import React, { useState } from 'react';
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
        } catch (err: any) {
            setError(err.message || 'Invalid JSON format');
        }
    };

    const handleLoadMock = () => {
        setBill(MOCK_BILL);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Import / No-API Mode</h2>
                        <p className="text-sm text-slate-500">Use any external AI (ChatGPT, Claude, etc) to process your bill.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab('prompt')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'prompt' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Step 1: Get Prompt
                    </button>
                    <button
                        onClick={() => setActiveTab('paste')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'paste' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Step 2: Paste Response
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'prompt' ? (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg text-sm text-amber-800">
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
                                <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap h-64 font-mono">
                                    {BILL_ANALYSIS_PROMPT}
                                </pre>
                                <button
                                    onClick={handleCopyPrompt}
                                    className="absolute top-2 right-2 px-3 py-1 bg-white text-indigo-600 text-xs font-bold rounded-lg shadow hover:bg-indigo-50 transition-all"
                                >
                                    {copySuccess ? '✅ Copied!' : '📋 Copy Prompt'}
                                </button>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setActiveTab('paste')}
                                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
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
                                className="w-full flex-1 min-h-[200px] p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-xs"
                            />

                            {error && (
                                <div className="text-red-500 text-sm font-semibold p-2 bg-red-50 rounded-lg">
                                    ⚠️ {error}
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-2">
                                <button
                                    onClick={handleLoadMock}
                                    className="text-slate-400 text-xs hover:text-slate-600 underline"
                                >
                                    (Or load Demo Data)
                                </button>

                                <button
                                    onClick={handleImport}
                                    disabled={!jsonInput.trim()}
                                    className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    🚀 Import Bill
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
