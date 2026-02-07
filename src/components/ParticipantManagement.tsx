import React, { useState } from 'react';
import type { Participant } from '../types';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

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
        <div className="p-6 bg-m3-surface rounded-2xl shadow-elevation-1 border border-m3-outline-variant">
            <h2 className="text-lg font-bold text-m3-on-surface mb-4 flex items-center gap-2">
                <span>👥</span> Participants
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
                {participants.map((p) => (
                    <div
                        key={p.id}
                        className="group flex items-center gap-2 px-3 py-1.5 bg-m3-secondary-container text-m3-on-secondary-container rounded-full text-sm font-medium border border-transparent hover:border-m3-secondary transition-all"
                    >
                        {p.name}
                        <button
                            onClick={async () => {
                                await Haptics.impact({ style: ImpactStyle.Light });
                                onRemoveParticipant(p.id);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full text-m3-on-secondary-container/60 hover:text-m3-on-error hover:bg-m3-error transition-colors ml-1"
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
                    className="flex-1 h-12 px-4 bg-m3-surface-variant text-m3-on-surface-variant border border-transparent focus:bg-m3-surface focus:border-m3-primary focus:text-m3-on-surface rounded-xl focus:outline-none focus:ring-1 focus:ring-m3-primary transition-all text-sm placeholder:text-m3-on-surface-variant/50"
                />
                <button
                    onClick={handleAdd}
                    disabled={!newName.trim()}
                    className="h-12 px-6 bg-m3-primary hover:bg-indigo-700 text-m3-on-primary text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-elevation-1 active:scale-95 flex items-center justify-center gap-2"
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
