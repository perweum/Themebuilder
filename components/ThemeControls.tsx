import React from 'react';
import { useTheme, FULL_GLOBAL_PRESET } from '../theme-context';
import { ColorPickerMenu } from './ColorPickerMenu';
import { Pencil, RotateCcw, ChevronDown, ChevronRight, X } from 'lucide-react';
import { COLOR_STEPS, ALPHA_STEPS, generateRamp } from '../lib/palette-generator';
import { mapTheme } from '../lib/theme-mapper';
import FontPicker from 'react-fontpicker-ts';
import 'react-fontpicker-ts/dist/index.css';

const MD3_TYPOGRAPHY_SCALE = [
    { name: 'Display Large', desktop: { size: '57px', line: '64px', tracking: '-0.25px' }, mobile: { size: '45px', line: '52px', tracking: '0px' } },
    { name: 'Display Medium', desktop: { size: '45px', line: '52px', tracking: '0px' }, mobile: { size: '36px', line: '44px', tracking: '0px' } },
    { name: 'Display Small', desktop: { size: '36px', line: '44px', tracking: '0px' }, mobile: { size: '36px', line: '44px', tracking: '0px' } },
    { name: 'Headline Large', desktop: { size: '32px', line: '40px', tracking: '0px' }, mobile: { size: '32px', line: '40px', tracking: '0px' } },
    { name: 'Headline Medium', desktop: { size: '28px', line: '36px', tracking: '0px' }, mobile: { size: '28px', line: '36px', tracking: '0px' } },
    { name: 'Headline Small', desktop: { size: '24px', line: '32px', tracking: '0px' }, mobile: { size: '24px', line: '32px', tracking: '0px' } },
    { name: 'Title Large', desktop: { size: '22px', line: '28px', tracking: '0px' }, mobile: { size: '22px', line: '28px', tracking: '0px' } },
    { name: 'Title Medium', desktop: { size: '16px', line: '24px', tracking: '0.15px', weight: 500 }, mobile: { size: '16px', line: '24px', tracking: '0.15px', weight: 500 } },
    { name: 'Title Small', desktop: { size: '14px', line: '20px', tracking: '0.1px', weight: 500 }, mobile: { size: '14px', line: '20px', tracking: '0.1px', weight: 500 } },
    { name: 'Body Large', desktop: { size: '16px', line: '24px', tracking: '0.5px' }, mobile: { size: '16px', line: '24px', tracking: '0.5px' } },
    { name: 'Body Medium', desktop: { size: '14px', line: '20px', tracking: '0.25px' }, mobile: { size: '14px', line: '20px', tracking: '0.25px' } },
    { name: 'Body Small', desktop: { size: '12px', line: '16px', tracking: '0.4px' }, mobile: { size: '12px', line: '16px', tracking: '0.4px' } },
    { name: 'Label Large', desktop: { size: '14px', line: '20px', tracking: '0.1px', weight: 500 }, mobile: { size: '14px', line: '20px', tracking: '0.1px', weight: 500 } },
    { name: 'Label Medium', desktop: { size: '12px', line: '16px', tracking: '0.5px', weight: 500 }, mobile: { size: '12px', line: '16px', tracking: '0.5px', weight: 500 } },
    { name: 'Label Small', desktop: { size: '11px', line: '16px', tracking: '0.5px', weight: 500 }, mobile: { size: '11px', line: '16px', tracking: '0.5px', weight: 500 } },
];

const ThemeNameEditor: React.FC<{ initialName: string, themeId: string, onRename: (id: string, newName: string) => void, isDarkMode: boolean }> = ({ initialName, themeId, onRename, isDarkMode }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [tempName, setTempName] = React.useState(initialName);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const submit = () => {
        setIsEditing(false);
        const finalName = tempName.trim() || themeId; // Fallback to ID if empty
        setTempName(finalName);
        if (finalName !== initialName) {
            onRename(themeId, finalName);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={submit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') submit();
                    if (e.key === 'Escape') {
                        setTempName(initialName);
                        setIsEditing(false);
                    }
                }}
                style={{
                    background: isDarkMode ? '#333' : '#fff',
                    border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
                    color: 'inherit',
                    fontSize: '1rem',
                    fontWeight: 600,
                    outline: 'none',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    width: '100%',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                }}
            />
        );
    }

    return (
        <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.25rem 0' }}
            onClick={() => setIsEditing(true)}
            title="Edit Theme Name"
        >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'inherit' }}>{initialName}</h2>
            <Pencil size={14} style={{ opacity: 0.5, color: 'inherit' }} />
        </div>
    );
};

