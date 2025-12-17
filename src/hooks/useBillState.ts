import { useState, useCallback } from 'react';
import type { BillState, Item, Participant } from '../types';
import { calculateBillSplit } from '../utils/calculations';

const INITIAL_PARTICIPANTS: Participant[] = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
];

const INITIAL_ITEMS: Item[] = [
    {
        id: 'i1',
        name: 'Paneer Butter Masala',
        price: 320,
        splitMode: 'EQUAL',
        consumption: { p1: true, p2: true }
    },
    {
        id: 'i2',
        name: 'Butter Roti',
        price: 60,
        splitMode: 'UNIT',
        consumption: { p1: 2, p2: 1 }
    }
];

export const useBillState = () => {
    const [bill, setBill] = useState<BillState>({
        participants: INITIAL_PARTICIPANTS,
        items: INITIAL_ITEMS
    });

    const addParticipant = useCallback((name: string) => {
        const id = `p-${Date.now()}`;
        setBill(prev => ({
            ...prev,
            participants: [...prev.participants, { id, name }]
        }));
    }, []);

    const removeParticipant = useCallback((id: string) => {
        setBill(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p.id !== id),
            // Clean up consumption for removed participant
            items: prev.items.map(item => {
                const { [id]: _, ...rest } = item.consumption;
                return { ...item, consumption: rest };
            })
        }));
    }, []);

    const addItem = useCallback(() => {
        const id = `i-${Date.now()}`;
        setBill(prev => ({
            ...prev,
            items: [...prev.items, {
                id,
                name: '',
                price: 0,
                splitMode: 'EQUAL',
                consumption: {}
            }]
        }));
    }, []);

    const updateItem = useCallback((itemId: string, updates: Partial<Item>) => {
        setBill(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
            )
        }));
    }, []);

    const deleteItem = useCallback((itemId: string) => {
        setBill(prev => ({
            ...prev,
            items: prev.items.filter(i => i.id !== itemId)
        }));
    }, []);

    const splitResults = calculateBillSplit(bill);

    return {
        bill,
        setBill,
        actions: {
            addParticipant,
            removeParticipant,
            addItem,
            updateItem,
            deleteItem
        },
        splitResults
    };
};
