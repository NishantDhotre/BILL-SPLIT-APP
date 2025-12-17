import React from 'react';
import { useBillState } from '../hooks/useBillState';
import { ParticipantManagement } from './ParticipantManagement';
import { BillTable } from './BillTable';

export const Dashboard: React.FC = () => {
    const { bill, actions, splitResults } = useBillState();

    const totalBillAmount = bill.items.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                        Bill Splitter <span className="text-indigo-600">Pro</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Precision splitting for precision eating.</p>
                </div>

                {/* Participant Management */}
                <ParticipantManagement
                    participants={bill.participants}
                    onAddParticipant={actions.addParticipant}
                    onRemoveParticipant={actions.removeParticipant}
                />

                {/* Bill Table */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Items</h2>
                        <button
                            onClick={actions.addItem}
                            className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-500/30"
                        >
                            + Add Item
                        </button>
                    </div>

                    <BillTable
                        items={bill.items}
                        participants={bill.participants}
                        onUpdateItem={actions.updateItem}
                        onDeleteItem={actions.deleteItem}
                    />
                </div>

                {/* Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm col-span-full md:col-span-1">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Total Bill</h3>
                        <div className="text-4xl font-black text-slate-900">
                            ₹{totalBillAmount.toFixed(2)}
                        </div>
                    </div>

                    {bill.participants.map(p => (
                        <div key={p.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    {p.name}
                                </h3>
                                <div className="text-2xl font-bold text-indigo-600">
                                    ₹{(splitResults[p.id] || 0).toFixed(2)}
                                </div>
                            </div>
                            <div className="h-10 w-10 text-xl font-bold rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                {p.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};
