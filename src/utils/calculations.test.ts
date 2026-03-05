import { describe, it, expect } from 'vitest';
import { validateItem, calculateItemSplit, calculateBillSplit } from './calculations';
import type { BillState, Item, Participant } from '../types';

describe('Core Engine Tests', () => {
    const participants: Participant[] = [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
    ];

    describe('Validation', () => {
        it('should validate EQUAL split when at least one participant is checked', () => {
            const item: Item = {
                id: 'i1', name: 'Item', price: 100, quantity: 1, splitMode: 'EQUAL',
                consumption: { p1: true }
            };
            expect(validateItem(item)).toBe(true);
        });

        it('should INVALIDATE EQUAL split when no participant is checked', () => {
            const item: Item = {
                id: 'i1', name: 'Item', price: 100, quantity: 1, splitMode: 'EQUAL',
                consumption: { p1: false, p2: false }
            };
            expect(validateItem(item)).toBe(false);
        });

        it('should validate UNIT split when total units >= 1', () => {
            const item: Item = {
                id: 'i1', name: 'Item', price: 100, quantity: 1, splitMode: 'UNIT',
                consumption: { p1: 1 }
            };
            expect(validateItem(item)).toBe(true);
        });

        it('should INVALIDATE UNIT split when total units < 1', () => {
            const item: Item = {
                id: 'i1', name: 'Item', price: 100, quantity: 1, splitMode: 'UNIT',
                consumption: { p1: 0, p2: 0 }
            };
            expect(validateItem(item)).toBe(false);
        });

        it('should INVALIDATE UNIT split with negative numbers', () => {
            const item: Item = {
                id: 'i1', name: 'Item', price: 100, quantity: 1, splitMode: 'UNIT',
                consumption: { p1: -1 }
            };
            expect(validateItem(item)).toBe(false);
        });

        it('should validate UNIT split with 0.5 fractions', () => {
            const item: Item = {
                id: 'i1', name: 'Roti', price: 60, quantity: 3, splitMode: 'UNIT',
                consumption: { p1: 1.5, p2: 1.5 } // Total 3 === quantity
            };
            expect(validateItem(item)).toBe(true);
        });

        it('should INVALIDATE UNIT split with non-0.5 fractions (e.g. 0.3)', () => {
            const item: Item = {
                id: 'i1', name: 'Roti', price: 60, quantity: 3, splitMode: 'UNIT',
                consumption: { p1: 0.3, p2: 2.7 }
            };
            expect(validateItem(item)).toBe(false);
        });

        it('should INVALIDATE UNIT split when total units ≠ item quantity', () => {
            const item: Item = {
                id: 'i1', name: 'Roti', price: 60, quantity: 3, splitMode: 'UNIT',
                consumption: { p1: 1, p2: 1 } // Total 2, but quantity is 3
            };
            expect(validateItem(item)).toBe(false);
        });
    });

    describe('Step 1.2 Scenarios', () => {
        it('Equal split (2 people)', () => {
            const item: Item = {
                id: 'i1', name: 'Paneer', price: 320, quantity: 1, splitMode: 'EQUAL',
                consumption: { p1: true, p2: true }
            };
            const split = calculateItemSplit(item);
            expect(split['p1']).toBe(160);
            expect(split['p2']).toBe(160);
        });

        it('Unit split (1 vs 2 rotis)', () => {
            const item: Item = {
                id: 'i2', name: 'Roti', price: 60, quantity: 3, splitMode: 'UNIT',
                consumption: { p1: 1, p2: 2 } // Total 3 items. Cost/unit = 20.
            };
            const split = calculateItemSplit(item);
            expect(split['p1']).toBe(20);
            expect(split['p2']).toBe(40);
        });

        it('Fractional unit split (0.5 step)', () => {
            const item: Item = {
                id: 'i3', name: 'Roti', price: 60, quantity: 3, splitMode: 'UNIT',
                consumption: { p1: 1.5, p2: 1.5 } // Total 3 === quantity. Cost/unit = 20.
            };
            const split = calculateItemSplit(item);
            expect(split['p1']).toBe(30); // 1.5 * 20
            expect(split['p2']).toBe(30); // 1.5 * 20
        });

        it('Mixed integer + fractional unit split', () => {
            const item: Item = {
                id: 'i4', name: 'Naan', price: 100, quantity: 4, splitMode: 'UNIT',
                consumption: { p1: 2.5, p2: 1.5 } // Total 4 === quantity. Cost/unit = 25.
            };
            const split = calculateItemSplit(item);
            expect(split['p1']).toBe(62.5); // 2.5 * 25
            expect(split['p2']).toBe(37.5); // 1.5 * 25
        });

        it('Mixed items', () => {
            const bill: BillState = {
                participants,
                items: [
                    { id: 'i1', name: 'Paneer', price: 300, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true } }, // 150 each
                    { id: 'i2', name: 'Roti', price: 100, quantity: 5, splitMode: 'UNIT', consumption: { p1: 4, p2: 1 } } // 20/unit. p1=80, p2=20
                ],
                discount: 0,
                tax: 0
            };
            const finals = calculateBillSplit(bill);
            expect(finals['p1']).toBe(230); // 150 + 80
            expect(finals['p2']).toBe(170); // 150 + 20
        });

        it('Invalid item (no consumers)', () => {
            const bill: BillState = {
                participants,
                items: [
                    { id: 'i1', name: 'Valid', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true } }, // p1=100
                    { id: 'i2', name: 'Invalid', price: 500, quantity: 1, splitMode: 'EQUAL', consumption: {} } // Ignored
                ],
                discount: 0,
                tax: 0
            };
            const finals = calculateBillSplit(bill);
            expect(finals['p1']).toBe(100);
        });

        it('Mode switch recalculation (simulated)', () => {
            // Start EQUAL
            let item: Item = {
                id: 'i1', name: 'SwitchItem', price: 100, quantity: 1, splitMode: 'EQUAL',
                consumption: { p1: true, p2: true }
            };
            let split = calculateItemSplit(item);
            expect(split['p1']).toBe(50);

            // Switch to UNIT (Consumption must be reset manually in app, here we simulate the state after reset)
            // State reset logic is in Dispatcher/UI, but calculation just respects inputs.
            // If we incorrectly pass EQUAL inputs to UNIT mode, validation should fail or ignore.

            item = { ...item, splitMode: 'UNIT', consumption: { p1: true } }; // Invalid Type for UNIT
            expect(validateItem(item)).toBe(false);

            item = { ...item, splitMode: 'UNIT', quantity: 4, consumption: { p1: 2, p2: 2 } }; // Valid UNIT. 25/unit.
            split = calculateItemSplit(item);
            expect(split['p1']).toBe(50);
            expect(split['p2']).toBe(50);
        });
    }); // End Step 1.2 Scenarios

    describe('Phase 4: Global Discount', () => {
        const participants: Participant[] = [
            { id: 'p1', name: 'Alice' },
            { id: 'p2', name: 'Bob' },
        ];

        it('should deduct discount equally', () => {
            const bill: BillState = {
                participants,
                items: [
                    { id: 'i1', name: 'Item', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true } }
                ],
                discount: 10,
                tax: 0
            };
            // Total 100. Share 50 each. Proportional discount logic: Each has 50% of the flat 100 total.
            // 50% of 10 discount is 5. So each gets 5 discount -> Final 45.
            const finals = calculateBillSplit(bill);
            expect(finals['p1']).toBe(45);
            expect(finals['p2']).toBe(45);
        });

        it('should handle large discounts (negative results)', () => {
            const bill: BillState = {
                participants,
                items: [
                    { id: 'i1', name: 'Item', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true } }
                ],
                discount: 120,
                tax: 0
            };
            // Total 100. Share 50 each. Proportional discount: 50% of 120 is 60. Share 50 - 60 = -10.
            const finals = calculateBillSplit(bill);
            expect(finals['p1']).toBe(-10);
            expect(finals['p2']).toBe(-10);
        });
    });

    describe('Phase 5: Extra Charges (Tax)', () => {
        const participants: Participant[] = [
            { id: 'p1', name: 'Alice' },
            { id: 'p2', name: 'Bob' },
        ];

        it('should ADD tax equally', () => {
            const bill: BillState = {
                participants,
                items: [
                    { id: 'i1', name: 'Item', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true } }
                ],
                discount: 0,
                tax: 10
            };
            // Total 100. Share 50 each. Proportional tax: 50% of 10 is 5. Final 55.
            const finals = calculateBillSplit(bill);
            expect(finals['p1']).toBe(55);
            expect(finals['p2']).toBe(55);
        });

        it('should handle Tax + Discount combined', () => {
            const bill: BillState = {
                participants,
                items: [
                    { id: 'i1', name: 'Item', price: 100, quantity: 1, splitMode: 'EQUAL', consumption: { p1: true, p2: true } }
                ],
                discount: 20,
                tax: 10
            };
            // Total 100. Share 50 each. Proportional Math Base 50. Discount -10 -> 40. Tax +5 -> 45.
            const finals = calculateBillSplit(bill);
            expect(finals['p1']).toBe(45);
            expect(finals['p2']).toBe(45);
        });
    });
});
