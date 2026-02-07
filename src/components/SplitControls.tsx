import React from 'react';

interface CheckboxControlProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const CheckboxControl: React.FC<CheckboxControlProps> = ({ checked, onChange }) => (
    <label className="flex items-center justify-center min-w-[48px] min-h-[48px] cursor-pointer group relative">
        <input
            type="checkbox"
            className="hidden"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`
      w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200
      ${checked
                ? 'bg-m3-primary border-m3-primary shadow-sm shadow-indigo-500/30'
                : 'bg-m3-surface border-m3-outline group-hover:border-m3-primary'
            }
    `}>
            <svg
                className={`w-4 h-4 text-m3-on-primary transform transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        {/* Ripple effect placeholder or expanded touch area visual if needed, 
            but min-w/min-h ensures 48px hit area. */}
    </label>
);

interface UnitControlProps {
    value: number;
    onChange: (value: number) => void;
}

export const UnitControl: React.FC<UnitControlProps> = ({ value, onChange }) => (
    <div className="flex items-center justify-center min-w-[48px] min-h-[48px]">
        <input
            type="number"
            min="0"
            step="1"
            value={value === 0 ? '' : value}
            placeholder="0"
            onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0) onChange(val);
            }}
            className={`
        w-16 h-10 px-2 text-center text-sm font-bold rounded-xl border-2 outline-none transition-all
        ${value > 0
                    ? 'bg-m3-primary-container border-m3-primary text-m3-on-primary-container focus:border-m3-primary'
                    : 'bg-m3-surface-variant border-transparent hover:border-m3-outline focus:bg-m3-surface focus:border-m3-primary text-m3-on-surface-variant'
                }
      `}
        />
    </div>
);
