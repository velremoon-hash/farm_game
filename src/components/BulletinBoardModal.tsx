import React from 'react';
import { Order, TranslationKey, TranslatedCropTypes } from '../types';

export default function BulletinBoardModal({ t, onClose, availableOrders, activeOrder, onAcceptOrder, CROP_TYPES }: {
    t: (key: TranslationKey) => string;
    onClose: () => void;
    availableOrders: Order[];
    activeOrder: Order | null;
    onAcceptOrder: (order: Order) => void;
    CROP_TYPES: TranslatedCropTypes;
}) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content bulletin-board-modal" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>×</button>
                <h2>{t('bulletinBoard')}</h2>

                {activeOrder && (
                    <div className="order-section">
                        <h3>{t('activeOrder')}</h3>
                        <div className="order-note">
                             <p className="order-requester">{t(`requester_${activeOrder.requesterKey}` as TranslationKey)}</p>
                             <div className="order-item">
                                 <span className="seed-icon">{CROP_TYPES[activeOrder.crop].icon}</span>
                                 <span>{CROP_TYPES[activeOrder.crop].name} ({activeOrder.progress}/{activeOrder.quantity})</span>
                             </div>
                             <p className="order-reward">
                                 <span className="order-reward-money">💰 {activeOrder.reward.money}</span> / <span className="order-reward-xp">✨ {activeOrder.reward.xp} XP</span>
                             </p>
                             <div className="order-progress-bar-outer">
                                <div className="order-progress-bar-inner" style={{width: `${(activeOrder.progress / activeOrder.quantity) * 100}%`}}></div>
                             </div>
                        </div>
                    </div>
                )}

                <div className="order-section">
                    <h3>{t('availableOrders')}</h3>
                    {availableOrders.length > 0 ? availableOrders.map(order => (
                        <div key={order.id} className="order-note">
                            <p className="order-requester">{t(`requester_${order.requesterKey}` as TranslationKey)}</p>
                             <div className="order-item">
                                 <span className="seed-icon">{CROP_TYPES[order.crop].icon}</span>
                                 <span>{CROP_TYPES[order.crop].name} x{order.quantity}</span>
                             </div>
                             <p className="order-reward">
                                <span className="order-reward-money">💰 {order.reward.money}</span> / <span className="order-reward-xp">✨ {order.reward.xp} XP</span>
                             </p>
                             <div className="order-actions">
                                <button 
                                    className="accept-order-button" 
                                    onClick={() => onAcceptOrder(order)}
                                    disabled={!!activeOrder}
                                >
                                    {t('accept')}
                                </button>
                             </div>
                        </div>
                    )) : <p>{t('noOrdersAvailable')}</p>}
                </div>
            </div>
        </div>
    );
}
