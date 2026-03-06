import React from 'react';
import { useBillStore } from '../store/useBillStore';
import { ClipboardIcon } from './Icons';

interface ApiKeyPromptProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ isOpen, onClose }) => {
    const { userApiKey, setUserApiKey, userProfile, setUserProfile } = useBillStore();
    const [tempKey, setTempKey] = React.useState('');

    React.useEffect(() => {
        if (isOpen) {
            setTempKey(userApiKey || '');
        }
    }, [isOpen, userApiKey]);

    if (!isOpen) return null;

    const handleSaveKey = () => {
        setUserApiKey(tempKey);
        onClose();
    };

    const handleSwitchToJson = () => {
        setUserProfile({ ...userProfile, importPreference: 'json' });
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-m3-surface rounded-2xl w-full max-w-sm shadow-elevation-3 animate-enter outline-none overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-m3-error-container p-5 flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-m3-error/20 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-m3-on-error-container">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-m3-on-error-container">API Key Required</h2>
                        <p className="text-sm text-m3-on-error-container/80 mt-0.5">
                            AI Scan needs a Gemini API key to analyze receipts.
                        </p>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {/* API Key input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-m3-on-surface-variant block">
                            Gemini API Key
                        </label>
                        <input
                            type="password"
                            value={tempKey}
                            onChange={(e) => setTempKey(e.target.value)}
                            placeholder="Paste API Key here..."
                            autoFocus
                            className="w-full px-4 py-3 border border-m3-outline rounded-xl focus:border-m3-primary focus:ring-1 focus:ring-m3-primary focus:outline-none bg-m3-surface text-m3-on-surface"
                        />
                        <p className="text-xs text-m3-on-surface-variant">
                            Get one free from{' '}
                            <a
                                href="https://aistudio.google.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-m3-primary underline"
                            >
                                Google AI Studio
                            </a>
                        </p>
                    </div>

                    {/* Save Key button */}
                    <button
                        onClick={handleSaveKey}
                        disabled={!tempKey.trim()}
                        className="w-full py-3 bg-m3-primary text-m3-on-primary font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Save Key & Continue
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-m3-outline-variant"></div>
                        <span className="text-xs text-m3-on-surface-variant font-medium">or</span>
                        <div className="flex-1 h-px bg-m3-outline-variant"></div>
                    </div>

                    {/* Switch to JSON */}
                    <button
                        onClick={handleSwitchToJson}
                        className="w-full py-3 border border-m3-outline text-m3-on-surface font-semibold rounded-xl hover:bg-m3-surface-variant transition-colors text-sm"
                    >
                        <ClipboardIcon className="w-5 h-5 inline mr-1" /> Switch to JSON Import instead
                    </button>
                </div>
            </div>
        </div>
    );
};
