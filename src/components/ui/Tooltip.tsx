import React, { useState } from 'react';
import './Tooltip.css';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
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
                <div className="tooltip-box">
                    {text}
                    <div className="tooltip-arrow"></div>
                </div>
            )}
        </div>
    );
};
