import React, { useState } from 'react';
import type { Participant } from '../types';

interface ParticipantManagementProps {
    participants: Participant[];
    onAddParticipant: (name: string) => void;
    onRemoveParticipant: (id: string) => void;
}

export const ParticipantManagement: React.FC<ParticipantManagementProps> = ({
    participants,
    onAddParticipant,
    onRemoveParticipant,
}) => {
    const [newName, setNewName] = useState('');

    const handleAdd = () => {
        if (newName.trim()) {
            onAddParticipant(newName.trim());
            setNewName('');
        }
    };

    return (
        <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span>👥</span> Participants
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
                {participants.map((p) => (
                    <div
                        key={p.id}
                        className="group flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100 transition-all hover:bg-indigo-100"
                    >
                        {p.name}
                        <button
                            onClick={() => onRemoveParticipant(p.id)}
                            className="w-5 h-5 flex items-center justify-center rounded-full text-indigo-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            aria-label={`Remove ${p.name}`}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="Add name..."
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
                <button
                    onClick={handleAdd}
                    disabled={!newName.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                    title="Add Participant"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="hidden sm:inline">Add</span>
                </button>
            </div>
        </div>
    );
};
