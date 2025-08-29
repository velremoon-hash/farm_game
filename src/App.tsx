import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import {
    PlotState, CropType, FoodType, GameMode, GameState, Language, AspectRatio, Weather, Season, AchievementId, Stats, FloatingText,
    Order, TranslationKey, TranslatedCropTypes, TranslatedFoodTypes, Animal, AnimalType, TranslatedAnimalTypes, SupplyType, TranslatedSupplyTypes, AnimalProductType, TranslatedAnimalProductTypes, BarterDeal, BarterItem, ToolType, Pet, PetType, PetRarity, TranslatedPetTypes
} from './types';
import {
    translations, CROP_DATA, FOOD_DATA, ACHIEVEMENT_DATA, XP_FOR_NEXT_LEVEL, INITIAL_FARM_SIZE, INITIAL_GREENHOUSE_SIZE,
    initialPlots, initialGreenhousePlots, getInitialFoodInventory, getInitialMarketPrices, ANIMAL_DATA, SUPPLY_DATA, ANIMAL_PRODUCT_DATA, getInitialAnimalProducts, getInitialSupplies, RANCH_PRICE, getInitialRawCrops, RECIPE_DATA, TOOL_DATA, PET_DATA, PET_RARITY_CHANCES, PET_PULL_COST
} from './data';

import TitleScreen from './components/TitleScreen';
import SeasonSelectionScreen from './components/SeasonSelectionScreen';
import GameScreen from './components/GameScreen';
import SettingsModal from './components/SettingsModal';
import LevelUpModal from './components/LevelUpModal';
import MilestoneRewardModal from './components/MilestoneRewardModal';
import RanchScreen from './components/BarnModal';
import TradingPostScreen from './components/TradingPostScreen';
import PetGachaModal from './components/PetGachaModal';
import GachaResultsModal from './components/GachaResultsModal';
import PetInventoryModal from './components/PetInventoryModal';

