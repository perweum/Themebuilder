import React from 'react';
import { ThemeProvider, useTheme, ThemeScope } from './theme-context';
import { ThemeControls } from './components/ThemeControls';
import { Button } from './components/Button';
import { PaletteViz } from './components/PaletteViz';
import { FeedbackCard } from './components/Feedback';
import { Toggle } from './components/Form';
import { Badge } from './components/DataDisplay';
import { ExportScreen } from './components/ExportScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { ContrastChecker } from './components/ContrastChecker';
import { TestThemeWebsite } from './components/TestThemeWebsite';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { generateRamp, getAccessibleForeground } from './lib/palette-generator';
import { getAccessibleBaseStep, getBestTextForBg } from './lib/theme-mapper';
import { wcagContrast } from 'culori';

const ThemeComponentCard: React.FC<{
    colorName: string,
    primaryColorName?: string,
    isDarkMode?: boolean
}> = ({ colorName, primaryColorName = 'neutral', isDarkMode }) => {
    return (
        <div style={{
            background: `var(--color-surface-${colorName}-default)`,
            border: `1px solid var(--color-border-${colorName}-default)`,
            borderRadius: 'var(--geometry-radius-3, 12px)',
            padding: '1.5rem',
            color: `var(--color-text-${colorName}-default, inherit)`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: 'var(--color-shadow-2)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        margin: 0,
                        color: `var(--color-text-${colorName}-bold, inherit)`,
                        textTransform: 'capitalize'
                    }}>
                        {colorName}
                    </h3>
                    <p style={{ margin: 0, opacity: 0.8, fontSize: '0.875rem' }}>Farger gjør livet mer fargerikt</p>
                </div>
                <Badge color="neutral" style={{ textTransform: 'capitalize' }}>{colorName} Badge</Badge>
            </div>

            {/* Form controls vertically stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Toggle checked={true} colorName={colorName} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Toggle 1</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Toggle checked={false} colorName={colorName} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Toggle 2</span>
                </div>
            </div>

            {/* Buttons row */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <Button variant="primary" color={colorName as any}>Primary</Button>
                <Button variant="outline" color={colorName as any}>Outline</Button>
                <Button variant="ghost" color={colorName as any}>Ghost</Button>
            </div>
        </div>
    );
};

const ThemeBlock: React.FC<{ themeConfig: any, globalColors: any, isDarkMode?: boolean }> = ({ themeConfig, globalColors, isDarkMode }) => {
    const primaryColorName = themeConfig.colors.length > 0 ? themeConfig.colors[0].name.toLowerCase().replace(/\s+/g, '-') : 'neutral';
    const accentColorName = themeConfig.colors.length > 1 ? themeConfig.colors[1].name.toLowerCase().replace(/\s+/g, '-') : primaryColorName;

    return (
        <div style={{ marginBottom: '4rem' }}>
            {/* Contrast Warnings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                {themeConfig.colors.map((color: any) => {
                    const gen = generateRamp(color.seed);
                    const preferredStep = isDarkMode ? 300 : gen.closestStep;
                    const { bgStep, textHex } = getAccessibleBaseStep(gen.ramp, preferredStep);
                    const bgHex = gen.ramp[bgStep];
                    const contrast = wcagContrast(textHex, bgHex);

                    if (contrast < 4.5) {
                        return (
                            <FeedbackCard key={`warning-${color.id}`} colorName="error" isDarkMode={isDarkMode}>
                                <strong>Low Contrast ({color.name})!</strong> Primary button text ratio is only {contrast.toFixed(2)}:1. This fails WCAG AA standards.
                            </FeedbackCard>
                        );
                    } else if (contrast < 7) {
                        return (
                            <FeedbackCard key={`warning-${color.id}`} colorName="neutral" isDarkMode={isDarkMode}>
                                <strong>AA Contrast ({color.name}) ({contrast.toFixed(2)}:1).</strong> Good, but consider adjusting for AAA (7:1).
                            </FeedbackCard>
                        );
                    }
                    return null;
                })}
            </div>

            {/* Structured Card Grid based on the mockup */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                alignItems: 'start'
            }}>
                {/* Theme Colors */}
                {themeConfig.colors.map((color: any) => (
                    <ThemeComponentCard
                        key={color.id}
                        colorName={color.name.toLowerCase().replace(/\s+/g, '-')}
                        primaryColorName={primaryColorName}
                        isDarkMode={isDarkMode}
                    />
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '4rem' }}>
                {/* Section 4: Global Feedback States */}
                <section>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', borderBottom: 'var(--geometry-borderWidth-default, 1px) solid var(--color-border-subtle)', paddingBottom: '0.5rem' }}>Global Feedback States</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {globalColors.map((color: any) => (
                            <FeedbackCard key={color.id} colorName={color.name} isDarkMode={isDarkMode}>
                                <strong>{color.name}</strong>
                            </FeedbackCard>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export type ThemeMode = 'system' | 'light' | 'dark';

// Main Interior Layout (The Kitchen Sink)
const KitchenSink: React.FC<{
    isDarkMode: boolean,
    themeMode: ThemeMode,
    setThemeMode: (val: ThemeMode) => void,
    onShowOnboarding: () => void,
    isMobile: boolean,
    onMenuClick: () => void
}> = ({ isDarkMode, themeMode, setThemeMode, onShowOnboarding, isMobile, onMenuClick }) => {
    const { themes, globalColors } = useTheme();
    const [activeThemeId, setActiveThemeId] = React.useState(themes[0]?.id || '');
    const [isExportOpen, setIsExportOpen] = React.useState(false);
    const [isContrastOpen, setIsContrastOpen] = React.useState(false);
    const [isDemoOpen, setIsDemoOpen] = React.useState(false);

    // Sync active theme if deleted
    React.useEffect(() => {
        if (!themes.find(t => t.id === activeThemeId) && themes.length > 0) {
            setActiveThemeId(themes[0].id);
        }
    }, [themes, activeThemeId]);

    const activeTheme = themes.find(t => t.id === activeThemeId) || themes[0];

    const containerStyle: React.CSSProperties = {
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? '1.5rem 1rem' : '3rem',
        backgroundColor: 'var(--color-background-default, #F8F8F8)',
        color: 'var(--color-text-default, #1F1F1F)',
        transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
        width: '100%',
        boxSizing: 'border-box'
    };

    const selectStyle: React.CSSProperties = {
        padding: '0.5rem 2.5rem 0.5rem 1rem',
        fontSize: '1rem',
        borderRadius: '0px',
        border: `1px solid ${isDarkMode ? '#fff' : '#000'}`,
        backgroundColor: 'transparent',
        color: isDarkMode ? '#fff' : '#000',
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="${isDarkMode ? '%23FFF' : '%23000'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg>')`,
        backgroundRepeat: 'no-repeat',
        backgroundPositionX: 'calc(100% - 0.5rem)',
        backgroundPositionY: '50%'
    };

    return (
        <ThemeScope themeConfig={activeTheme} globalColors={globalColors} isDarkMode={isDarkMode}>
            <div style={containerStyle} className={isDarkMode ? 'dark-mode' : ''}>
                <div style={{
                    maxWidth: '1000px', // iPhone 14 width roughly
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3rem',
                    transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)'
                }}>
                    <style>{`
                    /* Basic dark mode overrides for un-tokenized elements in Kitchen Sink */
                    .dark-mode h1, .dark-mode h2, .dark-mode h3, .dark-mode h4 { color: #fff !important; }
                    .dark-mode p { color: #aaa !important; }
                    .dark-mode .palette-viz-container { background: #222 !important; box-shadow: var(--color-shadow-3) !important; color: #fff; }
                    .dark-mode .palette-viz-container h2 { border-bottom-color: #444 !important; }
                    
                    /* Theme header selection area */
                    .theme-header-controls {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    /* Utility for dynamically capitalizing headers */
                    .capitalize { text-transform: capitalize; }

                    /* Header control hover states */
                    .header-control-select {
                        transition: all 0.2s ease;
                    }
                    .header-control-select:hover {
                        border-color: ${isDarkMode ? '#C3E835' : '#0142FE'} !important;
                        color: ${isDarkMode ? '#C3E835' : '#0142FE'} !important;
                        background-image: url('data:image/svg+xml;utf8,<svg fill="none" stroke="${isDarkMode ? '%23C3E835' : '%230142FE'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg>') !important;
                    }
                    .header-control-btn {
                        transition: all 0.2s ease;
                    }
                    .header-control-btn:hover {
                        border-color: ${isDarkMode ? '#C3E835' : '#0142FE'} !important;
                        color: ${isDarkMode ? '#C3E835' : '#0142FE'} !important;
                    }
                    .header-export-btn {
                        transition: opacity 0.2s ease;
                    }
                    .header-export-btn:hover {
                        opacity: 0.9 !important;
                    }
                `}</style>

                    {/* Top Controls: Theme Selector (Left) & Dark Mode Dropdown (Right) */}
                    <div className="theme-header-controls" style={{
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        gap: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: isMobile ? '100%' : 'auto' }}>
                            {isMobile && !isDemoOpen && (
                                <button onClick={onMenuClick} style={{ background: 'transparent', border: 'none', color: isDarkMode ? '#fff' : '#000', cursor: 'pointer', padding: 0.5, display: 'flex' }}>
                                    <Menu size={28} />
                                </button>
                            )}
                            <div>
                                {themes.length > 1 ? (
                                    <select
                                        className="header-control-select"
                                        value={activeTheme?.id || ''}
                                        onChange={(e) => setActiveThemeId(e.target.value)}
                                        style={selectStyle}
                                    >
                                        {themes.map(t => (
                                            <option key={t.id} value={t.id}>{t.name || t.id} Components</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{activeTheme?.name || activeTheme?.id || 'Theme'} Components</span>
                                )}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            width: isMobile ? '100%' : 'auto'
                        }}>
                            <ThemeToggle
                                isDarkMode={isDarkMode}
                                onChange={(isDark) => setThemeMode(isDark ? 'dark' : 'light')}
                            />
                            <button
                                className="header-control-btn"
                                onClick={() => setIsContrastOpen(true)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '1rem',
                                    borderRadius: '0px',
                                    border: `1px solid ${isDarkMode ? '#fff' : '#000'}`,
                                    backgroundColor: 'transparent',
                                    color: isDarkMode ? '#fff' : '#000',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    flex: isMobile ? '1 1 auto' : 'none',
                                    justifyContent: 'center'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 0 0 20"></path></svg>
                                Contrast
                            </button>

                            <button
                                className="header-control-btn"
                                onClick={() => setIsDemoOpen(true)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '1rem',
                                    borderRadius: '0px',
                                    border: `1px solid ${isDarkMode ? '#C3E835' : '#0142FE'}`,
                                    backgroundColor: 'transparent',
                                    color: isDarkMode ? '#C3E835' : '#0142FE',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    flex: isMobile ? '1 1 auto' : 'none',
                                    justifyContent: 'center',
                                    fontWeight: 600
                                }}
                            >
                                Test Theme
                            </button>

                            <button
                                className="header-export-btn"
                                onClick={() => setIsExportOpen(true)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '1rem',
                                    borderRadius: '0px',
                                    background: isDarkMode ? '#C3E835' : '#0142FE',
                                    color: isDarkMode ? '#000' : '#fff',
                                    cursor: 'pointer',
                                    fontWeight: 400,
                                    flex: isMobile ? '1 1 100%' : 'none',
                                    textAlign: 'center'
                                }}
                            >
                                Export Theme
                            </button>
                        </div>
                    </div>

                    {isExportOpen && (
                        <ExportScreen isDarkMode={isDarkMode} onClose={() => setIsExportOpen(false)} />
                    )}

                    {isContrastOpen && (
                        <ContrastChecker isDarkMode={isDarkMode} onClose={() => setIsContrastOpen(false)} />
                    )}

                    {isDemoOpen && activeTheme && (
                        <TestThemeWebsite
                            isDarkMode={isDarkMode}
                            activeTheme={activeTheme}
                            onClose={() => setIsDemoOpen(false)}
                            onToggleTheme={() => setThemeMode(isDarkMode ? 'light' : 'dark')}
                        />
                    )}

                    {/* 1. Theme Components */}
                    {activeTheme && (
                        <ThemeBlock themeConfig={activeTheme} globalColors={globalColors} isDarkMode={isDarkMode} />
                    )}

                    {/* 2. Palette Viz */}
                    <PaletteViz isDarkMode={isDarkMode} />
                </div>
            </div>
        </ThemeScope>
    );
};

function useMediaQuery(query: string) {
    const [matches, setMatches] = React.useState(false);

    React.useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        media.addEventListener('change', listener);

        // Initial check
        listener();

        return () => {
            window.removeEventListener('resize', listener);
            media.removeEventListener('change', listener);
        };
    }, [matches, query]);

    return matches;
}

