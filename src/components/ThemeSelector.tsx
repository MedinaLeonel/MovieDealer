import { useState, useEffect } from 'react';

type Theme = 'default' | 'casino' | 'jazz' | 'cinema' | 'cyber' | 'memphis';

export function ThemeSelector() {
    const [theme, setTheme] = useState<Theme>('default');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Labels for UI
    const themes: { id: Theme, label: string }[] = [
        { id: 'default', label: 'Default' },
        { id: 'casino', label: '♠ Casino' },
        { id: 'jazz', label: '🎷 Night Jazz' },
        { id: 'cinema', label: '🎬 Theatre' },
        { id: 'cyber', label: '💾 Cyber Cafe' },
        { id: 'memphis', label: '🔺 Memphis' },
    ];

    return (
        <div className="theme-selector">
            <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="theme-dropdown"
            >
                {themes.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                ))}
            </select>
        </div>
    );
}
