import { describe, it, expect, beforeEach } from 'vitest';
import { useBillStore } from './useBillStore';
import { act } from 'react';

// Access the store's state
const getState = () => useBillStore.getState();

describe('useBillStore Auto-Selection Logic', () => {
    beforeEach(() => {
        // Reset store to initial state
        const initialBill = {
            participants: [
                { id: 'p1', name: 'Alice' },
                { id: 'p2', name: 'Bob' },
            ],
            items: [],
            discount: 0,
            tax: 0
        };

        act(() => {
            useBillStore.setState({
                bill: initialBill,
                splitResults: {},
                isValid: true
            });
            // Re-initialize with setBill to trigger calcs if needed, but setState is enough for raw state
        });
    });

    it('should auto-select all current participants when adding a new item', () => {
        act(() => {
            getState().addItem();
        });

        const items = getState().bill.items;
        expect(items).toHaveLength(1);
        const newItem = items[0];

        // Verify splitMode is EQUAL by default
        expect(newItem.splitMode).toBe('EQUAL');

        // Verify all participants are selected
        expect(newItem.consumption['p1']).toBe(true);
        expect(newItem.consumption['p2']).toBe(true);
    });

    it('should add a new participant to all existing EQUAL items', () => {
        // 1. Add an item (will include p1, p2)
        act(() => {
            getState().addItem();
        });

        // 2. Add new participant
        act(() => {
            getState().addParticipant('Charlie');
        });

        const participants = getState().bill.participants;
        const charlie = participants.find(p => p.name === 'Charlie');
        expect(charlie).toBeDefined();

        const items = getState().bill.items;
        const item = items[0];

        // Verify Charlie is added to consumption
        expect(item.consumption[charlie!.id]).toBe(true);
    });

    it('should NOT add a new participant to existing UNIT items', () => {
        // 1. Add an item and change to UNIT
        act(() => {
            getState().addItem();
        });

        const itemId = getState().bill.items[0].id;

        act(() => {
            getState().updateItem(itemId, { splitMode: 'UNIT', consumption: {} });
        });

        // 2. Add new participant
        act(() => {
            getState().addParticipant('Dave');
        });

        const participants = getState().bill.participants;
        const dave = participants.find(p => p.name === 'Dave');
        const item = getState().bill.items[0];

        // Verify Dave is NOT automatically added
        expect(item.consumption[dave!.id]).toBeUndefined();
    });
});