export default function App() {
    const isMobile = useMediaQuery('(max-width: 860px)');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const [themeMode, setThemeMode] = React.useState<ThemeMode>(() => {
        const stored = localStorage.getItem('systemic_theme_mode');
        return (stored === 'light' || stored === 'dark' || stored === 'system') ? (stored as ThemeMode) : 'system';
    });

    const [systemIsDark, setSystemIsDark] = React.useState(() => {
        // Fallback to light if matchMedia is unavailable (e.g. server rendering, though Vite is mostly client)
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    React.useEffect(() => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, []);

    const isDarkMode = themeMode === 'system' ? systemIsDark : themeMode === 'dark';

    const handleThemeModeChange = (mode: ThemeMode) => {
        setThemeMode(mode);
        localStorage.setItem('systemic_theme_mode', mode);
    };

    const [showOnboarding, setShowOnboarding] = React.useState(false);

    React.useEffect(() => {
        if (!localStorage.getItem('systemic_onboarding_completed')) {
            setShowOnboarding(true);
        }
    }, []);

    return (
        <ThemeProvider>
            <div style={{ display: 'flex', height: '100vh', fontFamily: '"GT America", "Arial", sans-serif', overflow: 'hidden', position: 'relative' }}>

                {/* Overlay backdrop that fades in/out */}
                {isMobile && (
                    <div
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 40,
                            backdropFilter: 'blur(4px)',
                            opacity: isMobileMenuOpen ? 1 : 0,
                            pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
                            transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    />
                )}

                {/* Full-width sidebar overlay */}
                <div style={{
                    width: isMobile ? '100vw' : '320px',
                    flexShrink: 0,
                    position: isMobile ? 'fixed' : 'relative',
                    top: 0, bottom: 0,
                    left: 0,
                    transform: isMobile ? (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
                    zIndex: 50,
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    backgroundColor: isDarkMode ? '#1a1f26' : '#ffffff',
                    height: '100vh'
                }}>
                    <ThemeControls isDarkMode={isDarkMode} isMobile={isMobile} onClose={() => setIsMobileMenuOpen(false)} />
                </div>

                <KitchenSink
                    isDarkMode={isDarkMode}
                    themeMode={themeMode}
                    setThemeMode={handleThemeModeChange}
                    onShowOnboarding={() => setShowOnboarding(true)}
                    isMobile={isMobile}
                    onMenuClick={() => setIsMobileMenuOpen(true)}
                />
                {showOnboarding && <OnboardingModal isDarkMode={isDarkMode} onClose={() => setShowOnboarding(false)} />}

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                `}</style>
            </div>
        </ThemeProvider>
    );
}
