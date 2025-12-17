import React from 'react';
import type { Item, Participant, SplitMode } from '../types';
import { CheckboxControl, UnitControl } from './SplitControls';
import { validateItem } from '../utils/calculations';

interface BillTableProps {
    items: Item[];
    participants: Participant[];
    onUpdateItem: (itemId: string, updates: Partial<Item>) => void;
    onDeleteItem: (itemId: string) => void;
}

export const BillTable: React.FC<BillTableProps> = ({
    items,
    participants,
    onUpdateItem,
    onDeleteItem,
}) => {
    const handleModeSwitch = (itemId: string, currentMode: SplitMode) => {
        // Switch mode and reset consumption
        const newMode = currentMode === 'EQUAL' ? 'UNIT' : 'EQUAL';

        // Create new consumption map based on new mode
        // EQUAL: all false
        // UNIT: all 0
        // Spec: "Mode switch clears incompatible inputs"

        onUpdateItem(itemId, {
            splitMode: newMode,
            consumption: {}, // Reset consumption
        });
    };

    const handleConsumptionChange = (
        itemId: string,
        participantId: string,
        val: boolean | number
    ) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        onUpdateItem(itemId, {
            consumption: {
                ...item.consumption,
                [participantId]: val
            }
        });
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="py-4 px-6 font-semibold text-slate-700 text-sm">Item</th>
                            <th className="py-4 px-6 font-semibold text-slate-700 text-sm w-24">Price</th>
                            <th className="py-4 px-6 font-semibold text-slate-700 text-sm w-32">Mode</th>
                            {participants.map(p => (
                                <th key={p.id} className="py-4 px-4 font-semibold text-slate-700 text-sm text-center min-w-[80px]">
                                    {p.name}
                                </th>
                            ))}
                            <th className="py-4 px-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map(item => {
                            const isValid = validateItem(item);

                            return (
                                <tr
                                    key={item.id}
                                    className={`group transition-colors hover:bg-slate-50/50 ${!isValid ? 'bg-red-50/50' : ''}`}
                                >
                                    <td className="py-3 px-6">
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                                            className="bg-transparent font-medium text-slate-900 placeholder-slate-400 focus:outline-none w-full"
                                            placeholder="Item name"
                                        />
                                        {!isValid && (
                                            <div className="text-[10px] text-red-500 font-medium mt-1">
                                                {item.splitMode === 'EQUAL' ? 'Select at least one' : 'Invalid quantities'}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-6">
                                        <div className="flex items-center text-slate-600">
                                            <span className="mr-1 text-xs">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.price}
                                                onChange={(e) => onUpdateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                                                className="bg-transparent w-20 focus:outline-none font-mono text-sm"
                                            />
                                        </div>
                                    </td>
                                    <td className="py-3 px-6">
                                        <button
                                            onClick={() => handleModeSwitch(item.id, item.splitMode)}
                                            className={`
                        text-xs font-bold px-2 py-1 rounded-md border uppercase tracking-wider transition-all
                        ${item.splitMode === 'EQUAL'
                                                    ? 'bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100'
                                                    : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                                                }
                      `}
                                        >
                                            {item.splitMode}
                                        </button>
                                    </td>
                                    {participants.map(p => (
                                        <td key={p.id} className="py-3 px-4 text-center">
                                            <div className="flex justify-center">
                                                {item.splitMode === 'EQUAL' ? (
                                                    <CheckboxControl
                                                        checked={!!item.consumption[p.id]}
                                                        onChange={(val) => handleConsumptionChange(item.id, p.id, val)}
                                                    />
                                                ) : (
                                                    <UnitControl
                                                        value={(item.consumption[p.id] as number) || 0}
                                                        onChange={(val) => handleConsumptionChange(item.id, p.id, val)}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    ))}
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => onDeleteItem(item.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors px-2"
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {items.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        No items added. Upload a bill or add manually.
                    </div>
                )}
            </div>
        </div>
    );
};