const buttonStyle = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    fontSize: '0.875rem',
    color: 'inherit'
};



export const ThemeControls: React.FC<{
    isDarkMode?: boolean;
    isMobile?: boolean;
    onClose?: () => void;
}> = ({ isDarkMode = false, isMobile = false, onClose }) => {
    const {
        themes,
        addTheme,
        updateThemeName,
        removeTheme,
        addThemeColor,
        updateThemeColor,
        removeThemeColor,
        updateThemeGeometryValue,
        updateThemeFont,
        globalColors,
        addRandomGlobalColor,
        updateGlobalColor,
        removeGlobalColor,
        addGlobalColorsPreset,
        updateThemeSemanticOverride,
        resolvedThemes,
        resolvedDefaultThemes
    } = useTheme();

    const [activeTab, setActiveTab] = React.useState<'colors' | 'geometry' | 'semantic'>('colors');
    const [expandedSemanticCategories, setExpandedSemanticCategories] = React.useState<Record<string, boolean>>({});
    const [isPresetsExpanded, setIsPresetsExpanded] = React.useState(false);
    const [scaleMode, setScaleMode] = React.useState<'desktop' | 'mobile'>('desktop');

    const hasAllPresets = FULL_GLOBAL_PRESET.every(fp => globalColors.some(gc => gc.id === fp.id));

    const activeTheme = themes[0];
    const defaultTheme = resolvedDefaultThemes[0];
    const activeThemePayloadWithOptions = resolvedThemes[0];

    const tokenCategories = React.useMemo(() => {
        if (!defaultTheme) return {};
        const cats: Record<string, string[]> = {};
        const flatten = (obj: any, currentPath = '') => {
            for (const key in obj) {
                const newPath = currentPath ? `${currentPath}.${key}` : key;
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    if (obj[key].$value !== undefined) {
                        if (obj[key].$type === 'color') {
                            const rootCategory = newPath.split('.')[0];
                            if (!cats[rootCategory]) cats[rootCategory] = [];
                            cats[rootCategory].push(newPath);
                        }
                    } else {
                        flatten(obj[key], newPath);
                    }
                }
            }
        };
        flatten(defaultTheme.theme);
        return cats;
    }, [defaultTheme]);

    const formatPathLabel = (path: string) => {
        const parts = path.split('.');
        if (parts.length > 1) {
            return parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
        }
        return path;
    };

    const actionButtonStyle = {
        background: 'transparent',
        color: isDarkMode ? '#F8F8F8' : '#1F1F1F',
        border: `1px solid ${isDarkMode ? '#F8F8F8' : '#1F1F1F'}`,
        padding: '0.5rem',
        borderRadius: '0px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s ease',
        width: '100%'
    };

    const styles = {
        container: {
            width: isMobile ? '100%' : '320px',
            height: '100vh',
            borderRight: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
            padding: '2rem 1.5rem',
            overflowY: 'auto' as const,
            backgroundColor: isDarkMode ? '#111' : '#fff',
            color: isDarkMode ? '#F8F8F8' : '#1F1F1F',
            display: 'flex',
            flexDirection: 'column' as const,
        },
        sectionTitle: {
            fontSize: '1rem',
            fontWeight: 400,
            borderBottom: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
            paddingBottom: '0.5rem',
            marginBottom: '1rem',
            color: isDarkMode ? '#eee' : '#111',
        },
        group: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '0.5rem',
            marginBottom: '1rem',
        },
        label: {
            fontSize: '0.875rem',
            fontWeight: 600,
            color: isDarkMode ? '#C3E835' : '#0142FE',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            display: 'flex',
            justifyContent: 'space-between'
        },
        removeBtn: {
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '0.75rem',
        },
        themeBox: {
            border: 'none',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            // Will use inline override for the specific color tint
            backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb'
        }
    };

    const allExistingColors = [
        ...themes.flatMap(t => t.colors.map(c => ({ id: c.id, name: c.name, seed: c.seed, themeName: t.name || t.id }))),
        ...globalColors.map(c => ({ id: c.id, name: c.name, seed: c.seed, themeName: 'Global' }))
    ];

    return (
        <div style={styles.container} className="no-scrollbar">
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                /* CSS Reset for hover desync */
                .btn-remove { 
                    transition: color 0.2s ease;
                    color: inherit !important;
                }
                .btn-remove:hover { color: #ef4444 !important; }

                .btn-action { transition: all 0.2s ease; }
                .btn-action:hover {
                    border-color: ${isDarkMode ? '#C3E835' : '#0142FE'} !important;
                    color: ${isDarkMode ? '#C3E835' : '#0142FE'} !important;
                }
            `}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 626.59 180" style={{ height: '40px', width: 'auto', display: 'block' }}>
                    <g>
                        <path d="M 91.8 81.6 c 4.9 6 7.3 13.6 7.3 22.8 c 0 6.6 -1.5 12.7 -4.4 18.5 c -3 5.8 -7.9 10.5 -14.8 14.3 c -6.9 3.7 -15.9 5.6 -27.1 5.6 H 0 V 3 h 48.6 c 16.7 0 28.6 3.7 35.8 11 c 7.2 7.3 10.7 16.1 10.7 26.2 c 0 7 -2 13.2 -6 18.7 c -4 5.5 -9.8 9.4 -17.4 11.6 c 8.5 1.4 15.2 5.2 20.1 11.1 Z M 18.7 18.7 v 44.9 h 29.9 c 18.6 0 28 -7.3 28 -22.1 c 0 -6.6 -2.1 -12 -6.2 -16.4 c -4.1 -4.3 -11.4 -6.5 -21.8 -6.5 h -29.9 Z m 33.1 108.3 c 10.1 0 17.4 -2.3 22 -6.9 c 4.5 -4.6 6.8 -10.4 6.8 -17.5 s -2.2 -12.6 -6.6 -16.8 c -4.4 -4.3 -11.1 -6.4 -20.2 -6.4 H 18.7 v 47.7 h 33.1 Z" fill={isDarkMode ? "#F8F8F8" : "#1F1F1F"}></path>
                        <path d="M 205.3 98.5 h -69.9 c 0.1 9.6 2.9 17.3 8.2 23.1 c 5.3 5.8 12.4 8.8 21.2 8.8 c 6.3 0 11.7 -1.6 16.1 -4.8 c 4.5 -3.2 7.8 -7.8 10.1 -13.9 l 13.8 6.1 c -3.4 8.9 -8.6 15.7 -15.7 20.4 c -7 4.7 -15.5 7 -25.5 7 c -14.2 0 -25.2 -4.4 -33.1 -13.1 c -7.9 -8.7 -11.8 -21.2 -11.8 -37.3 s 3.9 -29.5 11.8 -38.8 c 7.9 -9.3 18.8 -14 32.9 -14 s 23.7 3.8 31 11.4 c 7.3 7.6 10.9 18.7 10.9 33.3 v 11.8 Z m -16.9 -13.6 v -2.2 c 0 -8.9 -2.2 -15.8 -6.6 -20.5 c -4.4 -4.7 -10.7 -7.1 -18.8 -7.1 c -8.5 0 -15.2 2.6 -20 7.9 c -4.8 5.3 -7.3 12.5 -7.6 21.9 h 53 Z" fill={isDarkMode ? "#F8F8F8" : "#1F1F1F"}></path>
                        <path d="M 316.3 142.8 h -20.7 l -29.7 -48.3 l -17.9 18.1 v 30.1 h -16.7 V 0 h 16.7 v 92.8 l 44.1 -48.5 h 21.9 l -36 38 l 38.4 60.5 Z" fill={isDarkMode ? "#F8F8F8" : "#1F1F1F"}></path>
                        <path d="M 421.2 142.8 h -20.7 l -29.7 -48.3 l -17.9 18.1 v 30.1 h -16.7 V 0 h 16.7 v 92.8 l 44.1 -48.5 h 21.9 l -36 38 l 38.4 60.5 Z" fill={isDarkMode ? "#F8F8F8" : "#1F1F1F"}></path>
                    </g>
                </svg>
                {isMobile && (
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: isDarkMode ? '#F8F8F8' : '#1F1F1F', cursor: 'pointer', padding: '0.5rem', display: 'flex' }}>
                        <X size={24} />
                    </button>
                )}
            </div>

            {/* TAB SELECTOR */}
            <div style={{
                display: 'flex',
                gap: '1.5rem',
                marginBottom: '1.5rem',
                borderBottom: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
                paddingBottom: '0'
            }}>
                <button
                    onClick={() => setActiveTab('colors')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: activeTab === 'colors' ? (isDarkMode ? '#C3E835' : '#0142FE') : (isDarkMode ? '#888' : '#666'),
                        borderBottom: activeTab === 'colors' ? `2px solid ${isDarkMode ? '#C3E835' : '#0142FE'}` : '2px solid transparent',
                        padding: '0.5rem 0.25rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                >
                    Colors
                </button>
                <button
                    onClick={() => setActiveTab('geometry')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: activeTab === 'geometry' ? (isDarkMode ? '#C3E835' : '#0142FE') : (isDarkMode ? '#888' : '#666'),
                        borderBottom: activeTab === 'geometry' ? `2px solid ${isDarkMode ? '#C3E835' : '#0142FE'}` : '2px solid transparent',
                        padding: '0.5rem 0.25rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        marginBottom: '-1px',
                        whiteSpace: isMobile ? 'normal' : 'nowrap'
                    }}
                >
                    Type & Size
                </button>
                <button
                    onClick={() => setActiveTab('semantic')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: activeTab === 'semantic' ? (isDarkMode ? '#C3E835' : '#0142FE') : (isDarkMode ? '#888' : '#666'),
                        borderBottom: activeTab === 'semantic' ? `2px solid ${isDarkMode ? '#C3E835' : '#0142FE'}` : '2px solid transparent',
                        padding: '0.5rem 0.25rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        marginBottom: '-1px'
                    }}
                >
                    Customize
                </button>
            </div>

            {activeTab === 'colors' && (
                <>
                    {/* BETA PRESETS (COLLAPSIBLE) */}
                    <div style={{ ...styles.themeBox, padding: '1rem', marginBottom: '1.5rem', marginTop: 0 }}>
                        <div
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => setIsPresetsExpanded(!isPresetsExpanded)}
                        >
                            <h3 style={{ ...styles.sectionTitle, borderBottom: 'none', paddingBottom: 0, margin: 0 }}>
                                Theme Presets
                                <span style={{ fontSize: '0.65rem', background: '#eab308', color: '#000', padding: '0.125rem 0.375rem', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '0.5rem' }}>BETA</span>
                            </h3>
                            <svg
                                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                style={{ transform: isPresetsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: isDarkMode ? '#aaa' : '#666' }}
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>

                        {isPresetsExpanded && (
                            <div style={{ marginTop: '1rem' }}>
                                <p style={{ fontSize: '0.75rem', color: isDarkMode ? '#aaa' : '#666', marginBottom: '1rem', marginTop: 0 }}>
                                    Instantly apply curated color scales to your current active theme (AAA Contrast).
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                                    {[
                                        { name: "Midnight Forest", colors: ['#143524', '#f59e0b'] }, // Darker green
                                        { name: "Corporate Blue", colors: ['#0f172a', '#1d4ed8', '#0ea5e9'] },
                                        { name: "Stripe Purple", colors: ['#312e81', '#0ea5e9'] }, // Indigo 900 for AAA
                                        { name: "Vercel Black", colors: ['#000000', '#0070f3'] },
                                        { name: "Linear Indigo", colors: ['#3730A3', '#eab308'] } // Even darker indigo
                                    ].map(preset => (
                                        <button
                                            key={preset.name}
                                            onClick={() => {
                                                // Actually, Vercel Light and Dark are just variants of the seed.
                                                // The active theme is just a collection of seeds. The "DarkMode" toggle is global.
                                                // So applying "Vercel Dark" just sets the primary seed to white (or very light gray).
                                                if (themes.length === 0) return;
                                                const themeId = themes[0].id;

                                                const newColors = preset.colors.map((seed, idx) => {
                                                    let colorName = 'brand';
                                                    if (idx === 1) colorName = 'accent';
                                                    if (idx === 2) colorName = 'support';
                                                    if (idx === 3) colorName = 'tertiary';
                                                    return { name: colorName, seed };
                                                });

                                                // Ensure the theme has exactly the right number of colors to match the preset length
                                                themes[0].colors.forEach(existingColor => {
                                                    // Remove any existing colors not covered by the preset length immediately
                                                    if (themes[0].colors.indexOf(existingColor) >= preset.colors.length) {
                                                        removeThemeColor(themeId, existingColor.id);
                                                    }
                                                });

                                                newColors.forEach((nc, idx) => {
                                                    if (idx < themes[0].colors.length) {
                                                        updateThemeColor(themeId, themes[0].colors[idx].id, nc.name, nc.seed);
                                                    } else {
                                                        // Fallback for missing slots: add them. 
                                                        // Note: addThemeColor is async relative to state, so we trigger a global add but we can't reliably name it yet without context support.
                                                        // As a workaround, we dispatch addThemeColor but user will have to name it. 
                                                        // For now this works for Corporate Blue since usually users have 2 or 3 colors already.
                                                        addThemeColor(themeId);
                                                    }
                                                });

                                                updateThemeName(themeId, preset.name);
                                            }}
                                            style={{
                                                ...actionButtonStyle,
                                                justifyContent: 'flex-start',
                                                background: isDarkMode ? '#222' : '#f0f0f0',
                                                border: '1px solid transparent',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                                                background: `linear-gradient(to bottom, ${preset.colors[0]}, ${preset.colors[1] || preset.colors[0]})`
                                            }} />
                                            <span style={{ paddingLeft: '0.5rem' }}>{preset.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* THEMES SECTION */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div>
                            {themes.map((theme, index) => {
                                // Default background
                                let bgStyle = isDarkMode ? '#1a1a1a' : '#f9fafb';
                                // If the theme has colors, use the 50 step of the first color for light mode
                                if (theme.colors.length > 0) {
                                    try {
                                        const gen = generateRamp(theme.colors[0].seed);
                                        bgStyle = isDarkMode ? '#1a1a1a' : gen.ramp[50];
                                    } catch (e) { /* ignore */ }
                                }

                                return (
                                    <div key={theme.id} style={{ ...styles.themeBox, backgroundColor: bgStyle }}>
                                        <div style={{ ...styles.sectionTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'none', paddingBottom: 0 }}>
                                            <div style={{ flex: 1, marginRight: '1rem' }}>
                                                <ThemeNameEditor
                                                    initialName={theme.name || theme.id}
                                                    themeId={theme.id}
                                                    onRename={updateThemeName}
                                                    isDarkMode={isDarkMode}
                                                />
                                            </div>
                                            {index > 0 && (
                                                <button
                                                    className="btn-remove"
                                                    onClick={() => removeTheme(theme.id)}
                                                    style={buttonStyle}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        {/* Map exactly over the N colors the user defines for the Theme */}
                                        {theme.colors.map((color, cIdx) => (
                                            <div key={color.id} style={styles.group}>
                                                <label style={styles.label}>
                                                    {color.name} Color
                                                    {theme.colors.length > 1 && (
                                                        <button
                                                            className="btn-remove"
                                                            onClick={() => removeThemeColor(theme.id, color.id)}
                                                            style={{ ...buttonStyle, padding: '0 0.25rem' }}
                                                            title="Remove Color"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </label>

                                                <ColorPickerMenu
                                                    name={color.name}
                                                    seed={color.seed}
                                                    isDarkMode={isDarkMode}
                                                    existingColors={allExistingColors}
                                                    onUpdate={(newName, newSeed) => {
                                                        updateThemeColor(theme.id, color.id, newName, newSeed);
                                                    }}
                                                />
                                            </div>
                                        ))}

                                        <button
                                            className="btn-action"
                                            onClick={() => addThemeColor(theme.id)}
                                            style={{ ...actionButtonStyle, marginTop: '0.5rem' }}
                                        >
                                            + Add theme color
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: `1px solid ${isDarkMode ? '#fff' : '#000'}`, marginBottom: '1.5rem' }}>
                            <button
                                className="btn-action"
                                onClick={addTheme}
                                style={actionButtonStyle}
                            >
                                + Add New Theme
                            </button>
                        </div>

                    </div>

                    {/* GLOBAL PRESETS */}
                    <div>
                        <div style={styles.themeBox}>
                            <h3 style={{ ...styles.sectionTitle, borderBottom: 'none', paddingBottom: 0, marginTop: 0 }}>Global Action States</h3>

                            {globalColors.map(color => {
                                // Lock names like 'neutral', 'success', 'error' because mapTheme structurally requires them
                                const isCore = ['neutral', 'success', 'error'].includes(color.id.toLowerCase());
                                return (
                                    <div key={color.id} style={styles.group}>
                                        <label style={styles.label}>
                                            {color.name}
                                            {!isCore && (
                                                <button
                                                    className="btn-remove"
                                                    onClick={() => removeGlobalColor(color.id)}
                                                    style={buttonStyle}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </label>

                                        <ColorPickerMenu
                                            name={color.name}
                                            seed={color.seed}
                                            isDarkMode={isDarkMode}
                                            existingColors={allExistingColors}
                                            onUpdate={(newName, newSeed) => {
                                                updateGlobalColor(color.id, newName, newSeed);
                                            }}
                                        />
                                    </div>
                                );
                            })}

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button
                                    className="btn-action"
                                    onClick={addRandomGlobalColor}
                                    style={{ ...actionButtonStyle, flex: 1 }}
                                >
                                    + Add color
                                </button>
                                {!hasAllPresets && (
                                    <button
                                        className="btn-action"
                                        onClick={addGlobalColorsPreset}
                                        style={{ ...actionButtonStyle, flex: 2 }}
                                    >
                                        + Add standard set
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )
            }

            {
                activeTab === 'geometry' && (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '1.5rem' }}>
                        {themes.map((theme, index) => {
                            const geometry = theme.geometry || { radiusBase: 4, includeRadius: true, includeBorders: true, borderWidth: 'small' };

                            return (
                                <div key={`geo-${theme.id}`} style={styles.themeBox}>
                                    <div style={{ ...styles.sectionTitle, borderBottom: 'none', paddingBottom: 0, marginTop: 0 }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Typography Setting</h3>
                                    </div>
                                    <div style={styles.group}>
                                        <label style={styles.label}>Global Font</label>
                                        <div style={{
                                            border: `1px solid ${isDarkMode ? '#F8F8F8' : '#1F1F1F'}`,
                                            padding: '0.25rem',
                                            background: 'transparent',
                                            color: isDarkMode ? '#F8F8F8' : '#1F1F1F'
                                        }}>
                                            <FontPicker
                                                defaultValue={theme.fontFamily || 'Inter'}
                                                value={(val) => updateThemeFont(theme.id, val)}
                                                autoLoad={true}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ ...styles.sectionTitle, borderBottom: 'none', paddingBottom: 0, marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Scale Preview</h3>
                                        <div style={{
                                            display: 'flex',
                                            background: isDarkMode ? '#2A2A2A' : '#E5E5E5',
                                            borderRadius: '999px',
                                            padding: '2px',
                                        }}>
                                            <button
                                                onClick={() => setScaleMode('desktop')}
                                                style={{
                                                    background: scaleMode === 'desktop' ? (isDarkMode ? '#F8F8F8' : '#FFFFFF') : 'transparent',
                                                    color: scaleMode === 'desktop' ? (isDarkMode ? '#000000' : '#000000') : (isDarkMode ? '#888888' : '#666666'),
                                                    border: 'none',
                                                    borderRadius: '999px',
                                                    padding: '4px 12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    boxShadow: scaleMode === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                                }}
                                            >
                                                Desktop
                                            </button>
                                            <button
                                                onClick={() => setScaleMode('mobile')}
                                                style={{
                                                    background: scaleMode === 'mobile' ? (isDarkMode ? '#F8F8F8' : '#FFFFFF') : 'transparent',
                                                    color: scaleMode === 'mobile' ? (isDarkMode ? '#000000' : '#000000') : (isDarkMode ? '#888888' : '#666666'),
                                                    border: 'none',
                                                    borderRadius: '999px',
                                                    padding: '4px 12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    boxShadow: scaleMode === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                                }}
                                            >
                                                Mobile
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1rem',
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                        overflowX: 'hidden',
                                        paddingRight: '0.5rem',
                                        background: isDarkMode ? '#1E1E1E' : '#F5F5F5',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: `1px solid ${isDarkMode ? '#333' : '#E5E5E5'}`
                                    }}>
                                        {MD3_TYPOGRAPHY_SCALE.map((item) => {
                                            const specs = item[scaleMode];
                                            return (
                                                <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isDarkMode ? '#888' : '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.name}</span>
                                                        <span style={{ fontSize: '0.75rem', color: isDarkMode ? '#666' : '#888' }}>{specs.size} / {specs.line}</span>
                                                    </div>
                                                    <div style={{
                                                        fontFamily: theme.fontFamily ? `"${theme.fontFamily}", sans-serif` : 'var(--theme-font-family)',
                                                        fontSize: specs.size,
                                                        lineHeight: specs.line,
                                                        fontWeight: specs.weight || 400,
                                                        letterSpacing: specs.tracking,
                                                        color: isDarkMode ? '#F8F8F8' : '#1F1F1F',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        Almost before we knew it
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div style={{ ...styles.sectionTitle, borderBottom: 'none', paddingBottom: 0, marginTop: '2rem' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Geometry</h3>
                                    </div>

                                    <div style={styles.group}>
                                        <label style={{ ...styles.label, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.25rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={geometry.includeRadius}
                                                onChange={(e) => updateThemeGeometryValue(theme.id, 'includeRadius', e.target.checked)}
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    accentColor: isDarkMode ? '#C3E835' : '#0142FE',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                            <span style={{ textTransform: 'uppercase' }}>Include Border Radius</span>
                                        </label>
                                        <label style={{ ...styles.label, marginTop: '0.5rem', opacity: geometry.includeRadius ? 1 : 0.5 }}>Radius Base Scale (px)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="64"
                                            value={geometry.radiusBase}
                                            disabled={!geometry.includeRadius}
                                            onChange={(e) => updateThemeGeometryValue(theme.id, 'radiusBase', Number(e.target.value))}
                                            style={{
                                                ...actionButtonStyle,
                                                justifyContent: 'flex-start',
                                                padding: '0.5rem',
                                                display: 'block',
                                                width: '100%',
                                                boxSizing: 'border-box',
                                                opacity: geometry.includeRadius ? 1 : 0.5,
                                                cursor: geometry.includeRadius ? 'auto' : 'not-allowed'
                                            }}
                                        />
                                    </div>

                                    <div style={{ ...styles.group, marginTop: '1.5rem' }}>
                                        <label style={{ ...styles.label, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={geometry.includeBorders}
                                                onChange={(e) => updateThemeGeometryValue(theme.id, 'includeBorders', e.target.checked)}
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    accentColor: isDarkMode ? '#C3E835' : '#0142FE',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                            <span style={{ textTransform: 'uppercase' }}>Include Borders</span>
                                        </label>
                                    </div>

                                    {geometry.includeBorders && (
                                        <div style={styles.group}>
                                            <label style={styles.label}>Border Width</label>
                                            <select
                                                value={geometry.borderWidth}
                                                onChange={(e) => updateThemeGeometryValue(theme.id, 'borderWidth', e.target.value as 'small' | 'medium' | 'large')}
                                                style={{
                                                    ...actionButtonStyle,
                                                    justifyContent: 'flex-start',
                                                    padding: '0.5rem',
                                                    appearance: 'auto'
                                                }}
                                            >
                                                <option value="small">Small (1px)</option>
                                                <option value="medium">Medium (2px)</option>
                                                <option value="large">Large (3px)</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )
            }
            {
                activeTab === 'semantic' && (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
                        {Object.entries(tokenCategories).map(([category, paths]) => (
                            <div key={category} style={{
                                background: isDarkMode ? 'var(--color-surface-default, #1a1a1a)' : '#f8fafc',
                                borderRadius: '12px',
                                padding: '1rem 0.5rem',
                            }}>
                                <div
                                    style={{ ...styles.sectionTitle, borderBottom: 'none', paddingBottom: 0, marginTop: 0, marginBottom: 0, display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}
                                    onClick={() => setExpandedSemanticCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16   px', height: '16px' }}>
                                        {expandedSemanticCategories[category] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{category} Tokens</h3>
                                </div>

                                {expandedSemanticCategories[category] && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        {paths.map(path => {
                                            // "category.item" e.g., "background.default"
                                            const isLightOverridden = activeTheme.semanticOverrides?.[path] !== undefined;
                                            const darkPath = `darkTheme.${path}`;
                                            const isDarkOverridden = activeTheme.semanticOverrides?.[darkPath] !== undefined;

                                            const currentLightVal = isLightOverridden ? activeTheme.semanticOverrides![path] : null;
                                            const currentDarkVal = isDarkOverridden ? activeTheme.semanticOverrides![darkPath] : null;

                                            const getHexVal = (valStr: string | null) => {
                                                if (!valStr) return null;
                                                const clean = valStr.replace(/[{}]/g, '').replace('color.', '');
                                                const [palette, step] = clean.split('.');
                                                return activeThemePayloadWithOptions?.color?.[palette]?.[step]?.$value || null;
                                            };

                                            const getDefValStr = (obj: any, defPath: string) => {
                                                let current = obj;
                                                const pathParts = defPath.split('.');
                                                for (const p of pathParts) {
                                                    if (current && current[p] !== undefined) current = current[p];
                                                    else return null;
                                                }
                                                return current?.$value || null;
                                            };

                                            const calculatedLightVal = currentLightVal || getDefValStr(defaultTheme?.theme || {}, path);
                                            const calculatedDarkVal = currentDarkVal || getDefValStr(defaultTheme?.darkTheme || defaultTheme?.theme || {}, path);

                                            const lightHex = getHexVal(calculatedLightVal);
                                            const darkHex = getHexVal(calculatedDarkVal);

                                            const renderSelectOptions = () => {
                                                if (!activeThemePayloadWithOptions) return null;
                                                const exportedPalettes = Object.keys(activeThemePayloadWithOptions.color);

                                                return (
                                                    <>
                                                        {exportedPalettes.map(paletteName => {
                                                            const isAlpha = paletteName === 'white' || paletteName === 'black';
                                                            const steps = isAlpha ? ALPHA_STEPS : COLOR_STEPS;
                                                            const labelSuffix = isAlpha ? ' (Alpha)' : ' Palette';
                                                            const formattedName = paletteName.charAt(0).toUpperCase() + paletteName.slice(1);

                                                            return (
                                                                <optgroup key={paletteName} label={`${formattedName}${labelSuffix}`}>
                                                                    {steps.map((step: any) => (
                                                                        <option key={`${paletteName}-${step}`} value={`{color.${paletteName}.${step}}`}>
                                                                            {paletteName}-{step}{isAlpha ? '%' : ''}
                                                                        </option>
                                                                    ))}
                                                                </optgroup>
                                                            );
                                                        })}
                                                    </>
                                                );
                                            };

                                            return (
                                                <div key={path} style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.25rem',
                                                    padding: '0.5rem',
                                                    background: isDarkMode ? '#222' : '#f8fafc',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${isDarkMode ? '#333' : '#e2e8f0'}`,
                                                }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatPathLabel(path)}</div>
                                                    <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: '0.5rem' }}>{path}</div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                                                        {/* Light Mode Picker */}
                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', position: 'relative' }}>
                                                            <span style={{ fontSize: '0.75rem', width: '40px' }}>Light</span>
                                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: lightHex || 'transparent', border: `1px solid ${isDarkMode ? '#444' : '#ccc'}`, flexShrink: 0 }} />
                                                            <select
                                                                value={calculatedLightVal || ''}
                                                                onChange={(e) => updateThemeSemanticOverride(activeTheme.id, path, e.target.value)}
                                                                style={{
                                                                    flex: 1,
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: '4px',
                                                                    border: `1px solid ${isLightOverridden ? '#3b82f6' : (isDarkMode ? '#444' : '#ccc')}`,
                                                                    background: isDarkMode ? '#111' : '#fff',
                                                                    color: 'inherit',
                                                                    fontSize: '0.75rem',
                                                                    width: '100%',
                                                                    appearance: 'auto'
                                                                }}
                                                            >
                                                                {!isLightOverridden && (
                                                                    <option value={calculatedLightVal || ''}>
                                                                        Auto ({calculatedLightVal?.replace(/[{}]/g, '').replace('color.', '').replace('darkTheme.', '')})
                                                                    </option>
                                                                )}
                                                                {renderSelectOptions()}
                                                            </select>
                                                            {isLightOverridden && (
                                                                <button onClick={() => updateThemeSemanticOverride(activeTheme.id, path, undefined)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }} title="Revert to Default">
                                                                    <RotateCcw size={14} />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Dark Mode Picker */}
                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', position: 'relative' }}>
                                                            <span style={{ fontSize: '0.75rem', width: '40px' }}>Dark</span>
                                                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: darkHex || 'transparent', border: `1px solid ${isDarkMode ? '#444' : '#ccc'}`, flexShrink: 0 }} />
                                                            <select
                                                                value={calculatedDarkVal || ''}
                                                                onChange={(e) => updateThemeSemanticOverride(activeTheme.id, darkPath, e.target.value)}
                                                                style={{
                                                                    flex: 1,
                                                                    padding: '0.25rem 0.5rem',
                                                                    borderRadius: '4px',
                                                                    border: `1px solid ${isDarkOverridden ? '#3b82f6' : (isDarkMode ? '#444' : '#ccc')}`,
                                                                    background: isDarkMode ? '#111' : '#fff',
                                                                    color: 'inherit',
                                                                    fontSize: '0.75rem',
                                                                    width: '100%',
                                                                    appearance: 'auto'
                                                                }}
                                                            >
                                                                {!isDarkOverridden && (
                                                                    <option value={calculatedDarkVal || ''}>
                                                                        Auto ({calculatedDarkVal?.replace(/[{}]/g, '').replace('color.', '').replace('darkTheme.', '')})
                                                                    </option>
                                                                )}
                                                                {renderSelectOptions()}
                                                            </select>
                                                            {isDarkOverridden && (
                                                                <button onClick={() => updateThemeSemanticOverride(activeTheme.id, darkPath, undefined)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }} title="Revert to Default">
                                                                    <RotateCcw size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            }
        </div >
    );
};
