import React, { useRef } from 'react';
import { useBillStore } from '../store/useBillStore';

interface UploadBillProps {
    onMissingKey?: () => void;
}

export const UploadBill: React.FC<UploadBillProps> = ({ onMissingKey }) => {
    const { uploadBill, isUploading, userApiKey } = useBillStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await uploadBill(file);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClick = () => {
        if (!userApiKey) {
            if (onMissingKey) onMissingKey();
            else alert("Please set your API Key in settings first.");
            return;
        }
        fileInputRef.current?.click();
    };

    return (
        <div className="relative">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            <button
                onClick={handleClick}
                disabled={isUploading}
                className={`
                    w-full h-12 px-4 text-sm font-semibold rounded-xl border transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95
                    ${isUploading
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                    }
                `}
            >
                {isUploading ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="hidden sm:inline">Targeting...</span>
                    </>
                ) : (
                    <>
                        {/* Camera SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                        <span className="hidden sm:inline">Upload Bill</span>
                    </>
                )}
            </button>
        </div>
    );
};
