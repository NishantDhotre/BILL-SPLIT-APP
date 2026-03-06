import React from 'react';
import { useBillStore } from '../store/useBillStore';
import type { ImportPreference } from '../types';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const IMPORT_OPTIONS: { value: ImportPreference; label: string; desc: string }[] = [
    { value: 'ai', label: 'AI Scan', desc: 'Upload or photograph receipts' },
    { value: 'json', label: 'JSON Import', desc: 'Paste bill data as JSON' },
    { value: 'both', label: 'Both', desc: 'Show all import options' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const {
        userProfile,
        setUserProfile,
        userApiKey,
        setUserApiKey,
        isUpiEnabled,
        upiId,
        upiName,
        setUpiConfig,
    } = useBillStore();

    // Temp states for the form
    const [tempName, setTempName] = React.useState('');
    const [tempPref, setTempPref] = React.useState<ImportPreference>('both');
    const [tempKey, setTempKey] = React.useState('');
    const [tempUpiEnabled, setTempUpiEnabled] = React.useState(false);
    const [tempUpiId, setTempUpiId] = React.useState('');
    const [tempUpiName, setTempUpiName] = React.useState('');

    // Sync temp state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setTempName(userProfile.name || '');
            setTempPref(userProfile.importPreference || 'both');
            setTempKey(userApiKey || '');
            setTempUpiEnabled(isUpiEnabled);
            setTempUpiId(upiId || '');
            setTempUpiName(upiName || '');
        }
    }, [isOpen, userProfile, userApiKey, isUpiEnabled, upiId, upiName]);

    const handleSave = () => {
        setUserProfile({ name: tempName.trim(), importPreference: tempPref });
        setUserApiKey(tempKey);
        setUpiConfig(tempUpiEnabled, tempUpiId, tempUpiName);
        onClose();
    };

    if (!isOpen) return null;

    const showApiKeyField = tempPref === 'ai' || tempPref === 'both';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-m3-surface rounded-2xl w-full max-w-md shadow-elevation-3 animate-enter max-h-[90vh] overflow-y-auto outline-none flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-m3-primary p-5 rounded-t-2xl shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
                            {tempName ? tempName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-m3-on-primary">Your Profile</h2>
                            <p className="text-sm text-m3-on-primary/70">Personalize your experience</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-m3-on-surface-variant block">
                            Your Name
                        </label>
                        <p className="text-xs text-m3-on-surface-variant">
                            Added as default participant when splitting bills.
                        </p>
                        <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            placeholder="e.g. Nishant"
                            className="w-full px-4 py-3 border border-m3-outline rounded-xl focus:border-m3-primary focus:ring-1 focus:ring-m3-primary focus:outline-none bg-m3-surface text-m3-on-surface"
                        />
                    </div>

                    <hr className="border-m3-outline-variant" />

                    {/* Import Preference */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-m3-on-surface-variant block">
                            How do you import bills?
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {IMPORT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setTempPref(opt.value)}
                                    className={`
                                        w-full text-left px-4 py-3 rounded-xl border-2 transition-all
                                        ${tempPref === opt.value
                                            ? 'border-m3-primary bg-m3-primary-container text-m3-on-primary-container shadow-sm'
                                            : 'border-m3-outline-variant bg-m3-surface text-m3-on-surface hover:bg-m3-surface-variant'}
                                    `}
                                >
                                    <div className="font-bold text-sm">{opt.label}</div>
                                    <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gemini API Key — only if AI is selected */}
                    {showApiKeyField && (
                        <>
                            <hr className="border-m3-outline-variant" />
                            <div className="space-y-2 animate-enter">
                                <label className="text-sm font-bold text-m3-on-surface-variant block">
                                    Gemini API Key
                                </label>
                                <p className="text-xs text-m3-on-surface-variant">
                                    Required for AI receipt scanning. Get one from{' '}
                                    <a
                                        href="https://aistudio.google.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-m3-primary underline"
                                    >
                                        Google AI Studio
                                    </a>.
                                </p>
                                <input
                                    type="password"
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                    placeholder="Paste API Key here..."
                                    className="w-full px-4 py-3 border border-m3-outline rounded-xl focus:border-m3-primary focus:ring-1 focus:ring-m3-primary focus:outline-none bg-m3-surface text-m3-on-surface"
                                />
                            </div>
                        </>
                    )}

                    <hr className="border-m3-outline-variant" />

                    {/* UPI Setup */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-m3-on-surface text-sm">Enable UPI QR</h3>
                                <p className="text-xs text-m3-on-surface-variant">
                                    Show QR code tailored for each participant's share.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer scale-90">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={tempUpiEnabled}
                                    onChange={(e) => setTempUpiEnabled(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-m3-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-m3-primary"></div>
                            </label>
                        </div>

                        {tempUpiEnabled && (
                            <div className="space-y-3 animate-enter">
                                <div>
                                    <label className="text-xs font-bold text-m3-on-surface-variant block mb-1">
                                        UPI ID
                                    </label>
                                    <input
                                        type="text"
                                        value={tempUpiId}
                                        onChange={(e) => setTempUpiId(e.target.value)}
                                        placeholder="e.g. name@upi"
                                        className="w-full px-4 py-2 border border-m3-outline rounded-xl focus:border-m3-primary focus:outline-none bg-m3-surface text-m3-on-surface text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-m3-on-surface-variant block mb-1">
                                        Payee Name (Optional)
                                    </label>
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
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 pt-2 border-t border-m3-outline-variant shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 font-bold text-m3-on-surface-variant hover:text-m3-on-surface transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-m3-primary text-m3-on-primary font-bold rounded-full hover:bg-indigo-700 transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
