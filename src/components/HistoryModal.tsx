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
                                            className="text-m3-error hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors flex items-center justify-center"
                                            title="Delete Saved Bill"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
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
