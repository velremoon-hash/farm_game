import React, { useState, useEffect, useRef } from 'react';

export default function IconTooltip({ content, x, y_top, y_bottom, onClose }: { content: string; x: number; y_top: number; y_bottom: number; onClose: () => void; }) {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({
        opacity: 0,
        position: 'fixed',
        top: y_bottom,
        left: x,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
    });

    useEffect(() => {
        if (tooltipRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect();
            let newTop = y_bottom + 8;
            let newLeft = x;
            
            if (newTop + rect.height > window.innerHeight - 10) {
                newTop = y_top - rect.height - 8;
            }
            
            const halfWidth = rect.width / 2;
            if (newLeft - halfWidth < 10) {
                newLeft = halfWidth + 10;
            } else if (newLeft + halfWidth > window.innerWidth - 10) {
                newLeft = window.innerWidth - halfWidth - 10;
            }

            setStyle({
                position: 'fixed',
                top: newTop,
                left: newLeft,
                opacity: 1,
                transform: 'translateX(-50%)',
                pointerEvents: 'auto',
            });
        }
    }, [x, y_top, y_bottom, content]);

    return (
        <div className="tooltip-overlay-clickable" onClick={onClose}>
            <div ref={tooltipRef} className="tooltip-content" style={style} onClick={e => e.stopPropagation()}>
                {content}
            </div>
        </div>
    );
}
