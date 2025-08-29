import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    PlotState, CropType, FoodType, GameMode, Weather, Season, AchievementId, Stats, Order, TranslationKey,
    AspectRatio, TranslatedCropTypes, TranslatedFoodTypes, Animal, AnimalType, AnimalProductType, SupplyType, TranslatedAnimalTypes, TranslatedSupplyTypes, TranslatedAnimalProductTypes,
    BarterDeal, BarterItem, BarterItemKey, Recipe, ToolType, TimeOfDay, Pet, TranslatedPetTypes
} from '../types';
import { XP_FOR_NEXT_LEVEL, INITIAL_FARM_SIZE, INITIAL_GREENHOUSE_SIZE, CROP_DATA, ANIMAL_PRODUCT_DATA, SUPPLY_DATA, GREENHOUSE_PRICE, RANCH_PRICE, FOOD_DATA, RECIPE_DATA, ANIMAL_DATA, TOOL_DATA, PET_DATA } from '../data';
import IconTooltip from './IconTooltip';
import PurchaseQuantityModal from './PurchaseQuantityModal';
import GreenhouseModal from './GreenhouseModal';
import BulletinBoardModal from './BulletinBoardModal';
import SeasonalBackground from './SeasonalBackground';
import KitchenModal from './KitchenModal';
import MoreActionsModal from './MoreActionsModal';
import PetGachaModal from './PetGachaModal';
import PetInventoryModal from './PetInventoryModal';
import ProfileModal from './ProfileModal';
import WhisperingWillowModal from './WhisperingWillowModal';

type SelectedItem = { type: 'seed', key: CropType } | { type: 'supply', key: SupplyType };

interface GameScreenProps {
    farmName: string;
    onGoToTitle: () => void;
    money: number;
    setMoney: React.Dispatch<React.SetStateAction<number>>;
    plots: PlotState[];
    setPlots: React.Dispatch<React.SetStateAction<PlotState[]>>;
    seeds: Record<CropType, number>;
    setSeeds: React.Dispatch<React.SetStateAction<Record<CropType, number>>>;
    ownedTools: Set<ToolType>;
    onBuyTool: (tool: ToolType) => void;
    hunger: number;
    setHunger: React.Dispatch<React.SetStateAction<number>>;
    foodInventory: Record<FoodType, number>;
    setFoodInventory: React.Dispatch<React.SetStateAction<Record<FoodType, number>>>;
    score: number;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    t: (key: TranslationKey, params?: Record<string, any>) => string;
    CROP_TYPES: TranslatedCropTypes;
    FOOD_TYPES: TranslatedFoodTypes;
    ANIMAL_TYPES: TranslatedAnimalTypes;
    SUPPLY_TYPES: TranslatedSupplyTypes;
    ANIMAL_PRODUCT_TYPES: TranslatedAnimalProductTypes;
    PET_TYPES: TranslatedPetTypes;
    gameMode: GameMode;
    weather: Weather;
    disasterChance: number;
    year: number;
    month: number;
    dayOfMonth: number;
    season: Season;
    dayStartTime: number;
    marketPrices: Record<CropType, number>;
    hasGreenhouse: boolean;
    setHasGreenhouse: React.Dispatch<React.SetStateAction<boolean>>;
    greenhousePlots: PlotState[];
    setGreenhousePlots: React.Dispatch<React.SetStateAction<PlotState[]>>;
    level: number;
    xp: number;
    addFloatingText: (text: string, type: 'money' | 'xp', x: number, y: number) => void;
    addXP: (amount: number) => void;
    stats: Stats;
    setStats: React.Dispatch<React.SetStateAction<Stats>>;
    unlockedAchievements: Set<AchievementId>;
    checkAchievements: (newStats: Stats) => void;
    aspectRatio: AspectRatio;
    claimedMilestoneRewards: number;
    onClaimMilestone: () => void;
    activeOrder: Order | null;
    setActiveOrder: React.Dispatch<React.SetStateAction<Order | null>>;
    availableOrders: Order[];
    setAvailableOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    hasBarn: boolean;
    onBuyBarn: () => void;
    animals: Animal[];
    onFeedAnimals: () => void;
    onCollectProduct: (animalId: number) => void;
    onBuyAnimal: (animal: AnimalType, quantity: number) => void;
    onBuySupplies: (supply: SupplyType, quantity: number) => void;
    supplies: Record<SupplyType, number>;
    setSupplies: React.Dispatch<React.SetStateAction<Record<SupplyType, number>>>;
    animalProducts: Record<AnimalProductType, number>;
    setAnimalProducts: React.Dispatch<React.SetStateAction<Record<AnimalProductType, number>>>;
    rawCrops: Record<CropType, number>;
    setRawCrops: React.Dispatch<React.SetStateAction<Record<CropType, number>>>;
    onCook: (recipeKey: keyof typeof RECIPE_DATA) => void;
    onVisitRanch: () => void;
    onVisitTradingPost: () => void;
    activePet: Pet | null;
    onPetPull: (count: 1 | 10) => void;
    onSetActivePet: (petId: number) => void;
    ownedPets: Pet[];
    activePetId: number | null;
    profilePicture: string | null;
    setProfilePicture: (dataUrl: string | null) => void;
    lastWhisperDay: number;
    willowMessage: string;
    isWillowLoading: boolean;
    onListenToWillow: () => void;
    totalDays: number;
}

