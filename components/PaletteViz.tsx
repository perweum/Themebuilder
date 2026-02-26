import React from 'react';
import { useTheme } from '../theme-context';
import { generateRamp, getColorName, getHueDistance } from '../lib/palette-generator';

const RampRow = ({ title, seed, cssPrefix, mappedName, isDarkMode }: { title: string, seed: string, cssPrefix?: string, mappedName?: string, isDarkMode?: boolean }) => {
    const gen = generateRamp(seed);

    let displayPrefix = cssPrefix;
    if (!displayPrefix) {
        const lower = title.toLowerCase().replace(/\s+/g, '-');
        if (['neutral', 'success', 'error'].includes(lower)) {
            displayPrefix = `color-${lower}`;
        } else {
            displayPrefix = `color-global-${lower}`;
        }
    }

    return (
        <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem', color: isDarkMode ? '#aaa' : '#666' }}>
                {title} <span style={{ fontWeight: 'normal', color: isDarkMode ? '#666' : '#999' }}>
                    {mappedName ? `(color.${mappedName}.*)` : `(var(--${displayPrefix}-*))`} - Mapped to: {gen.closestStep}
                </span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px' }}>
                {Object.entries(gen.ramp).map(([step, hex]) => (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
                        <div
                            style={{
                                width: '100%',
                                paddingTop: '100%', // square
                                backgroundColor: hex,
                                borderRadius: '4px',
                                border: step === String(gen.closestStep) ? `2px solid ${isDarkMode ? '#FFF' : '#000'}` : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                            }}
                            title={`Step ${step}: var(--${displayPrefix}-${step})`}
                        />
                        <span style={{ fontSize: '10px', color: step === String(gen.closestStep) ? (isDarkMode ? '#FFF' : '#000') : (isDarkMode ? '#666' : '#999'), fontWeight: step === String(gen.closestStep) ? 'bold' : 'normal' }}>{step}</span>
                        <span style={{ fontSize: '10px', color: isDarkMode ? '#aaa' : '#000' }}>{hex}</span>
                        <span style={{ fontSize: '8px', color: isDarkMode ? '#666' : '#aaa', marginTop: '2px', whiteSpace: 'nowrap' }}>var(--{displayPrefix}-{step})</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const PaletteViz: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode }) => {
    const { themes, globalColors } = useTheme();

    if (themes.length === 0) return null;

    return (
        <div className="palette-viz-container" style={{ padding: '2rem', background: isDarkMode ? '#1a1a1a' : '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'background-color 0.3s' }}>
            {themes.map((theme, index) => (
                <div key={theme.id} style={{ marginBottom: index < themes.length - 1 ? '3rem' : '0' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: `1px solid ${isDarkMode ? '#333' : '#eee'}`, paddingBottom: '0.5rem', color: isDarkMode ? '#FFF' : '#000' }}>Core Palette Engine ({theme.id})</h2>
                    {theme.colors.map(color => {
                        const safeName = color.name.toLowerCase().replace(/\s+/g, '-');
                        return (
                            <RampRow
                                key={color.id}
                                title={color.name}
                                seed={color.seed}
                                cssPrefix={`color-${safeName}`}
                                mappedName={safeName}
                                isDarkMode={isDarkMode}
                            />
                        );
                    })}
                </div>
            ))}

            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', marginTop: '3rem', borderBottom: `1px solid ${isDarkMode ? '#333' : '#eee'}`, paddingBottom: '0.5rem', color: isDarkMode ? '#FFF' : '#000' }}>Global & Semantic Colors</h2>
            {globalColors.map(color => (
                <RampRow key={color.id} title={color.name} seed={color.seed} isDarkMode={isDarkMode} />
            ))}
        </div>
    );
};
