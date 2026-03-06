import type { BillState, Item } from '../types';

/**
 * Validates an item based on its split mode.
 * EQUAL: At least one participant must be checked.
 * UNIT: Values must be multiples of 0.5 (≥ 0), total units must exactly equal item quantity.
 */
export function validateItem(item: Item): boolean {
    if (item.splitMode === 'EQUAL') {
        // Check if at least one participant is selected (value is true)
        return Object.values(item.consumption).some((val) => val === true);
    }

    if (item.splitMode === 'UNIT') {
        let totalUnits = 0;
        const consumptionValues = Object.values(item.consumption);
        const maxQuantity = item.quantity || 1; // Default to 1 if undefined

        for (const val of consumptionValues) {
            if (typeof val !== 'number') return false; // Should be number for UNIT
            if (val < 0) return false; // Must be >= 0
            // Must be a multiple of 0.5 (i.e. 0, 0.5, 1, 1.5, 2, ...)
            if ((val * 2) % 1 !== 0) return false;
            totalUnits += val;
        }

        // Total units must exactly equal the item's quantity
        return totalUnits >= 1 && totalUnits === maxQuantity;
    }

    return false;
}

/**
 * Calculates shares for EQUAL split mode.
 * share = item.price / eligible.length
 */
export function calculateEqualSplit(item: Item): Record<string, number> {
    const shares: Record<string, number> = {};
    const eligible = Object.entries(item.consumption)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, val]) => val === true)
        .map(([id]) => id);

    if (eligible.length === 0) return {};

    const share = item.price / eligible.length;

    eligible.forEach((id) => {
        shares[id] = share;
    });

    return shares;
}

/**
 * Calculates shares for UNIT split mode.
 * costPerUnit = item.price / totalUnits
 * share = units * costPerUnit
 */
export function calculateUnitSplit(item: Item): Record<string, number> {
    const shares: Record<string, number> = {};
    let totalUnits = 0;

    // Calculate total units
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(item.consumption).forEach(([_, val]) => {
        if (typeof val === 'number') {
            totalUnits += val;
        }
    });

    if (totalUnits === 0) return {};

    const costPerUnit = item.price / totalUnits;

    Object.entries(item.consumption).forEach(([id, val]) => {
        if (typeof val === 'number' && val > 0) {
            shares[id] = val * costPerUnit;
        }
    });

    return shares;
}

/**
 * Dispatches calculation to appropriate handler based on split mode.
 */
export function calculateItemSplit(item: Item): Record<string, number> {
    if (!validateItem(item)) {
        return {};
    }

    if (item.splitMode === 'EQUAL') {
        return calculateEqualSplit(item);
    } else if (item.splitMode === 'UNIT') {
        return calculateUnitSplit(item);
    }

    return {};
}

/**
 * Production-grade bill split pipeline:
 *
 *   1. items → participantSubtotal
 *   2. participantSubtotal → proportionalDiscount
 *   3. participantSubtotal → proportionalTax
 *   4. subtotal + tax − discount → final (exact, unrounded)
 *   5. round → balance remainder (ensures sum === grandTotal)
 */
export function calculateBillSplit(bill: BillState): Record<string, number> {
    const totals: Record<string, number> = {};

    // ── Step 0: Initialize ──────────────────────────────────────────
    bill.participants.forEach((p) => {
        totals[p.id] = 0;
    });

    // ── Step 1: items → participantSubtotal ──────────────────────────
    bill.items.forEach((item) => {
        const itemShares = calculateItemSplit(item);
        Object.entries(itemShares).forEach(([participantId, amount]) => {
            if (totals[participantId] === undefined) totals[participantId] = 0;
            totals[participantId] += amount;
        });
    });

    // Snapshot of per-participant item subtotals (before tax/discount)
    const baseSubtotals = { ...totals };
    const globalSubtotal = bill.items.reduce((sum, item) => sum + item.price, 0);

    // ── Step 2: participantSubtotal → proportionalDiscount ───────────
    const discountAmount = bill.discount || 0;
    if (globalSubtotal > 0 && discountAmount > 0) {
        bill.participants.forEach((p) => {
            if (totals[p.id] !== undefined) {
                const proportion = baseSubtotals[p.id] / globalSubtotal;
                totals[p.id] -= discountAmount * proportion;
            }
        });
    }

    // ── Step 3: participantSubtotal → proportionalTax ────────────────
    const taxAmount = bill.tax || 0;
    if (globalSubtotal > 0 && taxAmount > 0) {
        bill.participants.forEach((p) => {
            if (totals[p.id] !== undefined) {
                const proportion = baseSubtotals[p.id] / globalSubtotal;
                totals[p.id] += taxAmount * proportion;
            }
        });
    }

    // ── Step 4 & 5: round → balance remainder ────────────────────────
    // The expected total is based on what was actually distributed (valid items only),
    // plus proportional tax/discount applied to those items.
    const distributedSubtotal = Object.values(baseSubtotals).reduce((sum, v) => sum + v, 0);
    const taxPortion = globalSubtotal > 0 ? (distributedSubtotal / globalSubtotal) * taxAmount : 0;
    const discountPortion = globalSubtotal > 0 ? (distributedSubtotal / globalSubtotal) * discountAmount : 0;
    const expectedGrandTotal = Math.round((distributedSubtotal + taxPortion - discountPortion) * 100) / 100;

    // Round each participant to 2 decimal places
    const roundedTotals: Record<string, number> = {};
    Object.entries(totals).forEach(([id, amount]) => {
        roundedTotals[id] = Math.round(amount * 100) / 100;
    });

    // Calculate rounding remainder
    const roundedSum = Object.values(roundedTotals).reduce((sum, v) => sum + v, 0);
    const remainder = Math.round((expectedGrandTotal - roundedSum) * 100) / 100;

    // Assign remainder to the participant with the largest share (most fair)
    if (remainder !== 0 && bill.participants.length > 0) {
        let maxId = bill.participants[0].id;
        let maxVal = Math.abs(roundedTotals[maxId] || 0);
        bill.participants.forEach((p) => {
            const absVal = Math.abs(roundedTotals[p.id] || 0);
            if (absVal > maxVal) {
                maxVal = absVal;
                maxId = p.id;
            }
        });
        roundedTotals[maxId] = Math.round((roundedTotals[maxId] + remainder) * 100) / 100;
    }

    return roundedTotals;
}
