import React from 'react';
import { TranslationKey, Pet, TranslatedPetTypes } from '../types';

interface PetInventoryModalProps {
    t: (key: TranslationKey, params?: Record<string, any>) => string;
    onClose: () => void;
    ownedPets: Pet[];
    activePetId: number | null;
    onSetActivePet: (petId: number) => void;
    PET_TYPES: TranslatedPetTypes;
}

export default function PetInventoryModal({ t, onClose, ownedPets, activePetId, onSetActivePet, PET_TYPES }: PetInventoryModalProps) {
    const activePet = ownedPets.find(p => p.id === activePetId);
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content pet-inventory-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <h2>{t('myPets')}</h2>

                {activePet && (
                    <>
                        <h3>{t('activeCompanion')}</h3>
                        <div className={`pet-card rarity-${PET_TYPES[activePet.type].rarity}`}>
                             <div className="pet-card-icon">{PET_TYPES[activePet.type].icon}</div>
                            <div className="pet-card-name">{PET_TYPES[activePet.type].name}</div>
                        </div>
                    </>
                )}

                <h3>Collection</h3>
                <div className="pet-inventory-grid">
                    {ownedPets.map(pet => {
                        const petData = PET_TYPES[pet.type];
                        const isActive = pet.id === activePetId;
                        return (
                            <div
                                key={pet.id}
                                className={`pet-card rarity-${petData.rarity} ${isActive ? 'active' : ''}`}
                            >
                                {isActive && <div className="active-pet-label">⭐</div>}
                                <div className="pet-card-icon">{petData.icon}</div>
                                <div className="pet-card-name">{petData.name}</div>
                                {!isActive && (
                                    <button 
                                        className="set-active-button"
                                        onClick={() => onSetActivePet(pet.id)}
                                    >
                                        {t('setActive')}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}