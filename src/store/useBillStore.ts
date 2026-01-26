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
    setBillName: (name: string) => void;
    isUploading: boolean;
    uploadError: string | null;
    uploadBill: (file: File) => Promise<void>;
    setDiscount: (amount: number) => void;
    setTax: (amount: number) => void; // Phase 5
}

const INITIAL_BILL: BillState = {
    participants: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
    ],
    items: [
        {
            id: '1',
            name: 'Start by adding an item',
            price: 0,
            quantity: 1,
            splitMode: 'EQUAL',
            consumption: {}
        }
    ],
    discount: 0,
    tax: 0
};

export const useBillStore = create<BillStoreState>((set, get) => ({
    bill: INITIAL_BILL,
    splitResults: calculateBillSplit(INITIAL_BILL),
    isValid: true,

    // Phase 3: Upload Logic Init
    isUploading: false,
    uploadError: null,

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

            return { bill: { ...state.bill, participants: newParticipants, items: newItems } };
        });
        get().setBill(get().bill);
    },

    addItem: () => {
        set((state) => {
            const id = `i-${Date.now()}`;
            const newItem: Item = {
                id, name: '', price: 0, quantity: 1, splitMode: 'EQUAL', consumption: {}
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

    setDiscount: (amount) => {
        set((state) => ({
            bill: { ...state.bill, discount: amount }
        }));
        get().setBill(get().bill); // Trigger recalculation
    },

    setTax: (amount) => {
        set((state) => ({
            bill: { ...state.bill, tax: amount }
        }));
        get().setBill(get().bill);
    },

    setBillName: (name) => {
        set((state) => ({
            bill: { ...state.bill, billName: name }
        }));
        get().setBill(get().bill); // Trigger recalculation
    },

    // Phase 3: Upload Logic
    uploadBill: async (file: File) => {
        set({ isUploading: true, uploadError: null });
        try {
            // Dynamic import to avoid circular dependency
            const { uploadBillService } = await import('../services/billService');
            const parsedData = await uploadBillService(file);

            set((state) => {
                const newItems: Item[] = parsedData.items.map(p => {
                    const consumption: Record<string, boolean | number> = {};

                    // Auto-select all participants for EQUAL split
                    if (p.splitMode === 'EQUAL') {
                        state.bill.participants.forEach(part => {
                            consumption[part.id] = true;
                        });
                    }

                    return {
                        id: `i-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: p.name,
                        price: p.price,
                        quantity: p.quantity || 1, // Added quantity here
                        splitMode: p.splitMode,
                        consumption
                    };
                });

                const updatedItems = [...state.bill.items, ...newItems];
                return {
                    bill: {
                        ...state.bill,
                        items: updatedItems,
                        tax: (state.bill.tax || 0) + (parsedData.tax || 0),
                        billName: parsedData.billName || state.bill.billName
                    },
                    uploadError: null
                };
            });
            get().setBill(get().bill);
        } catch (error: any) {
            console.error(error);
            let msg = error.message || "Failed to analyze bill";

            // Friendly message for Quota Exceeded
            if (msg.includes("429") || msg.includes("Quota exceeded")) {
                msg = `⏳ AI Usage Limit Reached (Free Tier). \nDetails: ${msg}`;
            } else if (msg.includes("404")) {
                msg = `❌ AI Model Not Found. \nDetails: ${msg}`;
            }

            set({ uploadError: msg });
        } finally {
            set({ isUploading: false });
        }
    }
}));
