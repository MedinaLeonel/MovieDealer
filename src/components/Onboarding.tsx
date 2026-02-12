import React from 'react';
import './Onboarding.css';

interface OnboardingProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ isOpen, onClose }) => {
    const closeOnboarding = () => {
        onClose();
        localStorage.setItem('movieDealerHasSeenOnboarding', 'true');
    };

    if (!isOpen) return null;

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-content">
                <button className="close-onboarding" onClick={closeOnboarding}>×</button>
                <div className="onboarding-header">
                    <span className="onboarding-icon">🃏</span>
                    <h2>Bienvenido a Movie<span className="brand-dealer">Dealer</span></h2>
                </div>

                <div className="onboarding-steps">
                    <div className="onboarding-step">
                        <div className="step-badge">1</div>
                        <p><strong>Pool Masivo:</strong> El Dealer busca ~200 películas según tu nivel y filtros. Esto te da un océano de opciones para explorar.</p>
                    </div>

                    <div className="onboarding-step">
                        <div className="step-badge">2</div>
                        <p><strong>6 Rondas de Refinamiento:</strong> Tienes 6 oportunidades para perfeccionar tu mano. El sistema aprende de lo que conservas y adapta las recomendaciones.</p>
                    </div>

                    <div className="onboarding-step">
                        <div className="step-badge">3</div>
                        <p><strong>Energía ilimitada (por ahora):</strong> Probá sin límites. Descarta y conservá cartas las veces que quieras para explorar el pool y encontrar tu película ideal.</p>
                    </div>
                </div>

                <div className="onboarding-footer">
                    <p className="onboarding-tip">💡 Tip: El sistema aprende de tus elecciones. Conserva lo que te gusta y el algoritmo adaptará las siguientes cartas a tus preferencias.</p>
                    <button className="btn-primary" onClick={closeOnboarding}>¡Entendido!</button>
                </div>
            </div>
        </div>
    );
};
