import React, { useState, useMemo, useRef } from 'react';
import { TranslationKey, Stats, Pet, TranslatedPetTypes, AchievementId, GameMode } from '../types';
import { XP_FOR_NEXT_LEVEL, ACHIEVEMENT_DATA } from '../data';

interface ProfileModalProps {
    t: (key: TranslationKey, params?: Record<string, any>) => string;
    onClose: () => void;
    farmName: string;
    level: number;
    xp: number;
    stats: Stats;
    activePet: Pet | null;
    PET_TYPES: TranslatedPetTypes;
    unlockedAchievements: Set<AchievementId>;
    claimedMilestoneRewards: number;
    onClaimMilestone: () => void;
    gameMode: GameMode;
    profilePicture: string | null;
    onSetProfilePicture: (dataUrl: string | null) => void;
}

export default function ProfileModal({
    t, onClose, farmName, level, xp, stats, activePet, PET_TYPES,
    unlockedAchievements, claimedMilestoneRewards, onClaimMilestone, gameMode,
    profilePicture, onSetProfilePicture
}: ProfileModalProps) {

    const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const xpForNext = XP_FOR_NEXT_LEVEL[level] || Infinity;
    const xpForLast = level > 1 ? XP_FOR_NEXT_LEVEL[level-1] : 0;
    const xpProgress = xpForNext === Infinity ? 100 : Math.max(0, ((xp - xpForLast) / (xpForNext - xpForLast)) * 100);

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

    const statDisplayOrder: (keyof Stats)[] = [
        'totalGoldEarned',
        'totalCropsHarvested',
        'totalProductsCollected',
        'totalAnimals',
        'foodEaten',
        'farmPlots',
        'greenhousePlots',
        'springCropsHarvested',
        'summerCropsHarvested',
        'autumnCropsHarvested',
        'winterCropsHarvested',
    ];
    
    const getStatName = (statKey: keyof Stats) => {
        const keyMap: Record<keyof Stats, TranslationKey> = {
            totalGoldEarned: 'stat_totalGoldEarned',
            totalCropsHarvested: 'stat_totalCropsHarvested',
            farmPlots: 'stat_farmPlots',
            greenhousePlots: 'stat_greenhousePlots',
            hasGreenhouse: 'stat_hasGreenhouse',
            level: 'level',
            springCropsHarvested: 'stat_springCrops',
            summerCropsHarvested: 'stat_summerCrops',
            autumnCropsHarvested: 'stat_autumnCrops',
            winterCropsHarvested: 'stat_winterCrops',
            foodEaten: 'stat_foodEaten',
            hasBarn: 'stat_hasBarn',
            totalAnimals: 'stat_totalAnimals',
            totalProductsCollected: 'stat_totalProductsCollected',
        };
        return t(keyMap[statKey]);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                onSetProfilePicture(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePicture = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSetProfilePicture(null);
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content profile-modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                
                <div className="profile-layout">
                    <div className="profile-left">
                        <div className="profile-avatar-container">
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <div
                                className={`profile-avatar ${profilePicture ? 'has-image' : ''}`}
                                onClick={handleAvatarClick}
                                title="Click to upload a picture"
                            >
                                {profilePicture ? (
                                    <img src={profilePicture} alt="Profile" />
                                ) : (
                                    activePet ? PET_TYPES[activePet.type].icon : '🧑‍🌾'
                                )}
                            </div>
                            {profilePicture && (
                                <button className="remove-picture-button" onClick={handleRemovePicture} aria-label="Remove profile picture">
                                    &times;
                                </button>
                            )}
                        </div>

                        <h2 className="profile-farm-name">{farmName}</h2>
                        <p className="profile-level">{t('level')} {level}</p>
                         <div className="xp-bar-outer">
                            <div className="xp-bar-inner" style={{width: `${xpProgress}%`}}></div>
                            <span className="xp-text">{xp - xpForLast} / {xpForNext - xpForLast}</span>
                        </div>
                    </div>

                    <div className="profile-right">
                        <div className="profile-tabs">
                            <button className={`profile-tab-button ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
                                {t('farmRecord')}
                            </button>
                             <button className={`profile-tab-button ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}>
                                {t('achievements')}
                            </button>
                        </div>
                        <div className="profile-content">
                            {activeTab === 'stats' && (
                                <div className="profile-stats-list">
                                    {statDisplayOrder.map(key => {
                                        const value = stats[key];
                                        if (typeof value !== 'boolean' || (typeof value === 'boolean' && value)) {
                                            return (
                                                <div key={key} className="profile-stat-item">
                                                    <span>{getStatName(key)}</span>
                                                    <span>{typeof value === 'boolean' ? t('completed') : value}</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            )}
                            {activeTab === 'achievements' && (
                                <div className="achievements-content">
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}