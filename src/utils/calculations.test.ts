import { describe, it, expect } from 'vitest';
import { validateItem, calculateItemSplit, calculateBillSplit } from './calculations';
import type { BillState, Item, Participant } from '../types';

// ═══════════════════════════════════════════════════════════════════════
// HELPER: builds participants with sequential IDs
// ═══════════════════════════════════════════════════════════════════════
function makePeople(n: number): Participant[] {
    return Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, name: `P${i + 1}` }));
}

// ═══════════════════════════════════════════════════════════════════════
// 1. VALIDATION
// ═══════════════════════════════════════════════════════════════════════
describe('Validation', () => {
    // ── EQUAL mode ───────────────────────────────────────────────────
    it('EQUAL: valid when ≥1 participant checked', () => {
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true } };
        expect(validateItem(item)).toBe(true);
    });

    it('EQUAL: invalid when zero participants checked', () => {
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: false, p2: false } };
        expect(validateItem(item)).toBe(false);
    });

    it('EQUAL: invalid with empty consumption', () => {
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: {} };
        expect(validateItem(item)).toBe(false);
    });

    // ── UNIT mode: integers ──────────────────────────────────────────
    it('UNIT: valid when totalUnits === quantity', () => {
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 3, splitMode: 'UNIT', consumption: { p1: 1, p2: 2 } };
        expect(validateItem(item)).toBe(true);
    });

    it('UNIT: invalid when totalUnits < quantity', () => {
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 3, splitMode: 'UNIT', consumption: { p1: 1, p2: 1 } };
        expect(validateItem(item)).toBe(false);
    });

    it('UNIT: invalid when totalUnits > quantity', () => {
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 3, splitMode: 'UNIT', consumption: { p1: 2, p2: 2 } };
        expect(validateItem(item)).toBe(false);
    });

    it('UNIT: invalid when total is 0', () => {
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'UNIT', consumption: { p1: 0, p2: 0 } };
        expect(validateItem(item)).toBe(false);
    });

    it('UNIT: invalid with negative values', () => {
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'UNIT', consumption: { p1: -1 } };
        expect(validateItem(item)).toBe(false);
    });

    it('UNIT: invalid with boolean consumption (wrong type)', () => {
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'UNIT', consumption: { p1: true as unknown as number } };
        expect(validateItem(item)).toBe(false);
    });

    // ── UNIT mode: fractions ─────────────────────────────────────────
    it('UNIT: valid with 0.5 fractions summing to quantity', () => {
        const item: Item = { id: 'i1', name: 'X', price: 60, quantity: 3, splitMode: 'UNIT', consumption: { p1: 1.5, p2: 1.5 } };
        expect(validateItem(item)).toBe(true);
    });

    it('UNIT: valid with mixed int+fraction summing to quantity', () => {
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 4, splitMode: 'UNIT', consumption: { p1: 2.5, p2: 1.5 } };
        expect(validateItem(item)).toBe(true);
    });

    it('UNIT: invalid with 0.3 (not a 0.5 multiple)', () => {
        const item: Item = { id: 'i1', name: 'X', price: 60, quantity: 3, splitMode: 'UNIT', consumption: { p1: 0.3, p2: 2.7 } };
        expect(validateItem(item)).toBe(false);
    });

    it('UNIT: invalid with 0.25 (not a 0.5 multiple)', () => {
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'UNIT', consumption: { p1: 0.25, p2: 0.75 } };
        expect(validateItem(item)).toBe(false);
    });

    it('UNIT: invalid with 0.1 (not a 0.5 multiple)', () => {
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'UNIT', consumption: { p1: 0.1 } };
        expect(validateItem(item)).toBe(false);
    });

    it('UNIT: single participant 0.5 does not match quantity 1', () => {
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'UNIT', consumption: { p1: 0.5 } };
        expect(validateItem(item)).toBe(false); // 0.5 !== 1
    });
});

