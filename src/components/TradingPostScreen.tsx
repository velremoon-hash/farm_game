import React, { useState, useMemo } from 'react';
import {
    TranslationKey, GameMode, BarterDeal, CropType, AnimalProductType, FoodType, SupplyType,
    TranslatedCropTypes, TranslatedAnimalProductTypes, TranslatedFoodTypes, BarterItem, TranslatedSupplyTypes
} from '../types';
import { XP_FOR_NEXT_LEVEL, CROP_DATA, ANIMAL_PRODUCT_DATA, FOOD_DATA, RECIPE_DATA } from '../data';

// Define the sellable item types
type SellableItemType = 'rawCrop' | 'animalProduct' | 'food';
type SellableItemKey = CropType | AnimalProductType | FoodType;
interface SellableItem {
    type: SellableItemType;
    key: SellableItemKey;
    name: string;
    icon: string;
    quantity: number;
    sellPrice: number;
}


interface TradingPostScreenProps {
    t: (key: TranslationKey, params?: Record<string, any>) => string;
    onReturnToFarm: () => void;
    barterDeals: BarterDeal[];
    onExecuteTrade: (deal: BarterDeal) => void;
    onSellItem: (type: SellableItemType, key: SellableItemKey, quantity: number) => void;

    // Inventories
    rawCrops: Record<CropType, number>;
    animalProducts: Record<AnimalProductType, number>;
    foodInventory: Record<FoodType, number>;
    supplies: Record<SupplyType, number>;
    seeds: Record<CropType, number>; // for barter checking

    // Translated data
    CROP_TYPES: TranslatedCropTypes;
    ANIMAL_PRODUCT_TYPES: TranslatedAnimalProductTypes;
    FOOD_TYPES: TranslatedFoodTypes;
    SUPPLY_TYPES: TranslatedSupplyTypes;

    // HUD props
    farmName: string;
    money: number;
    score: number;
    level: number;
    xp: number;
    gameMode: GameMode;
    hunger: number;
    onGoToTitle: () => void;
}

