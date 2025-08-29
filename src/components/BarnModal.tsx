import React, { useState, useEffect, useMemo } from 'react';
import { Animal, TranslationKey, TranslatedAnimalTypes, TranslatedAnimalProductTypes, SupplyType, AnimalProductType, GameMode, TranslatedSupplyTypes } from '../types';
import { ANIMAL_PRODUCT_DATA, SUPPLY_DATA, XP_FOR_NEXT_LEVEL } from '../data';

interface RanchScreenProps {
    t: (key: TranslationKey, params?: Record<string, any>) => string;
    onReturnToFarm: () => void;
    animals: Animal[];
    onFeedAnimals: () => void;
    onCollectProduct: (animalId: number) => void;
    ANIMAL_TYPES: TranslatedAnimalTypes;
    ANIMAL_PRODUCT_TYPES: TranslatedAnimalProductTypes;
    SUPPLY_TYPES: TranslatedSupplyTypes;
    supplies: Record<SupplyType, number>;
    animalProducts: Record<AnimalProductType, number>;
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

export default function RanchScreen({
    t,
    onReturnToFarm,
    animals,
    onFeedAnimals,
    onCollectProduct,
    ANIMAL_TYPES,
    ANIMAL_PRODUCT_TYPES,
    SUPPLY_TYPES,
    supplies,
    animalProducts,
    farmName,
    money,
    score,
    level,
    xp,
    gameMode,
    hunger,
    onGoToTitle,
}: RanchScreenProps) {
    const hungryAnimalsCount = animals.filter(a => a.isHungry).length;
    const canFeed = supplies.feed >= hungryAnimalsCount && hungryAnimalsCount > 0;
    const [inventoryTab, setInventoryTab] = useState<'products' | 'supplies'>('products');

    const [animalPositions, setAnimalPositions] = useState<Record<number, { top: string; left: string }>>({});

    useEffect(() => {
        const newPositions: Record<number, { top: string; left: string }> = {};
        animals.forEach(animal => {
            // Generate random positions within the pasture area
            const top = `${Math.random() * 70 + 10}%`; // 10% to 80%
            const left = `${Math.random() * 80 + 5}%`; // 5% to 85%
            newPositions[animal.id] = { top, left };
        });
        setAnimalPositions(newPositions);
    }, [animals.length]); // Re-calculate only when the number of animals changes

    const xpForNext = XP_FOR_NEXT_LEVEL[level] || Infinity;
    const xpForLast = level > 1 ? XP_FOR_NEXT_LEVEL[level - 1] : 0;
    const xpProgress = xpForNext === Infinity ? 100 : Math.max(0, ((xp - xpForLast) / (xpForNext - xpForLast)) * 100);
    
    const getProductForAnimal = (type: Animal['type']): AnimalProductType => {
        switch (type) {
            case 'chicken': return 'egg';
            case 'cow': return 'milk';
            case 'pig': return 'truffle';
        }
    };

    return (
        <div className="game-container ranch-screen-container">
            <div className="game-header">
                <button className="title-button" onClick={onGoToTitle} aria-label="Go to Title Screen">🏠</button>
                <h1>{t('barn')}</h1>
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
            
            <div className="ranch-body">
                <div className="ranch-pasture">
                    {animals.map(animal => (
                        <div key={animal.id} className="animal-on-ranch" style={animalPositions[animal.id] || { top: '50%', left: '50%' }}>
                            <span className={`animal-icon type-${animal.type}`}>{ANIMAL_TYPES[animal.type].icon}</span>
                            <span className="animal-status">
                                {animal.isHungry ? '💬' : '❤️'}
                            </span>
                            {animal.productState === 'ready' && (
                                <div 
                                    className="animal-product" 
                                    onClick={() => onCollectProduct(animal.id)}
                                >
                                    {ANIMAL_PRODUCT_TYPES[getProductForAnimal(animal.type)].icon}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="ranch-ui-panel">
                    <div className="inventory">
                        <div className="inventory-header"><h2>{t('myInventory')}</h2></div>
                        <div className="inventory-tabs">
                            <button className={`tab-button ${inventoryTab === 'products' ? 'active' : ''}`} onClick={() => setInventoryTab('products')}>{t('products')}</button>
                            <button className={`tab-button ${inventoryTab === 'supplies' ? 'active' : ''}`} onClick={() => setInventoryTab('supplies')}>{t('supplies')}</button>
                        </div>
                        <div className="inventory-content">
                            {inventoryTab === 'products' && (
                                <div className="seed-list">
                                    {(Object.keys(ANIMAL_PRODUCT_DATA) as AnimalProductType[]).filter(p => animalProducts[p] > 0).map(p => (
                                        <div key={p} className="seed-item" style={{cursor: 'default'}}>
                                            <span className="seed-icon">{ANIMAL_PRODUCT_TYPES[p].icon}</span>
                                            <span className="seed-count">{animalProducts[p]}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {inventoryTab === 'supplies' && (
                                <div className="seed-list">
                                    {(Object.keys(SUPPLY_DATA) as SupplyType[]).filter(s => supplies[s] > 0).map(s => (
                                        <div key={s} className="seed-item" style={{cursor: 'default'}}>
                                            <span className="seed-icon">{SUPPLY_TYPES[s].icon}</span>
                                            <span className="seed-count">{supplies[s]}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="ranch-actions">
                        <div className="feed-info">
                            🌾 {t('feed')}: {supplies.feed}
                        </div>
                        <button className="feed-button" onClick={onFeedAnimals} disabled={!canFeed}>
                            {t('feedAllAnimals')} ({hungryAnimalsCount})
                        </button>
                        <button className="return-farm-button" onClick={onReturnToFarm}>
                            {t('returnToFarm')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}