// ═══════════════════════════════════════════════════════════════════════
// 2. ITEM-LEVEL SPLITS
// ═══════════════════════════════════════════════════════════════════════
describe('Item-Level Split Calculations', () => {
    // ── EQUAL ────────────────────────────────────────────────────────
    it('EQUAL: 2 people share equally', () => {
        const item: Item = { id: 'i1', name: 'Paneer', price: 320, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true } };
        const s = calculateItemSplit(item);
        expect(s['p1']).toBe(160);
        expect(s['p2']).toBe(160);
    });

    it('EQUAL: 1 person pays full price', () => {
        const item: Item = { id: 'i1', name: 'Dessert', price: 150, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: false } };
        const s = calculateItemSplit(item);
        expect(s['p1']).toBe(150);
        expect(s['p2']).toBeUndefined();
    });

    it('EQUAL: 5 people share ₹100', () => {
        const consumption: Record<string, boolean> = {};
        for (let i = 1; i <= 5; i++) consumption[`p${i}`] = true;
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'EQUAL', consumption };
        const s = calculateItemSplit(item);
        for (let i = 1; i <= 5; i++) expect(s[`p${i}`]).toBe(20);
    });

    it('EQUAL: returns empty for invalid item', () => {
        const item: Item = { id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: {} };
        expect(calculateItemSplit(item)).toEqual({});
    });

    // ── UNIT (integer) ───────────────────────────────────────────────
    it('UNIT: 1 vs 2 roti (cost per unit)', () => {
        const item: Item = { id: 'i1', name: 'Roti', price: 60, quantity: 3, splitMode: 'UNIT', consumption: { p1: 1, p2: 2 } };
        const s = calculateItemSplit(item);
        expect(s['p1']).toBe(20);
        expect(s['p2']).toBe(40);
    });

    it('UNIT: single person eats all', () => {
        const item: Item = { id: 'i1', name: 'Naan', price: 80, quantity: 4, splitMode: 'UNIT', consumption: { p1: 4, p2: 0 } };
        const s = calculateItemSplit(item);
        expect(s['p1']).toBe(80);
        expect(s['p2']).toBeUndefined();
    });

    // ── UNIT (fractional 0.5) ────────────────────────────────────────
    it('UNIT: equal fractional split (1.5 + 1.5)', () => {
        const item: Item = { id: 'i1', name: 'Roti', price: 60, quantity: 3, splitMode: 'UNIT', consumption: { p1: 1.5, p2: 1.5 } };
        const s = calculateItemSplit(item);
        expect(s['p1']).toBe(30);
        expect(s['p2']).toBe(30);
    });

    it('UNIT: unequal fractional split (2.5 + 1.5)', () => {
        const item: Item = { id: 'i1', name: 'Naan', price: 100, quantity: 4, splitMode: 'UNIT', consumption: { p1: 2.5, p2: 1.5 } };
        const s = calculateItemSplit(item);
        expect(s['p1']).toBe(62.5);
        expect(s['p2']).toBe(37.5);
    });

    it('UNIT: 3-way fractional split (1 + 0.5 + 0.5)', () => {
        const item: Item = { id: 'i1', name: 'Pizza', price: 200, quantity: 2, splitMode: 'UNIT', consumption: { p1: 1, p2: 0.5, p3: 0.5 } };
        const s = calculateItemSplit(item);
        expect(s['p1']).toBe(100);
        expect(s['p2']).toBe(50);
        expect(s['p3']).toBe(50);
    });
});

