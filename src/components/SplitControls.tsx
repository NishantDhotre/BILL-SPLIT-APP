import React from 'react';

interface CheckboxControlProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const CheckboxControl: React.FC<CheckboxControlProps> = ({ checked, onChange }) => (
    <label className="flex items-center justify-center w-full h-full cursor-pointer group">
        <div className={`
      w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200
      ${checked
                ? 'bg-indigo-500 border-indigo-500 shadow-sm shadow-indigo-500/30'
                : 'bg-white border-slate-300 group-hover:border-indigo-300'
            }
    `}>
            <svg
                className={`w-4 h-4 text-white transform transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <input
            type="checkbox"
            className="hidden"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
        />
    </label>
);

interface UnitControlProps {
    value: number;
    onChange: (value: number) => void;
}

export const UnitControl: React.FC<UnitControlProps> = ({ value, onChange }) => (
    <div className="flex items-center justify-center">
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
        w-16 px-2 py-1.5 text-center text-sm font-medium rounded-lg border-2 outline-none transition-all
        ${value > 0
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 focus:border-indigo-500'
                    : 'bg-slate-50 border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 text-slate-600'
                }
      `}
        />
    </div>
);
