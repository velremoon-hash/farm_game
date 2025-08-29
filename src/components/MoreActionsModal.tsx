import React from 'react';
import { TranslationKey } from '../types';

interface MoreActionsModalProps {
    t: (key: TranslationKey) => string;
    onClose: () => void;
    onOpenBulletin: () => void;
    onVisitTradingPost: () => void;
    onOpenKitchen: () => void;
    onOpenPetGacha: () => void;
    onOpenPetInventory: () => void;
}

export default function MoreActionsModal({
    t,
    onClose,
    onOpenBulletin,
    onVisitTradingPost,
    onOpenKitchen,
    onOpenPetGacha,
    onOpenPetInventory,
}: MoreActionsModalProps) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content more-actions-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose} aria-label="Close">×</button>
                <h2>{t('moreActions')}</h2>
                <div className="more-actions-buttons">
                    <button className="bulletin-board-button" onClick={onOpenBulletin}>{t('bulletinBoard')}</button>
                    <button className="trading-post-button" onClick={onVisitTradingPost}>{t('tradingPost')}</button>
                    <button className="kitchen-button" onClick={onOpenKitchen}>{t('kitchen')}</button>
                    <button className="pet-shelter-button" onClick={onOpenPetGacha}>{t('petGacha')}</button>
                    <button className="pet-shelter-button" style={{backgroundColor: '#a569bd', boxShadow: '0 5px 0 #8e44ad'}} onClick={onOpenPetInventory}>{t('petHouse')}</button>
                </div>
            </div>
        </div>
    );
}