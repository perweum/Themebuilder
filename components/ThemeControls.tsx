import React from 'react';
import { useTheme, FULL_GLOBAL_PRESET } from '../theme-context';
import { ColorPickerMenu } from './ColorPickerMenu';
import { Pencil } from 'lucide-react';

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
    isDarkMode?: boolean
}> = ({ isDarkMode = false }) => {
    const {
        themes,
        addTheme,
        updateThemeName,
        removeTheme,
        addThemeColor,
        updateThemeColor,
        removeThemeColor,
        updateThemeGeometryValue,
        globalColors,
        addRandomGlobalColor,
        updateGlobalColor,
        removeGlobalColor,
        addGlobalColorsPreset
    } = useTheme();

    const [activeTab, setActiveTab] = React.useState<'colors' | 'geometry'>('colors');

    const hasAllPresets = FULL_GLOBAL_PRESET.every(fp => globalColors.some(gc => gc.id === fp.id));

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
            width: '320px',
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
            <div style={{ marginBottom: '1rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 626.59 180" style={{ height: '40px', width: 'auto', display: 'block' }}>
                    <g>
                        <path d="M 91.8 81.6 c 4.9 6 7.3 13.6 7.3 22.8 c 0 6.6 -1.5 12.7 -4.4 18.5 c -3 5.8 -7.9 10.5 -14.8 14.3 c -6.9 3.7 -15.9 5.6 -27.1 5.6 H 0 V 3 h 48.6 c 16.7 0 28.6 3.7 35.8 11 c 7.2 7.3 10.7 16.1 10.7 26.2 c 0 7 -2 13.2 -6 18.7 c -4 5.5 -9.8 9.4 -17.4 11.6 c 8.5 1.4 15.2 5.2 20.1 11.1 Z M 18.7 18.7 v 44.9 h 29.9 c 18.6 0 28 -7.3 28 -22.1 c 0 -6.6 -2.1 -12 -6.2 -16.4 c -4.1 -4.3 -11.4 -6.5 -21.8 -6.5 h -29.9 Z m 33.1 108.3 c 10.1 0 17.4 -2.3 22 -6.9 c 4.5 -4.6 6.8 -10.4 6.8 -17.5 s -2.2 -12.6 -6.6 -16.8 c -4.4 -4.3 -11.1 -6.4 -20.2 -6.4 H 18.7 v 47.7 h 33.1 Z" fill={isDarkMode ? "#F8F8F8" : "#1F1F1F"}></path>
                        <path d="M 205.3 98.5 h -69.9 c 0.1 9.6 2.9 17.3 8.2 23.1 c 5.3 5.8 12.4 8.8 21.2 8.8 c 6.3 0 11.7 -1.6 16.1 -4.8 c 4.5 -3.2 7.8 -7.8 10.1 -13.9 l 13.8 6.1 c -3.4 8.9 -8.6 15.7 -15.7 20.4 c -7 4.7 -15.5 7 -25.5 7 c -14.2 0 -25.2 -4.4 -33.1 -13.1 c -7.9 -8.7 -11.8 -21.2 -11.8 -37.3 s 3.9 -29.5 11.8 -38.8 c 7.9 -9.3 18.8 -14 32.9 -14 s 23.7 3.8 31 11.4 c 7.3 7.6 10.9 18.7 10.9 33.3 v 11.8 Z m -16.9 -13.6 v -2.2 c 0 -8.9 -2.2 -15.8 -6.6 -20.5 c -4.4 -4.7 -10.7 -7.1 -18.8 -7.1 c -8.5 0 -15.2 2.6 -20 7.9 c -4.8 5.3 -7.3 12.5 -7.6 21.9 h 53 Z" fill={isDarkMode ? "#F8F8F8" : "#1F1F1F"}></path>
                        <path d="M 316.3 142.8 h -20.7 l -29.7 -48.3 l -17.9 18.1 v 30.1 h -16.7 V 0 h 16.7 v 92.8 l 44.1 -48.5 h 21.9 l -36 38 l 38.4 60.5 Z" fill={isDarkMode ? "#F8F8F8" : "#1F1F1F"}></path>
                        <path d="M 421.2 142.8 h -20.7 l -29.7 -48.3 l -17.9 18.1 v 30.1 h -16.7 V 0 h 16.7 v 92.8 l 44.1 -48.5 h 21.9 l -36 38 l 38.4 60.5 Z" fill={isDarkMode ? "#F8F8F8" : "#1F1F1F"}></path>
                    </g>
                </svg>
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
                        marginBottom: '-1px'
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
                        marginBottom: '-1px'
                    }}
                >
                    Geometry
                </button>
            </div>

            {activeTab === 'colors' && (
                <>
                    {/* THEMES SECTION */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div>
                            {themes.map((theme, index) => (
                                <div key={theme.id} style={styles.themeBox}>
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
                            ))}
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
                                const isCore = ['neutral', 'success', 'error'].includes(color.name.toLowerCase());
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
                                            isNameEditable={!isCore}
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
            )}

            {activeTab === 'geometry' && (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '1.5rem' }}>
                    {themes.map((theme, index) => {
                        const geometry = theme.geometry || { radiusBase: 4, includeRadius: true, includeBorders: true, borderWidth: 'small' };

                        return (
                            <div key={`geo-${theme.id}`} style={styles.themeBox}>
                                <div style={{ ...styles.sectionTitle, borderBottom: 'none', paddingBottom: 0, marginTop: 0 }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{theme.name || theme.id} Geometry</h3>
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
            )}
        </div>
    );
};
