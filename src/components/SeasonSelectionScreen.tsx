import React from 'react';
import { Season, TranslationKey } from '../types';

export default function SeasonSelectionScreen({ onSeasonSelect, t }: {
    onSeasonSelect: (season: Season) => void;
    t: (key: TranslationKey) => string;
}) {
    const seasons: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
    const seasonIcons: Record<Season, string> = {
        Spring: '🌸',
        Summer: '🌻',
        Autumn: '🍁',
        Winter: '☃️',
    };

    return (
        <div className="title-container season-select-container">
            <h1 className="season-select-title">{t('chooseStartingSeason')}</h1>
            <div className="season-buttons-container">
                {seasons.map(season => (
                    <button key={season} className={`season-select-button season-${season.toLowerCase()}`} onClick={() => onSeasonSelect(season)}>
                        <span className="season-icon">{seasonIcons[season]}</span>
                        {t(season.toLowerCase() as TranslationKey)}
                    </button>
                ))}
            </div>
        </div>
    );
}
