import React, { useState, useMemo } from 'react';
import { CropType, FoodType, Season, TranslationKey, TranslatedCropTypes, TranslatedFoodTypes, AnimalType, SupplyType, TranslatedAnimalTypes, TranslatedSupplyTypes } from '../types';

export default function PurchaseQuantityModal({ 
    item, 
    onClose, 
    onConfirm, 
    money, 
    t, 
    CROP_TYPES, 
    FOOD_TYPES,
    ANIMAL_TYPES,
    SUPPLY_TYPES,
    marketPrices,
}: {
    item: {type: 'seed' | 'food' | 'animal' | 'supply', key: CropType | FoodType | AnimalType | SupplyType};
    onClose: () => void;
    onConfirm: (item: {type: 'seed' | 'food' | 'animal' | 'supply', key: CropType | FoodType | AnimalType | SupplyType}, quantity: number) => void;
    money: number;
    t: (key: TranslationKey) => string;
    CROP_TYPES: TranslatedCropTypes;
    FOOD_TYPES: TranslatedFoodTypes;
    ANIMAL_TYPES: TranslatedAnimalTypes;
    SUPPLY_TYPES: TranslatedSupplyTypes;
    marketPrices: Record<CropType, number>;
}) {
    const { name, icon, price } = useMemo(() => {
        switch (item.type) {
            case 'seed': {
                const cropKey = item.key as CropType;
                const data = CROP_TYPES[cropKey];
                const marketMultiplier = marketPrices[cropKey] || 1;
                const currentPrice = Math.floor(data.seedPrice * marketMultiplier);
                return { name: data.name, icon: data.icon, price: currentPrice };
            }
            case 'food': {
                const foodKey = item.key as FoodType;
                const data = FOOD_TYPES[foodKey];
                return { name: data.name, icon: data.icon, price: data.price };
            }
            case 'animal': {
                const animalKey = item.key as AnimalType;
                const data = ANIMAL_TYPES[animalKey];
                return { name: data.name, icon: data.icon, price: data.price };
            }
            case 'supply': {
                const supplyKey = item.key as SupplyType;
                const data = SUPPLY_TYPES[supplyKey];
                return { name: data.name, icon: data.icon, price: data.price };
            }
            default:
                return { name: 'Unknown', icon: '❓', price: 9999 };
        }
    }, [item, CROP_TYPES, FOOD_TYPES, ANIMAL_TYPES, SUPPLY_TYPES, marketPrices]);
    
    const maxAffordable = useMemo(() => (price > 0 ? Math.floor(money / price) : 0), [money, price]);
    const [quantity, setQuantity] = useState(maxAffordable > 0 ? 1 : 0);

    const handleQuantityChange = (newQuantity: string) => {
        let num = parseInt(newQuantity, 10);
        if (isNaN(num)) return;

        if (num < 1) num = 1;
        if (num > maxAffordable) num = maxAffordable;
        
        setQuantity(num);
    };

    const increment = () => setQuantity(q => Math.min(q + 1, maxAffordable));
    const decrement = () => setQuantity(q => Math.max(q - 1, 1));
    
    const totalCost = quantity * price;

    return (
        <div className="modal-overlay top" onClick={onClose}>
            <div className="modal-content quantity-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose} aria-label="Close">×</button>
                <div className="modal-item-header">
                    <span className="seed-icon">{icon}</span>
                    <h2>{name}</h2>
                </div>

                <div className="quantity-controls">
                    <button onClick={decrement} disabled={quantity <= 1}>-</button>
                    <input 
                        type="number" 
                        value={quantity} 
                        onChange={e => handleQuantityChange(e.target.value)} 
                        min="1" 
                        max={maxAffordable}
                        aria-label="Quantity"
                    />
                    <button onClick={increment} disabled={quantity >= maxAffordable || maxAffordable === 0}>+</button>
                </div>

                <input 
                    type="range" 
                    min="1" 
                    max={maxAffordable > 1 ? maxAffordable : 1}
                    value={quantity} 
                    onChange={e => handleQuantityChange(e.target.value)}
                    disabled={maxAffordable <= 1}
                    className="quantity-slider"
                />

                <div className="total-cost">
                    {t('total')}: 💰 {totalCost}
                </div>

                <button 
                    className="confirm-purchase-button"
                    onClick={() => onConfirm(item, quantity)}
                    disabled={quantity === 0 || totalCost > money}
                >
                    {t('buy')} ({quantity})
                </button>
            </div>
        </div>
    );
}