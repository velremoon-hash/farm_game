import React from 'react';
import { TranslationKey } from '../types';

interface WhisperingWillowModalProps {
    t: (key: TranslationKey, params?: Record<string, any>) => string;
    onClose: () => void;
    onListen: () => void;
    message: string;
    isLoading: boolean;
    canListen: boolean;
}

export default function WhisperingWillowModal({
    t, onClose, onListen, message, isLoading, canListen
}: WhisperingWillowModalProps) {
    
    const getButtonText = () => {
        if (isLoading) return '...';
        if (!canListen) return t('willowSleeps');
        return t('listenToWillow');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content willow-modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <h2>{t('whisperingWillow')}</h2>

                <div className="willow-message-display">
                    {isLoading && !message && <span className="loading-indicator">🌿</span>}
                    {message || t("willowHums")}
                </div>

                <button
                    className="willow-listen-button"
                    onClick={onListen}
                    disabled={!canListen || isLoading}
                >
                    {getButtonText()}
                </button>
            </div>
        </div>
    );
}