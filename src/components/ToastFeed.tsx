import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck } from 'lucide-react';
import './ToastFeed.css';

const coastalCities = [
    'San Bernardo', 'Pinamar', 'Villa Gesell', 'Mar del Plata',
    'Cariló', 'Santa Teresita', 'Mar de las Pampas', 'Necochea'
];

const names = [
    'Leandro', 'Micaela', 'Facundo', 'Valentina',
    'Julian', 'Sol', 'Mateo', 'Delfina', 'Bauti'
];

interface Toast {
    id: number;
    text: string;
}

export const ToastFeed: React.FC = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const name = names[Math.floor(Math.random() * names.length)];
            const city = coastalCities[Math.floor(Math.random() * coastalCities.length)];
            const id = Date.now();

            const newToast = {
                id,
                text: `${name} de ${city} acaba de descubrir una joya 💎`
            };

            setToasts(prev => [...prev, newToast]);

            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 5000);

        }, 15000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="toast-feed-container">
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                        className="social-toast"
                    >
                        <div className="toast-icon">
                            <UserCheck size={16} />
                        </div>
                        <span className="toast-text">{toast.text}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
