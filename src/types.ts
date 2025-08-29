import { translations } from './data';

export type CropType = 'carrot' | 'tomato' | 'potato' | 'cucumber' | 'broccoli' | 'strawberry' | 'corn' | 'bell_pepper' | 'eggplant' | 'watermelon' | 'stardust_sprout';
export type FoodType = 'bread' | 'salad' | 'sandwich' | 'pizza' | 'steak' | 'strawberry_cake' | 'bibimbap' | 'cold_noodles' | 'shaved_ice' | 'samgyetang' | 'roasted_sweet_potato' | 'persimmon' | 'jjinppang' | 'udon' | 'veggie_stir_fry' | 'omelette' | 'truffle_pasta';
export type AnimalType = 'chicken' | 'cow' | 'pig';
export type AnimalProductType = 'egg' | 'milk' | 'truffle' | 'golden_egg';
export type SupplyType = 'feed' | 'golden_fertilizer' | 'pet_biscuit';
export type ToolType = 'wateringCan' | 'sprinkler';
export type PetType = 'farm_dog' | 'calico_cat' | 'wise_owl' | 'golden_goose' | 'mini_dragon';
export type PetRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type BarterItemType = 'food' | 'animalProduct' | 'seed' | 'supply';
export type BarterItemKey = FoodType | AnimalProductType | CropType | SupplyType;

export interface BarterItem {
    type: BarterItemType;
    key: BarterItemKey;
    quantity: number;
}

export interface BarterDeal {
    id: string;
    give: BarterItem;
    get: BarterItem;
}

export type RawCropType = CropType;

export type IngredientType = 'rawCrop' | 'animalProduct' | 'food';
export type IngredientKey = RawCropType | AnimalProductType | FoodType;

export interface Ingredient {
    type: IngredientType;
    key: IngredientKey;
    quantity: number;
}

export interface Recipe {
    result: { type: 'food'; key: FoodType; quantity: number };
    ingredients: readonly Ingredient[];
}

export type AchievementId = 
    'money1' | 'money2' | 'money3' | 'money4' | 
    'harvest1' | 'harvest2' | 'harvest3' | 'harvest4' | 
    'level1' | 'level2' | 'level3' | 
    'expand1' | 'expand2' | 'expand3' | 
    'greenhouse1' | 'greenhouse2' | 'greenhouse3' | 
    'seasonalSpring' | 'seasonalSummer' | 'seasonalAutumn' | 'seasonalWinter' | 
    'foodie1' | 'foodie2' |
    'buildBarn1' | 'buyChicken1' | 'collectEgg1' |
    'buyCow1' | 'collectMilk1' | 'buyPig1' | 'collectTruffle1';

export type TranslationKey = keyof typeof translations['en'];

export type GameMode = 'normal' | 'beta';
export type GameState = 'title' | 'season_select' | 'playing';
export type Language = keyof typeof translations;
export type AspectRatio = 'default' | 'widescreen';
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'heavyRain' | 'heatwave' | 'typhoon' | 'blizzard';
export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';
export type TimeOfDay = 'sunrise' | 'day' | 'sunset' | 'night';

export interface PlotState {
    crop: CropType | null;
    state: 'empty' | 'growing' | 'ready';
    growthStartTime: number | null;
    isWatered: boolean;
    isFertilized?: boolean;
    size?: 'Small' | 'Medium' | 'Large';
}

export interface Animal {
    id: number;
    type: AnimalType;
    isHungry: boolean;
    productState: 'none' | 'ready';
}

export interface Pet {
    id: number;
    type: PetType;
}

export interface FloatingText {
    id: number;
    text: string;
    type: 'money' | 'xp';
    x: number;
    y: number;
}

export interface Stats {
    totalGoldEarned: number;
    totalCropsHarvested: number;
    farmPlots: number;
    greenhousePlots: number;
    hasGreenhouse: boolean;
    level: number;
    springCropsHarvested: number;
    summerCropsHarvested: number;
    autumnCropsHarvested: number;
    winterCropsHarvested: number; // From greenhouse
    foodEaten: number;
    hasBarn: boolean;
    totalAnimals: number;
    totalProductsCollected: number;
}
export type StatId = keyof Stats;

export interface Order {
    id: string;
    crop: CropType;
    quantity: number;
    progress: number;
    reward: { money: number; xp: number; };
    requesterKey: 'restaurant' | 'mayor' | 'school';
}

// For use in components that receive translated data
export type TranslatedCropTypes = Record<CropType, { name: string; icon: string; growthTime: number; sellPrice: number; seedPrice: number; seasons: readonly Season[]; xp: number; }>;
export type TranslatedFoodTypes = Record<FoodType, { name: string; icon: string; price: number; hungerRestore: number; seasonality?: Season }>;
export type TranslatedAnimalTypes = Record<AnimalType, { name: string; icon: string; price: number; }>;
export type TranslatedAnimalProductTypes = Record<AnimalProductType, { name: string; icon: string; sellPrice: number; }>;
export type TranslatedSupplyTypes = Record<SupplyType, { name: string; icon: string; price: number; }>;
export type TranslatedToolTypes = Record<ToolType, { name: string; description: string; }>;
export type TranslatedPetTypes = Record<PetType, { name: string; icon: string; rarity: PetRarity; description: string; }>;