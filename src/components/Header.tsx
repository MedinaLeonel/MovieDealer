import React from 'react';
import { ThemeSelector } from './ui/ThemeSelector';
import { Tooltip } from './ui/Tooltip';

interface HeaderProps {
    tokens: number;
    streak: number;
    onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    tokens,
    streak,
    onReset
}) => {
    const handleLogoClick = () => {
        onReset();
    };

    return (
        <header className="app-header">
            <div className="header-main">
                <div className="brand" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                    MovieDealer
                </div>
            </div>

            <div className="header-actions show">
                <div className="action-group">
                    <ThemeSelector />
                </div>
                <div className="stats-group">
                    <Tooltip text="Energía disponible para descartar cartas" position="bottom">
                        <div className="tokens-badge">💎 {tokens}</div>
                    </Tooltip>
                    <Tooltip text="Días seguidos descubriendo cine" position="bottom">
                        <div className="streak">🔥 {streak}</div>
                    </Tooltip>
                </div>
            </div>
        </header>
    );
};
