import React, { useState } from 'react';
import { CheckIcon, ClipboardIcon, WarningIcon } from './Icons';
import { useBillStore } from '../store/useBillStore';
import { BILL_ANALYSIS_PROMPT } from '../services/billService';
import { MOCK_BILL } from '../utils/mockBill';

interface ManualImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ManualImportModal: React.FC<ManualImportModalProps> = ({ isOpen, onClose }) => {
    const { importBillJSON, setBill } = useBillStore();
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'prompt' | 'paste'>('prompt');
    const [copySuccess, setCopySuccess] = useState(false);

    if (!isOpen) return null;

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(BILL_ANALYSIS_PROMPT);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleImport = () => {
        try {
            setError(null);
            importBillJSON(jsonInput);
            onClose();
            setJsonInput('');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Invalid JSON format';
            setError(msg);
        }
    };

    const handleLoadMock = () => {
        setBill(MOCK_BILL);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-m3-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-elevation-3 animate-enter flex flex-col" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 border-b border-m3-outline-variant flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-m3-on-surface">Import / No-API Mode</h2>
                        <p className="text-sm text-m3-on-surface-variant">Use any external AI (ChatGPT, Claude, etc) to process your bill.</p>
                    </div>
                    <button onClick={onClose} className="text-m3-on-surface-variant hover:text-m3-on-surface transition-colors">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-m3-outline-variant">
                    <button
                        onClick={() => setActiveTab('prompt')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'prompt' ? 'text-m3-primary border-b-2 border-m3-primary' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                    >
                        Step 1: Get Prompt
                    </button>
                    <button
                        onClick={() => setActiveTab('paste')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'paste' ? 'text-m3-primary border-b-2 border-m3-primary' : 'text-m3-on-surface-variant hover:text-m3-on-surface'}`}
                    >
                        Step 2: Paste Response
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'prompt' ? (
                        <div className="space-y-4">
                            <div className="bg-m3-tertiary-container border-l-4 border-m3-tertiary p-4 rounded-r-lg text-sm text-m3-on-tertiary-container">
                                <strong>Instructions:</strong>
                                <ol className="list-decimal list-inside mt-2 space-y-1">
                                    <li>Copy the System Prompt below.</li>
                                    <li>Go to <strong>ChatGPT, Claude, or Gemini</strong>.</li>
                                    <li>Paste the Prompt.</li>
                                    <li>Upload your Bill Image.</li>
                                    <li>Copy the <strong>JSON response</strong> they generate.</li>
                                </ol>
                            </div>

                            <div className="relative">
                                <pre className="bg-m3-inverse-surface text-m3-inverse-on-surface p-4 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap h-64 font-mono">
                                    {BILL_ANALYSIS_PROMPT}
                                </pre>
                                <button
                                    onClick={handleCopyPrompt}
                                    className="absolute top-2 right-2 px-3 py-1 bg-m3-primary-container text-m3-on-primary-container text-xs font-bold rounded-lg shadow hover:opacity-90 transition-all"
                                >
                                    {copySuccess ? <><CheckIcon className="w-4 h-4 inline" /> Copied!</> : <><ClipboardIcon className="w-4 h-4 inline" /> Copy Prompt</>}
                                </button>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setActiveTab('paste')}
                                    className="px-6 py-2 bg-m3-primary text-m3-on-primary font-bold rounded-xl hover:bg-indigo-700 transition-all"
                                >
                                    Next: Paste JSON →
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 h-full flex flex-col">
                            <textarea
                                value={jsonInput}
                                onChange={e => setJsonInput(e.target.value)}
                                placeholder="Paste the JSON response from the AI here..."
                                className="w-full flex-1 min-h-[200px] p-4 border border-m3-outline rounded-xl focus:ring-2 focus:ring-m3-primary focus:outline-none font-mono text-xs bg-m3-surface text-m3-on-surface placeholder:text-m3-on-surface-variant"
                            />

                            {error && (
                                <div className="text-m3-on-error-container text-sm font-semibold p-2 bg-m3-error-container rounded-lg">
                                    <WarningIcon className="w-4 h-4 inline shrink-0" /> {error}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-2">
                                <button
                                    onClick={handleLoadMock}
                                    className="text-m3-on-surface-variant text-xs hover:text-m3-on-surface underline"
                                >
                                    (Or load Demo Data)
                                </button>

                                <button
                                    onClick={handleImport}
                                    disabled={!jsonInput.trim()}
                                    className="px-6 py-2 bg-m3-primary text-m3-on-primary font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <><CheckIcon className="w-5 h-5 inline mr-1" /> Import Bill</>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
