import React from 'react';
import { TranslationKey, Recipe, Ingredient, CropType, AnimalProductType, FoodType, TranslatedCropTypes, TranslatedFoodTypes, TranslatedAnimalProductTypes } from '../types';
import { RECIPE_DATA, FOOD_DATA } from '../data';

interface KitchenModalProps {
    t: (key: TranslationKey, params?: Record<string, any>) => string;
    onClose: () => void;
    onCook: (recipeKey: keyof typeof RECIPE_DATA) => void;
    rawCrops: Record<CropType, number>;
    animalProducts: Record<AnimalProductType, number>;
    foodInventory: Record<FoodType, number>;
    CROP_TYPES: TranslatedCropTypes;
    FOOD_TYPES: TranslatedFoodTypes;
    ANIMAL_PRODUCT_TYPES: TranslatedAnimalProductTypes;
}

export default function KitchenModal({
    t, onClose, onCook, rawCrops, animalProducts, foodInventory,
    CROP_TYPES, FOOD_TYPES, ANIMAL_PRODUCT_TYPES
}: KitchenModalProps) {

    const getItemDisplayData = (item: Ingredient) => {
        switch (item.type) {
            case 'rawCrop': return { icon: CROP_TYPES[item.key as CropType].icon, name: CROP_TYPES[item.key as CropType].name };
            case 'animalProduct': return { icon: ANIMAL_PRODUCT_TYPES[item.key as AnimalProductType].icon, name: ANIMAL_PRODUCT_TYPES[item.key as AnimalProductType].name };
            case 'food': return { icon: FOOD_TYPES[item.key as FoodType].icon, name: FOOD_TYPES[item.key as FoodType].name };
            default: return { icon: '❓', name: 'Unknown' };
        }
    };
    
    const checkIngredients = (recipe: Recipe) => {
        for (const ingredient of recipe.ingredients) {
            switch (ingredient.type) {
                case 'rawCrop':
                    if ((rawCrops[ingredient.key as CropType] || 0) < ingredient.quantity) return false;
                    break;
                case 'animalProduct':
                    if ((animalProducts[ingredient.key as AnimalProductType] || 0) < ingredient.quantity) return false;
                    break;
                case 'food':
                     if ((foodInventory[ingredient.key as FoodType] || 0) < ingredient.quantity) return false;
                    break;
                default: return false;
            }
        }
        return true;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content kitchen-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <h2>{t('kitchen')}</h2>

                <div className="recipe-list">
                    {(Object.keys(RECIPE_DATA) as (keyof typeof RECIPE_DATA)[]).map(recipeKey => {
                        const recipe = RECIPE_DATA[recipeKey];
                        const canCook = checkIngredients(recipe);
                        const resultData = FOOD_TYPES[recipe.result.key];

                        return (
                            <div key={recipeKey} className="recipe-item">
                                <div className="recipe-result">
                                    <span className="food-icon">{resultData.icon}</span>
                                    <span className="food-name">{resultData.name}</span>
                                    <p className="food-description">+{resultData.hungerRestore} {t('hunger')}</p>
                                </div>
                                <div className="recipe-details">
                                    <h4>{t('ingredients')}</h4>
                                    <ul className="recipe-ingredients">
                                        {recipe.ingredients.map((ing, index) => {
                                            const displayData = getItemDisplayData(ing);
                                            let hasAmount = 0;
                                            switch (ing.type) {
                                                case 'rawCrop': hasAmount = rawCrops[ing.key as CropType] || 0; break;
                                                case 'animalProduct': hasAmount = animalProducts[ing.key as AnimalProductType] || 0; break;
                                                case 'food': hasAmount = foodInventory[ing.key as FoodType] || 0; break;
                                            }
                                            const hasEnough = hasAmount >= ing.quantity;
                                            return (
                                                <li key={index} className={hasEnough ? 'ingredient-has' : 'ingredient-lacks'}>
                                                    {displayData.icon} {displayData.name} ({hasAmount}/{ing.quantity})
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                <button className="cook-button" onClick={() => onCook(recipeKey)} disabled={!canCook}>
                                    {t('cook')}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}