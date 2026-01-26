import type { BillState, Item } from '../types';

/**
 * Validates an item based on its split mode.
 * EQUAL: At least one participant must be checked.
 * UNIT: All quantities must be integers >= 0, and total units >= 1.
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
            if (!Number.isInteger(val) || val < 0) return false; // Must be integer >= 0
            totalUnits += val;
        }

        // Must assign at least 1 unit AND not exceed available quantity
        return totalUnits >= 1 && totalUnits <= maxQuantity;
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
 * Aggregates splits for all items in the bill.
 * Returns final rounded totals per participant.
 */
export function calculateBillSplit(bill: BillState): Record<string, number> {
    const totals: Record<string, number> = {};

    // Initialize totals for all participants
    bill.participants.forEach((p) => {
        totals[p.id] = 0;
    });

    bill.items.forEach((item) => {
        const itemShares = calculateItemSplit(item);
        Object.entries(itemShares).forEach(([participantId, amount]) => {
            if (totals[participantId] === undefined) totals[participantId] = 0; // Guard
            totals[participantId] += amount;
        });
    });

    // Apply Global Discount
    const participantCount = bill.participants.length;
    const discountAmount = bill.discount || 0;

    if (participantCount > 0 && discountAmount > 0) {
        const discountPerPerson = discountAmount / participantCount;
        bill.participants.forEach((p) => {
            if (totals[p.id] !== undefined) {
                totals[p.id] -= discountPerPerson;
            }
        });
    }



    // Apply Global Tax
    const taxAmount = bill.tax || 0;
    if (participantCount > 0 && taxAmount > 0) {
        const taxPerPerson = taxAmount / participantCount;
        bill.participants.forEach((p) => {
            if (totals[p.id] !== undefined) {
                totals[p.id] += taxPerPerson;
            }
        });
    }

    // Round final totals
    const roundedTotals: Record<string, number> = {};
    Object.entries(totals).forEach(([id, amount]) => {
        roundedTotals[id] = Math.round(amount * 100) / 100;
    });

    return roundedTotals;
}