export default function GameScreen({ 
    farmName, 
    onGoToTitle, 
    money, setMoney, 
    plots, setPlots, 
    seeds, setSeeds, 
    ownedTools, onBuyTool, 
    hunger, setHunger, 
    foodInventory, setFoodInventory, 
    score, setScore, 
    t, 
    CROP_TYPES, 
    FOOD_TYPES,
    ANIMAL_TYPES,
    SUPPLY_TYPES,
    ANIMAL_PRODUCT_TYPES,
    PET_TYPES,
    gameMode,
    weather,
    disasterChance,
    year,
    month,
    dayOfMonth,
    season,
    dayStartTime,
    marketPrices,
    hasGreenhouse, setHasGreenhouse,
    greenhousePlots, setGreenhousePlots,
    level, xp,
    addFloatingText,
    addXP,
    stats,
    setStats,
    unlockedAchievements,
    checkAchievements,
    aspectRatio,
    claimedMilestoneRewards,
    onClaimMilestone,
    activeOrder,
    setActiveOrder,
    availableOrders,
    setAvailableOrders,
    hasBarn,
    onBuyBarn,
    animals,
    onFeedAnimals,
    onCollectProduct,
    onBuyAnimal,
    onBuySupplies,
    supplies,
    setSupplies,
    animalProducts,
    setAnimalProducts,
    rawCrops,
    setRawCrops,
    onCook,
    onVisitRanch,
    onVisitTradingPost,
    activePet,
    onPetPull,
    onSetActivePet,
    ownedPets,
    activePetId,
    profilePicture,
    setProfilePicture,
    lastWhisperDay,
    willowMessage,
    isWillowLoading,
    onListenToWillow,
    totalDays,
}: GameScreenProps) {
    const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
    const [isShopOpen, setShopOpen] = useState(false);
    const [isGreenhouseOpen, setGreenhouseOpen] = useState(false);
    const [isBulletinOpen, setBulletinOpen] = useState(false);
    const [isKitchenOpen, setKitchenOpen] = useState(false);
    const [isMoreActionsOpen, setMoreActionsOpen] = useState(false);
    const [isPetGachaOpen, setPetGachaOpen] = useState(false);
    const [isPetInventoryOpen, setPetInventoryOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const [isWillowModalOpen, setWillowModalOpen] = useState(false);
    const [inventoryTab, setInventoryTab] = useState<'seeds' | 'food' | 'products' | 'supplies' | 'tools'>('seeds');
    const [shopTab, setShopTab] = useState<'seeds' | 'animals' | 'supplies' | 'food' | 'upgrades'>('seeds');
    const [purchaseItem, setPurchaseItem] = useState<{type: 'seed' | 'food' | 'animal' | 'supply', key: CropType | FoodType | AnimalType | SupplyType} | null>(null);
    const [tooltip, setTooltip] = useState<{ content: string; x: number; y_top: number; y_bottom: number; } | null>(null);
    const [dayProgress, setDayProgress] = useState(0);
    const [marketRefreshTime, setMarketRefreshTime] = useState('');
    const [moneyChanged, setMoneyChanged] = useState(false);
    const [scoreChanged, setScoreChanged] = useState(false);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const farmGridRef = useRef<HTMLDivElement>(null);

    const DAY_DURATION = 15000;
    
    const timeOfDay: TimeOfDay = useMemo(() => {
        if (dayProgress < 10) return 'sunrise';
        if (dayProgress < 75) return 'day';
        if (dayProgress < 85) return 'sunset';
        return 'night';
    }, [dayProgress]);

    const isSelectedSeedOutOfSeason = selectedItem?.type === 'seed' && !CROP_TYPES[selectedItem.key].seasons.some(s => s === season);
    
    const triggerValuePop = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(true);
        setTimeout(() => setter(false), 300);
    };

    useEffect(() => {
        triggerValuePop(setMoneyChanged);
    }, [money]);

    useEffect(() => {
        triggerValuePop(setScoreChanged);
    }, [score]);

    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timerId);
    }, []);


    useEffect(() => {
        const updateProgress = () => {
            const elapsedTime = Date.now() - dayStartTime;
            const progress = Math.min(100, (elapsedTime / DAY_DURATION) * 100);
            setDayProgress(progress);
        };
        
        updateProgress();
        const interval = setInterval(updateProgress, 1000);
        return () => clearInterval(interval);
    }, [dayStartTime]);

    useEffect(() => {
        if (!isShopOpen) return;

        const updateTimer = () => {
            const elapsedTime = Date.now() - dayStartTime;
            const remainingTime = Math.max(0, DAY_DURATION - elapsedTime);
            
            const minutes = Math.floor(remainingTime / 60000);
            const seconds = Math.floor((remainingTime % 60000) / 1000);
            
            setMarketRefreshTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);

        return () => clearInterval(timerInterval);
    }, [isShopOpen, dayStartTime]);

    const weatherIcons: Record<Weather, string> = {
        sunny: '☀️',
        cloudy: '☁️',
        rainy: '🌧️',
        heavyRain: '⛈️',
        heatwave: '🔥',
        typhoon: '🌪️',
        blizzard: '❄️',
    };
    
    const seasonIcons: Record<Season, string> = {
        Spring: '🌸',
        Summer: '🌻',
        Autumn: '🍁',
        Winter: '☃️',
    };
    
    const DISASTER_INFO: Partial<Record<Weather, { title: string; body: string; }>> = {
        heavyRain: { title: t('heavyRainAlertTitle'), body: t('heavyRainAlertBody') },
        heatwave: { title: t('heatwaveAlertTitle'), body: t('heatwaveAlertBody') },
        typhoon: { title: t('typhoonAlertTitle'), body: t('typhoonAlertBody') },
        blizzard: { title: t('blizzardAlertTitle'), body: t('blizzardAlertBody') },
    };
    const currentDisaster = DISASTER_INFO[weather];

    const isDisasterActive = useMemo(() => 
        ['heavyRain', 'heatwave', 'typhoon', 'blizzard'].includes(weather),
        [weather]
    );

    const disasterIcon = useMemo(() => {
        if (disasterChance >= 60) return '🚨';
        if (disasterChance >= 30) return '⚠️';
        return '🌪️';
    }, [disasterChance]);

    const handleIconClick = useCallback((e: React.MouseEvent<HTMLElement>, content: string) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            content,
            x: rect.left + rect.width / 2,
            y_top: rect.top,
            y_bottom: rect.bottom,
        });
    }, []);

    const closeTooltip = useCallback(() => {
        setTooltip(null);
    }, []);

    const handlePlant = (plotIndex: number, isGreenhouse: boolean) => {
        if (selectedItem?.type !== 'seed') return;
        const cropToPlant = selectedItem.key;

        const currentPlots = isGreenhouse ? greenhousePlots : plots;
        const setPlotsFunc = isGreenhouse ? setGreenhousePlots : setPlots;
        const plot = currentPlots[plotIndex];
        
        if (plot.state === 'empty' && seeds[cropToPlant] > 0) {
            if (weather === 'blizzard' && !isGreenhouse) return;
            if (!isGreenhouse && !CROP_TYPES[cropToPlant].seasons.some(s => s === season)) return;

            setSeeds(prev => ({ ...prev, [cropToPlant]: prev[cropToPlant] - 1 }));
            
            let startTime = Date.now();
            let watered = false;
            let growthTime = CROP_TYPES[cropToPlant].growthTime;
            
            if (activePet?.type === 'mini_dragon') {
                growthTime *= (1 - PET_DATA.mini_dragon.passive.growthSpeedBonus);
            }

            if (ownedTools.has('wateringCan')) {
                const timeToSkip = growthTime / 2;
                startTime -= timeToSkip;
                watered = true;
            }
            
            const newPlots = [...currentPlots];
            newPlots[plotIndex] = {
                crop: cropToPlant,
                state: 'growing',
                growthStartTime: startTime,
                isWatered: watered,
                isFertilized: false,
            };
            setPlotsFunc(newPlots);
        }
    };

    const handleUseFertilizer = (plotIndex: number, isGreenhouse: boolean) => {
        if (supplies.golden_fertilizer > 0) {
            const currentPlots = isGreenhouse ? greenhousePlots : plots;
            const setPlotsFunc = isGreenhouse ? setGreenhousePlots : setPlots;
            const plot = currentPlots[plotIndex];
    
            if (plot.state === 'growing' && !plot.isFertilized) {
                setSupplies(prev => ({ ...prev, golden_fertilizer: prev.golden_fertilizer - 1 }));
    
                const newPlots = [...currentPlots];
                newPlots[plotIndex] = { ...plot, isFertilized: true };
                setPlotsFunc(newPlots);
    
                setSelectedItem(null);
    
                const plotRef = farmGridRef.current?.children[plotIndex] as HTMLElement;
                if (plotRef) {
                    const rect = plotRef.getBoundingClientRect();
                    addFloatingText('🌟', 'xp', rect.left + rect.width / 2, rect.top + rect.height / 2);
                }
            }
        }
    };

    const handlePlotClick = (index: number, isGreenhouse: boolean) => {
        if (season === 'Winter' && !isGreenhouse) return;

        if (selectedItem) {
            if (selectedItem.type === 'seed') {
                handlePlant(index, isGreenhouse);
            } else if (selectedItem.type === 'supply' && selectedItem.key === 'golden_fertilizer') {
                handleUseFertilizer(index, isGreenhouse);
            }
        }
        // Manual harvesting is removed. Auto-harvest logic is in App.tsx
    };
    
    const handlePurchase = (item: {type: 'seed' | 'food' | 'animal' | 'supply', key: CropType | FoodType | AnimalType | SupplyType}, quantity: number) => {
        switch(item.type) {
            case 'seed': {
                const cropKey = item.key as CropType;
                const cropData = CROP_TYPES[cropKey];
                const marketMultiplier = marketPrices[cropKey] || 1;
                const totalCost = Math.floor(cropData.seedPrice * marketMultiplier) * quantity;
                if (money >= totalCost) {
                    setMoney(m => m - totalCost);
                    setSeeds(s => ({...s, [cropKey]: s[cropKey] + quantity}));
                }
                break;
            }
            case 'food': {
                const foodKey = item.key as FoodType;
                const totalCost = FOOD_TYPES[foodKey].price * quantity;
                if (money >= totalCost) {
                    setMoney(m => m - totalCost);
                    setFoodInventory(f => ({...f, [foodKey]: f[foodKey] + quantity}));
                }
                break;
            }
            case 'animal': {
                onBuyAnimal(item.key as AnimalType, quantity);
                break;
            }
            case 'supply': {
                onBuySupplies(item.key as SupplyType, quantity);
                break;
            }
        }
        setPurchaseItem(null);
    };

    const handleExpandFarm = () => {
        const cost = 20 * (plots.length - INITIAL_FARM_SIZE + 1);
        if (money >= cost) {
            setMoney(m => m - cost);
            setPlots(p => [...p, { crop: null, state: 'empty', growthStartTime: null, isWatered: false, isFertilized: false }]);
             setStats(prev => {
                const newStats = { ...prev, farmPlots: prev.farmPlots + 1 };
                checkAchievements(newStats);
                return newStats;
            });
        }
    };

     const handleExpandGreenhouse = () => {
        const cost = 50 * (greenhousePlots.length - INITIAL_GREENHOUSE_SIZE + 1);
        if (money >= cost) {
            setMoney(m => m - cost);
            setGreenhousePlots(p => [...p, { crop: null, state: 'empty', growthStartTime: null, isWatered: false, isFertilized: false }]);
             setStats(prev => {
                const newStats = { ...prev, greenhousePlots: prev.greenhousePlots + 1 };
                checkAchievements(newStats);
                return newStats;
            });
        }
    };

    const handleBuyGreenhouse = () => {
        if (money >= GREENHOUSE_PRICE && !hasGreenhouse) {
            setMoney(m => m - GREENHOUSE_PRICE);
            setHasGreenhouse(true);
            setStats(prev => {
                const newStats = { ...prev, hasGreenhouse: true };
                checkAchievements(newStats);
                return newStats;
            });
        }
    };

    const handleSelectItem = (item: SelectedItem | null) => {
        setSelectedItem(prev => (prev?.key === item?.key && prev?.type === item?.type) ? null : item);
    };

    const xpForNext = XP_FOR_NEXT_LEVEL[level] || Infinity;
    const xpForLast = level > 1 ? XP_FOR_NEXT_LEVEL[level-1] : 0;
    const xpProgress = xpForNext === Infinity ? 100 : Math.max(0, ((xp - xpForLast) / (xpForNext - xpForLast)) * 100);

    const formatTime = (ms: number) => {
        if (ms <= 0) return '00:00';
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const canListenToWillow = totalDays > lastWhisperDay;

    return (
        <div className="game-container">
            <SeasonalBackground season={season} timeOfDay={timeOfDay} dayProgress={dayProgress} />
            <div className="whispering-willow-tree" onClick={() => setWillowModalOpen(true)} title="Listen to the Whispering Willow"></div>
            <div className="game-header">
                <button className="title-button" onClick={onGoToTitle} aria-label="Go to Title Screen">🏠</button>
                <h1 onClick={() => setProfileOpen(true)}>{farmName}</h1>
            </div>
            {currentDisaster && isDisasterActive && (
                <div className="disaster-notification">
                    <h4>{currentDisaster.title}</h4>
                    <p>{currentDisaster.body}</p>
                </div>
            )}
            <div className="hud">
                <div onClick={(e) => handleIconClick(e, t('moneyTooltip'))} className="icon-clickable">
                    <span className="icon">💰</span> <span className={`value ${moneyChanged ? 'popping' : ''}`}>{money}</span>
                </div>
                <div>
                    <span className="icon">🦴</span> <span className="value">{supplies.pet_biscuit || 0}</span>
                </div>
                <div className="level-container">
                    <div className="level-info"><span>{t('level')} {level}</span></div>
                    <div className="xp-bar-outer">
                        <div className="xp-bar-inner" style={{width: `${xpProgress}%`}}></div>
                        <span className="xp-text">{xp - xpForLast} / {xpForNext - xpForLast}</span>
                    </div>
                </div>
                {gameMode === 'beta' && (
                     <div className="hunger-container icon-clickable" onClick={(e) => handleIconClick(e, t('hungerTooltip'))}>
                        <span className="icon">🍗</span> 
                        <div className="hunger-bar-outer"><div className="hunger-bar-inner" style={{width: `${hunger}%`}}></div></div>
                        <span className="hunger-text">{hunger}/100</span>
                    </div>
                )}
            </div>
            <div className="world-info">
                 <div className="day-info">
                    <span className="day-text">{t('year')} {year} / {t('month')} {month} / {t('day')} {dayOfMonth}</span>
                    <span className="season-text">{seasonIcons[season]} {t(season.toLowerCase() as TranslationKey)}</span>
                    <div className="day-progress-bar-outer"><div className="day-progress-bar-inner" style={{width: `${dayProgress}%`}}></div></div>
                </div>
                <div className="weather-info">
                    <span className="weather" onClick={(e) => handleIconClick(e, t('weatherTooltip'))}>
                        {t('weather')}: {weatherIcons[weather]} {t(weather)}
                    </span>
                    <span className="disaster-chance" onClick={(e) => handleIconClick(e, t('disasterChanceTooltip'))}>
                         {disasterIcon} {disasterChance}%
                    </span>
                     {activePet && (
                        <span className="hud-pet-icon icon-clickable" onClick={() => setPetInventoryOpen(true)}>
                            {PET_TYPES[activePet.type].icon}
                        </span>
                    )}
                </div>
            </div>

            <div className="game-body">
                <div className="game-main-content">
                    {activePet && (
                        <div className="pet-on-farm">
                            {PET_TYPES[activePet.type].icon}
                        </div>
                    )}
                    <div ref={farmGridRef} className={`farm-grid ${isSelectedSeedOutOfSeason && selectedItem?.type === 'seed' ? 'planting-forbidden' : ''}`}>
                        {plots.map((plot, index) => {
                             const isFrozen = season === 'Winter' && plot.state === 'empty';
                             let remainingTime = 0;
                             if(plot.state === 'growing' && plot.crop && plot.growthStartTime) {
                                let growthTime = CROP_TYPES[plot.crop].growthTime;
                                if (activePet?.type === 'mini_dragon') {
                                    growthTime *= (1 - PET_DATA.mini_dragon.passive.growthSpeedBonus);
                                }
                                remainingTime = growthTime - (currentTime - plot.growthStartTime);
                             }

                             return (
                                <div 
                                    key={index} 
                                    className={`plot ${plot.state} ${isFrozen ? 'frozen' : ''}`}
                                    onClick={() => handlePlotClick(index, false)}
                                    aria-label={`Farm plot ${index + 1}, state: ${plot.state}`}
                                >
                                    {plot.crop && plot.state !== 'empty' && (
                                        <span className={`crop-icon ${plot.state === 'ready' && plot.size ? `size-${plot.size.toLowerCase()}` : ''}`}>
                                            {CROP_TYPES[plot.crop].icon}
                                        </span>
                                    )}
                                    {plot.isWatered && plot.state === 'growing' && <div className="water-droplet">💧</div>}
                                    {plot.isFertilized && plot.state === 'growing' && <div className="fertilizer-icon">🌟</div>}
                                    {remainingTime > 0 && (
                                        <div className="growth-timer">
                                            {formatTime(remainingTime)}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="ui-panel">
                    <div className="inventory">
                        <div className="inventory-header">
                            <h2>{t('myInventory')}</h2>
                        </div>
                        <div className="inventory-tabs">
                            <button className={`tab-button ${inventoryTab === 'seeds' ? 'active' : ''}`} onClick={() => setInventoryTab('seeds')}>{t('seeds')}</button>
                            <button className={`tab-button ${inventoryTab === 'food' ? 'active' : ''}`} onClick={() => setInventoryTab('food')}>{t('food')}</button>
                            <button className={`tab-button ${inventoryTab === 'products' ? 'active' : ''}`} onClick={() => setInventoryTab('products')}>{t('products')}</button>
                            <button className={`tab-button ${inventoryTab === 'supplies' ? 'active' : ''}`} onClick={() => setInventoryTab('supplies')}>{t('supplies')}</button>
                            <button className={`tab-button ${inventoryTab === 'tools' ? 'active' : ''}`} onClick={() => setInventoryTab('tools')}>{t('tools')}</button>
                        </div>
                        <div className="inventory-content">
                             {inventoryTab === 'seeds' && (
                                <div className="seed-list">
                                    {(Object.keys(CROP_DATA) as CropType[]).filter(key => seeds[key] > 0).map(key => {
                                        const isOutOfSeason = !CROP_TYPES[key].seasons.some(s => s === season);
                                        const isSelected = selectedItem?.type === 'seed' && selectedItem.key === key;
                                        return (
                                            <div 
                                                key={key} 
                                                className={`seed-item ${isSelected ? 'selected' : ''} ${isOutOfSeason ? 'disabled' : ''}`}
                                                onClick={() => !isOutOfSeason && handleSelectItem({ type: 'seed', key: key })}
                                            >
                                                <span className="seed-icon">{CROP_TYPES[key].icon}</span>
                                                <span className="seed-count">{seeds[key]}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                             {inventoryTab === 'food' && (
                                <div className="seed-list">
                                    {(Object.keys(FOOD_DATA) as FoodType[]).filter(key => foodInventory[key] > 0).map(key => (
                                         <div key={key} className="seed-item">
                                            <span className="seed-icon">{FOOD_TYPES[key].icon}</span>
                                            <span className="seed-count">{foodInventory[key]}</span>
                                        </div>
                                    ))}
                                </div>
                             )}
                            {inventoryTab === 'products' && (
                                <div className="seed-list">
                                    {(Object.keys(ANIMAL_PRODUCT_DATA) as AnimalProductType[]).filter(key => animalProducts[key] > 0).map(key => (
                                        <div key={key} className="seed-item" style={{cursor: "default"}}>
                                            <span className="seed-icon">{ANIMAL_PRODUCT_TYPES[key].icon}</span>
                                            <span className="seed-count">{animalProducts[key]}</span>
                                        </div>
                                    ))}
                                     {(Object.keys(CROP_DATA) as CropType[]).filter(key => rawCrops[key] > 0).map(key => (
                                        <div key={key} className="seed-item" style={{cursor: "default"}}>
                                            <span className="seed-icon">{CROP_TYPES[key].icon}</span>
                                            <span className="seed-count">{rawCrops[key]}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {inventoryTab === 'supplies' && (
                                <div className="seed-list">
                                    {(Object.keys(SUPPLY_DATA) as SupplyType[]).filter(s => supplies[s] > 0).map(s => {
                                         const isSelected = selectedItem?.type === 'supply' && selectedItem.key === s;
                                         const canSelect = s === 'golden_fertilizer';
                                        return (
                                        <div key={s} className={`seed-item ${isSelected ? 'selected' : ''}`} onClick={() => canSelect && handleSelectItem({type: 'supply', key: s})} style={{ cursor: canSelect ? 'pointer' : 'default' }}>
                                            <span className="seed-icon">{SUPPLY_TYPES[s].icon}</span>
                                            <span className="seed-count">{supplies[s]}</span>
                                        </div>
                                    )})}
                                </div>
                            )}
                            {inventoryTab === 'tools' && (
                                <div className="seed-list">
                                    {Array.from(ownedTools).map(tool => (
                                        <div key={tool} className="seed-item" style={{cursor: 'default'}}>
                                            <span className="seed-icon">{TOOL_DATA[tool].icon}</span>
                                            <span className="seed-count">{t('owned')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="action-buttons-container">
                        <button className="shop-button" onClick={() => setShopOpen(true)}>{t('visitShop')}</button>
                        <button className="greenhouse-button" onClick={() => setGreenhouseOpen(true)} disabled={!hasGreenhouse}>{t('viewGreenhouse')}</button>
                        <button className="ranch-button" onClick={onVisitRanch} disabled={!hasBarn}>{t('visitBarn')}</button>
                        <button className="more-actions-button" onClick={() => setMoreActionsOpen(true)}>{t('moreActions')}</button>
                    </div>
                </div>
            </div>
            {isShopOpen && (
                <div className="modal-overlay" onClick={() => setShopOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-button" onClick={() => setShopOpen(false)}>×</button>
                        <h2>{t('visitShop')}</h2>
                        <div className="shop-tabs">
                            <button className={`shop-tab ${shopTab === 'seeds' ? 'active' : ''}`} onClick={() => setShopTab('seeds')}>{t('seedShop')}</button>
                            <button className={`shop-tab ${shopTab === 'animals' ? 'active' : ''}`} onClick={() => setShopTab('animals')} disabled={!hasBarn}>{t('animalShop')}</button>
                            <button className={`shop-tab ${shopTab === 'supplies' ? 'active' : ''}`} onClick={() => setShopTab('supplies')}>{t('suppliesShop')}</button>
                            <button className={`shop-tab ${shopTab === 'food' ? 'active' : ''}`} onClick={() => setShopTab('food')}>{t('foodShop')}</button>
                            <button className={`shop-tab ${shopTab === 'upgrades' ? 'active' : ''}`} onClick={() => setShopTab('upgrades')}>{t('upgrades')}</button>
                        </div>
                        {shopTab === 'seeds' && (
                             <>
                                <div className="market-refresh-timer">{t('pricesRefreshIn')}: {marketRefreshTime}</div>
                                {(Object.keys(CROP_DATA) as CropType[]).map(key => {
                                    const data = CROP_TYPES[key];
                                    const marketMultiplier = marketPrices[key] || 1;
                                    const currentPrice = Math.floor(data.seedPrice * marketMultiplier);
                                    const isOutOfSeason = !data.seasons.some(s => s === season);
                                    
                                    if (isOutOfSeason) return null;

                                    return (
                                        <div key={key} className="shop-item">
                                            <div className="shop-item-info">
                                                <span className="seed-icon">{data.icon}</span>
                                                <span>
                                                    {data.name} - 💰 {currentPrice}
                                                     {marketMultiplier !== 1 && (
                                                        <span className={marketMultiplier > 1 ? 'price-up' : 'price-down'}>
                                                            {' '}({marketMultiplier > 1 ? '▲' : '▼'}{Math.abs(marketMultiplier - 1).toFixed(2)}%)
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <button className="buy-button" onClick={() => setPurchaseItem({type: 'seed', key})} disabled={money < currentPrice}>{t('buy')}</button>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                        {shopTab === 'food' && (
                            <>
                                {(Object.keys(FOOD_DATA) as FoodType[]).map(key => {
                                    const data = FOOD_TYPES[key];
                                    const isSeasonal = data.seasonality && data.seasonality !== season;
                                    if (isSeasonal) return null;
                                    return (
                                        <div key={key} className="shop-item">
                                            <div className="shop-item-info">
                                                <span className="seed-icon">{data.icon}</span>
                                                <span>{data.name} (+{data.hungerRestore}🍗)</span>
                                            </div>
                                            <button className="buy-button" onClick={() => setPurchaseItem({type: 'food', key})} disabled={money < data.price}>💰 {data.price}</button>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                        {shopTab === 'animals' && (
                             <>
                                {(Object.keys(ANIMAL_DATA) as AnimalType[]).map(key => {
                                    const data = ANIMAL_TYPES[key];
                                    return (
                                        <div key={key} className="shop-item">
                                            <div className="shop-item-info">
                                                <span className="seed-icon">{data.icon}</span>
                                                <span>{data.name}</span>
                                            </div>
                                            <button className="buy-button" onClick={() => setPurchaseItem({type: 'animal', key})} disabled={money < data.price}>💰 {data.price}</button>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                        {shopTab === 'supplies' && (
                             <>
                                {(Object.keys(SUPPLY_DATA) as SupplyType[]).map(key => {
                                    const data = SUPPLY_TYPES[key];
                                    return (
                                        <div key={key} className="shop-item with-description">
                                            <div className="shop-item-main">
                                                <div className="shop-item-info">
                                                    <span className="seed-icon">{data.icon}</span>
                                                    <span>{data.name}</span>
                                                </div>
                                                <button className="buy-button" onClick={() => setPurchaseItem({type: 'supply', key})} disabled={money < data.price}>💰 {data.price}</button>
                                            </div>
                                            <p className="shop-item-description">{t(`${key}_desc` as TranslationKey, { default: '' })}</p>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                         {shopTab === 'upgrades' && (
                            <>
                                {(Object.keys(TOOL_DATA) as ToolType[]).map(toolKey => {
                                    const tool = TOOL_DATA[toolKey];
                                    const isOwned = ownedTools.has(toolKey);
                                    return (
                                        <div key={toolKey} className="shop-item with-description">
                                            <div className="shop-item-main">
                                                <div className="shop-item-info">
                                                    <span className="seed-icon">{tool.icon}</span>
                                                    <span>{t(toolKey as TranslationKey)}</span>
                                                </div>
                                                {isOwned ? (
                                                    <button className="buy-button" disabled>{t('owned')}</button>
                                                ) : (
                                                    <button className="buy-button" onClick={() => onBuyTool(toolKey)} disabled={money < tool.price}>💰 {tool.price}</button>
                                                )}
                                            </div>
                                            <p className="shop-item-description">{t(`${toolKey}Description` as TranslationKey)}</p>
                                        </div>
                                    );
                                })}
                                <hr className="shop-divider" />
                                <div className="shop-item with-description">
                                    <div className="shop-item-main">
                                        <div className="shop-item-info"><span className="seed-icon">🏡</span><span>{t('expandFarm')}</span></div>
                                        <button className="buy-button" onClick={handleExpandFarm} disabled={money < (20 * (plots.length - INITIAL_FARM_SIZE + 1))}>💰 {20 * (plots.length - INITIAL_FARM_SIZE + 1)}</button>
                                    </div>
                                    <p className="shop-item-description">Current Size: {plots.length} plots</p>
                                </div>
                                <hr className="shop-divider" />
                                {!hasGreenhouse && (
                                    <div className="shop-item with-description">
                                        <div className="shop-item-main">
                                            <div className="shop-item-info"><span className="seed-icon">🌿</span><span>{t('greenhouse')}</span></div>
                                            <button className="buy-button" onClick={handleBuyGreenhouse} disabled={money < GREENHOUSE_PRICE}>💰 {GREENHOUSE_PRICE}</button>
                                        </div>
                                        <p className="shop-item-description">{t('greenhouseDescription')}</p>
                                    </div>
                                )}
                                {hasGreenhouse && (
                                    <div className="shop-item with-description">
                                        <div className="shop-item-main">
                                            <div className="shop-item-info"><span className="seed-icon">🌿</span><span>{t('expandGreenhouse')}</span></div>
                                            <button className="buy-button" onClick={handleExpandGreenhouse} disabled={money < (50 * (greenhousePlots.length - INITIAL_GREENHOUSE_SIZE + 1))}>💰 {50 * (greenhousePlots.length - INITIAL_GREENHOUSE_SIZE + 1)}</button>
                                        </div>
                                        <p className="shop-item-description">Current Size: {greenhousePlots.length} plots</p>
                                    </div>
                                )}
                                 <hr className="shop-divider" />
                                {!hasBarn && (
                                    <div className="shop-item with-description">
                                        <div className="shop-item-main">
                                            <div className="shop-item-info"><span className="seed-icon">🏠</span><span>{t('buildBarn')}</span></div>
                                            <button className="buy-button" onClick={onBuyBarn} disabled={money < RANCH_PRICE}>💰 {RANCH_PRICE}</button>
                                        </div>
                                        <p className="shop-item-description">{t('buildBarnDescription')}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
            {purchaseItem && (
                <PurchaseQuantityModal 
                    item={purchaseItem} 
                    onClose={() => setPurchaseItem(null)} 
                    onConfirm={handlePurchase}
                    money={money}
                    t={t}
                    CROP_TYPES={CROP_TYPES}
                    FOOD_TYPES={FOOD_TYPES}
                    ANIMAL_TYPES={ANIMAL_TYPES}
                    SUPPLY_TYPES={SUPPLY_TYPES}
                    marketPrices={marketPrices}
                />
            )}
            {isGreenhouseOpen && hasGreenhouse && (
                <GreenhouseModal 
                    onClose={() => setGreenhouseOpen(false)}
                    plots={greenhousePlots}
                    onPlotClick={(index) => handlePlotClick(index, true)}
                    CROP_TYPES={CROP_TYPES}
                    selectedItem={selectedItem?.type === 'seed' ? selectedItem.key : null}
                    t={t}
                    currentTime={currentTime}
                />
            )}
            {isBulletinOpen && (
                 <BulletinBoardModal
                    t={t}
                    onClose={() => setBulletinOpen(false)}
                    availableOrders={availableOrders}
                    activeOrder={activeOrder}
                    onAcceptOrder={(order) => setActiveOrder(order)}
                    CROP_TYPES={CROP_TYPES}
                />
            )}
             {isKitchenOpen && (
                <KitchenModal
                    t={t}
                    onClose={() => setKitchenOpen(false)}
                    onCook={onCook}
                    rawCrops={rawCrops}
                    animalProducts={animalProducts}
                    foodInventory={foodInventory}
                    CROP_TYPES={CROP_TYPES}
                    FOOD_TYPES={FOOD_TYPES}
                    ANIMAL_PRODUCT_TYPES={ANIMAL_PRODUCT_TYPES}
                />
            )}
            {isMoreActionsOpen && (
                <MoreActionsModal
                    t={t}
                    onClose={() => setMoreActionsOpen(false)}
                    onOpenBulletin={() => { setMoreActionsOpen(false); setBulletinOpen(true); }}
                    onVisitTradingPost={() => { setMoreActionsOpen(false); onVisitTradingPost(); }}
                    onOpenKitchen={() => { setMoreActionsOpen(false); setKitchenOpen(true); }}
                    onOpenPetGacha={() => { setMoreActionsOpen(false); setPetGachaOpen(true); }}
                    onOpenPetInventory={() => { setMoreActionsOpen(false); setPetInventoryOpen(true); }}
                />
            )}
            {isPetGachaOpen && (
                <PetGachaModal
                    t={t}
                    onClose={() => setPetGachaOpen(false)}
                    onPetPull={onPetPull}
                    petBiscuits={supplies.pet_biscuit || 0}
                />
            )}
            {isPetInventoryOpen && (
                <PetInventoryModal
                    t={t}
                    onClose={() => setPetInventoryOpen(false)}
                    ownedPets={ownedPets}
                    activePetId={activePetId}
                    onSetActivePet={onSetActivePet}
                    PET_TYPES={PET_TYPES}
                />
            )}
            {isProfileOpen && (
                <ProfileModal
                    t={t}
                    onClose={() => setProfileOpen(false)}
                    farmName={farmName}
                    level={level}
                    xp={xp}
                    stats={stats}
                    activePet={activePet}
                    PET_TYPES={PET_TYPES}
                    unlockedAchievements={unlockedAchievements}
                    claimedMilestoneRewards={claimedMilestoneRewards}
                    onClaimMilestone={onClaimMilestone}
                    gameMode={gameMode}
                    profilePicture={profilePicture}
                    onSetProfilePicture={setProfilePicture}
                />
            )}
            {isWillowModalOpen && (
                <WhisperingWillowModal
                    t={t}
                    onClose={() => setWillowModalOpen(false)}
                    onListen={onListenToWillow}
                    message={willowMessage}
                    isLoading={isWillowLoading}
                    canListen={canListenToWillow}
                />
            )}
            {tooltip && <IconTooltip content={tooltip.content} x={tooltip.x} y_top={tooltip.y_top} y_bottom={tooltip.y_bottom} onClose={closeTooltip} />}
        </div>
    );
}