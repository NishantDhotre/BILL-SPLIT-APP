import type { BillState, Action, Item } from '../types';

/**
 * Applies a list of actions to the bill state.
 * Returns a new state.
 */
export function dispatchActions(state: BillState, actions: Action[]): BillState {
    let newState = { ...state };

    // Helper to find item by ID or Name (case-insensitive)
    const findItemIndex = (identifier: string) => {
        return newState.items.findIndex(
            i => i.id === identifier || i.name.toLowerCase() === identifier.toLowerCase()
        );
    };

    const findParticipantId = (identifier: string) => {
        // Check if ID matches
        const pById = newState.participants.find(p => p.id === identifier);
        if (pById) return pById.id;

        // Check if Name matches
        const pByName = newState.participants.find(p => p.name.toLowerCase() === identifier.toLowerCase());
        return pByName ? pByName.id : null;
    };

    for (const action of actions) {
        switch (action.type) {
            case 'ADD_PARTICIPANT': {
                const exists = newState.participants.some(p => p.name.toLowerCase() === action.name.toLowerCase());
                if (!exists) {
                    newState = {
                        ...newState,
                        participants: [
                            ...newState.participants,
                            { id: `p-${Date.now()}-${Math.random()}`, name: action.name }
                        ]
                    };
                }
                break;
            }

            case 'REMOVE_PARTICIPANT': {
                const pid = findParticipantId(action.id); // action.id might be name or id
                if (pid) {
                    newState = {
                        ...newState,
                        participants: newState.participants.filter(p => p.id !== pid),
                        items: newState.items.map(item => {
                            const { [pid]: _, ...rest } = item.consumption;
                            return { ...item, consumption: rest };
                        })
                    };
                }
                break;
            }

            case 'SET_SPLIT_MODE': {
                const itemIndex = findItemIndex(action.item);
                if (itemIndex !== -1) {
                    const item = newState.items[itemIndex];
                    if (item.splitMode !== action.mode) {
                        const updatedItems = [...newState.items];
                        updatedItems[itemIndex] = {
                            ...item,
                            splitMode: action.mode,
                            consumption: {} // Reset consumption on mode switch
                        };
                        newState = { ...newState, items: updatedItems };
                    }
                }
                break;
            }

            case 'SET_CHECKED': {
                const itemIndex = findItemIndex(action.item);
                if (itemIndex !== -1) {
                    const item = newState.items[itemIndex];
                    if (item.splitMode === 'EQUAL') {
                        const newConsumption = { ...item.consumption };

                        // For EQUAL, action.participants list are the ones to be checked.
                        // Assumption: This action sets the specific participants to TRUE.
                        // Does it clear others? "SET_CHECKED" implies setting state.
                        // Usually LLM says "Shared by Alice and Bob".
                        // So we should probably set only those to true? Or reset others?
                        // Let's assume authoritative set for now, or just set to true.
                        // But if LLM says "Alice and Bob", it usually implies *only* them.
                        // Let's interpret as: Set these to true, leave undefined/others?
                        // Or better: clear and set. "shared by Alice and Bob" -> logic is exclusive.

                        // Let's clear for safety if the list is provided.
                        const freshConsumption: Record<string, boolean> = {};

                        action.participants.forEach(pName => {
                            const pid = findParticipantId(pName);
                            if (pid) {
                                freshConsumption[pid] = true;
                            }
                        });

                        const updatedItems = [...newState.items];
                        updatedItems[itemIndex] = { ...item, consumption: freshConsumption };
                        newState = { ...newState, items: updatedItems };
                    }
                }
                break;
            }

            case 'SET_UNIT': {
                const itemIndex = findItemIndex(action.item);
                if (itemIndex !== -1) {
                    const item = newState.items[itemIndex];
                    if (item.splitMode === 'UNIT') {
                        const pid = findParticipantId(action.participant);
                        if (pid) {
                            const updatedItems = [...newState.items];
                            updatedItems[itemIndex] = {
                                ...item,
                                consumption: {
                                    ...item.consumption,
                                    [pid]: action.quantity
                                }
                            };
                            newState = { ...newState, items: updatedItems };
                        }
                    }
                }
                break;
            }
        }
    }

    return newState;
}
