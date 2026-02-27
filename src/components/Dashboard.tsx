import React from 'react';
import { useBillStore } from '../store/useBillStore';
import { ParticipantManagement } from './ParticipantManagement';
import { BillTable } from './BillTable';
import { UploadBill } from './UploadBill';
import { captureReceipt, shareImage } from '../utils/shareUtils';
import { ManualImportModal } from './ManualImportModal';
import { calculateItemSplit } from '../utils/calculations';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { QRCodeSVG } from 'qrcode.react';
import { HistoryModal } from './HistoryModal';

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
        setUserApiKey,
        isUpiEnabled,
        upiId,
        upiName,
        setUpiConfig,
        saveCurrentBill,
        clearCurrentBill
    } = useBillStore();

    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [isImportOpen, setIsImportOpen] = React.useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

    // Temp states for settings modal
    const [tempKey, setTempKey] = React.useState('');
    const [tempUpiEnabled, setTempUpiEnabled] = React.useState(false);
    const [tempUpiId, setTempUpiId] = React.useState('');
    const [tempUpiName, setTempUpiName] = React.useState('');

    // Load current settings into temp state when modal opens
    React.useEffect(() => {
        if (isSettingsOpen) {
            setTempKey(userApiKey || '');
            setTempUpiEnabled(isUpiEnabled);
            setTempUpiId(upiId || '');
            setTempUpiName(upiName || '');
        }
    }, [isSettingsOpen, userApiKey, isUpiEnabled, upiId, upiName]);

    // Auto-prompt for key if missing
    React.useEffect(() => {
        if (!userApiKey) {
            setIsSettingsOpen(true);
        }
    }, [userApiKey]);

    const handleSaveSettings = () => {
        setUserApiKey(tempKey);
        setUpiConfig(tempUpiEnabled, tempUpiId, tempUpiName);
        setIsSettingsOpen(false);
    };

    const handleSaveBill = async () => {
        saveCurrentBill();
        await Haptics.impact({ style: ImpactStyle.Light });
        // Optional: show a quick toast or feedback here
    };

    const handleClearBill = async () => {
        if (confirm('Are you sure you want to clear the current bill?')) {
            clearCurrentBill();
            await Haptics.impact({ style: ImpactStyle.Light });
        }
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
        }).filter(i => Math.abs(i.share) > 0.001);

        // Calculate and add Tax & Discount shares
        const participantCount = bill.participants.length;
        if (participantCount > 0) {
            if (bill.tax > 0) {
                details.push({ name: 'Tax / Charges', share: bill.tax / participantCount });
            }
            if (bill.discount > 0) {
                // Negative share for discount so it displays properly and can be subtracted
                details.push({ name: 'Discount', share: -(bill.discount / participantCount) });
            }
        }

        return details;
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

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setIsHistoryOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-m3-outline text-m3-on-surface hover:bg-m3-surface-variant transition-all text-sm font-semibold"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>History</span>
                        </button>
                        <button
                            onClick={handleSaveBill}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-m3-outline text-emerald-600 hover:bg-emerald-50 transition-all text-sm font-semibold"
                        >
                            <span>Save Bill</span>
                        </button>
                        <button
                            onClick={handleClearBill}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-m3-outline text-red-600 hover:bg-red-50 transition-all text-sm font-semibold"
                        >
                            <span>Clear</span>
                        </button>

                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-m3-surface-variant text-m3-on-surface-variant hover:bg-m3-outline hover:text-m3-primary transition-all text-sm font-semibold"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            <span className="hidden sm:inline">Settings</span>
                        </button>
                    </div>
                </div>

                {/* Validation Warning */}
                {
                    !isValid && (
                        <div className="bg-m3-error-container text-m3-on-error-container rounded-xl p-4 flex items-start gap-3 shadow-sm">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <p className="font-bold">Check Split Configuration</p>
                                <p className="text-sm opacity-90">Some items have invalid split percentages or units.</p>
                            </div>
                        </div>
                    )
                }

                {/* Upload Error Warning */}
                {
                    uploadError && (
                        <div className="bg-amber-100 text-amber-900 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                            <span className="text-xl">🛑</span>
                            <div>
                                <p className="font-bold">Upload Failed</p>
                                <p className="text-sm opacity-90">{uploadError}</p>
                            </div>
                        </div>
                    )
                }

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
                                        inputMode="decimal"
                                        value={bill.tax || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setTax(val === '' ? 0 : Math.max(0, Number(val)));
                                        }}
                                        className="w-full bg-transparent font-bold text-m3-on-surface focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="bg-m3-surface-variant rounded-xl px-3 py-2">
                                    <label className="text-[10px] uppercase font-bold text-m3-on-surface-variant tracking-wider">Discount</label>
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        value={bill.discount || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setDiscount(val === '' ? 0 : Math.max(0, Number(val)));
                                        }}
                                        className="w-full bg-transparent font-bold text-m3-on-surface focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    await Haptics.impact({ style: ImpactStyle.Light });
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
                {
                    viewingParticipant && (
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

                                    {/* UPI QR Code Generation */}
                                    {isUpiEnabled && upiId && (splitResults[viewingParticipant] || 0) > 0 && (
                                        <div className="p-6 border-t border-m3-outline-variant bg-white flex flex-col items-center gap-3">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Scan to Pay</span>
                                            <QRCodeSVG
                                                value={`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName || bill.participants.find(p => p.id === viewingParticipant)?.name || 'Bill')}&am=${(splitResults[viewingParticipant] || 0).toFixed(2)}&cu=INR`}
                                                size={160}
                                                level="L"
                                                includeMargin={true}
                                            />
                                            <span className="text-sm font-bold text-gray-800">{upiId}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-m3-surface flex flex-wrap gap-3">
                                    <button
                                        onClick={() => setViewingParticipant(null)}
                                        className="flex-1 min-w-[120px] px-4 py-3 text-m3-on-surface-variant font-bold hover:bg-m3-surface-variant rounded-xl transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const pName = bill.participants.find(p => p.id === viewingParticipant)?.name || 'Bill';
                                            const details = getParticipantDetails(viewingParticipant);
                                            const total = (splitResults[viewingParticipant] || 0).toFixed(2);

                                            let text = `*Bill Split for ${pName}*\n`;
                                            if (bill.billName) text += `*${bill.billName}*\n\n`;
                                            else text += '\n';

                                            details?.forEach(item => {
                                                text += `${item.name}: ₹${Math.abs(item.share).toFixed(2)} ${item.share < 0 ? '(Cr)' : ''}\n`;
                                            });

                                            text += `\n*Total Payable: ₹${total}*\n`;

                                            if (isUpiEnabled && upiId && Number(total) > 0) {
                                                text += `\n*UPI ID*: ${upiId}\n`;
                                                text += `*Auto-Pay Link*: upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName || pName)}&am=${total}&cu=INR\n`;
                                            }

                                            try {
                                                await navigator.clipboard.writeText(text);
                                                alert('Copied to clipboard! You can paste in WhatsApp now.');
                                            } catch (err) {
                                                console.error('Failed to copy text: ', err);
                                                alert('Failed to copy. Try sharing the image receipt instead.');
                                            }
                                        }}
                                        className="flex-1 min-w-[120px] px-4 py-3 bg-m3-surface-variant text-m3-on-surface font-bold rounded-xl hover:bg-m3-outline transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>📋</span> Copy Text
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const pName = bill.participants.find(p => p.id === viewingParticipant)?.name || 'Bill';
                                            const blob = await captureReceipt('mini-bill-card');
                                            if (blob) {
                                                await shareImage(blob, `bill-${pName}.png`, `Bill for ${pName}`);
                                            }
                                        }}
                                        className="flex-1 min-w-[120px] px-4 py-3 bg-m3-primary text-m3-on-primary font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                                    >
                                        <span>📸</span> Share Receipt
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Settings Modal (kept simple but styled) */}
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsSettingsOpen(false)}>
                        <div className="bg-m3-surface rounded-2xl w-full max-w-md p-6 shadow-elevation-3 space-y-6 animate-enter max-h-[90vh] overflow-y-auto outline-none" onClick={e => e.stopPropagation()}>

                            {/* App Settings Section */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-m3-on-surface">Settings</h2>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-m3-on-surface-variant block">Gemini API Key</label>
                                    <p className="text-xs text-m3-on-surface-variant mb-2">Required for AI receipt scanning.</p>
                                    <input
                                        type="password"
                                        value={tempKey}
                                        onChange={(e) => setTempKey(e.target.value)}
                                        placeholder="Paste API Key here..."
                                        className="w-full px-4 py-3 border border-m3-outline rounded-xl focus:border-m3-primary focus:ring-1 focus:ring-m3-primary focus:outline-none bg-m3-surface text-m3-on-surface"
                                    />
                                </div>
                            </div>

                            <hr className="border-m3-outline-variant" />

                            {/* UPI Setup Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-m3-on-surface">Enable UPI QR</h3>
                                        <p className="text-xs text-m3-on-surface-variant">Show QR code tailored for each participant's share.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer scale-90">
                                        <input type="checkbox" className="sr-only peer" checked={tempUpiEnabled} onChange={(e) => setTempUpiEnabled(e.target.checked)} />
                                        <div className="w-11 h-6 bg-m3-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-m3-primary"></div>
                                    </label>
                                </div>

                                {tempUpiEnabled && (
                                    <div className="space-y-3 animate-enter">
                                        <div>
                                            <label className="text-xs font-bold text-m3-on-surface-variant block mb-1">UPI ID</label>
                                            <input
                                                type="text"
                                                value={tempUpiId}
                                                onChange={(e) => setTempUpiId(e.target.value)}
                                                placeholder="e.g. name@upi"
                                                className="w-full px-4 py-2 border border-m3-outline rounded-xl focus:border-m3-primary focus:outline-none bg-m3-surface text-m3-on-surface text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-m3-on-surface-variant block mb-1">Payee Name (Optional)</label>
                                            <input
                                                type="text"
                                                value={tempUpiName}
                                                onChange={(e) => setTempUpiName(e.target.value)}
                                                placeholder="e.g. John Doe"
                                                className="w-full px-4 py-2 border border-m3-outline rounded-xl focus:border-m3-primary focus:outline-none bg-m3-surface text-m3-on-surface text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 font-bold text-m3-on-surface-variant hover:text-m3-on-surface">Cancel</button>
                                <button onClick={handleSaveSettings} className="px-6 py-2 bg-m3-primary text-m3-on-primary font-bold rounded-full hover:bg-indigo-700">Save</button>
                            </div>
                        </div>
                    </div>
                )}

                <ManualImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
                <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

            </div>
        </div>
    );
};
