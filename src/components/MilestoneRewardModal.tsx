import React from 'react';
import { TranslationKey } from '../types';

export default function MilestoneRewardModal({ t, onClose, reward }: {
    t: (key: TranslationKey, params?: Record<string, any>) => string;
    onClose: () => void;
    reward: { milestone: number; money: number; seeds: number };
}) {
    return (
        <div className="modal-overlay top">
            <div className="modal-content milestone-reward-modal" onClick={e => e.stopPropagation()}>
                <div className="milestone-reward-animation">
                    <span className="star star1">🏆</span>
                    <span className="star star2">🌟</span>
                    <span className="star star3">✨</span>
                </div>
                <h2>{t('milestoneRewardTitle')}</h2>
                <p>{t('milestoneRewardMessage', { count: reward.milestone * 5 })}</p>
                <div className="reward-section">
                    <h3>{t('levelUpReward')}</h3>
                    <p className="reward-amount">💰 {reward.money}</p>
                    <p>{t('andSeeds', {count: reward.seeds})}</p>
                </div>
                <button className="claim-reward-button" onClick={onClose}>
                    {t('claimReward')}
                </button>
            </div>
        </div>
    );
}
