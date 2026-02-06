import React from 'react';
import { useBillStore } from '../store/useBillStore';
import { ParticipantManagement } from './ParticipantManagement';
import { BillTable } from './BillTable';
import { UploadBill } from './UploadBill';
import { captureReceipt, shareImage } from '../utils/shareUtils';
import { ManualImportModal } from './ManualImportModal';

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
            // Check if we have an Env key as fallback to decide urgency, 
            // but user asked to "Always ask", so we prompt regardless to encourage BYOK.
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
            let share = 0;
            // Logic mirrored from calculations.ts (This could be exported for reuse ideally)
            if (item.splitMode === 'EQUAL') {
                const eligible = Object.values(item.consumption).filter(v => v === true).length;
                if (item.consumption[participantId] && eligible > 0) {
                    share = item.price / eligible;
                }
            } else {
                // UNIT
                const values = Object.values(item.consumption);
                const totalUnits = values.reduce((sum: number, val) => {
                    return sum + (typeof val === 'number' ? val : 0);
                }, 0);

                const rawUserUnit = item.consumption[participantId];
                const userUnits = typeof rawUserUnit === 'number' ? rawUserUnit : 0;

                if (totalUnits > 0 && userUnits > 0) {
                    share = (item.price / totalUnits) * userUnits;
                }
            }
            return { name: item.name, share };
        }).filter(i => i.share > 0);

        // Add Tax and Discount shares
        const pCount = bill.participants.length;
        if (pCount > 0) {
            if (taxTotal > 0) details.push({ name: 'Tax / Charges Share', share: taxTotal / pCount });
            if (discountTotal > 0) details.push({ name: 'Discount Share', share: -(discountTotal / pCount) });
        }

        return details;
    };

    return (
        <div className="min-h-screen bg-slate-50 py-6 px-3 sm:py-12 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                {/* Header */}
                {/* Header */}
                <div className="relative flex flex-col space-y-2 animate-enter">
                    {/* Settings Button: Static Right on Mobile, Absolute Right on Desktop */}
                    <div className="flex justify-end w-full sm:absolute sm:top-1 sm:right-0 sm:w-auto z-10">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="flex items-center gap-2 px-3 h-12 sm:h-auto sm:p-2 text-slate-400 hover:text-indigo-600 transition-colors text-sm font-bold bg-slate-50 sm:bg-transparent rounded-xl sm:rounded-none border sm:border-0 border-slate-100"
                            title="Configure API Key"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="hidden sm:inline">Configure Key</span>
                        </button>
                    </div>

                    <div className="text-center space-y-1 pt-1 sm:pt-0">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
                            Bill Splitter Pro
                        </h1>
                        <p className="text-slate-500 font-medium text-sm sm:text-base">Split any bill, fairly and effortlessly.</p>
                    </div>
                </div>

                {/* Validation Warning */}
                {!isValid && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-red-500">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    Some items have invalid split configurations. Please check the rows highlighted in red.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Error Warning */}
                {uploadError && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-amber-500">🛑</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-amber-700 font-bold">
                                    Upload Failed
                                </p>
                                <p className="text-sm text-amber-700">
                                    {uploadError}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Participant Management */}
                <div className="animate-enter delay-100">
                    <ParticipantManagement
                        participants={bill.participants}
                        onAddParticipant={addParticipant}
                        onRemoveParticipant={removeParticipant}
                    />
                </div>

                {/* Bill Context & Items */}
                <div className="space-y-4 animate-enter delay-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-slate-800">Items</h2>
                        {/* Action Buttons: 3 Cols on Mobile (Icon Only), Flex on Desktop (Text) */}
                        <div className="grid grid-cols-3 sm:flex gap-2 w-full sm:w-auto">

                            {/* Upload Button */}
                            <div className="col-span-1 sm:w-auto">
                                <UploadBill onMissingKey={() => setIsSettingsOpen(true)} />
                            </div>

                            {/* Import Button */}
                            <button
                                onClick={() => setIsImportOpen(true)}
                                className="col-span-1 h-12 px-4 bg-white text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 border border-slate-200 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
                                title="Import Manual JSON"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                <span className="hidden sm:inline">Import</span>
                            </button>

                            {/* Add Item Button */}
                            <button
                                onClick={addItem}
                                className="col-span-1 h-12 px-4 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-500/30 flex items-center justify-center gap-2 active:scale-95"
                                title="Add New Item"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                <span className="hidden sm:inline">Add Item</span>
                            </button>
                        </div>
                    </div>

                    <BillTable
                        items={bill.items}
                        participants={bill.participants}
                        onUpdateItem={updateItem}
                        onDeleteItem={deleteItem}
                    />
                </div>

                {/* Results Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-enter delay-500">

                    {/* Math Breakdown Panel */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 col-span-full md:col-span-1 flex flex-col justify-between gap-4">

                        {/* Summary Math */}
                        <div id="summary-card" className="space-y-2 border-b border-slate-100 pb-4 bg-white p-4">
                            <input
                                type="text"
                                className="w-full text-xl font-bold text-slate-800 text-center mb-4 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none placeholder-slate-400 transition-all"
                                value={bill.billName || ''}
                                onChange={(e) => setBillName(e.target.value)}
                                placeholder="Bill Summary (Edit Name)"
                            />
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Breakdown</h3>
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>+ Tax / Charges</span>
                                <span>₹{taxTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600 font-medium">
                                <span>- Discount</span>
                                <span>₹{discountTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-slate-100">
                                <span>Grand Total</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tax</label>
                                <input
                                    type="number"
                                    value={bill.tax || ''}
                                    onChange={(e) => setTax(Math.max(0, Number(e.target.value)))}
                                    className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Discount</label>
                                <input
                                    type="number"
                                    value={bill.discount || ''}
                                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                                    className="w-full h-12 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <button
                            onClick={async () => {
                                console.log('Share Summary button clicked');
                                const blob = await captureReceipt('summary-card');
                                console.log('Blob captured:', blob ? 'Yes' : 'No');
                                if (blob) shareImage(blob, 'bill-summary.png', 'Bill Summary');
                            }}
                            className="w-full py-3 sm:py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
                            title="Share Summary"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                            </svg>
                            <span className="hidden sm:inline">Share Summary</span>
                        </button>
                    </div>

                    {/* Participant Cards */}
                    {bill.participants.map(p => (
                        <div
                            key={p.id}
                            onClick={() => setViewingParticipant(p.id)}
                            className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-200 ${!isValid ? 'opacity-50' : ''} group`}
                        >
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 group-hover:text-indigo-500 transition-colors">
                                    {p.name}
                                </h3>
                                <div className="text-2xl font-bold text-indigo-600">
                                    ₹{(splitResults[p.id] || 0).toFixed(2)}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">Tap for details</p>
                            </div>
                            <div className="h-12 w-12 text-xl font-bold rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {p.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mini Bill Modal */}
                {viewingParticipant && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setViewingParticipant(null)}>
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>

                            {/* Capture Area */}
                            <div id="mini-bill-card">
                                <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                                    <div>
                                        <div className="text-xs text-indigo-200 font-bold uppercase tracking-wider mb-1">{bill.billName}</div>
                                        <h2 className="text-xl font-bold">
                                            {bill.participants.find(p => p.id === viewingParticipant)?.name}'s Bill
                                        </h2>
                                        <p className="text-indigo-200 text-sm">Itemized Breakdown</p>
                                    </div>
                                    {/* Close button hidden in capture if we wanted, but for now we keep header separate or clean up? 
                                        Actually, let's keep the close button OUTSIDE the capture area or hide it via CSS if possible?
                                        Simplest: Put ID on a wrapper that INCLUDES header but we might accept the X button in image.
                                         Better: Just accept it.
                                    */}
                                </div>
                                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 bg-white">
                                    {getParticipantDetails(viewingParticipant)?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                                            <span className="text-slate-600 font-medium truncate pr-4">{item.name}</span>
                                            <span className={`font-bold ${item.share < 0 ? 'text-green-600' : 'text-slate-800'}`}>
                                                ₹{Math.abs(item.share).toFixed(2)} {item.share < 0 ? '(Cr)' : ''}
                                            </span>
                                        </div>
                                    ))}
                                    {getParticipantDetails(viewingParticipant)?.length === 0 && (
                                        <p className="text-center text-slate-400 py-4">No items assigned yet.</p>
                                    )}
                                </div>
                                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                    <span className="font-bold text-slate-600">Total Payable</span>
                                    <span className="text-2xl font-black text-indigo-600">
                                        ₹{(splitResults[viewingParticipant] || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 bg-slate-100 flex justify-between items-center gap-4">
                                <button
                                    onClick={() => setViewingParticipant(null)}
                                    className="px-4 py-2 text-slate-500 font-medium hover:text-slate-700"
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
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                                >
                                    <span>📸</span> Share Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Modal */}
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setIsSettingsOpen(false)}>
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200 space-y-4" onClick={e => e.stopPropagation()}>
                            <h2 className="text-xl font-bold text-slate-800">Configure AI Model</h2>
                            <p className="text-sm text-slate-600">
                                To use the AI features for free without limits, please provide your own <strong>Gemini API Key</strong>.
                            </p>
                            <div className="bg-slate-50 p-4 rounded-lg text-xs text-slate-500 space-y-2">
                                <p>1. Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">Google AI Studio</a>.</p>
                                <p>2. Create a free API Key.</p>
                                <p>3. Paste it below.</p>
                            </div>

                            <input
                                type="password"
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                                placeholder="Paste API Key here..."
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="px-4 py-2 text-slate-500 font-medium hover:text-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveKey}
                                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                                >
                                    Save Key
                                </button>
                            </div>
                            <div className="text-[10px] text-slate-400 text-center">
                                Your key is stored locally in your browser and never sent to our servers.
                            </div>
                        </div>
                    </div>
                )}

                <ManualImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />

            </div>
        </div>
    );
};
