import React, { useRef, useState } from 'react';
import { useBillStore } from '../store/useBillStore';

interface UploadBillProps {
    onMissingKey?: () => void;
}

export const UploadBill: React.FC<UploadBillProps> = ({ onMissingKey }) => {
    const { uploadBill, isUploading, userApiKey } = useBillStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const processFile = async (file: File) => {
        if (!userApiKey) {
            if (onMissingKey) onMissingKey();
            else alert("Please set your API Key in settings first.");
            return;
        }

        await uploadBill(file);
        // Reset input so same file can be selected again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            await processFile(file);
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
        <div className="relative group">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            <button
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                disabled={isUploading}
                className={`
                    relative overflow-hidden w-full sm:w-auto h-12 sm:h-auto px-6 py-3 
                    border-2 border-dashed rounded-xl transition-all duration-300 ease-out
                    flex items-center justify-center gap-3
                    ${isUploading
                        ? 'bg-m3-surface-variant border-transparent text-m3-on-surface-variant cursor-not-allowed opacity-80'
                        : isDragging
                            ? 'bg-m3-primary-container border-m3-primary text-m3-on-primary-container scale-105 shadow-elevation-2'
                            : 'bg-m3-surface hover:bg-m3-surface-variant border-m3-outline hover:border-m3-primary text-m3-on-surface hover:text-m3-primary shadow-sm hover:shadow-elevation-1 active:scale-95'
                    }
                `}
            >
                {/* Background Ripple Effect on Click could go here if implemented purely in CSS, 
                    but utilizing simple active states for now */}

                {isUploading ? (
                    <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="font-semibold text-sm">Analyzing Bill...</span>
                    </>
                ) : (
                    <>
                        <div className={`p-1 rounded-full ${isDragging ? 'bg-m3-primary text-m3-on-primary' : 'bg-m3-secondary-container text-m3-on-secondary-container group-hover:bg-m3-primary group-hover:text-m3-on-primary'} transition-colors`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                            </svg>
                        </div>
                        <span className="font-semibold text-sm hidden sm:inline">
                            {isDragging ? 'Drop to Upload' : 'Upload Bill Resource'}
                        </span>
                        <span className="font-semibold text-sm sm:hidden">
                            Upload Bill
                        </span>
                    </>
                )}
            </button>
        </div>
    );
};
