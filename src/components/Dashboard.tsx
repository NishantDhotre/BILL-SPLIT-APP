import React from 'react';
import { useBillStore } from '../store/useBillStore';
import { ParticipantManagement } from './ParticipantManagement';
import { BillTable } from './BillTable';
import { UploadBill } from './UploadBill';
import { captureReceipt, shareImage } from '../utils/shareUtils';
import { ManualImportModal } from './ManualImportModal';
import { calculateItemSplit } from '../utils/calculations';

export const Dashboard: React.FC = () => {
    const {
        bill,
        splitResults,
        isValid,
        addParticipant,
        removeParticipant,
        addItem,
        updateItem,
        deleteItem,
        uploadError,
        setDiscount,
        setTax,
        setBillName,
        userApiKey,
        setUserApiKey
    } = useBillStore();

    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [isImportOpen, setIsImportOpen] = React.useState(false);
    const [tempKey, setTempKey] = React.useState('');

    // Load key into temp state when opening
    React.useEffect(() => {
        if (isSettingsOpen) setTempKey(userApiKey || '');
    }, [isSettingsOpen, userApiKey]);

    // Auto-prompt for key if missing
    React.useEffect(() => {
        if (!userApiKey) {
            setIsSettingsOpen(true);
        }
    }, [userApiKey]);

    const handleSaveKey = () => {
        setUserApiKey(tempKey);
        setIsSettingsOpen(false);
    };

    const [viewingParticipant, setViewingParticipant] = React.useState<string | null>(null);

    const subtotal = bill.items.reduce((sum, item) => sum + item.price, 0);
    const taxTotal = bill.tax || 0;
    const discountTotal = bill.discount || 0;
    const grandTotal = subtotal + taxTotal - discountTotal;

    const getParticipantDetails = (participantId: string) => {
        const participant = bill.participants.find(p => p.id === participantId);
        if (!participant) return null;

        const details = bill.items.map(item => {
            const itemSplits = calculateItemSplit(item);
            const share = itemSplits[participantId] || 0;
            return { name: item.name, share };
        }).filter(i => i.share > 0); // Only positive shares (credits/debt handled in total, but item level usually positive unless negative price?)
        // Actually, negative price items (discounts) would result in negative share, which is fine.
        // But the filter > 0 might hide them?
        // Let's modify filter to allow non-zero.

        // Wait, original code filtered > 0. If I have a discount item (-100), share is -50.
        // If I filter > 0, I lose the discount in the breakdown! 
        // Let's check original logic.
        /* 
           Original: .filter(i => i.share > 0);
           If the user adds a negative price item as a "discount item", it wouldn't show up in the breakdown list?
           That seems like a bug or limitation of the original implementation. 
           However, standard discounts are handled via Global Discount field.
           If a user enters a negative item price, it acts as a focused credit.
           I should probably filter `share !== 0`.
        */

        // Re-reading original code:
        // return { name: item.name, share };
        // }).filter(i => i.share > 0);

        // Use Math.abs(share) > 0.005 to filter out rounding dust?
        // Or just share !== 0.

        return details.filter(i => Math.abs(i.share) > 0.001);
    };

    return (
        <div className="min-h-screen bg-m3-background text-m3-on-background py-6 px-4 sm:py-12 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 animate-enter">
                    <div className="space-y-1">
                        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-m3-on-surface tracking-tight">
                            Bill Splitter <span className="text-m3-primary">Pro</span>
                        </h1>
                        <p className="text-m3-on-surface-variant text-lg font-medium">Split bills fairly, effortlessly.</p>
                    </div>

                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-full border border-m3-outline text-m3-on-surface-variant hover:bg-m3-surface-variant hover:text-m3-primary transition-all text-sm font-semibold"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Configure Key</span>
                    </button>
                </div>

                {/* Validation Warning */}
                {!isValid && (
                    <div className="bg-m3-error-container text-m3-on-error-container rounded-xl p-4 flex items-start gap-3 shadow-sm">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <p className="font-bold">Check Split Configuration</p>
                            <p className="text-sm opacity-90">Some items have invalid split percentages or units.</p>
                        </div>
                    </div>
                )}

                {/* Upload Error Warning */}
                {uploadError && (
                    <div className="bg-amber-100 text-amber-900 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                        <span className="text-xl">🛑</span>
                        <div>
                            <p className="font-bold">Upload Failed</p>
                            <p className="text-sm opacity-90">{uploadError}</p>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Participants & Items (8 cols) */}
                    <div className="lg:col-span-8 space-y-8 animate-enter delay-100">

                        {/* Participants Section */}
                        <section>
                            <ParticipantManagement
                                participants={bill.participants}
                                onAddParticipant={addParticipant}
                                onRemoveParticipant={removeParticipant}
                            />
                        </section>

                        {/* Items Section */}
                        <section className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-2xl font-display font-bold text-m3-on-surface">Items</h2>
                                <div className="flex flex-wrap gap-3">
                                    <UploadBill onMissingKey={() => setIsSettingsOpen(true)} />

                                    <button
                                        onClick={() => setIsImportOpen(true)}
                                        className="h-12 px-6 rounded-xl border border-m3-outline text-m3-on-surface hover:bg-m3-surface-variant hover:border-m3-outline-variant font-semibold transition-all flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>
                                        Import JSON
                                    </button>

                                    <button
                                        onClick={addItem}
                                        className="h-12 px-6 bg-m3-primary text-m3-on-primary rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Add Item
                                    </button>
                                </div>
                            </div>

                            <BillTable
                                items={bill.items}
                                participants={bill.participants}
                                onUpdateItem={updateItem}
                                onDeleteItem={deleteItem}
                            />
                        </section>
                    </div>

                    {/* Right Column: Summary & Breakdown (4 cols) */}
                    <div className="lg:col-span-4 space-y-6 animate-enter delay-200">

                        {/* Summary Card */}
                        <div className="bg-m3-surface rounded-2xl p-6 shadow-elevation-2 border border-m3-outline-variant space-y-6 sticky top-6">
                            <div id="summary-card" className="space-y-4 bg-m3-surface p-2 rounded-xl">
                                <input
                                    type="text"
                                    className="w-full text-2xl font-display font-bold text-center bg-transparent border-b border-transparent hover:border-m3-outline focus:border-m3-primary focus:outline-none placeholder-m3-on-surface-variant/50 transition-colors"
                                    value={bill.billName || ''}
                                    onChange={(e) => setBillName(e.target.value)}
                                    placeholder="Bill Name"
                                />

                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between text-m3-on-surface-variant">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-m3-on-surface-variant">
                                        <span>+ Tax / Charges</span>
                                        <span>₹{taxTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-m3-tertiary font-medium">
                                        <span>- Discount</span>
                                        <span>₹{discountTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-2xl font-bold text-m3-on-surface pt-4 border-t border-m3-outline-variant">
                                        <span>Total</span>
                                        <span>₹{grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-m3-surface-variant rounded-xl px-3 py-2">
                                    <label className="text-[10px] uppercase font-bold text-m3-on-surface-variant tracking-wider">Tax</label>
                                    <input
                                        type="number"
                                        value={bill.tax || ''}
                                        onChange={(e) => setTax(Math.max(0, Number(e.target.value)))}
                                        className="w-full bg-transparent font-bold text-m3-on-surface focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="bg-m3-surface-variant rounded-xl px-3 py-2">
                                    <label className="text-[10px] uppercase font-bold text-m3-on-surface-variant tracking-wider">Discount</label>
                                    <input
                                        type="number"
                                        value={bill.discount || ''}
                                        onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                                        className="w-full bg-transparent font-bold text-m3-on-surface focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    const blob = await captureReceipt('summary-card');
                                    if (blob) shareImage(blob, 'bill-summary.png', 'Bill Summary');
                                }}
                                className="w-full py-3 bg-m3-secondary-container text-m3-on-secondary-container font-bold rounded-xl hover:bg-m3-secondary hover:text-m3-on-secondary transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                                </svg>
                                Share Summary
                            </button>
                        </div>

                        {/* Individual Breakdowns Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                            {bill.participants.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => setViewingParticipant(p.id)}
                                    className={`bg-m3-surface rounded-xl p-4 border border-m3-outline-variant shadow-sm hover:shadow-elevation-2 hover:border-m3-primary cursor-pointer transition-all group flex items-center justify-between ${!isValid ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-m3-primary-container text-m3-on-primary-container font-bold flex items-center justify-center text-lg">
                                            {p.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-m3-on-surface group-hover:text-m3-primary transition-colors">{p.name}</h3>
                                            <p className="text-xs text-m3-on-surface-variant">Tap for details</p>
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold text-m3-primary">
                                        ₹{(splitResults[p.id] || 0).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Participant Detail Modal */}
                {viewingParticipant && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setViewingParticipant(null)}>
                        <div className="bg-m3-surface rounded-2xl w-full max-w-md shadow-elevation-5 overflow-hidden animate-enter" onClick={e => e.stopPropagation()}>

                            <div id="mini-bill-card">
                                <div className="bg-m3-primary p-6 text-m3-on-primary">
                                    <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">{bill.billName}</div>
                                    <h2 className="text-2xl font-bold">
                                        {bill.participants.find(p => p.id === viewingParticipant)?.name}'s Share
                                    </h2>
                                </div>
                                <div className="p-6 max-h-[50vh] overflow-y-auto space-y-3 bg-m3-surface">
                                    {getParticipantDetails(viewingParticipant)?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm py-2 border-b border-m3-outline-variant/50 last:border-0">
                                            <span className="text-m3-on-surface font-medium truncate pr-4">{item.name}</span>
                                            <span className={`font-bold ${item.share < 0 ? 'text-m3-tertiary' : 'text-m3-on-surface'}`}>
                                                ₹{Math.abs(item.share).toFixed(2)} {item.share < 0 ? '(Cr)' : ''}
                                            </span>
                                        </div>
                                    ))}
                                    {getParticipantDetails(viewingParticipant)?.length === 0 && (
                                        <p className="text-center text-m3-on-surface-variant py-4">No items assigned yet.</p>
                                    )}
                                </div>
                                <div className="p-6 bg-m3-surface-variant border-t border-m3-outline-variant flex justify-between items-center">
                                    <span className="font-bold text-m3-on-surface-variant">Total Payable</span>
                                    <span className="text-3xl font-black text-m3-primary">
                                        ₹{(splitResults[viewingParticipant] || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 bg-m3-surface flex gap-3">
                                <button
                                    onClick={() => setViewingParticipant(null)}
                                    className="flex-1 px-4 py-3 text-m3-on-surface-variant font-bold hover:bg-m3-surface-variant rounded-xl transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={async () => {
                                        const pName = bill.participants.find(p => p.id === viewingParticipant)?.name || 'Bill';
                                        const blob = await captureReceipt('mini-bill-card');
                                        if (blob) {
                                            await shareImage(blob, `bill-${pName}.png`, `Bill for ${pName}`);
                                        }
                                    }}
                                    className="flex-1 px-4 py-3 bg-m3-primary text-m3-on-primary font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                                >
                                    <span>📸</span> Share Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Modal (kept simple but styled) */}
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsSettingsOpen(false)}>
                        <div className="bg-m3-surface rounded-2xl w-full max-w-md p-6 shadow-elevation-3 space-y-4 animate-enter" onClick={e => e.stopPropagation()}>
                            <h2 className="text-xl font-bold text-m3-on-surface">Configure AI Model</h2>
                            <p className="text-sm text-m3-on-surface-variant">
                                Please provide your <strong>Gemini API Key</strong> to use AI features.
                            </p>
                            <input
                                type="password"
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                                placeholder="Paste API Key here..."
                                className="w-full px-4 py-3 border border-m3-outline rounded-xl focus:border-m3-primary focus:ring-1 focus:ring-m3-primary focus:outline-none bg-m3-surface text-m3-on-surface"
                            />
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 font-bold text-m3-on-surface-variant hover:text-m3-on-surface">Cancel</button>
                                <button onClick={handleSaveKey} className="px-6 py-2 bg-m3-primary text-m3-on-primary font-bold rounded-full hover:bg-indigo-700">Save</button>
                            </div>
                        </div>
                    </div>
                )}

                <ManualImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />

            </div>
        </div>
    );
};