export default function TradingPostScreen({
    t, onReturnToFarm, barterDeals, onExecuteTrade, onSellItem,
    rawCrops, animalProducts, foodInventory, supplies, seeds,
    CROP_TYPES, ANIMAL_PRODUCT_TYPES, FOOD_TYPES, SUPPLY_TYPES,
    farmName, money, score, level, xp, gameMode, hunger, onGoToTitle,
}: TradingPostScreenProps) {
    const [activeTab, setActiveTab] = useState<'sell' | 'barter'>('sell');

    const xpForNext = XP_FOR_NEXT_LEVEL[level] || Infinity;
    const xpForLast = level > 1 ? XP_FOR_NEXT_LEVEL[level - 1] : 0;
    const xpProgress = xpForNext === Infinity ? 100 : Math.max(0, ((xp - xpForLast) / (xpForNext - xpForLast)) * 100);
    
    const sellableItems = useMemo((): SellableItem[] => {
        const items: SellableItem[] = [];

        for (const key of Object.keys(rawCrops) as CropType[]) {
            if (rawCrops[key] > 0) {
                const data = CROP_TYPES[key];
                items.push({ type: 'rawCrop', key, name: data.name, icon: data.icon, quantity: rawCrops[key], sellPrice: data.sellPrice });
            }
        }
        for (const key of Object.keys(animalProducts) as AnimalProductType[]) {
            if (animalProducts[key] > 0) {
                const data = ANIMAL_PRODUCT_TYPES[key];
                items.push({ type: 'animalProduct', key, name: data.name, icon: data.icon, quantity: animalProducts[key], sellPrice: data.sellPrice });
            }
        }
        for (const key of Object.keys(foodInventory) as FoodType[]) {
            // Only sell crafted food, not bought food
            const isCraftable = key in RECIPE_DATA;
            if (foodInventory[key] > 0 && isCraftable) {
                const data = FOOD_TYPES[key];
                items.push({ type: 'food', key, name: data.name, icon: data.icon, quantity: foodInventory[key], sellPrice: data.price });
            }
        }

        return items.sort((a, b) => a.name.localeCompare(b.name));
    }, [rawCrops, animalProducts, foodInventory, CROP_TYPES, ANIMAL_PRODUCT_TYPES, FOOD_TYPES]);


    const getItemDisplayData = (item: BarterItem) => {
        switch (item.type) {
            case 'seed': return { icon: CROP_TYPES[item.key as CropType].icon, name: CROP_TYPES[item.key as CropType].name };
            case 'animalProduct': return { icon: ANIMAL_PRODUCT_TYPES[item.key as AnimalProductType].icon, name: ANIMAL_PRODUCT_TYPES[item.key as AnimalProductType].name };
            case 'food': return { icon: FOOD_TYPES[item.key as FoodType].icon, name: FOOD_TYPES[item.key as FoodType].name };
            case 'supply': return { icon: SUPPLY_TYPES[item.key as SupplyType].icon, name: SUPPLY_TYPES[item.key as SupplyType].name };
            default: return { icon: '❓', name: 'Unknown' };
        }
    };
    
    const canAffordTrade = (deal: BarterDeal): boolean => {
        const { give } = deal;
        switch (give.type) {
            case 'animalProduct': return (animalProducts[give.key as AnimalProductType] || 0) >= give.quantity;
            case 'food': return (foodInventory[give.key as FoodType] || 0) >= give.quantity;
            case 'seed': return (seeds[give.key as CropType] || 0) >= give.quantity;
            case 'supply': return (supplies[give.key as SupplyType] || 0) >= give.quantity;
            default: return false;
        }
    };

    return (
        <div className="game-container trading-post-screen-container">
            <div className="game-header">
                <button className="title-button" onClick={onGoToTitle} aria-label="Go to Title Screen">🏠</button>
                <h1>{t('tradingPost')}</h1>
            </div>

            <div className="hud">
                 <div className="money-container"><span className="icon">💰</span><span className="value">{money}</span></div>
                <div className="score-container"><span className="icon">🏆</span><span className="value">{score}</span></div>
                <div className="level-container">
                    <div className="level-info"><span>{t('level')} {level}</span></div>
                    <div className="xp-bar-outer">
                        <div className="xp-bar-inner" style={{width: `${xpProgress}%`}}></div>
                        <span className="xp-text">{xp - xpForLast} / {xpForNext - xpForLast}</span>
                    </div>
                </div>
                {gameMode === 'beta' && (
                    <div className="hunger-container">
                        <span className="icon">🍗</span>
                        <div className="hunger-bar-outer"><div className="hunger-bar-inner" style={{width: `${hunger}%`}}></div></div>
                        <span className="hunger-text">{hunger}/100</span>
                    </div>
                )}
            </div>

            <div className="trading-post-body">
                <div className="trading-post-content">
                    <div className="shop-tabs">
                        <button className={`shop-tab ${activeTab === 'sell' ? 'active' : ''}`} onClick={() => setActiveTab('sell')}>
                            {t('sellGoods')}
                        </button>
                        <button className={`shop-tab ${activeTab === 'barter' ? 'active' : ''}`} onClick={() => setActiveTab('barter')}>
                            {t('barter')}
                        </button>
                    </div>

                    {activeTab === 'sell' && (
                        <div>
                            {sellableItems.length === 0 ? <p>You have nothing to sell.</p> : sellableItems.map(item => (
                                <div key={`${item.type}-${item.key}`} className="trading-post-item">
                                    <div className="trading-post-item-info">
                                        <span className="seed-icon">{item.icon}</span>
                                        <span>{item.name} ({item.quantity})</span>
                                    </div>
                                    <div className="trading-post-item-actions">
                                        <span>💰 {item.sellPrice}</span>
                                        <button className="sell-small-button" onClick={() => onSellItem(item.type, item.key, 1)}>Sell 1</button>
                                        <button className="sell-small-button" onClick={() => onSellItem(item.type, item.key, item.quantity)}>Sell All</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'barter' && (
                        <div>
                            {barterDeals.map(deal => {
                                const giveDisplay = getItemDisplayData(deal.give);
                                const getDisplay = getItemDisplayData(deal.get);
                                const canAfford = canAffordTrade(deal);

                                return (
                                    <div key={deal.id} className="barter-deal">
                                        <div className="barter-item-display">
                                            <span className="seed-icon">{giveDisplay.icon}</span>
                                            <span>{giveDisplay.name} x{deal.give.quantity}</span>
                                        </div>
                                        <div className="trade-actions">
                                            <span className="trade-arrow">→</span>
                                            <button className="trade-button" onClick={() => onExecuteTrade(deal)} disabled={!canAfford}>
                                                {t('trade')}
                                            </button>
                                        </div>
                                        <div className="barter-item-display">
                                            <span className="seed-icon">{getDisplay.icon}</span>
                                            <span>{getDisplay.name} x{deal.get.quantity}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                <div className="trading-post-ui-panel">
                     <div className="action-buttons-container">
                        <button className="return-farm-button" onClick={onReturnToFarm}>
                            {t('returnToFarm')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}