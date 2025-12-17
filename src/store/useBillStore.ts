import { create } from 'zustand';
import type { BillState, Item } from '../types';
import { calculateBillSplit, validateItem } from '../utils/calculations';

interface BillStoreState {
    bill: BillState;
    splitResults: Record<string, number>;
    isValid: boolean;

    // Actions
    addParticipant: (name: string) => void;
    removeParticipant: (id: string) => void;
    addItem: () => void;
    updateItem: (itemId: string, updates: Partial<Item>) => void;
    deleteItem: (itemId: string) => void;
    setBill: (bill: BillState) => void;
    isUploading: boolean;
    uploadBill: (file: File) => Promise<void>;
}

const INITIAL_BILL: BillState = {
    participants: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
    ],
    items: [
        { id: 'i1', name: 'Paneer', price: 320, splitMode: 'EQUAL', consumption: { p1: true, p2: true } }
    ]
};

export const useBillStore = create<BillStoreState>((set, get) => ({
    bill: INITIAL_BILL,
    splitResults: calculateBillSplit(INITIAL_BILL),
    isValid: true,

    addParticipant: (name) => {
        set((state) => {
            const id = `p-${Date.now()}`;
            const newParticipants = [...state.bill.participants, { id, name }];

            const newBill = { ...state.bill, participants: newParticipants };
            return {
                bill: newBill
            };
            // Recalculation happens in middleware or distinct set? 
            // Simplified: We'll recalculate in a subscriber or manually here. 
            // For now, let's update results immediately.
        });
        get().setBill(get().bill); // Trigger recalc via setBill helper
    },

    removeParticipant: (id) => {
        set((state) => {
            const newParticipants = state.bill.participants.filter(p => p.id !== id);
            const newItems = state.bill.items.map(item => {
                const { [id]: _, ...rest } = item.consumption;
                return { ...item, consumption: rest };
            });

            return { bill: { participants: newParticipants, items: newItems } };
        });
        get().setBill(get().bill);
    },

    addItem: () => {
        set((state) => {
            const id = `i-${Date.now()}`;
            const newItem: Item = {
                id, name: '', price: 0, splitMode: 'EQUAL', consumption: {}
            };
            return { bill: { ...state.bill, items: [...state.bill.items, newItem] } };
        });
        get().setBill(get().bill);
    },

    updateItem: (itemId, updates) => {
        set((state) => {
            const newItems = state.bill.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
            );
            return { bill: { ...state.bill, items: newItems } };
        });
        get().setBill(get().bill);
    },

    deleteItem: (itemId) => {
        set((state) => ({
            bill: { ...state.bill, items: state.bill.items.filter(i => i.id !== itemId) }
        }));
        get().setBill(get().bill);
    },

    setBill: (newBill) => {
        // Validate all items
        const allValid = newBill.items.every(validateItem);
        const results = calculateBillSplit(newBill);

        set({
            bill: newBill,
            splitResults: results,
            isValid: allValid
        });
    },

    // Phase 3: Upload Logic
    isUploading: false,
    uploadBill: async (file: File) => {
        set({ isUploading: true });
        try {
            // Dynamic import to avoid circular dependency if service imports types? 
            // Actually service imports Item type only.
            const { uploadBillService } = await import('../services/billService');
            const parsedData = await uploadBillService(file);

            set((state) => {
                // Convert parsed items to full Items
                const newItems: Item[] = parsedData.items.map(p => ({
                    id: `i-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: p.name,
                    price: p.price,
                    splitMode: p.splitMode,
                    consumption: {} // Reset consumption
                }));

                // Merge or Replace? Requirement says "Populate items". Usually replace or append.
                // Let's Append for now, or maybe replace if empty? 
                // "Auto-populate dashboard from bill photo" suggests initial state.
                // Let's Append to existing items to be safe, user can clear if needed.

                const updatedItems = [...state.bill.items, ...newItems];
                return {
                    bill: { ...state.bill, items: updatedItems }
                };
            });
            // Trigger recalc
            get().setBill(get().bill); // Recalculate everything
        } catch (error) {
            console.error(error);
            // Handle error state if needed
        } finally {
            set({ isUploading: false });
        }
    }
}));
