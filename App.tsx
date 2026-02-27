import React from 'react';
import { ThemeProvider, useTheme, ThemeScope } from './theme-context';
import { ThemeControls } from './components/ThemeControls';
import { Button } from './components/Button';
import { PaletteViz } from './components/PaletteViz';
import { FeedbackCard } from './components/Feedback';
import { Card } from './components/Card';
import { Input, Toggle, CustomCheckbox, CustomRadio, CustomRadioGroup } from './components/Form';
import { PressableCard } from './components/PressableCard';
import { Badge } from './components/DataDisplay';
import { Select, SelectItem } from './components/Select';
import { ExportScreen } from './components/ExportScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { ContrastChecker } from './components/ContrastChecker';
import { generateRamp, getAccessibleForeground } from './lib/palette-generator';
import { wcagContrast } from 'culori';

const ThemeBlock: React.FC<{ themeConfig: any, globalColors: any, isDarkMode?: boolean }> = ({ themeConfig, globalColors, isDarkMode }) => {
    // Determine the primary color to use as a fallback for form active states
    const primaryColorName = themeConfig.colors.length > 0 ? themeConfig.colors[0].name.toLowerCase().replace(/\s+/g, '-') : 'neutral';

    return (
        <div style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {/* Contrast Warnings */}
                {themeConfig.colors.map((color: any) => {
                    const gen = generateRamp(color.seed);
                    const bgStep = isDarkMode ? 300 : gen.closestStep;
                    const bgHex = gen.ramp[bgStep];
                    const textStep = getAccessibleForeground(gen.ramp, bgHex);
                    const textHex = gen.ramp[textStep];
                    const contrast = wcagContrast(textHex, bgHex);

                    if (contrast < 4.5) {
                        return (
                            <div key={`warning-${color.id}`}>
                                <FeedbackCard colorName="error" isDarkMode={isDarkMode}>
                                    <strong>Low Contrast ({color.name})!</strong> Primary button text ratio is only {contrast.toFixed(2)}:1. This fails WCAG AA standards.
                                </FeedbackCard>
                            </div>
                        );
                    } else if (contrast < 7) {
                        return (
                            <div key={`warning-${color.id}`}>
                                <FeedbackCard colorName="neutral" isDarkMode={isDarkMode}>
                                    <strong>AA Contrast ({color.name}) ({contrast.toFixed(2)}:1).</strong> Good, but consider adjusting for AAA (7:1).
                                </FeedbackCard>
                            </div>
                        );
                    }
                    return null;
                })}

                {/* Section 1: Interactive Elements */}
                <section>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>Components</h3>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {themeConfig.colors.map((color: any) => {
                            const cName = color.name.toLowerCase().replace(/\s+/g, '-');
                            return (
                                <div key={color.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#666', textTransform: 'capitalize' }}>{color.name} Actions</h4>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <Button variant="primary" color={cName as any}>Primary</Button>
                                        <Button variant="outline" color={cName as any}>Outline</Button>
                                        <Button variant="ghost" color={cName as any}>Ghost</Button>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Static disabled row example attached to the first color */}
                        {themeConfig.colors.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#666' }}>Disabled Actions</h4>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <Button variant="primary" color={themeConfig.colors[0].name} isDisabled>Disabled</Button>
                                    <Button variant="outline" color={themeConfig.colors[0].name} isDisabled>Disabled</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Section 1.5: Form Elements */}
                <section>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>Form Elements</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap: '2rem', alignItems: 'start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <Input label="Email Address" placeholder="name@company.com" colorName={primaryColorName} />
                            <Input label="Error State" placeholder="Invalid input..." error errorMessage="Please enter a valid email." colorName={primaryColorName} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <CustomCheckbox label="I agree to the terms" value="terms" colorName={primaryColorName} />
                            <CustomCheckbox label="Receive newsletter" value="newsletter" defaultSelected colorName={primaryColorName} />
                            <div style={{ height: '1rem' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Toggle checked={true} colorName={primaryColorName} />
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-default)', fontWeight: 500 }}>Notifications On</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Toggle checked={false} colorName={primaryColorName} />
                                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-subtle)', fontWeight: 500 }}>Silent Mode</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <CustomRadioGroup label="Select an Option">
                                <CustomRadio value="1" label="Standard Option" colorName={primaryColorName} />
                                <CustomRadio value="2" label="Premium Option" colorName={primaryColorName} />
                                <CustomRadio value="3" label="Enterprise Option" colorName={primaryColorName} />
                            </CustomRadioGroup>
                        </div>
                    </div>
                </section>

                {/* Section 1.6: Data Display */}
                <section>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>Data Display</h3>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {themeConfig.colors.map((color: any) => {
                                const cName = color.name.toLowerCase().replace(/\s+/g, '-');
                                return <Badge key={color.id} color={cName as any} style={{ textTransform: 'capitalize' }}>{color.name} Badge</Badge>;
                            })}
                            <Badge color="neutral">Neutral Badge</Badge>
                        </div>
                        <div style={{ width: '1px', height: '24px', background: '#ddd' }}></div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-subtle)' }}>
                            <strong>John Doe</strong> and <strong>Alice Bob</strong>
                        </div>
                    </div>
                </section>

                {/* Section 2: Cards & Surfaces */}
                <section>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>Surfaces & Depth</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <Card title="Default Surface">
                            This card uses the default surface and subtle text colors mapped from the neutral ramp. It represents the standard elevation.
                        </Card>

                        {themeConfig.colors.map((color: any) => {
                            const cName = color.name.toLowerCase().replace(/\s+/g, '-');
                            return (
                                <Card key={color.id} variant={cName as any} title={`${color.name} Surface`} style={{ textTransform: 'capitalize' }}>
                                    A tinted surface derived from {color.name} Step 3. Text is automatically set to the {color.name} Contrast token (Step 7) for legibility.
                                </Card>
                            );
                        })}

                        {themeConfig.colors.length > 0 && (
                            <PressableCard
                                colorName={themeConfig.colors[0].name.toLowerCase().replace(/\s+/g, '-')}
                                title="Pressable Card"
                                description="Interactive Surface using hover and press state offsets derived from the primary seed color."
                            >
                                <div style={{ fontSize: '0.875rem', marginTop: '1rem', color: `var(--color-text-${primaryColorName}-default)`, opacity: 0.8 }}>Click me!</div>
                            </PressableCard>
                        )}
                    </div>
                </section>

                {/* Section 3: Global Feedback States */}
                <section>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>Global Feedback States</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {globalColors.map((color: any) => (
                            <FeedbackCard key={color.id} colorName={color.name} isDarkMode={isDarkMode}>
                                <strong>{color.name} ({color.id})</strong>
                            </FeedbackCard>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

// Main Interior Layout (The Kitchen Sink)
const KitchenSink: React.FC<{ isDarkMode: boolean, setIsDarkMode: (val: boolean) => void, onShowOnboarding: () => void }> = ({ isDarkMode, setIsDarkMode, onShowOnboarding }) => {
    const { themes, globalColors } = useTheme();
    const [activeThemeId, setActiveThemeId] = React.useState(themes[0]?.id || '');
    const [isExportOpen, setIsExportOpen] = React.useState(false);
    const [isContrastOpen, setIsContrastOpen] = React.useState(false);

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
        padding: '3rem',
        backgroundColor: 'var(--color-background-default, #F8F8F8)',
        color: 'var(--color-text-default, #1F1F1F)',
        transition: 'background-color 0.3s ease, color 0.3s ease'
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
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    <style>{`
                    /* Basic dark mode overrides for un-tokenized elements in Kitchen Sink */
                    .dark-mode h1, .dark-mode h2, .dark-mode h3, .dark-mode h4 { color: #fff !important; }
                    .dark-mode p { color: #aaa !important; }
                    .dark-mode .palette-viz-container { background: #222 !important; box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important; color: #fff; }
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
                    <div className="theme-header-controls">
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
                                <span style={{ fontSize: '1.25rem' }}>{activeTheme?.name || activeTheme?.id || 'Theme'} Components</span>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <select
                                className="header-control-select"
                                value={isDarkMode ? 'dark' : 'light'}
                                onChange={(e) => setIsDarkMode(e.target.value === 'dark')}
                                style={selectStyle}
                            >
                                <option value="light">Light Mode</option>
                                <option value="dark">Dark Mode</option>
                            </select>
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
                                    gap: '0.5rem'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 0 0 20"></path></svg>
                                Contrast
                            </button>
                            <button
                                className="header-control-btn"
                                onClick={onShowOnboarding}
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
                                    gap: '0.5rem'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                                Intro
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
                                    fontWeight: 400
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

export default function App() {
    const [isDarkMode, setIsDarkMode] = React.useState(false);
    const [showOnboarding, setShowOnboarding] = React.useState(false);

    React.useEffect(() => {
        if (!localStorage.getItem('systemic_onboarding_completed')) {
            setShowOnboarding(true);
        }
    }, []);

    return (
        <ThemeProvider>
            <div style={{ display: 'flex', height: '100vh', fontFamily: '"GT America", "Arial", sans-serif' }}>
                <div style={{ width: 'auto', flexShrink: 0 }}>
                    <ThemeControls isDarkMode={isDarkMode} />
                </div>
                <KitchenSink isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} onShowOnboarding={() => setShowOnboarding(true)} />
                {showOnboarding && <OnboardingModal isDarkMode={isDarkMode} onClose={() => setShowOnboarding(false)} />}
            </div>
        </ThemeProvider>
    );
}