// ═══════════════════════════════════════════════════════════════════════
// 3. BILL-LEVEL: TAX & DISCOUNT
// ═══════════════════════════════════════════════════════════════════════
describe('Bill-Level: Tax & Discount', () => {
    const participants = makePeople(2);

    it('proportional discount (equal shares → equal deduction)', () => {
        const bill: BillState = {
            participants,
            items: [{ id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true } }],
            discount: 10, tax: 0
        };
        const f = calculateBillSplit(bill);
        expect(f['p1']).toBe(45);
        expect(f['p2']).toBe(45);
    });

    it('proportional tax (equal shares → equal tax)', () => {
        const bill: BillState = {
            participants,
            items: [{ id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true } }],
            discount: 0, tax: 10
        };
        const f = calculateBillSplit(bill);
        expect(f['p1']).toBe(55);
        expect(f['p2']).toBe(55);
    });

    it('tax + discount combined', () => {
        const bill: BillState = {
            participants,
            items: [{ id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true } }],
            discount: 20, tax: 10
        };
        const f = calculateBillSplit(bill);
        expect(f['p1']).toBe(45);
        expect(f['p2']).toBe(45);
    });

    it('discount exceeding subtotal → negative totals', () => {
        const bill: BillState = {
            participants,
            items: [{ id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true } }],
            discount: 120, tax: 0
        };
        const f = calculateBillSplit(bill);
        expect(f['p1']).toBe(-10);
        expect(f['p2']).toBe(-10);
    });

    it('proportional tax with UNEQUAL shares', () => {
        const bill: BillState = {
            participants,
            items: [
                { id: 'i1', name: 'Steak', price: 300, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true } },
                { id: 'i2', name: 'Salad', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p2: true } },
            ],
            discount: 0, tax: 40
        };
        const f = calculateBillSplit(bill);
        expect(f['p1']).toBe(330); // 300 + 75% of 40
        expect(f['p2']).toBe(110); // 100 + 25% of 40
    });

    it('proportional discount with UNEQUAL shares', () => {
        const bill: BillState = {
            participants,
            items: [
                { id: 'i1', name: 'Steak', price: 300, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true } },
                { id: 'i2', name: 'Salad', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p2: true } },
            ],
            discount: 40, tax: 0
        };
        const f = calculateBillSplit(bill);
        expect(f['p1']).toBe(270); // 300 - 75% of 40
        expect(f['p2']).toBe(90);  // 100 - 25% of 40
    });

    it('invalid items do NOT affect final totals', () => {
        const bill: BillState = {
            participants,
            items: [
                { id: 'i1', name: 'Valid', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true } },
                { id: 'i2', name: 'Invalid', price: 500, quantity: 1, splitMode: 'EQUAL', consumption: {} },
            ],
            discount: 0, tax: 0
        };
        const f = calculateBillSplit(bill);
        expect(f['p1']).toBe(100);
    });
});

// ═══════════════════════════════════════════════════════════════════════
// 4. REMAINDER BALANCING
// ═══════════════════════════════════════════════════════════════════════
describe('Remainder Balancing', () => {
    it('3-way split of ₹100 → sums exactly to 100', () => {
        const bill: BillState = {
            participants: makePeople(3),
            items: [{ id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true, p3: true } }],
            discount: 0, tax: 0
        };
        const f = calculateBillSplit(bill);
        const sum = f['p1'] + f['p2'] + f['p3'];
        expect(sum).toBe(100);
        expect(Object.values(f).sort()).toEqual([33.33, 33.33, 33.34]);
    });

    it('7-way split of ₹100 → sums exactly to 100', () => {
        const people = makePeople(7);
        const consumption: Record<string, boolean> = {};
        people.forEach(p => consumption[p.id] = true);

        const bill: BillState = {
            participants: people,
            items: [{ id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'EQUAL', consumption }],
            discount: 0, tax: 0
        };
        const f = calculateBillSplit(bill);
        const sum = Math.round(Object.values(f).reduce((a, b) => a + b, 0) * 100) / 100;
        expect(sum).toBe(100);
    });

    it('3-way split of ₹1 → sums exactly to 1', () => {
        const bill: BillState = {
            participants: makePeople(3),
            items: [{ id: 'i1', name: 'X', price: 1, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true, p3: true } }],
            discount: 0, tax: 0
        };
        const f = calculateBillSplit(bill);
        const sum = Math.round((f['p1'] + f['p2'] + f['p3']) * 100) / 100;
        expect(sum).toBe(1);
    });

    it('remainder with tax + discount', () => {
        const bill: BillState = {
            participants: makePeople(3),
            items: [{ id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true, p3: true } }],
            discount: 7, tax: 13
        };
        const f = calculateBillSplit(bill);
        const sum = Math.round(Object.values(f).reduce((a, b) => a + b, 0) * 100) / 100;
        expect(sum).toBe(106); // 100 + 13 - 7
    });
});

