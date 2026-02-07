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

export const BillTable: React.FC<BillTableProps> = React.memo(({
    items,
    participants,
    onUpdateItem,
    onDeleteItem,
}) => {
    // ... logic remains same ...
    const handleModeSwitch = (itemId: string, currentMode: SplitMode) => {
        // Switch mode and reset consumption
        const newMode = currentMode === 'EQUAL' ? 'UNIT' : 'EQUAL';

        // Create new consumption map based on new mode
        let newConsumption = {};

        if (newMode === 'EQUAL') {
            // Auto-select ALL participants by default
            newConsumption = participants.reduce((acc, p) => ({ ...acc, [p.id]: true }), {});
        } else {
            // UNIT: Empty/Zero
            newConsumption = {};
        }

        onUpdateItem(itemId, {
            splitMode: newMode,
            consumption: newConsumption,
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
        <div className="overflow-hidden rounded-2xl border border-m3-outline-variant shadow-elevation-1 bg-m3-surface">

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-m3-surface-variant border-b border-m3-outline-variant">
                            <th className="py-4 px-6 font-bold text-m3-on-surface-variant text-sm">Item</th>
                            <th className="py-4 px-2 font-bold text-m3-on-surface-variant text-sm w-16">Qty</th>
                            <th className="py-4 px-6 font-bold text-m3-on-surface-variant text-sm w-24">Price</th>
                            <th className="py-4 px-6 font-bold text-m3-on-surface-variant text-sm w-32">Mode</th>
                            {participants.map(p => (
                                <th key={p.id} className="py-4 px-4 font-bold text-m3-on-surface-variant text-sm text-center min-w-[80px]">
                                    {p.name}
                                </th>
                            ))}
                            <th className="py-4 px-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-m3-outline-variant/40">
                        {items.map(item => {
                            const isValid = validateItem(item);
                            const currentQty = item.quantity || 1;
                            let errorMsg = '';
                            if (!isValid) {
                                if (item.splitMode === 'EQUAL') errorMsg = 'Select ≥ 1';
                                else {
                                    const totalUsed = Object.values(item.consumption).reduce((acc: number, val) =>
                                        acc + (typeof val === 'number' ? val : 0), 0);
                                    if (totalUsed > currentQty) errorMsg = `Exceeds Qty (${totalUsed}/${currentQty})`;
                                    else if (totalUsed < 1) errorMsg = 'Assign ≥ 1';
                                    else errorMsg = 'Invalid';
                                }
                            }

                            return (
                                <tr key={item.id} className={`group transition-colors hover:bg-m3-surface-variant/50 ${!isValid ? 'bg-m3-error-container/20' : ''}`}>
                                    <td className="py-3 px-6">
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                                            className="bg-transparent font-medium text-m3-on-surface placeholder-m3-on-surface-variant/50 focus:outline-none w-full"
                                            placeholder="Item name"
                                        />
                                        {!isValid && <div className="text-[10px] text-m3-error font-bold mt-1">{errorMsg}</div>}
                                    </td>
                                    <td className="py-3 px-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity || 1}
                                            onChange={(e) => onUpdateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                            className="w-12 bg-transparent text-center font-mono text-sm border-b border-transparent focus:border-m3-primary outline-none text-m3-on-surface"
                                        />
                                    </td>
                                    <td className="py-3 px-6">
                                        <div className="flex items-center text-m3-on-surface-variant">
                                            <span className="mr-1 text-xs">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.price}
                                                onChange={(e) => onUpdateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                                                className="bg-transparent w-20 focus:outline-none font-mono text-sm text-m3-on-surface"
                                            />
                                        </div>
                                    </td>
                                    <td className="py-3 px-6">
                                        <button
                                            onClick={() => handleModeSwitch(item.id, item.splitMode)}
                                            className={`text-xs font-bold px-2 py-1 rounded-md border uppercase tracking-wider transition-all 
                                                ${item.splitMode === 'EQUAL'
                                                    ? 'bg-m3-primary-container text-m3-on-primary-container border-m3-primary-container hover:brightness-95'
                                                    : 'bg-m3-tertiary-container text-m3-on-tertiary-container border-m3-tertiary-container hover:brightness-95'}`}
                                        >
                                            {item.splitMode}
                                        </button>
                                    </td>
                                    {participants.map(p => (
                                        <td key={p.id} className="py-3 px-4 text-center">
                                            <div className="flex justify-center">
                                                {item.splitMode === 'EQUAL' ? (
                                                    <CheckboxControl checked={!!item.consumption[p.id]} onChange={(val) => handleConsumptionChange(item.id, p.id, val)} />
                                                ) : (
                                                    <UnitControl value={(item.consumption[p.id] as number) || 0} onChange={(val) => handleConsumptionChange(item.id, p.id, val)} />
                                                )}
                                            </div>
                                        </td>
                                    ))}
                                    <td className="py-3 px-4 text-center">
                                        <button onClick={() => onDeleteItem(item.id)} className="w-8 h-8 flex items-center justify-center text-m3-on-surface-variant hover:text-m3-on-error hover:bg-m3-error-container rounded-full transition-colors mx-auto active:scale-95">×</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-m3-outline-variant/40">
                {items.length === 0 && (
                    <div className="p-8 text-center text-m3-on-surface-variant text-sm font-medium">
                        No items added.
                    </div>
                )}

                {items.map(item => {
                    const isValid = validateItem(item);
                    return (
                        <div key={item.id} className={`p-4 space-y-3 ${!isValid ? 'bg-m3-error-container/10 border-l-4 border-l-m3-error pl-3' : ''} text-sm transition-colors`}>
                            {/* Row 1: Name & Price */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => onUpdateItem(item.id, { name: e.target.value })}
                                    className="flex-1 bg-transparent font-bold text-m3-on-surface placeholder-m3-on-surface-variant/50 focus:outline-none min-w-0"
                                    placeholder="Item Name"
                                />
                                <div className="flex items-center bg-m3-surface-variant px-2 py-1 rounded-lg border border-m3-outline-variant shrink-0">
                                    <span className="text-m3-on-surface-variant text-xs mr-1">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={item.price}
                                        onChange={(e) => onUpdateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                                        className="w-16 bg-transparent font-mono font-bold text-m3-on-surface outline-none text-right"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Controls & Participants */}
                            <div className="flex items-center gap-2 h-10">
                                {/* Qty */}
                                <div className="relative shrink-0 w-10">
                                    <span className="absolute -top-2 left-0 text-[8px] text-m3-on-surface-variant font-bold uppercase">Qty</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity || 1}
                                        onChange={(e) => onUpdateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                        className="w-full h-10 bg-m3-surface-variant border border-m3-outline-variant rounded-lg text-center font-mono font-bold text-m3-on-surface outline-none text-xs"
                                    />
                                </div>

                                {/* Mode Switch */}
                                <button
                                    onClick={() => handleModeSwitch(item.id, item.splitMode)}
                                    className={`shrink-0 h-10 px-3 rounded-lg border uppercase tracking-wider text-[10px] font-bold transition-all active:scale-95 
                                    ${item.splitMode === 'EQUAL'
                                            ? 'bg-m3-primary-container text-m3-on-primary-container border-m3-primary-container'
                                            : 'bg-m3-tertiary-container text-m3-on-tertiary-container border-m3-tertiary-container'}`}
                                >
                                    {item.splitMode.substring(0, 1)}
                                </button>

                                {/* Scrollable Participants */}
                                <div className="flex-1 overflow-x-auto flex items-center gap-2 px-1 no-scrollbar mask-linear-fade">
                                    {participants.map(p => (
                                        <div key={p.id} className={`shrink-0 flex flex-col items-center justify-center ${item.splitMode === 'EQUAL' ? 'w-8' : 'w-16'}`}>
                                            <div className="text-[9px] text-m3-on-surface-variant font-medium truncate w-full text-center leading-none mb-1">{p.name.substring(0, 3)}</div>
                                            {item.splitMode === 'EQUAL' ? (
                                                <CheckboxControl checked={!!item.consumption[p.id]} onChange={(val) => handleConsumptionChange(item.id, p.id, val)} />
                                            ) : (
                                                <UnitControl value={(item.consumption[p.id] as number) || 0} onChange={(val) => handleConsumptionChange(item.id, p.id, val)} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Delete */}
                                <button onClick={() => onDeleteItem(item.id)} className="shrink-0 w-8 h-8 flex items-center justify-center text-m3-on-surface-variant hover:text-m3-on-error hover:bg-m3-error-container rounded-full transition-colors active:scale-95">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
