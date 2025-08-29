import React, { useMemo } from 'react';
import { Season, TimeOfDay } from '../types';

export default function SeasonalBackground({ season, timeOfDay, dayProgress }: { season: Season; timeOfDay: TimeOfDay; dayProgress: number; }) {
    const particles = useMemo(() => {
        if (season === 'Winter' || season === 'Spring') {
            const count = 50;
            return Array.from({ length: count }, (_, i) => ({
                id: i,
                style: {
                    left: `${Math.random() * 100}vw`,
                    animationDuration: `${Math.random() * 5 + 5}s`,
                    animationDelay: `${Math.random() * 10}s`,
                    opacity: Math.random() * 0.7 + 0.3,
                },
            }));
        }
        return [];
    }, [season]);

    const autumnLeaves = useMemo(() => {
        if (season !== 'Autumn') return [];
        const count = 15; // Per tree
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            style: {
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 80}%`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                animationDelay: `${Math.random() * 5}s`,
            },
        }));
    }, [season]);

    const getParticleClass = () => {
        switch (season) {
            case 'Winter': return 'snow';
            case 'Spring': return 'petal';
            default: return '';
        }
    };
    
    const nightOverlayOpacity = useMemo(() => {
        switch (timeOfDay) {
            case 'sunrise': return 0.5;
            case 'day': return 0;
            case 'sunset': return 0.6;
            case 'night': return 0.85;
            default: return 0;
        }
    }, [timeOfDay]);

    const stars = useMemo(() => {
        if (timeOfDay !== 'night' && timeOfDay !== 'sunset' && timeOfDay !== 'sunrise') return [];
        return Array.from({ length: 50 }, (_, i) => ({
            id: i,
            style: {
                top: `${Math.random() * 60}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 2 + 2}s`,
            },
        }));
    }, [timeOfDay]);

    const particleClass = getParticleClass();
    const isWinter = season === 'Winter';

    return (
        <div className="seasonal-background">
            <div className="night-overlay" style={{ opacity: nightOverlayOpacity }}></div>
            <div className="stars" style={{ opacity: (timeOfDay === 'night' || timeOfDay === 'sunset') ? 1 : 0 }}>
                {stars.map(star => <div key={star.id} className="star" style={star.style}></div>)}
            </div>

            <div className="sky-object-container" style={{ transform: `translate(-50%, -50%) rotate(${dayProgress * 1.8 - 90}deg)` }}>
                <div className="sun" style={{ opacity: (timeOfDay === 'day' || timeOfDay === 'sunrise' || timeOfDay === 'sunset') ? 1 : 0, transform: `translateX(-50%) rotate(${-(dayProgress * 1.8 - 90)}deg)` }}></div>
                <div className="moon" style={{ opacity: (timeOfDay === 'night' || timeOfDay === 'sunset' || timeOfDay === 'sunrise') ? 1 : 0, transform: `translateX(-50%) rotate(${-(dayProgress * 1.8 - 90)}deg)` }}></div>
            </div>
            
            {particles.map(p => (
                <div key={p.id} className={`particle ${particleClass}`} style={p.style}></div>
            ))}
            
            {season !== 'Winter' && (
                <div className="clouds">
                    <div className="cloud cloud1"></div>
                    <div className="cloud cloud2"></div>
                    <div className="cloud cloud3"></div>
                </div>
            )}

            <div className="hill hill1"></div>
            <div className="hill hill2"></div>

            <div className="fence">
                <div className="fence-post"></div>
                <div className="fence-post"></div>
                <div className="fence-post"></div>
                <div className="fence-post"></div>
                <div className="fence-post"></div>
            </div>

            <div className={`tree tree1 ${isWinter ? 'bare' : ''}`}>
                <div className="canopy">
                    {season === 'Autumn' && autumnLeaves.map(leaf => (
                        <div key={`t1-${leaf.id}`} className="tree-leaf" style={leaf.style}></div>
                    ))}
                </div>
            </div>
            <div className={`tree tree2 ${isWinter ? 'bare' : ''}`}>
                <div className="canopy">
                    {season === 'Autumn' && autumnLeaves.map(leaf => (
                        <div key={`t2-${leaf.id}`} className="tree-leaf" style={{ ...leaf.style, animationDelay: `${Math.random() * 5}s` }}></div>
                    ))}
                </div>
            </div>
            <div className={`tree tree3 ${isWinter ? 'bare' : ''}`}>
                <div className="canopy">
                     {season === 'Autumn' && autumnLeaves.map(leaf => (
                        <div key={`t3-${leaf.id}`} className="tree-leaf" style={{ ...leaf.style, animationDelay: `${Math.random() * 5}s` }}></div>
                    ))}
                </div>
            </div>
            <div className={`tree tree4 ${isWinter ? 'bare' : ''}`}>
                <div className="canopy">
                    {season === 'Autumn' && autumnLeaves.map(leaf => (
                        <div key={`t4-${leaf.id}`} className="tree-leaf" style={{ ...leaf.style, animationDelay: `${Math.random() * 5}s` }}></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
