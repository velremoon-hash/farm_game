import React from 'react';
import { TranslationKey, Pet, TranslatedPetTypes } from '../types';

interface GachaResultsModalProps {
    t: (key: TranslationKey) => string;
    results: Pet[];
    onClose: () => void;
    PET_TYPES: TranslatedPetTypes;
}

export default function GachaResultsModal({ t, results, onClose, PET_TYPES }: GachaResultsModalProps) {
    return (
        <div className="modal-overlay top" onClick={onClose}>
            <div className="modal-content gacha-results-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <h2>{t('newFriends')}</h2>
                <div className="gacha-results-grid">
                    {results.map((pet, index) => {
                        const petData = PET_TYPES[pet.type];
                        return (
                            <div 
                                key={pet.id} 
                                className={`pet-card rarity-${petData.rarity}`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="pet-card-icon">{petData.icon}</div>
                                <div className="pet-card-name">{petData.name}</div>
                            </div>
                        );
                    })}
                </div>
                <button className="claim-reward-button" onClick={onClose}>
                    {t('great')}
                </button>
            </div>
        </div>
    );
}