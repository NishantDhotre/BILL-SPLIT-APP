import React from 'react';
import { useBillStore } from '../store/useBillStore';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
    const { savedBills, loadBill, deleteSavedBill } = useBillStore();

    if (!isOpen) return null;

    const handleLoad = (id: string) => {
        if (confirm('Load this bill? Current unsaved changes will be lost.')) {
            loadBill(id);
            onClose();
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this bill from history?')) {
            deleteSavedBill(id);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}>
            <div className="bg-m3-surface rounded-2xl w-full max-w-md p-6 shadow-elevation-3 space-y-4 animate-enter max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}>

                <div className="flex justify-between items-center pb-2 border-b border-m3-outline-variant">
                    <h2 className="text-xl font-bold text-m3-on-surface">Bill History</h2>
                    <button onClick={onClose} className="text-m3-on-surface-variant hover:text-m3-primary p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 py-2">
                    {savedBills.length === 0 ? (
                        <div className="text-center text-m3-on-surface-variant py-8">
                            <p>No saved bills found.</p>
                            <p className="text-sm mt-1">Use the "Save Bill" button to keep a record.</p>
                        </div>
                    ) : (
                        savedBills.map((bill) => {
                            const date = new Date(bill.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            });

                            const total = bill.items.reduce((sum, item) => sum + item.price, 0) + (bill.tax || 0) - (bill.discount || 0);

                            return (
                                <div key={bill.id}
                                    onClick={() => handleLoad(bill.id)}
                                    className="p-4 bg-m3-surface-variant rounded-xl border border-transparent hover:border-m3-primary cursor-pointer transition-all flex justify-between items-center group">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-m3-on-surface">{bill.billName || 'Unnamed Bill'}</h3>
                                        <p className="text-xs text-m3-on-surface-variant">{date}</p>
                                        <div className="flex gap-2 text-xs font-medium text-m3-tertiary">
                                            <span>{bill.participants.length} folks</span>
                                            <span>•</span>
                                            <span>{bill.items.length} items</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span className="font-bold text-m3-primary">₹{total.toFixed(2)}</span>
                                        <button
                                            onClick={(e) => handleDelete(bill.id, e)}
                                            className="text-m3-on-surface-variant hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Delete Saved Bill"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
