import React from 'react';
import { useBillStore } from '../store/useBillStore';
import { ParticipantManagement } from './ParticipantManagement';
import { BillTable } from './BillTable';
import { UploadBill } from './UploadBill';
import { MOCK_BILL } from '../utils/mockBill';
import { captureReceipt, shareImage } from '../utils/shareUtils';

export const Dashboard: React.FC = () => {
    const {
        bill,
        splitResults,
        isValid,
        setBill,
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
    }, []); // Run once on mount

    const handleSaveKey = () => {
        setUserApiKey(tempKey);
        setIsSettingsOpen(false);
    };

    const [viewingParticipant, setViewingParticipant] = React.useState<string | null>(null);

    const loadMockBill = () => {
        setBill(MOCK_BILL);
    };

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
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                {/* Header */}
                <div className="relative text-center space-y-2">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="absolute right-0 top-1 p-2 text-slate-400 hover:text-indigo-600 transition-colors text-xl"
                        title="Configure API Key"
                    >
                        ⚙️Key
                    </button>
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                        Bill Splitter Pro
                    </h1>
                    <p className="text-slate-500 font-medium">Precision splitting for precision eating.</p>
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
                <ParticipantManagement
                    participants={bill.participants}
                    onAddParticipant={addParticipant}
                    onRemoveParticipant={removeParticipant}
                />

                {/* Bill Context & Items */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Items</h2>
                        <div className="flex gap-2">
                            <UploadBill onMissingKey={() => setIsSettingsOpen(true)} />
                            <button
                                onClick={loadMockBill}
                                className="px-4 py-2 bg-white text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
                            >
                                📥 Load Mock
                            </button>
                            <button
                                onClick={addItem}
                                className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-500/30"
                            >
                                + Add Item
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Math Breakdown Panel */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm col-span-full md:col-span-1 flex flex-col justify-between gap-4">

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
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Discount</label>
                                <input
                                    type="number"
                                    value={bill.discount || ''}
                                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            className="w-full py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <span>📸</span> Share Summary
                        </button>
                    </div>

                    {/* Participant Cards */}
                    {bill.participants.map(p => (
                        <div
                            key={p.id}
                            onClick={() => setViewingParticipant(p.id)}
                            className={`bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md cursor-pointer transition-all ${!isValid ? 'opacity-50' : ''} group`}
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

            </div>
        </div>
    );
};
