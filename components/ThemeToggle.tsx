import React from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{
    isDarkMode: boolean;
    onChange: (isDark: boolean) => void;
}> = ({ isDarkMode, onChange }) => {

    // Explicit branding colors requested by user
    const borderColor = isDarkMode ? '#fff' : '#000';
    const selectedBg = isDarkMode ? '#C3E835' : '#0142FE';

    // The dark mode pill is Lime, so Moon needs to be black. The sun is outside, needs to be white.
    // The light mode pill is Blue, so Sun needs to be white. The moon is outside, needs to be black.
    const moonColor = isDarkMode ? '#000' : borderColor;
    const sunColor = isDarkMode ? borderColor : '#fff';

    return (
        <button
            onClick={() => onChange(!isDarkMode)}
            title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                boxSizing: 'border-box',
                width: '74px',
                height: '38px',
                padding: '3px',
                border: `1px solid ${borderColor}`,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                outline: 'none'
            }}
        >
            {/* The sliding active pill background */}
            <div style={{
                position: 'absolute',
                top: '3px',
                bottom: '3px',
                left: '3px',
                width: 'calc(50% - 3px)',
                background: selectedBg,
                border: `1px solid ${borderColor}`,
                boxSizing: 'border-box',
                transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s ease',
                transform: isDarkMode ? 'translateX(0)' : 'translateX(100%)',
                zIndex: 0
            }} />

            {/* The Icons */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: moonColor, transition: 'color 0.3s ease' }}>
                    <Moon size={16} strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sunColor, transition: 'color 0.3s ease' }}>
                    <Sun size={16} strokeWidth={2.5} />
                </div>
            </div>
        </button>
    );
};
