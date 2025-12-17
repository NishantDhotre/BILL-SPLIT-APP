import React, { useRef } from 'react';
import { useBillStore } from '../store/useBillStore';

export const UploadBill: React.FC = () => {
    const { uploadBill, isUploading } = useBillStore();
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
                    px-4 py-2 text-sm font-semibold rounded-xl border transition-all shadow-sm flex items-center gap-2
                    ${isUploading
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                    }
                `}
            >
                {isUploading ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Targeting Items...
                    </>
                ) : (
                    <>
                        📸 Upload Bill
                    </>
                )}
            </button>
        </div>
    );
};
