import React, { useState } from 'react';
import './Onboarding.css';

export const Onboarding: React.FC = () => {
    const [isOpen, setIsOpen] = useState(() => {
        return !localStorage.getItem('movieDealerHasSeenOnboarding');
    });

    const closeOnboarding = () => {
        setIsOpen(false);
        localStorage.setItem('movieDealerHasSeenOnboarding', 'true');
    };

    if (!isOpen) {
        return (
            <button className="info-trigger" onClick={() => setIsOpen(true)}>
                ¿Cómo funciona? ℹ️
            </button>
        );
    }

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-content">
                <button className="close-onboarding" onClick={closeOnboarding}>×</button>
                <div className="onboarding-header">
                    <span className="onboarding-icon">🃏</span>
                    <h2>Bienvenido a MovieDealer</h2>
                </div>

                <div className="onboarding-steps">
                    <div className="onboarding-step">
                        <div className="step-badge">1</div>
                        <p><strong>El Dealer reparte 5 cartas:</strong> Cada carta es una película basada en tu nivel de cinefilia.</p>
                    </div>

                    <div className="onboarding-step">
                        <div className="step-badge">2</div>
                        <p><strong>Refina tu mano:</strong> Tienes 3 rondas para descartar las que no te gusten. El Dealer aprenderá de tus gustos y te dará opciones similares.</p>
                    </div>

                    <div className="onboarding-step">
                        <div className="step-badge">3</div>
                        <p><strong>La Decisión Final:</strong> En la última ronda, la suerte decide. Solo una película quedará para que la disfrutes hoy.</p>
                    </div>
                </div>

                <div className="onboarding-footer">
                    <p className="onboarding-tip">💡 Tip: El algoritmo entiende si prefieres ciertas décadas o géneros según las películas que conservas.</p>
                    <button className="btn-primary" onClick={closeOnboarding}>¡Entendido!</button>
                </div>
            </div>
        </div>
    );
};
