import React from 'react';
import { TranslationKey } from '../types';

export default function LevelUpModal({ t, onClose, reward }: {
    t: (key: TranslationKey, params?: Record<string, string | number>) => string;
    onClose: () => void;
    reward: { level: number; money: number };
}) {
    return (
        <div className="modal-overlay top">
            <div className="modal-content level-up-modal" onClick={e => e.stopPropagation()}>
                <div className="level-up-animation">
                    <span className="star star1">⭐</span>
                    <span className="star star2">🌟</span>
                    <span className="star star3">✨</span>
                </div>
                <h2>{t('levelUpTitle')}</h2>
                <p>{t('levelUpMessage', { level: reward.level })}</p>
                <div className="reward-section">
                    <h3>{t('levelUpReward')}</h3>
                    <p className="reward-amount">💰 {reward.money}</p>
                </div>
                <button className="claim-reward-button" onClick={onClose}>
                    {t('claimReward')}
                </button>
            </div>
        </div>
    );
}
