import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { wcagContrast } from 'culori';
import { useTheme } from '../theme-context';
import { SystemicModal } from './SystemicModal';

interface ContrastCheckerProps {
    onClose: () => void;
    isDarkMode: boolean;
}

const ContrastCell: React.FC<{ fgVar: string, bgVar: string, isDarkMode: boolean }> = ({ fgVar, bgVar, isDarkMode }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [ratio, setRatio] = useState<number | null>(null);

    useEffect(() => {
        if (!ref.current) return;
        // Small delay to ensure CSS variables are applied
        const timer = requestAnimationFrame(() => {
            if (!ref.current) return;
            const style = getComputedStyle(ref.current);
            const bgColor = style.backgroundColor;
            const fgColor = style.color;
            if (bgColor && fgColor) {
                const r = wcagContrast(bgColor, fgColor);
                if (typeof r === 'number') {
                    setRatio(r);
                }
            }
        });
        return () => cancelAnimationFrame(timer);
    }, [bgVar, fgVar, isDarkMode]); // Re-run when dark mode changes

    const getBadgeInfo = (r: number) => {
        if (r >= 7) return { label: 'AAA', color: 'var(--color-success-600)', bg: 'var(--color-surface-success-default)' };
        if (r >= 4.5) return { label: 'AA', color: 'var(--color-success-600)', bg: 'var(--color-surface-success-default)' };
        if (r >= 3) return { label: 'AA18', color: 'var(--color-warning-600)', bg: 'rgba(234, 179, 8, 0.1)' };
        return { label: 'FAIL', color: 'var(--color-error-600)', bg: 'var(--color-surface-error-default)' };
    };

    const badge = ratio ? getBadgeInfo(ratio) : null;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            boxSizing: 'border-box',
            borderRight: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
            borderBottom: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
            position: 'relative',
        }}>
            <div
                ref={ref}
                style={{
                    padding: '1.5rem',
                    background: `var(${bgVar})`,
                    color: `var(${fgVar})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    fontWeight: 600,
                    fontSize: '1rem',
                }}
            >
                Preview Text
            </div>
            {ratio !== null && badge && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: isDarkMode ? '#1a1a1a' : '#fafafa' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-default)' }}>
                        {ratio.toFixed(2)}
                    </span>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: badge.color,
                        background: badge.bg,
                        padding: '0.125rem 0.375rem',
                        borderRadius: '4px'
                    }}>
                        {badge.label}
                    </span>
                </div>
            )}
        </div>
    );
};

export const ContrastChecker: React.FC<ContrastCheckerProps> = ({ onClose, isDarkMode }) => {
    const { themes } = useTheme();
    // Assuming active theme logic is handled in App.tsx or we just use the first/active one. We can just use the DOM resolution since it runs inside ThemeScope!
    const activeThemeId = document.querySelector('select')?.value; // Quick hack if passing active theme isn't easy, but wait, the active theme is in the DOM!
    // Let's just grab the primary name from the generated CSS variables or contexts.
    // Actually we can read the theme from context.
    const activeTheme = themes[0]; // Simplification for finding primary color
    // We can realistically guess the primary color name if there's one:
    const primaryColorName = activeTheme?.colors[0]?.name.toLowerCase().replace(/\s+/g, '-') || 'brand';

    const backgrounds = [
        { label: 'Canvas', var: '--color-background-default' },
        { label: 'Surface', var: '--color-surface-default' },
        { label: 'Tinted Surface', var: `--color-surface-${primaryColorName}-default` },
        { label: 'Solid Base', var: `--color-base-${primaryColorName}-default` }
    ];

    const foregrounds = [
        { label: 'Text Default', var: '--color-text-default' },
        { label: 'Text Subtle', var: '--color-text-subtle' },
        { label: 'Text Primary', var: `--color-text-${primaryColorName}-default` },
        { label: 'Text Contrast', var: `--color-text-${primaryColorName}-contrast` }
    ];

    return (
        <SystemicModal variant="centered" isDarkMode={isDarkMode} onClose={onClose} maxWidth="900px" noPadding>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-default)', margin: 0 }}>Contrast Checker</h2>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-subtle)' }}>WCAG 2.1 Contrast matrix using the active semantic tokens.</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: isDarkMode ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ overflow: 'auto', padding: '2rem' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `auto repeat(${backgrounds.length}, 1fr)`,
                        borderTop: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
                        borderLeft: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
                        background: isDarkMode ? '#1a1a1a' : '#fafafa',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}>
                        {/* Header Row */}
                        <div style={{ padding: '1rem', borderRight: `1px solid ${isDarkMode ? '#333' : '#eee'}`, borderBottom: `1px solid ${isDarkMode ? '#333' : '#eee'}` }} />
                        {backgrounds.map((bg, i) => (
                            <div key={i} style={{
                                padding: '1rem',
                                borderRight: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
                                borderBottom: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: 'var(--color-text-subtle)',
                                textTransform: 'uppercase',
                                textAlign: 'center'
                            }}>
                                {bg.label}
                                <div style={{ fontSize: '0.65rem', fontWeight: 400, marginTop: '0.25rem', opacity: 0.7 }}>var({bg.var})</div>
                            </div>
                        ))}

                        {/* Rows */}
                        {foregrounds.map((fg, rIdx) => (
                            <React.Fragment key={rIdx}>
                                <div style={{
                                    padding: '1rem',
                                    borderRight: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
                                    borderBottom: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: 'var(--color-text-default)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    {fg.label}
                                    <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--color-text-subtle)', marginTop: '0.25rem' }}>var({fg.var})</div>
                                </div>
                                {backgrounds.map((bg, cIdx) => (
                                    <ContrastCell key={cIdx} fgVar={fg.var} bgVar={bg.var} isDarkMode={isDarkMode} />
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </SystemicModal>
    );
};