export default function App() {
    const getInitialState = () => {
        try {
            const savedDataString = localStorage.getItem('my-little-farm-save-game');
            if (savedDataString) {
                const savedData = JSON.parse(savedDataString);
                // Convert achievement set from array back to Set
                if (savedData.unlockedAchievements) {
                    savedData.unlockedAchievements = new Set(savedData.unlockedAchievements);
                }
                if (savedData.ownedTools) {
                    savedData.ownedTools = new Set(savedData.ownedTools);
                }
                return savedData;
            }
        } catch (error) {
            console.error("Could not parse saved game data:", error);
        }
        return null;
    };

    const savedState = getInitialState();

    const [gameState, setGameState] = useState<GameState>('title');
    const [currentView, setCurrentView] = useState<'farm' | 'ranch' | 'trading_post'>(savedState?.currentView ?? 'farm');
    const [farmName, setFarmName] = useState(savedState?.farmName || '');
    const [language, setLanguage] = useState<Language>('ko');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('default');
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [isMuted, setMuted] = useState(() => {
        const savedMute = localStorage.getItem('farm-music-muted');
        return savedMute ? JSON.parse(savedMute) : false;
    });
    const audioRef = useRef<HTMLAudioElement>(null);

    // Core game data state
    const [money, setMoney] = useState(savedState?.money ?? 50);
    const [plots, setPlots] = useState<PlotState[]>(savedState?.plots || initialPlots);
    const [seeds, setSeeds] = useState<Record<CropType, number>>(savedState?.seeds || { 
        carrot: 3, tomato: 0, potato: 0, cucumber: 0, broccoli: 0,
        strawberry: 0, corn: 0, bell_pepper: 0, eggplant: 0, watermelon: 0, stardust_sprout: 0,
    });
    const [ownedTools, setOwnedTools] = useState<Set<ToolType>>(savedState?.ownedTools ?? new Set());
    const [hasGreenhouse, setHasGreenhouse] = useState(savedState?.hasGreenhouse ?? false);
    const [greenhousePlots, setGreenhousePlots] = useState<PlotState[]>(savedState?.greenhousePlots || initialGreenhousePlots);
    const [hunger, setHunger] = useState(savedState?.hunger ?? 100);
    const [foodInventory, setFoodInventory] = useState<Record<FoodType, number>>(savedState?.foodInventory || getInitialFoodInventory());
    const [score, setScore] = useState(savedState?.score ?? 0);
    const [gameMode, setGameMode] = useState<GameMode>(savedState?.gameMode || 'normal');
    const [weather, setWeather] = useState<Weather>(savedState?.weather === 'storm' ? 'heavyRain' : (savedState?.weather || 'sunny'));
    const [disasterChance, setDisasterChance] = useState(savedState?.disasterChance ?? 15);
    const [totalDays, setTotalDays] = useState(savedState?.totalDays ?? savedState?.day ?? 1);
    const [dayStartTime, setDayStartTime] = useState(savedState?.dayStartTime ?? Date.now());
    const [marketPrices, setMarketPrices] = useState<Record<CropType, number>>(savedState?.marketPrices || getInitialMarketPrices());
    const [level, setLevel] = useState(savedState?.level ?? 1);
    const [xp, setXp] = useState(savedState?.xp ?? 0);
    const [unlockedAchievements, setUnlockedAchievements] = useState<Set<AchievementId>>(savedState?.unlockedAchievements || new Set());
    const [stats, setStats] = useState<Stats>(savedState?.stats || { 
        totalGoldEarned: 0, totalCropsHarvested: 0, farmPlots: INITIAL_FARM_SIZE, greenhousePlots: INITIAL_GREENHOUSE_SIZE,
        hasGreenhouse: false, level: 1, springCropsHarvested: 0, summerCropsHarvested: 0,
        autumnCropsHarvested: 0, winterCropsHarvested: 0, foodEaten: 0, hasBarn: false, totalAnimals: 0, totalProductsCollected: 0
    });
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const [achievementToast, setAchievementToast] = useState<AchievementId | null>(null);
    const [levelUpReward, setLevelUpReward] = useState<{ level: number; money: number } | null>(savedState?.levelUpReward ?? null);
    const [claimedMilestoneRewards, setClaimedMilestoneRewards] = useState(savedState?.claimedMilestoneRewards ?? 0);
    const [milestoneReward, setMilestoneReward] = useState<{ milestone: number; money: number; seeds: number; } | null>(savedState?.milestoneReward ?? null);
    const [activeOrder, setActiveOrder] = useState<Order | null>(savedState?.activeOrder ?? null);
    const [availableOrders, setAvailableOrders] = useState<Order[]>(savedState?.availableOrders ?? []);
    
    // Animal Husbandry State
    const [hasBarn, setHasBarn] = useState(savedState?.hasBarn ?? false);
    const [animals, setAnimals] = useState<Animal[]>(savedState?.animals ?? []);
    const [animalProducts, setAnimalProducts] = useState<Record<AnimalProductType, number>>(savedState?.animalProducts || getInitialAnimalProducts());
    const [supplies, setSupplies] = useState<Record<SupplyType, number>>(savedState?.supplies || getInitialSupplies());
    const [rawCrops, setRawCrops] = useState<Record<CropType, number>>(savedState?.rawCrops || getInitialRawCrops());

    // Trading Post State
    const [barterDeals, setBarterDeals] = useState<BarterDeal[]>(savedState?.barterDeals ?? []);

    // Pet Gacha State
    const [ownedPets, setOwnedPets] = useState<Pet[]>(savedState?.ownedPets ?? []);
    const [activePetId, setActivePetId] = useState<number | null>(savedState?.activePetId ?? null);
    const [gachaResults, setGachaResults] = useState<Pet[] | null>(null);
    const [profilePicture, setProfilePicture] = useState<string | null>(savedState?.profilePicture ?? null);

    // Whispering Willow AI State
    const [lastWhisperDay, setLastWhisperDay] = useState(savedState?.lastWhisperDay ?? 0);
    const [willowMessage, setWillowMessage] = useState('');
    const [isWillowLoading, setWillowLoading] = useState(false);

    const dayTimerRef = useRef<number | null>(null);
    const DAY_DURATION = 15000; // 15 seconds per day

    const activePet = useMemo(() => {
        if (activePetId === null) return null;
        return ownedPets.find(p => p.id === activePetId) || null;
    }, [ownedPets, activePetId]);
    
    const t = useCallback((key: TranslationKey, params?: Record<string, string | number>) => {
        let str = translations[language][key] || translations['en'][key];
        if (params) {
            Object.keys(params).forEach(pKey => {
                str = str.replace(`{${pKey}}`, String(params[pKey]));
            });
        }
        return str;
    }, [language]);
    
    const addFloatingText = useCallback((text: string, type: 'money' | 'xp', x: number, y: number) => {
        const newText: FloatingText = { id: Date.now() + Math.random(), text, type, x, y };
        setFloatingTexts(current => [...current, newText]);
        setTimeout(() => {
            setFloatingTexts(current => current.filter(t => t.id !== newText.id));
        }, 1500);
    }, []);

    const addXP = useCallback((amount: number) => {
        let finalAmount = amount;
        if (activePet?.type === 'wise_owl') {
            finalAmount *= (1 + PET_DATA.wise_owl.passive.xpBonus);
        }
        setXp(prev => prev + Math.round(finalAmount));
    }, [activePet]);

    const checkAchievements = useCallback((currentStats: Stats) => {
        let changed = false;
        const newAchievements = new Set(unlockedAchievements);
        for (const id of Object.keys(ACHIEVEMENT_DATA) as AchievementId[]) {
            if (!newAchievements.has(id)) {
                const req = ACHIEVEMENT_DATA[id].requires;
                if ((currentStats[req.stat] as any) >= req.value) {
                    newAchievements.add(id);
                    setAchievementToast(id);
                    setTimeout(() => setAchievementToast(null), 4000);
                    changed = true;
                }
            }
        }
        if (changed) {
            setUnlockedAchievements(newAchievements);
        }
    }, [unlockedAchievements]);


    useEffect(() => {
        const xpNeeded = XP_FOR_NEXT_LEVEL[level];
        if (xpNeeded && xp >= xpNeeded) {
            const newLevel = level + 1;
            setLevel(newLevel);
            addFloatingText(`Level Up!`, 'xp', window.innerWidth / 2, window.innerHeight / 3);
            setLevelUpReward({ level: newLevel, money: newLevel * 50 });
            setStats(prev => {
                const newStats = { ...prev, level: newLevel };
                checkAchievements(newStats);
                return newStats;
            });
        }
    }, [xp, level, addFloatingText, checkAchievements]);

    // Date and Season Calculation
    const DAYS_PER_MONTH = 28;
    const MONTHS_PER_YEAR = 12;

    const year = Math.floor((totalDays - 1) / (MONTHS_PER_YEAR * DAYS_PER_MONTH)) + 1;
    const month = Math.floor(((totalDays - 1) % (MONTHS_PER_YEAR * DAYS_PER_MONTH)) / DAYS_PER_MONTH) + 1;
    const dayOfMonth = ((totalDays - 1) % DAYS_PER_MONTH) + 1;

    const getSeason = (currentMonth: number): Season => {
        if ([3, 4, 5].includes(currentMonth)) return 'Spring';
        if ([6, 7, 8].includes(currentMonth)) return 'Summer';
        if ([9, 10, 11].includes(currentMonth)) return 'Autumn';
        return 'Winter'; // Months 12, 1, 2
    };

    const season = getSeason(month);


     // Effect to save game state to localStorage
    useEffect(() => {
        try {
            if (gameState === 'playing') {
                const gameStateToSave = { 
                    farmName, money, plots, seeds, ownedTools: Array.from(ownedTools), hunger, foodInventory, 
                    score, gameMode, weather, disasterChance, totalDays, dayStartTime, marketPrices,
                    hasGreenhouse, greenhousePlots, level, xp, 
                    unlockedAchievements: Array.from(unlockedAchievements), // Convert Set to Array for JSON
                    stats,
                    levelUpReward,
                    claimedMilestoneRewards,
                    milestoneReward,
                    activeOrder,
                    availableOrders,
                    hasBarn,
                    animals,
                    animalProducts,
                    supplies,
                    rawCrops,
                    currentView,
                    barterDeals,
                    ownedPets,
                    activePetId,
                    profilePicture,
                    lastWhisperDay,
                };
                localStorage.setItem('my-little-farm-save-game', JSON.stringify(gameStateToSave));
            }
        } catch (error) {
            console.error("Could not save game data:", error);
        }
    }, [farmName, money, plots, seeds, ownedTools, hunger, foodInventory, score, gameMode, weather, gameState, disasterChance, totalDays, dayStartTime, marketPrices, hasGreenhouse, greenhousePlots, level, xp, unlockedAchievements, stats, levelUpReward, claimedMilestoneRewards, milestoneReward, activeOrder, availableOrders, hasBarn, animals, animalProducts, supplies, rawCrops, currentView, barterDeals, ownedPets, activePetId, profilePicture, lastWhisperDay]);

    const CROP_TYPES: TranslatedCropTypes = useMemo(() => {
        return (Object.keys(CROP_DATA) as CropType[]).reduce((acc, cropKey) => {
            acc[cropKey] = { ...CROP_DATA[cropKey], name: t(cropKey as TranslationKey) };
            return acc;
        }, {} as TranslatedCropTypes);
    }, [t]);

    const FOOD_TYPES: TranslatedFoodTypes = useMemo(() => {
        return (Object.keys(FOOD_DATA) as FoodType[]).reduce((acc, foodKey) => {
            acc[foodKey] = { ...FOOD_DATA[foodKey], name: t(foodKey as TranslationKey) };
            return acc;
        }, {} as TranslatedFoodTypes);
    }, [t]);

    const ANIMAL_TYPES: TranslatedAnimalTypes = useMemo(() => {
        return (Object.keys(ANIMAL_DATA) as AnimalType[]).reduce((acc, key) => {
            acc[key] = { ...ANIMAL_DATA[key], name: t(key as TranslationKey) };
            return acc;
        }, {} as TranslatedAnimalTypes);
    }, [t]);

    const ANIMAL_PRODUCT_TYPES: TranslatedAnimalProductTypes = useMemo(() => {
        return (Object.keys(ANIMAL_PRODUCT_DATA) as AnimalProductType[]).reduce((acc: TranslatedAnimalProductTypes, key) => {
            const productKey = key as AnimalProductType;
            acc[productKey] = { ...ANIMAL_PRODUCT_DATA[productKey], name: t(key as TranslationKey) };
            return acc;
        }, {} as TranslatedAnimalProductTypes);
    }, [t]);

    const SUPPLY_TYPES: TranslatedSupplyTypes = useMemo(() => {
        return (Object.keys(SUPPLY_DATA) as SupplyType[]).reduce((acc, key) => {
            acc[key] = { ...SUPPLY_DATA[key], name: t(key as TranslationKey) };
            return acc;
        }, {} as TranslatedSupplyTypes);
    }, [t]);

    const PET_TYPES: TranslatedPetTypes = useMemo(() => {
        return (Object.keys(PET_DATA) as PetType[]).reduce((acc, key) => {
            const petKey = key as PetType;
            acc[petKey] = {
                ...PET_DATA[petKey],
                name: t(key as TranslationKey),
                description: t(`${key}_desc` as TranslationKey),
            };
            return acc;
        }, {} as TranslatedPetTypes);
    }, [t]);


    useEffect(() => {
        const root = document.getElementById('root');
        if (root) {
            // Manage widescreen class
            if (aspectRatio === 'widescreen') {
                root.classList.add('widescreen');
            } else {
                root.classList.remove('widescreen');
            }

            // Manage season class
            const seasonClasses = ['season-spring', 'season-summer', 'season-autumn', 'season-winter'];
            seasonClasses.forEach(c => root.classList.remove(c));
            root.classList.add(`season-${season.toLowerCase()}`);
        }
    }, [aspectRatio, season]);

    useEffect(() => {
        localStorage.setItem('farm-music-muted', JSON.stringify(isMuted));
        const audio = audioRef.current;
        if (audio) {
            if (gameState === 'playing' && !isMuted) {
                audio.volume = 0.3;
                audio.play().catch(error => {
                    console.error("Audio playback failed:", error);
                });
            } else {
                audio.pause();
            }
        }
    }, [isMuted, gameState]);
    
    useEffect(() => {
        if (gameState === 'playing' && gameMode === 'beta') {
            const hungerInterval = weather === 'heatwave' ? 2500 : 5000;
            const timer = setInterval(() => {
                setHunger(h => Math.max(0, h - 1));
            }, hungerInterval);
            return () => clearInterval(timer);
        }
    }, [gameState, gameMode, weather]);

    const generateNewOrders = useCallback((day: number, currentSeason: Season): Order[] => {
        const orders: Order[] = [];
        const seasonalCrops = (Object.keys(CROP_DATA) as CropType[]).filter(c => CROP_DATA[c].seasons.some(s => s === currentSeason));
        if (seasonalCrops.length === 0) return [];

        const numOrders = 2;
        const requesters: Order['requesterKey'][] = ['restaurant', 'mayor', 'school'];

        for (let i = 0; i < numOrders; i++) {
            const crop = seasonalCrops[Math.floor(Math.random() * seasonalCrops.length)];
            const cropData = CROP_DATA[crop];
            const quantity = 5 + Math.floor(Math.random() * 10);
            const rewardMultiplier = 1.2 + Math.random() * 0.3;
            const money = Math.floor(cropData.sellPrice * quantity * rewardMultiplier);
            const xp = Math.floor(cropData.xp * quantity * 1.2);
            const requesterKey = requesters[Math.floor(Math.random() * requesters.length)];
            
            orders.push({
                id: `order-${day}-${i}`,
                crop,
                quantity,
                progress: 0,
                reward: { money, xp },
                requesterKey
            });
        }
        return orders;
    }, []);

    const generateNewBarterDeals = useCallback((): BarterDeal[] => {
        const specialDeals: { give: BarterItem; get: BarterItem }[] = [
            { give: { type: 'animalProduct', key: 'truffle', quantity: 3 }, get: { type: 'supply', key: 'golden_fertilizer', quantity: 1 } },
            { give: { type: 'animalProduct', key: 'milk', quantity: 10 }, get: { type: 'seed', key: 'stardust_sprout', quantity: 2 } },
            { give: { type: 'food', key: 'pizza', quantity: 2 }, get: { type: 'supply', key: 'golden_fertilizer', quantity: 1 } },
            { give: { type: 'animalProduct', key: 'egg', quantity: 20 }, get: { type: 'seed', key: 'stardust_sprout', quantity: 1 } },
        ];
    
        const normalDeals: { give: BarterItem; get: BarterItem }[] = [
            { give: { type: 'animalProduct', key: 'egg', quantity: 3 }, get: { type: 'supply', key: 'feed', quantity: 5 } },
            { give: { type: 'animalProduct', key: 'milk', quantity: 1 }, get: { type: 'supply', key: 'feed', quantity: 6 } },
            { give: { type: 'animalProduct', key: 'egg', quantity: 8 }, get: { type: 'seed', key: 'carrot', quantity: 2 } },
            { give: { type: 'animalProduct', key: 'milk', quantity: 4 }, get: { type: 'seed', key: 'tomato', quantity: 1 } },
            { give: { type: 'animalProduct', key: 'egg', quantity: 5 }, get: { type: 'food', key: 'bread', quantity: 1 } },
            { give: { type: 'food', key: 'bread', quantity: 1 }, get: { type: 'animalProduct', key: 'egg', quantity: 4 } },
        ];

        const deals: BarterDeal[] = [];
        const shuffledNormal = [...normalDeals].sort(() => 0.5 - Math.random());
        
        // First deal is always normal
        deals.push({ ...shuffledNormal[0], id: `barter-${totalDays}-0` });

        // Second deal has a chance to be special
        if (Math.random() < 0.33) { // 33% chance for a special deal
            const specialDeal = specialDeals[Math.floor(Math.random() * specialDeals.length)];
            deals.push({ ...specialDeal, id: `barter-${totalDays}-1` });
        } else {
            deals.push({ ...shuffledNormal[1], id: `barter-${totalDays}-1` });
        }
        return deals;
    }, [totalDays]);


    // Weather change effect based on Day system
    useEffect(() => {
        if (gameState !== 'playing') {
            if (dayTimerRef.current) clearTimeout(dayTimerRef.current);
            return;
        }

        const scheduleNextDay = (delay: number) => {
            if (dayTimerRef.current) clearTimeout(dayTimerRef.current);
            dayTimerRef.current = window.setTimeout(startNewDay, delay);
        };

        const startNewDay = () => {
            const newTotalDays = totalDays + 1;
            const newMonth = Math.floor(((newTotalDays - 1) % (MONTHS_PER_YEAR * DAYS_PER_MONTH)) / DAYS_PER_MONTH) + 1;
            const newSeason = getSeason(newMonth);

            setTotalDays(newTotalDays);
            setDayStartTime(Date.now());
            
             // Sprinkler logic
            if (ownedTools.has('sprinkler')) {
                const waterAll = (plotsToWater: PlotState[]) => plotsToWater.map(plot => ({ ...plot, isWatered: true }));
                setPlots(waterAll);
                if (hasGreenhouse) {
                    setGreenhousePlots(waterAll);
                }
            }

            // Pet Passives
            if (activePet) {
                switch(activePet.type) {
                    case 'farm_dog':
                        if (Math.random() < PET_DATA.farm_dog.passive.findFeedChance) {
                            const feedFound = Math.floor(Math.random() * 3) + 1;
                            setSupplies(s => ({ ...s, feed: s.feed + feedFound }));
                            addFloatingText(`+${feedFound} 🌾`, 'xp', window.innerWidth * 0.8, window.innerHeight / 2);
                        }
                        break;
                    case 'golden_goose':
                         if (Math.random() < PET_DATA.golden_goose.passive.goldenEggChance) {
                            setAnimalProducts(p => ({ ...p, golden_egg: (p.golden_egg || 0) + 1 }));
                            addFloatingText(`+1 🌟`, 'xp', window.innerWidth * 0.8, window.innerHeight / 2);
                        }
                        break;
                }
            }


            // Update animal states
            setAnimals(prevAnimals => prevAnimals.map(animal => ({
                ...animal,
                isHungry: true,
                productState: animal.isHungry ? 'none' : 'ready'
            })));

            // Update market prices
            setMarketPrices(prevPrices => {
                const newMarketPrices = { ...prevPrices };
                for (const crop of Object.keys(newMarketPrices) as CropType[]) {
                    const change = (Math.random() - 0.5) * 0.5; // Fluctuation between -0.25 and +0.25
                    let newMultiplier = (newMarketPrices[crop] || 1) + change;
                    newMultiplier = Math.round(Math.max(0.5, Math.min(2.5, newMultiplier)) * 100) / 100;
                    newMarketPrices[crop] = newMultiplier;
                }
                return newMarketPrices;
            });

            // Generate new orders
            setAvailableOrders(generateNewOrders(newTotalDays, newSeason));
            // Generate new barter deals
            setBarterDeals(generateNewBarterDeals());

            let newWeather: Weather;
            const isDisaster = Math.random() * 100 < disasterChance;

            if (isDisaster) {
                let possibleDisasters: Weather[];

                if (newSeason === 'Summer') {
                    possibleDisasters = ['heavyRain', 'heatwave', 'typhoon'];
                } else if (newSeason === 'Winter') {
                    possibleDisasters = ['heavyRain', 'blizzard', 'typhoon'];
                } else { // Spring, Autumn
                    possibleDisasters = ['heavyRain', 'heatwave', 'blizzard', 'typhoon'];
                }
                
                newWeather = possibleDisasters[Math.floor(Math.random() * possibleDisasters.length)];
                setDisasterChance(5); // Reset after disaster
            } else {
                const normalWeatherRand = Math.random();
                if (normalWeatherRand < 0.50) newWeather = 'sunny';
                else if (normalWeatherRand < 0.80) newWeather = 'cloudy';
                else newWeather = 'rainy';
                // Increase chance after normal weather
                setDisasterChance(prev => Math.min(75, prev + Math.floor(Math.random() * 6) + 5)); // Increase by 5-10%, cap at 75%
            }
            
            setWeather(newWeather);
            scheduleNextDay(DAY_DURATION);
        };

        const elapsedTime = Date.now() - dayStartTime;
        const remainingTime = Math.max(0, DAY_DURATION - elapsedTime);
        scheduleNextDay(remainingTime);

        return () => {
            if (dayTimerRef.current) clearTimeout(dayTimerRef.current);
        };
    }, [gameState, disasterChance, dayStartTime, DAY_DURATION, totalDays, generateNewOrders, generateNewBarterDeals, hasGreenhouse, ownedTools, activePet, addFloatingText]);
    
    // One-time weather effects
    useEffect(() => {
        if (gameState !== 'playing') return;

        switch(weather) {
            case 'rainy':
                setPlots(currentPlots => currentPlots.map((plot): PlotState => {
                    if (plot.state === 'growing' && !plot.isWatered && plot.crop && plot.growthStartTime) {
                        const cropData = CROP_DATA[plot.crop];
                        const remainingTime = cropData.growthTime - (Date.now() - plot.growthStartTime);
                        const timeToSkip = remainingTime * 0.25;
                        return { 
                            ...plot, 
                            isWatered: true,
                            growthStartTime: plot.growthStartTime - timeToSkip
                        };
                    }
                    return plot;
                }));
                break;
            case 'heatwave':
                setPlots(currentPlots => currentPlots.map((plot): PlotState => {
                    if (plot.state === 'growing' && plot.crop && plot.growthStartTime) {
                        const cropData = CROP_DATA[plot.crop];
                        const remainingTime = cropData.growthTime - (Date.now() - plot.growthStartTime);
                        const timeToSkip = remainingTime * 0.25; // 25% growth boost
                        return {
                            ...plot,
                            growthStartTime: plot.growthStartTime - timeToSkip
                        };
                    }
                    return plot;
                }));
                break;
            case 'typhoon':
                setPlots(currentPlots => currentPlots.map((plot): PlotState => {
                    if ((plot.state === 'growing' || plot.state === 'ready') && Math.random() < 0.3) { // 30% destruction chance
                       return { crop: null, state: 'empty', growthStartTime: null, isWatered: false, isFertilized: false };
                    }
                    return plot;
                }));
                break;
        }
    }, [weather, gameState]);

    // Main Game Tick for Auto-Harvesting
    useEffect(() => {
        if (gameState !== 'playing') return;
    
        const gameTick = setInterval(() => {
            const now = Date.now();
            const assignSize = (): 'Small' | 'Medium' | 'Large' => {
                const rand = Math.random();
                if (rand < 0.25) return 'Small';
                if (rand < 0.75) return 'Medium';
                return 'Large';
            };
    
            const processPlots = (
                currentPlots: PlotState[],
                setPlotsFunc: React.Dispatch<React.SetStateAction<PlotState[]>>,
                isGreenhouse: boolean
            ) => {
                let plotsChanged = false;
                const newPlots = [...currentPlots];
    
                newPlots.forEach((plot, index) => {
                    // Stage 1: Check for growth completion
                    if (plot.state === 'growing' && plot.crop && plot.growthStartTime) {
                        let growthTime = CROP_TYPES[plot.crop].growthTime;
                        if (activePet?.type === 'mini_dragon') {
                            growthTime *= (1 - PET_DATA.mini_dragon.passive.growthSpeedBonus);
                        }
                        if (now - plot.growthStartTime >= growthTime) {
                            newPlots[index] = { ...plot, state: 'ready' as const, size: plot.isFertilized ? 'Large' : assignSize() };
                            plotsChanged = true;
                        }
                    }
                });

                 newPlots.forEach((plot, index) => {
                    // Stage 2: Process ready plots for auto-selling
                    if (plot.state === 'ready' && plot.crop) {
                        const cropForHarvest = plot.crop;
                        const cropSize = plot.size || 'Medium';
                        
                        let yieldAmount = 1;
                        let xpMultiplier = 1;
                        let priceMultiplier = 1;
                
                        switch(cropSize) {
                            case 'Small':
                                xpMultiplier = 0.8;
                                priceMultiplier = 0.8;
                                break;
                            case 'Large':
                                yieldAmount = 2;
                                xpMultiplier = 1.5;
                                priceMultiplier = 2.0;
                                break;
                        }

                        // Floating text position (simplified to center screen)
                        const x = window.innerWidth / 2;
                        const y = window.innerHeight / 2;
                
                        if (activeOrder && activeOrder.crop === cropForHarvest) {
                            const newProgress = Math.min(activeOrder.quantity, activeOrder.progress + yieldAmount);
                            const fulfilledAmount = newProgress - activeOrder.progress;
                            addFloatingText(`+${fulfilledAmount} ${CROP_TYPES[cropForHarvest].icon}`, 'xp', x, y);
                            
                            if (newProgress >= activeOrder.quantity) {
                                setMoney(prev => prev + activeOrder.reward.money);
                                addXP(activeOrder.reward.xp);
                                addFloatingText(`+${activeOrder.reward.money}`, 'money', x, y - 20);
                                addFloatingText(`+${activeOrder.reward.xp} XP`, 'xp', x, y - 40);
                                setActiveOrder(null);
                            } else {
                                setActiveOrder({ ...activeOrder, progress: newProgress });
                            }
                        } else {
                            const cropData = CROP_TYPES[cropForHarvest];
                            const xpGained = Math.round(cropData.xp * xpMultiplier * yieldAmount);
                            let moneyGained = Math.round(cropData.sellPrice * priceMultiplier * (marketPrices[cropForHarvest] || 1)) * yieldAmount;
                           
                            if (activePet?.type === 'calico_cat') {
                                moneyGained *= (1 + PET_DATA.calico_cat.passive.moneyBonus);
                            }
                             moneyGained = Math.round(moneyGained);

                            setMoney(prev => prev + moneyGained);
                            addXP(xpGained);
                            setStats(prev => ({...prev, totalGoldEarned: prev.totalGoldEarned + moneyGained }));

                            addFloatingText(`+${moneyGained}`, 'money', x, y);
                            addFloatingText(`+${xpGained} XP`, 'xp', x, y - 20);
                        }
                         
                         setStats(prev => {
                            const newStats = { ...prev };
                            newStats.totalCropsHarvested += yieldAmount;
                            if (isGreenhouse && season === 'Winter') {
                                newStats.winterCropsHarvested = (newStats.winterCropsHarvested || 0) + yieldAmount;
                            } else {
                                switch(season) {
                                    case 'Spring': newStats.springCropsHarvested = (newStats.springCropsHarvested || 0) + yieldAmount; break;
                                    case 'Summer': newStats.summerCropsHarvested = (newStats.summerCropsHarvested || 0) + yieldAmount; break;
                                    case 'Autumn': newStats.autumnCropsHarvested = (newStats.autumnCropsHarvested || 0) + yieldAmount; break;
                                }
                            }
                            checkAchievements(newStats);
                            return newStats;
                         });

                        // Clear the plot
                        newPlots[index] = { crop: null, state: 'empty', growthStartTime: null, isWatered: false, isFertilized: false };
                        plotsChanged = true;
                    }
                 });

                if (plotsChanged) {
                    setPlotsFunc(newPlots);
                }
            };
            
            const dayProgress = (now - dayStartTime) / DAY_DURATION;
            const isNight = dayProgress > 0.85;

            if (season !== 'Winter' && weather !== 'blizzard' && !isNight) {
                 processPlots(plots, setPlots, false);
            }
            if (hasGreenhouse) {
                processPlots(greenhousePlots, setGreenhousePlots, true);
            }
        }, 1000);
    
        return () => clearInterval(gameTick);
    }, [gameState, plots, greenhousePlots, hasGreenhouse, CROP_TYPES, activePet, activeOrder, marketPrices, dayStartTime, season, weather, addXP, addFloatingText, checkAchievements]);


    const handleStartGame = (mode: GameMode) => {
        setGameMode(mode);
        if (savedState) {
            setGameState('playing');
        } else {
            setGameState('season_select');
        }
    };

    const handleSeasonSelect = (season: Season) => {
        // This is a new game. Reset all state.
        setMoney(50);
        setPlots(JSON.parse(JSON.stringify(initialPlots)) as PlotState[]);
        setSeeds({ 
            carrot: 3, tomato: 0, potato: 0, cucumber: 0, broccoli: 0,
            strawberry: 0, corn: 0, bell_pepper: 0, eggplant: 0, watermelon: 0, stardust_sprout: 0,
        });
        setOwnedTools(new Set());
        setHasGreenhouse(false);
        setGreenhousePlots(JSON.parse(JSON.stringify(initialGreenhousePlots)) as PlotState[]);
        setHunger(100);
        setFoodInventory(getInitialFoodInventory());
        setScore(0);
        setWeather('sunny');
        setDisasterChance(15);
        setMarketPrices(getInitialMarketPrices());
        setLevel(1);
        setXp(0);
        setUnlockedAchievements(new Set());
        setStats({ 
            totalGoldEarned: 0, totalCropsHarvested: 0, farmPlots: INITIAL_FARM_SIZE, greenhousePlots: INITIAL_GREENHOUSE_SIZE,
            hasGreenhouse: false, level: 1, springCropsHarvested: 0, summerCropsHarvested: 0,
            autumnCropsHarvested: 0, winterCropsHarvested: 0, foodEaten: 0, hasBarn: false, totalAnimals: 0, totalProductsCollected: 0
        });
        setLevelUpReward(null);
        setClaimedMilestoneRewards(0);
        setMilestoneReward(null);
        setActiveOrder(null);
        setAvailableOrders([]);
        setHasBarn(false);
        setAnimals([]);
        setAnimalProducts(getInitialAnimalProducts());
        setSupplies(getInitialSupplies());
        setRawCrops(getInitialRawCrops());
        setCurrentView('farm');
        setBarterDeals([]);
        setOwnedPets([]);
        setActivePetId(null);
        setProfilePicture(null);
        setLastWhisperDay(0);

        const seasonStartDays: Record<Season, number> = {
            'Spring': (3 - 1) * DAYS_PER_MONTH + 1,
            'Summer': (6 - 1) * DAYS_PER_MONTH + 1,
            'Autumn': (9 - 1) * DAYS_PER_MONTH + 1,
            'Winter': (12 - 1) * DAYS_PER_MONTH + 1,
        };

        setTotalDays(seasonStartDays[season]);
        setDayStartTime(Date.now());
        setGameState('playing');
    };


    const handleGoToTitle = () => setGameState('title');
    const handleToggleMute = () => setMuted(prev => !prev);
    
    const handleClaimLevelUpReward = () => {
        if (levelUpReward) {
            setMoney(m => m + levelUpReward.money);
            addFloatingText(`+${levelUpReward.money}`, 'money', window.innerWidth / 2, window.innerHeight / 2);
            setLevelUpReward(null);
        }
    };

    const handleClaimMilestone = () => {
        const milestoneNum = claimedMilestoneRewards + 1;
        const moneyReward = 1000 * Math.pow(2, milestoneNum - 1);
        const seedReward = 5 * milestoneNum;
        
        setMilestoneReward({
            milestone: milestoneNum,
            money: moneyReward,
            seeds: seedReward,
        });
    };
    
    const handleCloseMilestoneReward = () => {
        if (milestoneReward) {
            setMoney(m => m + milestoneReward.money);
            setSeeds(s => {
                const newSeeds = { ...s };
                for (const crop of Object.keys(newSeeds) as CropType[]) {
                    newSeeds[crop] += milestoneReward.seeds;
                }
                return newSeeds;
            });
            setClaimedMilestoneRewards(r => r + 1);
            addFloatingText(`+${milestoneReward.money}`, 'money', window.innerWidth / 2, window.innerHeight / 2);
            setMilestoneReward(null);
        }
    };

    const handleBuyBarn = () => {
        if (money >= RANCH_PRICE && !hasBarn) {
            setMoney(m => m - RANCH_PRICE);
            setHasBarn(true);
            setStats(prev => {
                const newStats = {...prev, hasBarn: true};
                checkAchievements(newStats);
                return newStats;
            })
        }
    };

    const handleBuyTool = (tool: ToolType) => {
        if (ownedTools.has(tool)) return;
        const toolData = TOOL_DATA[tool];
        if (money >= toolData.price) {
            setMoney(m => m - toolData.price);
            setOwnedTools(prev => new Set(prev).add(tool));
        }
    };

    const handleBuyAnimal = (animalType: AnimalType, quantity: number) => {
        const price = ANIMAL_DATA[animalType].price;
        const totalCost = price * quantity;
        if (money >= totalCost) {
            setMoney(m => m - totalCost);
            const newAnimals: Animal[] = Array.from({ length: quantity }, () => ({
                id: Date.now() + Math.random(),
                type: animalType,
                isHungry: true,
                productState: 'none',
            }));
            setAnimals(prev => [...prev, ...newAnimals]);
             setStats(prev => {
                const newStats = {...prev, totalAnimals: prev.totalAnimals + quantity};
                checkAchievements(newStats);
                return newStats;
            })
        }
    };

    const handleBuySupplies = (supplyType: SupplyType, quantity: number) => {
        const price = SUPPLY_DATA[supplyType].price;
        const totalCost = price * quantity;
        if (money >= totalCost) {
            setMoney(m => m - totalCost);
            setSupplies(prev => ({...prev, [supplyType]: (prev[supplyType] || 0) + quantity}));
        }
    };

    const handleFeedAnimals = () => {
        const hungryAnimals = animals.filter(a => a.isHungry).length;
        if (supplies.feed >= hungryAnimals && hungryAnimals > 0) {
            setSupplies(prev => ({...prev, feed: prev.feed - hungryAnimals}));
            setAnimals(prev => prev.map(a => a.isHungry ? {...a, isHungry: false} : a));
        }
    };

    const handleCollectProduct = (animalId: number) => {
        const animal = animals.find(a => a.id === animalId);
        if (animal && animal.productState === 'ready') {
            let productType: AnimalProductType;
            switch(animal.type) {
                case 'chicken': productType = 'egg'; break;
                case 'cow': productType = 'milk'; break;
                case 'pig': productType = 'truffle'; break;
                default: return;
            }
            
            setAnimalProducts(prev => ({...prev, [productType]: prev[productType] + 1}));
            setAnimals(prev => prev.map(a => a.id === animalId ? {...a, productState: 'none'} : a));
            setStats(prev => {
                const newStats = {...prev, totalProductsCollected: prev.totalProductsCollected + 1};
                checkAchievements(newStats);
                return newStats;
            })
        }
    };

    const handleExecuteTrade = (deal: BarterDeal) => {
        const { give, get } = deal;

        let hasEnough = false;
        switch (give.type) {
            case 'animalProduct': hasEnough = animalProducts[give.key as AnimalProductType] >= give.quantity; break;
            case 'food': hasEnough = foodInventory[give.key as FoodType] >= give.quantity; break;
            case 'seed': hasEnough = seeds[give.key as CropType] >= give.quantity; break;
            case 'supply': hasEnough = supplies[give.key as SupplyType] >= give.quantity; break;
        }

        if (!hasEnough) return;

        // Subtract items
        switch (give.type) {
            case 'animalProduct': setAnimalProducts(p => ({ ...p, [give.key]: p[give.key as AnimalProductType] - give.quantity })); break;
            case 'food': setFoodInventory(f => ({ ...f, [give.key]: f[give.key as FoodType] - give.quantity })); break;
            case 'seed': setSeeds(s => ({ ...s, [give.key as CropType]: s[give.key as CropType] - give.quantity })); break;
            case 'supply': setSupplies(s => ({ ...s, [give.key as SupplyType]: s[give.key as SupplyType] - give.quantity })); break;
        }

        // Add items
        switch (get.type) {
            case 'animalProduct': setAnimalProducts(p => ({ ...p, [get.key]: p[get.key as AnimalProductType] + get.quantity })); break;
            case 'food': setFoodInventory(f => ({ ...f, [get.key]: (f[get.key as FoodType] || 0) + get.quantity })); break;
            case 'seed': setSeeds(s => ({ ...s, [get.key as CropType]: (s[get.key as CropType] || 0) + get.quantity })); break;
            case 'supply': setSupplies(s => ({ ...s, [get.key as SupplyType]: (s[get.key as SupplyType] || 0) + get.quantity })); break;
        }
    };
    
    const handleSellItem = (type: 'rawCrop' | 'animalProduct' | 'food', key: CropType | AnimalProductType | FoodType, quantity: number) => {
        let price = 0;
        let currentQuantity = 0;
        switch(type) {
            case 'rawCrop':
                price = CROP_DATA[key as CropType].sellPrice;
                currentQuantity = rawCrops[key as CropType] || 0;
                break;
            case 'animalProduct':
                price = ANIMAL_PRODUCT_DATA[key as AnimalProductType].sellPrice;
                currentQuantity = animalProducts[key as AnimalProductType] || 0;
                break;
            case 'food':
                price = FOOD_DATA[key as FoodType].price;
                currentQuantity = foodInventory[key as FoodType] || 0;
                break;
        }

        const sellQuantity = Math.min(quantity, currentQuantity);
        if (sellQuantity <= 0) return;

        let moneyEarned = price * sellQuantity;

        if (activePet?.type === 'calico_cat') {
            moneyEarned *= (1 + PET_DATA.calico_cat.passive.moneyBonus);
        }

        setMoney(m => m + Math.round(moneyEarned));

        switch(type) {
            case 'rawCrop': setRawCrops(rc => ({ ...rc, [key as CropType]: rc[key as CropType] - sellQuantity })); break;
            case 'animalProduct': setAnimalProducts(ap => ({ ...ap, [key as AnimalProductType]: ap[key as AnimalProductType] - sellQuantity })); break;
            case 'food': setFoodInventory(fi => ({ ...fi, [key as FoodType]: fi[key as FoodType] - sellQuantity })); break;
        }
    };

    const handleCook = (recipeKey: keyof typeof RECIPE_DATA) => {
        const recipe = RECIPE_DATA[recipeKey];
        
        // Check if player has enough ingredients
        for (const ingredient of recipe.ingredients) {
            switch (ingredient.type) {
                case 'rawCrop':
                    if ((rawCrops[ingredient.key as CropType] || 0) < ingredient.quantity) return;
                    break;
                case 'animalProduct':
                    if ((animalProducts[ingredient.key as AnimalProductType] || 0) < ingredient.quantity) return;
                    break;
                case 'food':
                    if ((foodInventory[ingredient.key as FoodType] || 0) < ingredient.quantity) return;
                    break;
            }
        }
    
        // Consume ingredients
        for (const ingredient of recipe.ingredients) {
             switch (ingredient.type) {
                case 'rawCrop':
                    setRawCrops(prev => ({ ...prev, [ingredient.key as CropType]: prev[ingredient.key as CropType] - ingredient.quantity }));
                    break;
                case 'animalProduct':
                    setAnimalProducts(prev => ({ ...prev, [ingredient.key as AnimalProductType]: prev[ingredient.key as AnimalProductType] - ingredient.quantity }));
                    break;
                case 'food':
                    setFoodInventory(prev => ({ ...prev, [ingredient.key as FoodType]: prev[ingredient.key as FoodType] - ingredient.quantity }));
                    break;
            }
        }
        
        // Add result to food inventory
        const { result } = recipe;
        setFoodInventory(prev => ({ ...prev, [result.key]: (prev[result.key] || 0) + result.quantity }));
        addXP(20);
        addFloatingText(`+1 ${FOOD_DATA[result.key].icon}`, 'xp', window.innerWidth / 2, window.innerHeight / 2);
    };

    const handlePetPull = (count: 1 | 10) => {
        const cost = count === 1 ? PET_PULL_COST.single : PET_PULL_COST.multi;
        if (supplies.pet_biscuit < cost) return;

        setSupplies(s => ({ ...s, pet_biscuit: s.pet_biscuit - cost }));

        const pullOnePet = (minRarity: PetRarity = 'common'): Pet => {
            let chosenRarity: PetRarity;
            let possiblePets: PetType[];

            while (true) {
                const rand = Math.random();
                let cumulative = 0;
                let foundRarity: PetRarity = 'common';

                for (const rarity of ['legendary', 'epic', 'rare', 'common'] as PetRarity[]) {
                    cumulative += PET_RARITY_CHANCES[rarity];
                    if (rand < cumulative) {
                        foundRarity = rarity;
                        break;
                    }
                }

                const rarityOrder: Record<PetRarity, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };
                if (rarityOrder[foundRarity] >= rarityOrder[minRarity]) {
                    chosenRarity = foundRarity;
                    break;
                }
            }
            
            possiblePets = (Object.keys(PET_DATA) as PetType[]).filter(p => PET_DATA[p].rarity === chosenRarity);
            const chosenPetType = possiblePets[Math.floor(Math.random() * possiblePets.length)];
            
            return {
                id: Date.now() + Math.random(),
                type: chosenPetType,
            };
        };

        const results: Pet[] = [];
        for (let i = 0; i < count; i++) {
            results.push(pullOnePet());
        }

        if (count === 10) {
            const hasRareOrBetter = results.some(pet => PET_DATA[pet.type].rarity !== 'common');
            if (!hasRareOrBetter) {
                results[results.length - 1] = pullOnePet('rare');
            }
        }
        
        setOwnedPets(prev => [...prev, ...results]);
        setGachaResults(results);
    };

    const handleSetActivePet = (petId: number) => {
        setActivePetId(petId);
    };

    const handleListenToWillow = async () => {
        if (totalDays <= lastWhisperDay || isWillowLoading) return;

        setWillowLoading(true);
        setWillowMessage('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const prices = Object.entries(marketPrices);
            prices.sort((a, b) => b[1] - a[1]);
            const cropWithHighestPrice = CROP_TYPES[prices[0][0] as CropType].name;
            const cropWithLowestPrice = CROP_TYPES[prices[prices.length - 1][0] as CropType].name;
            const playerSeedList = (Object.keys(seeds) as CropType[])
                .filter(key => seeds[key] > 0)
                .map(key => `${CROP_TYPES[key].name} (x${seeds[key]})`)
                .join(', ') || 'None';

            const prompt = `
You are the Whispering Willow, a wise, ancient, and slightly cryptic magical tree on a farm. Provide short, poetic, and actionable advice to the farmer in Korean. The farmer can only listen to you once per day.

Current Farm Status:
- Season: ${season}, Day ${dayOfMonth}
- Farmer's Gold: ${money}
- Current Weather: ${weather}
- Market Insight: The price of ${cropWithHighestPrice} is high, while ${cropWithLowestPrice} is low.
- Seeds in Hand: ${playerSeedList}
- Active Bulletin Board Order: ${activeOrder ? `Seeking ${activeOrder.quantity} ${CROP_TYPES[activeOrder.crop].name}` : 'None'}

Based on this, give your mystical whisper for the day. Keep it concise, under 50 words.
`;
            
            const response = await ai.models.generateContentStream({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            for await (const chunk of response) {
                setWillowMessage(prev => prev + chunk.text);
            }
            
            setLastWhisperDay(totalDays);
        } catch (error) {
            console.error("Error fetching willow whisper:", error);
            setWillowMessage("The willow's whispers are lost in the wind today...");
        } finally {
            setWillowLoading(false);
        }
    };


    let pageContent;

    if (gameState === 'title') {
        pageContent = (
            <>
                <TitleScreen 
                    farmName={farmName}
                    onFarmNameChange={setFarmName}
                    onStartGame={() => handleStartGame('normal')}
                    onStartBeta={() => handleStartGame('beta')}
                    onOpenSettings={() => setSettingsOpen(true)}
                    t={t}
                />
                {isSettingsOpen && (
                    <SettingsModal
                        t={t}
                        onClose={() => setSettingsOpen(false)}
                        onLanguageChange={setLanguage}
                        currentLanguage={language}
                        onAspectRatioChange={setAspectRatio}
                        currentAspectRatio={aspectRatio}
                        onToggleMute={handleToggleMute}
                        isMuted={isMuted}
                    />
                )}
            </>
        );
    } else if (gameState === 'season_select') {
        pageContent = (
            <SeasonSelectionScreen onSeasonSelect={handleSeasonSelect} t={t} />
        );
    } else if (currentView === 'farm') {
         pageContent = (
            <GameScreen 
                farmName={farmName || t('title')} 
                onGoToTitle={handleGoToTitle}
                money={money}
                setMoney={setMoney}
                plots={plots}
                setPlots={setPlots}
                seeds={seeds}
                setSeeds={setSeeds}
                ownedTools={ownedTools}
                onBuyTool={handleBuyTool}
                hunger={hunger}
                setHunger={setHunger}
                foodInventory={foodInventory}
                setFoodInventory={setFoodInventory}
                score={score}
                setScore={setScore}
                t={t}
                CROP_TYPES={CROP_TYPES}
                FOOD_TYPES={FOOD_TYPES}
                ANIMAL_TYPES={ANIMAL_TYPES}
                SUPPLY_TYPES={SUPPLY_TYPES}
                ANIMAL_PRODUCT_TYPES={ANIMAL_PRODUCT_TYPES}
                PET_TYPES={PET_TYPES}
                gameMode={gameMode}
                weather={weather}
                disasterChance={disasterChance}
                year={year}
                month={month}
                dayOfMonth={dayOfMonth}
                season={season}
                dayStartTime={dayStartTime}
                marketPrices={marketPrices}
                hasGreenhouse={hasGreenhouse}
                setHasGreenhouse={setHasGreenhouse}
                greenhousePlots={greenhousePlots}
                setGreenhousePlots={setGreenhousePlots}
                level={level}
                xp={xp}
                addFloatingText={addFloatingText}
                addXP={addXP}
                stats={stats}
                setStats={setStats}
                unlockedAchievements={unlockedAchievements}
                checkAchievements={checkAchievements}
                aspectRatio={aspectRatio}
                claimedMilestoneRewards={claimedMilestoneRewards}
                onClaimMilestone={handleClaimMilestone}
                activeOrder={activeOrder}
                setActiveOrder={setActiveOrder}
                availableOrders={availableOrders}
                setAvailableOrders={setAvailableOrders}
                hasBarn={hasBarn}
                onBuyBarn={handleBuyBarn}
                animals={animals}
                onFeedAnimals={handleFeedAnimals}
                onCollectProduct={handleCollectProduct}
                onBuyAnimal={handleBuyAnimal}
                onBuySupplies={handleBuySupplies}
                supplies={supplies}
                setSupplies={setSupplies}
                animalProducts={animalProducts}
                setAnimalProducts={setAnimalProducts}
                rawCrops={rawCrops}
                setRawCrops={setRawCrops}
                onCook={handleCook}
                onVisitRanch={() => setCurrentView('ranch')}
                onVisitTradingPost={() => setCurrentView('trading_post')}
                activePet={activePet}
                onPetPull={handlePetPull}
                onSetActivePet={handleSetActivePet}
                ownedPets={ownedPets}
                activePetId={activePetId}
                profilePicture={profilePicture}
                setProfilePicture={setProfilePicture}
                lastWhisperDay={lastWhisperDay}
                willowMessage={willowMessage}
                isWillowLoading={isWillowLoading}
                onListenToWillow={handleListenToWillow}
                totalDays={totalDays}
            />
        );
    } else if (currentView === 'ranch') {
        pageContent = (
             <RanchScreen
                t={t}
                onReturnToFarm={() => setCurrentView('farm')}
                animals={animals}
                onFeedAnimals={handleFeedAnimals}
                onCollectProduct={handleCollectProduct}
                ANIMAL_TYPES={ANIMAL_TYPES}
                ANIMAL_PRODUCT_TYPES={ANIMAL_PRODUCT_TYPES}
                SUPPLY_TYPES={SUPPLY_TYPES}
                supplies={supplies}
                animalProducts={animalProducts}
                // HUD props
                farmName={farmName || t('title')}
                money={money}
                score={score}
                level={level}
                xp={xp}
                gameMode={gameMode}
                hunger={hunger}
                onGoToTitle={handleGoToTitle}
            />
        );
    } else { // currentView === 'trading_post'
        pageContent = (
             <TradingPostScreen
                t={t}
                onReturnToFarm={() => setCurrentView('farm')}
                barterDeals={barterDeals}
                onExecuteTrade={handleExecuteTrade}
                onSellItem={handleSellItem}
                rawCrops={rawCrops}
                animalProducts={animalProducts}
                foodInventory={foodInventory}
                supplies={supplies}
                seeds={seeds}
                CROP_TYPES={CROP_TYPES}
                ANIMAL_PRODUCT_TYPES={ANIMAL_PRODUCT_TYPES}
                FOOD_TYPES={FOOD_TYPES}
                SUPPLY_TYPES={SUPPLY_TYPES}
                // HUD props
                farmName={farmName || t('title')}
                money={money}
                score={score}
                level={level}
                xp={xp}
                gameMode={gameMode}
                hunger={hunger}
                onGoToTitle={handleGoToTitle}
            />
        );
    }
    
    return (
        <>
            <audio ref={audioRef} src="https://codeskulptor-demos.commondatastorage.googleapis.com/descent/background%20music.mp3" loop />
            {floatingTexts.map(ft => (
                <div key={ft.id} className={`floating-text ${ft.type}`} style={{ left: ft.x, top: ft.y }}>
                    {ft.text}
                </div>
            ))}
            {achievementToast && (
                 <div className="achievement-toast">
                    <span className="achievement-toast-icon">⭐</span>
                    <div className="achievement-toast-text">
                        <h4>{t('newAchievementUnlocked')}</h4>
                        <p>{t(`achievement_${achievementToast}_name` as TranslationKey)}</p>
                    </div>
                </div>
            )}
            {levelUpReward && (
                <LevelUpModal
                    t={t}
                    onClose={handleClaimLevelUpReward}
                    reward={levelUpReward}
                />
            )}
            {milestoneReward && (
                 <MilestoneRewardModal
                    t={t}
                    onClose={handleCloseMilestoneReward}
                    reward={milestoneReward}
                />
            )}
            {gachaResults && (
                <GachaResultsModal
                    t={t}
                    results={gachaResults}
                    onClose={() => setGachaResults(null)}
                    PET_TYPES={PET_TYPES}
                />
            )}
            {pageContent}
        </>
    );
}