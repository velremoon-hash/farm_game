import React from 'react';
import { TranslationKey, PetRarity } from '../types';
import { PET_PULL_COST, PET_RARITY_CHANCES } from '../data';

interface PetGachaModalProps {
    t: (key: TranslationKey, params?: Record<string, any>) => string;
    onClose: () => void;
    onPetPull: (count: 1 | 10) => void;
    petBiscuits: number;
}

export default function PetGachaModal({ t, onClose, onPetPull, petBiscuits }: PetGachaModalProps) {
    const canAffordSingle = petBiscuits >= PET_PULL_COST.single;
    const canAffordMulti = petBiscuits >= PET_PULL_COST.multi;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content pet-gacha-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <h2>{t('petGacha')}</h2>
                
                <p className="biscuit-balance">🦴 {petBiscuits}</p>

                <div className="gacha-pull-buttons">
                    <button 
                        className="pull-button"
                        onClick={() => onPetPull(1)}
                        disabled={!canAffordSingle}
                    >
                        {t('pull1')}
                        <br/>
                        <span style={{fontSize: '1rem'}}>{t('pullCost', { count: PET_PULL_COST.single })}</span>
                    </button>
                    <button 
                        className="pull-button pull-button-10x"
                        onClick={() => onPetPull(10)}
                        disabled={!canAffordMulti}
                    >
                        {t('pull10')}
                        <br/>
                        <span style={{fontSize: '1rem'}}>{t('pullCost', { count: PET_PULL_COST.multi })}</span>
                        <br/>
                        <span className="pull-guarantee">{t('guaranteedRare')}</span>
                    </button>
                </div>

                <div>
                    <h4>{t('probabilities')}</h4>
                    <table className="probabilities-table">
                        <tbody>
                            {(Object.keys(PET_RARITY_CHANCES) as PetRarity[]).map(rarity => (
                                <tr key={rarity}>
                                    <td className={`rarity-${rarity}`}>{t(`rarity_${rarity}` as TranslationKey)}</td>
                                    <td>{(PET_RARITY_CHANCES[rarity] * 100).toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}