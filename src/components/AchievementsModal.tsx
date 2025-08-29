import React, { useMemo } from 'react';
import { AchievementId, GameMode, Stats, TranslationKey } from '../types';
import { ACHIEVEMENT_DATA } from '../data';

export default function AchievementsModal({ t, onClose, unlockedAchievements, stats, claimedMilestoneRewards, onClaimMilestone, gameMode }: {
    t: (key: TranslationKey, params?: Record<string, any>) => string;
    onClose: () => void;
    unlockedAchievements: Set<AchievementId>;
    stats: Stats;
    claimedMilestoneRewards: number;
    onClaimMilestone: () => void;
    gameMode: GameMode;
}) {
    const achievementsByCategory = useMemo(() => {
        const categories: Record<string, AchievementId[]> = {};
        for (const id of Object.keys(ACHIEVEMENT_DATA) as AchievementId[]) {
            const ach = ACHIEVEMENT_DATA[id];
            if (!categories[ach.category]) {
                categories[ach.category] = [];
            }
            categories[ach.category].push(id);
        }
        // Sort achievements within each category by tier
        for (const category in categories) {
            categories[category].sort((a, b) => ACHIEVEMENT_DATA[a].tier - ACHIEVEMENT_DATA[b].tier);
        }
        return categories;
    }, []);

    const totalMilestonesAvailable = Math.floor(unlockedAchievements.size / 5);
    const canClaimMilestone = totalMilestonesAvailable > claimedMilestoneRewards;
    const milestoneProgress = unlockedAchievements.size % 5;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <h2>{t('achievements')}</h2>
                
                <div className="milestone-reward-section">
                    <h3>{t('milestoneReward')}</h3>
                    <div className="milestone-progress-bar-outer">
                        <div className="milestone-progress-bar-inner" style={{ width: `${(milestoneProgress / 5) * 100}%` }}></div>
                        <span className="milestone-progress-text">{t('achievementsCompleted', { count: milestoneProgress })}</span>
                    </div>
                    {canClaimMilestone && (
                        <button className="claim-milestone-button" onClick={onClaimMilestone}>
                           🎁 {t('claimYourReward')}
                        </button>
                    )}
                </div>

                <div className="achievement-list">
                    {Object.entries(achievementsByCategory)
                        .filter(([category]) => gameMode === 'beta' || category !== 'Beta')
                        .map(([category, achievementIds]) => {
                        let nextAchievementId: AchievementId | null = null;
                        for (const id of achievementIds) {
                            if (!unlockedAchievements.has(id)) {
                                nextAchievementId = id;
                                break;
                            }
                        }

                        if (!nextAchievementId) {
                            // Optionally show a "completed" message for the category
                            return null;
                        }
                        
                        const data = ACHIEVEMENT_DATA[nextAchievementId];
                        const nameKey = `achievement_${nextAchievementId}_name` as TranslationKey;
                        const descKey = `achievement_${nextAchievementId}_desc` as TranslationKey;
                        const current_val = stats[data.requires.stat] as number || 0;
                        const required_val = data.requires.value as number;
                        const progress = Math.min(100, (current_val / required_val) * 100);

                        return (
                            <div key={category} className="achievement-category">
                                <h3>{t(`category_${category}` as TranslationKey)}</h3>
                                <div className={`achievement-item`}>
                                    <span className="achievement-icon">{data.icon}</span>
                                    <div className="achievement-details">
                                        <h4>
                                            <span>{t(nameKey)}</span>
                                            <span>{current_val} / {required_val}</span>
                                        </h4>
                                        <p>{t(descKey)}</p>
                                        <div className="achievement-progress-bar-outer">
                                            <div className="achievement-progress-bar-inner" style={{width: `${progress}%`}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                     {unlockedAchievements.size === Object.keys(ACHIEVEMENT_DATA).length && (
                        <p className="all-complete-message">{t('allAchievementsCompleted')}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
