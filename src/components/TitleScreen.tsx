import React from 'react';
import { TranslationKey } from '../types';

export default function TitleScreen({ farmName, onFarmNameChange, onStartGame, onStartBeta, onOpenSettings, t }: {
    farmName: string;
    onFarmNameChange: (name: string) => void;
    onStartGame: () => void;
    onStartBeta: () => void;
    onOpenSettings: () => void;
    t: (key: TranslationKey) => string;
}) {
    return (
        <div className="title-container">
            <button className="settings-button" onClick={onOpenSettings} aria-label={t('settings')}>⚙️</button>
            <h1>{t('title')}</h1>
            <input
                type="text"
                value={farmName}
                onChange={(e) => onFarmNameChange(e.target.value)}
                className="farm-name-input"
                placeholder={t('enterFarmNamePlaceholder')}
                aria-label="Farm Name Input"
            />
            <div className="start-buttons-container">
                 <button className="start-button" onClick={onStartGame}>
                    {t('startGame')}
                </button>
                <button className="start-button beta-button" onClick={onStartBeta}>
                    {t('betaTest')}
                </button>
            </div>
        </div>
    );
}
