import React, { useState } from 'react';
import './Tooltip.css';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
    const [show, setShow] = useState(false);

    return (
        <div
            className="tooltip-wrapper"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onFocus={() => setShow(true)}
            onBlur={() => setShow(false)}
        >
            {children}
            {show && (
                <div className={`tooltip-box position-${position}`}>
                    {text}
                    <div className="tooltip-arrow"></div>
                </div>
            )}
        </div>
    );
};