// ═══════════════════════════════════════════════════════════════════════
// 5. MIXED ITEM SCENARIOS
// ═══════════════════════════════════════════════════════════════════════
describe('Mixed Item Scenarios', () => {
    const participants = makePeople(2);

    it('EQUAL + UNIT items combined', () => {
        const bill: BillState = {
            participants,
            items: [
                { id: 'i1', name: 'Paneer', price: 300, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true } },
                { id: 'i2', name: 'Roti', price: 100, quantity: 5, splitMode: 'UNIT', consumption: { p1: 4, p2: 1 } },
            ],
            discount: 0, tax: 0
        };
        const f = calculateBillSplit(bill);
        expect(f['p1']).toBe(230); // 150 + 80
        expect(f['p2']).toBe(170); // 150 + 20
    });

    it('mode switch: EQUAL → UNIT recalculates correctly', () => {
        let item: Item = { id: 'i1', name: 'X', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true } };
        expect(calculateItemSplit(item)['p1']).toBe(50);

        item = { ...item, splitMode: 'UNIT', consumption: { p1: true as unknown as number } };
        expect(validateItem(item)).toBe(false);

        item = { ...item, quantity: 4, consumption: { p1: 2, p2: 2 } };
        const s = calculateItemSplit(item);
        expect(s['p1']).toBe(50);
        expect(s['p2']).toBe(50);
    });

    it('disjoint consumption: one only UNIT, another only EQUAL', () => {
        const bill: BillState = {
            participants,
            items: [
                { id: 'i1', name: 'Curry', price: 200, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true } },
                { id: 'i2', name: 'Roti', price: 60, quantity: 3, splitMode: 'UNIT', consumption: { p1: 0, p2: 3 } },
            ],
            discount: 0, tax: 0
        };
        const f = calculateBillSplit(bill);
        expect(f['p1']).toBe(200);
        expect(f['p2']).toBe(60);
    });

    it('participant with zero consumption pays ₹0', () => {
        const bill: BillState = {
            participants,
            items: [
                { id: 'i1', name: 'Curry', price: 200, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true } },
            ],
            discount: 0, tax: 0
        };
        const f = calculateBillSplit(bill);
        expect(f['p1']).toBe(200);
        expect(f['p2']).toBe(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════
// 6. INVARIANTS (must hold for ANY valid bill)
// ═══════════════════════════════════════════════════════════════════════
describe('Invariants', () => {
    function assertInvariants(bill: BillState) {
        const f = calculateBillSplit(bill);
        const values = Object.values(f);

        // No NaN or Infinity
        for (const v of values) {
            expect(Number.isFinite(v)).toBe(true);
        }

        // All values are rounded to 2 decimal places
        for (const v of values) {
            expect(v).toBe(Math.round(v * 100) / 100);
        }

        // Sum matches expected grand total (only distributed items count)
        const validItemPrices = bill.items
            .filter(item => validateItem(item))
            .reduce((sum, item) => sum + item.price, 0);
        const globalSubtotal = bill.items.reduce((sum, item) => sum + item.price, 0);

        if (globalSubtotal > 0 && validItemPrices > 0) {
            const proportion = validItemPrices / globalSubtotal;
            const taxPart = (bill.tax || 0) * proportion;
            const discPart = (bill.discount || 0) * proportion;
            const expectedTotal = validItemPrices + taxPart - discPart;
            const actualSum = values.reduce((a, b) => a + b, 0);
            // Use toBeCloseTo(2) to handle JS floating point imprecision
            expect(Math.round(actualSum * 100) / 100).toBeCloseTo(Math.round(expectedTotal * 100) / 100, 2);
        }
    }

    it('equal split, no tax/discount', () => {
        assertInvariants({
            participants: makePeople(4),
            items: [{ id: 'i1', name: 'X', price: 247, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true, p3: true, p4: true } }],
            discount: 0, tax: 0
        });
    });

    it('unit split, with tax and discount', () => {
        assertInvariants({
            participants: makePeople(3),
            items: [{ id: 'i1', name: 'Roti', price: 90, quantity: 6, splitMode: 'UNIT', consumption: { p1: 1, p2: 2, p3: 3 } }],
            discount: 15, tax: 23
        });
    });

    it('mixed items, large tax', () => {
        assertInvariants({
            participants: makePeople(2),
            items: [
                { id: 'i1', name: 'A', price: 350, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true } },
                { id: 'i2', name: 'B', price: 90, quantity: 3, splitMode: 'UNIT', consumption: { p1: 1, p2: 2 } },
            ],
            discount: 50, tax: 78
        });
    });

    it('single participant, single item', () => {
        assertInvariants({
            participants: makePeople(1),
            items: [{ id: 'i1', name: 'Solo', price: 999, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true } }],
            discount: 0, tax: 0
        });
    });

    it('zero price item', () => {
        assertInvariants({
            participants: makePeople(2),
            items: [{ id: 'i1', name: 'Free', price: 0, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true } }],
            discount: 0, tax: 0
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════
// 7. STRESS TESTS
// ═══════════════════════════════════════════════════════════════════════
describe('Stress Tests', () => {
    it('50 participants × 1 item equal split → sum matches', () => {
        const n = 50;
        const people = makePeople(n);
        const consumption: Record<string, boolean> = {};
        people.forEach(p => consumption[p.id] = true);

        const bill: BillState = {
            participants: people,
            items: [{ id: 'i1', name: 'Big Item', price: 9999.99, quantity: 1, splitMode: 'EQUAL', consumption }],
            discount: 0, tax: 0
        };
        const f = calculateBillSplit(bill);
        const sum = Math.round(Object.values(f).reduce((a, b) => a + b, 0) * 100) / 100;
        expect(sum).toBe(9999.99);
        Object.values(f).forEach(v => {
            expect(Number.isFinite(v)).toBe(true);
            expect(v).toBeGreaterThanOrEqual(0);
        });
    });

    it('2 participants × 100 items → sum matches', () => {
        const people = makePeople(2);
        const items: Item[] = [];
        let expectedTotal = 0;

        for (let i = 0; i < 100; i++) {
            const price = 10 + i;
            expectedTotal += price;
            items.push({
                id: `i${i}`, name: `Item ${i}`, price, quantity: 1,
                splitMode: 'EQUAL', consumption: { p1: true, p2: true }
            });
        }

        const bill: BillState = { participants: people, items, discount: 0, tax: 0 };
        const f = calculateBillSplit(bill);
        const sum = Math.round((f['p1'] + f['p2']) * 100) / 100;
        expect(sum).toBe(expectedTotal); // 5950
        expect(f['p1']).toBeCloseTo(expectedTotal / 2, 1);
    });

    it('50 participants × 100 mixed items with tax & discount → invariants hold', () => {
        const n = 50;
        const people = makePeople(n);
        const items: Item[] = [];

        for (let i = 0; i < 100; i++) {
            const price = Math.round((50 + Math.sin(i) * 30) * 100) / 100;
            if (i % 2 === 0) {
                const consumption: Record<string, boolean> = {};
                people.forEach(p => consumption[p.id] = true);
                items.push({ id: `i${i}`, name: `E${i}`, price, quantity: 1, splitMode: 'EQUAL', consumption });
            } else {
                const consumption: Record<string, number> = {};
                people.forEach(p => consumption[p.id] = 1);
                items.push({ id: `i${i}`, name: `U${i}`, price, quantity: n, splitMode: 'UNIT', consumption });
            }
        }

        const bill: BillState = { participants: people, items, discount: 100, tax: 250 };
        const f = calculateBillSplit(bill);
        const values = Object.values(f);

        values.forEach(v => expect(Number.isFinite(v)).toBe(true));
        values.forEach(v => expect(Math.round(v * 100) / 100).toBe(v));

        const subtotal = items.reduce((s, i) => s + i.price, 0);
        const expectedTotal = Math.round((subtotal + 250 - 100) * 100) / 100;
        const actualSum = Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;
        expect(actualSum).toBe(expectedTotal);
    });

    it('high-value bill: ₹10,00,000 split among 13 people', () => {
        const people = makePeople(13);
        const consumption: Record<string, boolean> = {};
        people.forEach(p => consumption[p.id] = true);

        const bill: BillState = {
            participants: people,
            items: [{ id: 'i1', name: 'Wedding Feast', price: 1000000, quantity: 1, splitMode: 'EQUAL', consumption }],
            discount: 0, tax: 180000
        };
        const f = calculateBillSplit(bill);
        const sum = Math.round(Object.values(f).reduce((a, b) => a + b, 0) * 100) / 100;
        expect(sum).toBe(1180000);
    });

    it('₹1 split among 7 people → all values ≥ 0, sum = 1', () => {
        const people = makePeople(7);
        const consumption: Record<string, boolean> = {};
        people.forEach(p => consumption[p.id] = true);

        const bill: BillState = {
            participants: people,
            items: [{ id: 'i1', name: 'Tiny', price: 1, quantity: 1, splitMode: 'EQUAL', consumption }],
            discount: 0, tax: 0
        };
        const f = calculateBillSplit(bill);
        const values = Object.values(f);
        values.forEach(v => expect(v).toBeGreaterThanOrEqual(0));
        const sum = Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;
        expect(sum).toBe(1);
    });
});

// ═══════════════════════════════════════════════════════════════════════
// 8. REAL-WORLD RESTAURANT BILL
// ═══════════════════════════════════════════════════════════════════════
describe('Real-World Restaurant Bill', () => {
    it('full Indian restaurant bill with 4 friends', () => {
        const people = makePeople(4);

        const bill: BillState = {
            participants: people,
            items: [
                // Shared starters (EQUAL, all 4)
                { id: 'i1', name: 'Paneer Tikka', price: 320, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true, p3: true, p4: true } },
                { id: 'i2', name: 'Veg Manchurian', price: 280, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true, p3: true, p4: true } },
                // Naan: p1 had 2, p2 had 1, p3 had 1.5, p4 had 1.5 (UNIT)
                { id: 'i3', name: 'Butter Naan', price: 300, quantity: 6, splitMode: 'UNIT', consumption: { p1: 2, p2: 1, p3: 1.5, p4: 1.5 } },
                // Main course shared by 3 (p1 didn't eat this)
                { id: 'i4', name: 'Dal Makhani', price: 350, quantity: 1, splitMode: 'EQUAL', consumption: { p1: false, p2: true, p3: true, p4: true } },
                // Drinks: only p1 and p3
                { id: 'i5', name: 'Lassi x2', price: 160, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p3: true } },
                // Dessert: only p2
                { id: 'i6', name: 'Gulab Jamun', price: 120, quantity: 1, splitMode: 'EQUAL', consumption: { p2: true } },
            ],
            tax: 92.55,
            discount: 50,
        };

        const f = calculateBillSplit(bill);

        // Sum must equal subtotal + tax - discount
        const subtotal = bill.items.reduce((s, i) => s + i.price, 0);
        const expectedTotal = Math.round((subtotal + 92.55 - 50) * 100) / 100;
        const actualSum = Math.round(Object.values(f).reduce((a, b) => a + b, 0) * 100) / 100;
        expect(actualSum).toBe(expectedTotal);

        // p2 pays the most (dessert + main course)
        expect(f['p2']).toBeGreaterThan(f['p1']);
        expect(f['p2']).toBeGreaterThan(f['p4']);

        // All positive
        Object.values(f).forEach(v => expect(v).toBeGreaterThan(0));
    });
});
