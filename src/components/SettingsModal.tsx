import React from 'react';
import { Language, AspectRatio, TranslationKey } from '../types';

export default function SettingsModal({ 
    t, 
    onClose, 
    onLanguageChange, 
    currentLanguage, 
    onAspectRatioChange, 
    currentAspectRatio,
    onToggleMute,
    isMuted
}: {
    t: (key: TranslationKey) => string;
    onClose: () => void;
    onLanguageChange: (lang: Language) => void;
    currentLanguage: Language;
    onAspectRatioChange: (ratio: AspectRatio) => void;
    currentAspectRatio: AspectRatio;
    onToggleMute: () => void;
    isMuted: boolean;
}) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose} aria-label="Close settings">×</button>
                <h2>{t('settings')}</h2>
                <div className="settings-section">
                    <h3>{t('language')}</h3>
                    <div className="language-buttons">
                        <button
                            className={`language-button ${currentLanguage === 'en' ? 'active' : ''}`}
                            onClick={() => onLanguageChange('en')}
                        >
                            English
                        </button>
                        <button
                            className={`language-button ${currentLanguage === 'ko' ? 'active' : ''}`}
                            onClick={() => onLanguageChange('ko')}
                        >
                            한국어
                        </button>
                    </div>
                </div>
                 <div className="settings-section">
                    <h3>{t('aspectRatio')}</h3>
                    <div className="aspect-ratio-buttons">
                        <button
                            className={`aspect-ratio-button ${currentAspectRatio === 'default' ? 'active' : ''}`}
                            onClick={() => onAspectRatioChange('default')}
                        >
                            {t('default')}
                        </button>
                        <button
                            className={`aspect-ratio-button ${currentAspectRatio === 'widescreen' ? 'active' : ''}`}
                            onClick={() => onAspectRatioChange('widescreen')}
                        >
                            {t('widescreen')}
                        </button>
                    </div>
                </div>
                <div className="settings-section">
                    <h3>{t('sound')}</h3>
                    <div className="sound-buttons">
                        <button
                            className="sound-button"
                            onClick={onToggleMute}
                        >
                            {isMuted ? t('musicOff') : t('musicOn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
