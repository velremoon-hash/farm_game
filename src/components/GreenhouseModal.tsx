import React from 'react';
import { PlotState, CropType, TranslationKey, TranslatedCropTypes } from '../types';

export default function GreenhouseModal({
    onClose,
    plots,
    onPlotClick,
    CROP_TYPES,
    selectedItem,
    t,
    currentTime
}: {
    onClose: () => void;
    plots: PlotState[];
    onPlotClick: (index: number) => void;
    CROP_TYPES: TranslatedCropTypes;
    selectedItem: CropType | null;
    t: (key: TranslationKey) => string;
    currentTime: number;
}) {
    const formatTime = (ms: number) => {
        if (ms <= 0) return '00:00';
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="modal-overlay top" onClick={onClose}>
            <div className="modal-content greenhouse-modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose} aria-label="Close greenhouse">×</button>
                <h2>{t('greenhouse')}</h2>

                <div className="farm-grid">
                    {plots.map((plot, index) => {
                        const remainingTime = plot.state === 'growing' && plot.crop && plot.growthStartTime
                            ? CROP_TYPES[plot.crop].growthTime - (currentTime - plot.growthStartTime)
                            : 0;

                        return (
                            <div
                                key={`gh-${index}`}
                                className={`plot ${plot.state}`}
                                onClick={() => onPlotClick(index)}
                                aria-label={`Greenhouse plot ${index + 1}, state: ${plot.state}`}
                            >
                                {plot.crop && plot.state !== 'empty' && (
                                    <span className={`crop-icon ${plot.state === 'ready' && plot.size ? `size-${plot.size.toLowerCase()}` : ''}`}>
                                        {CROP_TYPES[plot.crop].icon}
                                    </span>
                                )}
                                {plot.isWatered && plot.state === 'growing' && <div className="water-droplet">💧</div>}
                                {remainingTime > 0 && (
                                    <div className="growth-timer">
                                        {formatTime(remainingTime)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
