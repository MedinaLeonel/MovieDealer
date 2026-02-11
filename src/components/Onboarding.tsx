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
                    <h2>Bienvenido a MovieDealer</h2>
                </div>

                <div className="onboarding-steps">
                    <div className="onboarding-step">
                        <div className="step-badge">1</div>
                        <p><strong>El Dealer reparte 5 cartas:</strong> Cada película se elige según tu nivel y se sesga por tus géneros favoritos históricos.</p>
                    </div>

                    <div className="onboarding-step">
                        <div className="step-badge">2</div>
                        <p><strong>Refina tu mano:</strong> Tienes 3 rondas. ¡Ojo! En la Ronda 2, el Dealer **quemará** la peor carta automáticamente para subir el nivel.</p>
                    </div>

                    <div className="onboarding-step">
                        <div className="step-badge">3</div>
                        <p><strong>Gestión de Energía:</strong> Descartar cartas consume **10 tokens**. Si te quedas sin energía, tendrás que ir All-In con lo que tengas.</p>
                    </div>
                </div>

                <div className="onboarding-footer">
                    <p className="onboarding-tip">💡 Tip: El algoritmo no solo aprende lo que conservas, sino que prioriza películas con streaming en tu región.</p>
                    <button className="btn-primary" onClick={closeOnboarding}>¡Entendido!</button>
                </div>
            </div>
        </div>
    );
};
