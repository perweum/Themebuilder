import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../theme-context';
import { X, Download, RotateCcw } from 'lucide-react';
import { COLOR_STEPS, ALPHA_STEPS, generateRamp } from '../lib/palette-generator';
import { mapTheme } from '../lib/theme-mapper';
import { SystemicModal } from './SystemicModal';

const semanticRoles = [
    { label: 'Background', basePath: 'background' },
    { label: 'Surface Rest', basePath: 'surface', subPath: 'rest' },
    { label: 'Surface Hover', basePath: 'surface', subPath: 'hover' },
    { label: 'Surface Press', basePath: 'surface', subPath: 'press' },
    { label: 'Interactive Rest', basePath: 'interactive', subPath: 'rest' },
    { label: 'Interactive Hover', basePath: 'interactive', subPath: 'hover' },
    { label: 'Interactive Press', basePath: 'interactive', subPath: 'press' },
    { label: 'Text Default', basePath: 'text', subPath: 'default' },
    { label: 'Text onSurface', basePath: 'text', subPath: 'onSurface' },
    { label: 'Text onInteractive', basePath: 'text', subPath: 'onInteractive' },
];

export const ExportScreen: React.FC<{
    isDarkMode: boolean;
    onClose: () => void;
}> = ({ isDarkMode, onClose }) => {
    const { themes, globalColors, updateThemeSemanticOverride, resolvedThemes, resolvedDefaultThemes } = useTheme();
    // Assuming we export the first theme or have a selector. Keep simple: export active theme (first one).
    const activeTheme = themes[0];
    const activeThemePayloadWithOptions = resolvedThemes[0];
    const defaultTheme = resolvedDefaultThemes[0];

    const [expandedColor, setExpandedColor] = useState<string | null>(
        activeTheme?.colors[0]?.name.toLowerCase().replace(/\s+/g, '-') || null
    );

    const [exportFormat, setExportFormat] = useState<'figma' | 'json'>('json');
    const [activeTab, setActiveTab] = useState<'semantic' | 'primitive' | 'geometry'>('semantic');

    const parseSetFromStorage = (key: string) => {
        try {
            const saved = localStorage.getItem(key);
            if (saved) return new Set<string>(JSON.parse(saved));
        } catch (e) { }
        return new Set<string>();
    };

    const [excludedPalettes, setExcludedPalettes] = useState<Set<string>>(() => parseSetFromStorage('sys_ex_palettes'));
    const [excludedSemanticCategories, setExcludedSemanticCategories] = useState<Set<string>>(() => parseSetFromStorage('sys_ex_sem_cats'));
    const [excludedSemanticTokens, setExcludedSemanticTokens] = useState<Set<string>>(() => parseSetFromStorage('sys_ex_sem_toks'));
    const [excludedGeometry, setExcludedGeometry] = useState<Set<string>>(() => parseSetFromStorage('sys_ex_geo'));

    useEffect(() => { localStorage.setItem('sys_ex_palettes', JSON.stringify([...excludedPalettes])); }, [excludedPalettes]);
    useEffect(() => { localStorage.setItem('sys_ex_sem_cats', JSON.stringify([...excludedSemanticCategories])); }, [excludedSemanticCategories]);
    useEffect(() => { localStorage.setItem('sys_ex_sem_toks', JSON.stringify([...excludedSemanticTokens])); }, [excludedSemanticTokens]);
    useEffect(() => { localStorage.setItem('sys_ex_geo', JSON.stringify([...excludedGeometry])); }, [excludedGeometry]);

    if (!activeTheme || !defaultTheme || !activeThemePayloadWithOptions) return null;

    const formatPathLabel = (path: string) => {
        return path.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    };

    const tokenCategories = useMemo(() => {
        if (!defaultTheme) return {};
        const cats: Record<string, string[]> = {};
        const flatten = (obj: any, prefix = '') => {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    if ('$value' in obj[key]) {
                        const path = prefix ? `${prefix}.${key}` : key;
                        const cat = path.split('.')[0];
                        if (!cats[cat]) cats[cat] = [];
                        cats[cat].push(path);
                    } else {
                        flatten(obj[key], prefix ? `${prefix}.${key}` : key);
                    }
                }
            }
        };
        flatten(defaultTheme.theme);
        return cats;
    }, [defaultTheme]);

    const handleExport = () => {
        // Create a deep clone to mutate for export
        const exportPayload = JSON.parse(JSON.stringify(activeThemePayloadWithOptions));

        // Strip excluded primitive palettes
        excludedPalettes.forEach(paletteName => {
            if (exportPayload.color && exportPayload.color[paletteName]) {
                delete exportPayload.color[paletteName];
            }
        });

        // Strip excluded semantic categories
        excludedSemanticCategories.forEach(category => {
            if (exportPayload.theme && exportPayload.theme[category]) {
                delete exportPayload.theme[category];
            }
            if (exportPayload.darkTheme && exportPayload.darkTheme[category]) {
                delete exportPayload.darkTheme[category];
            }
        });

        // Strip individually excluded semantic tokens
        excludedSemanticTokens.forEach(path => {
            // path can be deeply nested like "surface.green.hover"
            const parts = path.split('.');

            const deleteNested = (obj: any, pathParts: string[]) => {
                let current = obj;
                for (let i = 0; i < pathParts.length - 1; i++) {
                    if (!current[pathParts[i]]) return;
                    current = current[pathParts[i]];
                }
                if (current) delete current[pathParts[pathParts.length - 1]];
            };

            if (exportPayload.theme) deleteNested(exportPayload.theme, parts);
            if (exportPayload.darkTheme) deleteNested(exportPayload.darkTheme, parts);
        });

        // Strip excluded geometry categories
        excludedGeometry.forEach(category => {
            if (exportPayload.geometry && exportPayload.geometry[category]) {
                delete exportPayload.geometry[category];
            }
        });

        let exportData: any = {};

        if (exportFormat === 'figma') {
            exportData = {
                "Primitives": {
                    color: exportPayload.color,
                    geometry: exportPayload.geometry
                },
                "Light": { color: exportPayload.theme },
                "Dark": { color: exportPayload.darkTheme }
            };
        } else {
            exportData = exportPayload;
        }

        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const element = document.createElement('a');
        element.setAttribute("href", url);
        element.setAttribute("download", `theme-${exportFormat}.json`);
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(url);
    };

    return (
        <SystemicModal variant="centered" isDarkMode={isDarkMode} onClose={onClose} maxWidth="800px" noPadding>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header & Tabs */}
                <div style={{
                    borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                }}>
                    <div style={{
                        padding: '1.5rem 1.5rem 0 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: isDarkMode ? '#f8fafc' : '#0f172a' }}>Theme Export</h2>
                            <p style={{ margin: '0.25rem 0 1rem 0', fontSize: '0.875rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                                Review primitive colors or override specific semantic mappings before downloading.
                            </p>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: isDarkMode ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '3rem', padding: '0 1.5rem' }}>
                        <button
                            onClick={() => setActiveTab('semantic')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: activeTab === 'semantic' ? (isDarkMode ? '#C3E835' : '#0142FE') : (isDarkMode ? '#94a3b8' : '#64748b'),
                                borderBottom: activeTab === 'semantic' ? `2px solid ${isDarkMode ? '#C3E835' : '#0142FE'}` : '2px solid transparent',
                                padding: '0.75rem 0.25rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginBottom: '-1px'
                            }}
                        >
                            Semantic Tokens
                        </button>
                        <button
                            onClick={() => setActiveTab('primitive')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: activeTab === 'primitive' ? (isDarkMode ? '#C3E835' : '#0142FE') : (isDarkMode ? '#94a3b8' : '#64748b'),
                                borderBottom: activeTab === 'primitive' ? `2px solid ${isDarkMode ? '#C3E835' : '#0142FE'}` : '2px solid transparent',
                                padding: '0.75rem 0.25rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginBottom: '-1px'
                            }}
                        >
                            Primitive Tokens
                        </button>
                        <button
                            onClick={() => setActiveTab('geometry')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: activeTab === 'geometry' ? (isDarkMode ? '#C3E835' : '#0142FE') : (isDarkMode ? '#94a3b8' : '#64748b'),
                                borderBottom: activeTab === 'geometry' ? `2px solid ${isDarkMode ? '#C3E835' : '#0142FE'}` : '2px solid transparent',
                                padding: '0.75rem 0.25rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginBottom: '-1px'
                            }}
                        >
                            Geometry Tokens
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="no-scrollbar">
                    {activeTab === 'semantic' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 1fr) 1fr 1fr auto', gap: '0.75rem', padding: '1rem 0.75rem 0.5rem', borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, marginBottom: '-0.75rem', alignItems: 'end' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isDarkMode ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Token Name</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isDarkMode ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Light Mode</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isDarkMode ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dark Mode</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isDarkMode ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', justifySelf: 'center' }}>Export</div>
                        </div>
                    )}
                    {activeTab === 'semantic' && Object.entries(tokenCategories).map(([category, paths]) => (
                        <div key={category}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                                paddingTop: '0.5rem',
                                paddingBottom: '1rem',
                                marginBottom: '0.75rem',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={!excludedSemanticCategories.has(category)}
                                    onChange={(e) => {
                                        const newSet = new Set(excludedSemanticCategories);
                                        if (e.target.checked) {
                                            newSet.delete(category);
                                        } else {
                                            newSet.add(category);
                                        }
                                        setExcludedSemanticCategories(newSet);
                                    }}
                                    style={{ accentColor: isDarkMode ? '#C3E835' : '#0142FE', cursor: 'pointer', width: '16px', height: '16px' }}
                                />
                                <h3 style={{
                                    textTransform: 'capitalize',
                                    fontSize: '1rem',
                                    margin: 0,
                                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                                    opacity: excludedSemanticCategories.has(category) ? 0.5 : 1
                                }}>
                                    {category} Tokens
                                </h3>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                                opacity: excludedSemanticCategories.has(category) ? 0.3 : 1,
                                pointerEvents: excludedSemanticCategories.has(category) ? 'none' : 'auto'
                            }}>
                                {paths.map(path => {
                                    const lightValuePath = `theme.${path}`;
                                    const darkValuePath = `darkTheme.${path}`;
                                    const lightOverridePath = path;
                                    const darkOverridePath = `darkTheme.${path}`;

                                    const getValueByPath = (obj: any, p: string) => {
                                        const parts = p.split('.');
                                        let current = obj;
                                        for (const part of parts) {
                                            if (!current) return null;
                                            current = current[part];
                                        }
                                        return current?.$value || null;
                                    };

                                    const currentLightVal = getValueByPath(activeThemePayloadWithOptions, lightValuePath);
                                    const currentDarkVal = getValueByPath(activeThemePayloadWithOptions, darkValuePath);

                                    let lightHex = currentLightVal;
                                    if (lightHex?.startsWith('{')) {
                                        lightHex = getValueByPath(activeThemePayloadWithOptions, lightHex.slice(1, -1)) || lightHex;
                                    }
                                    let darkHex = currentDarkVal;
                                    if (darkHex?.startsWith('{')) {
                                        darkHex = getValueByPath(activeThemePayloadWithOptions, darkHex.slice(1, -1)) || darkHex;
                                    }

                                    const isLightOverridden = !!activeTheme.semanticOverrides?.[lightOverridePath];
                                    const isDarkOverridden = !!activeTheme.semanticOverrides?.[darkOverridePath];

                                    const renderSelectOptions = () => {
                                        return (
                                            <>
                                                {activeTheme.colors.map((c: any) => {
                                                    const cName = c.name.toLowerCase().replace(/\s+/g, '-');
                                                    return (
                                                        <optgroup label={c.name} style={{ textTransform: 'capitalize' }} key={c.id}>
                                                            {COLOR_STEPS.map((step: any) => (
                                                                <option key={`${cName}-${step}`} value={`{color.${cName}.${step}}`}>{cName}-{step}</option>
                                                            ))}
                                                        </optgroup>
                                                    );
                                                })}
                                                {globalColors.map(gc => {
                                                    const safeName = gc.name.toLowerCase().replace(/\s+/g, '-');
                                                    return (
                                                        <optgroup label={gc.name} style={{ textTransform: 'capitalize' }} key={gc.id}>
                                                            {COLOR_STEPS.map((step: any) => (
                                                                <option key={`${safeName}-${step}`} value={`{color.${safeName}.${step}}`}>{safeName}-{step}</option>
                                                            ))}
                                                        </optgroup>
                                                    );
                                                })}
                                                <optgroup label="White (Alpha)">
                                                    {ALPHA_STEPS.map((step: any) => (
                                                        <option key={`white-${step}`} value={`{color.white.${step}}`}>white-{step}%</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Black (Alpha)">
                                                    {ALPHA_STEPS.map((step: any) => (
                                                        <option key={`black-${step}`} value={`{color.black.${step}}`}>black-{step}%</option>
                                                    ))}
                                                </optgroup>
                                            </>
                                        );
                                    };

                                    return (
                                        <div key={path} style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'minmax(160px, 1fr) 1fr 1fr auto',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            background: isDarkMode ? '#1e293b' : '#f8fafc',
                                            borderRadius: '6px',
                                            border: 'none',
                                            alignItems: 'center',
                                            opacity: excludedSemanticTokens.has(path) ? 0.3 : 1
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatPathLabel(path)}</div>
                                                <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>{path}</div>
                                            </div>

                                            {/* Light Mode Picker */}
                                            <div style={{ position: 'relative', display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: lightHex || 'transparent', border: '1px solid #ccc', flexShrink: 0 }} />
                                                <select
                                                    value={isLightOverridden ? activeTheme.semanticOverrides![lightOverridePath] : (currentLightVal || '')}
                                                    onChange={(e) => updateThemeSemanticOverride(activeTheme.id, lightOverridePath, e.target.value)}
                                                    style={{
                                                        flex: 1,
                                                        width: isLightOverridden ? 'calc(100% - 28px)' : '100%',
                                                        padding: '0.5rem',
                                                        borderRadius: '4px',
                                                        border: `1px solid ${isLightOverridden ? '#3b82f6' : (isDarkMode ? '#334155' : '#e2e8f0')}`,
                                                        background: isDarkMode ? '#0f172a' : '#fff',
                                                        color: 'inherit',
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    {!isLightOverridden && (
                                                        <option value={currentLightVal || ''}>
                                                            Auto ({currentLightVal?.replace(/[{}]/g, '').replace('color.', '').replace('darkTheme.', '')})
                                                        </option>
                                                    )}
                                                    {renderSelectOptions()}
                                                </select>
                                                {isLightOverridden && (
                                                    <button
                                                        onClick={() => updateThemeSemanticOverride(activeTheme.id, lightOverridePath, undefined)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            borderRadius: '4px',
                                                        }}
                                                        title="Revert to Default"
                                                    >
                                                        <RotateCcw size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Dark Mode Picker */}
                                            <div style={{ position: 'relative', display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: darkHex || 'transparent', border: '1px solid #ccc', flexShrink: 0 }} />
                                                <select
                                                    value={isDarkOverridden ? activeTheme.semanticOverrides![darkOverridePath] : (currentDarkVal || '')}
                                                    onChange={(e) => updateThemeSemanticOverride(activeTheme.id, darkOverridePath, e.target.value)}
                                                    style={{
                                                        flex: 1,
                                                        width: isDarkOverridden ? 'calc(100% - 28px)' : '100%',
                                                        padding: '0.5rem',
                                                        borderRadius: '4px',
                                                        border: `1px solid ${isDarkOverridden ? '#3b82f6' : (isDarkMode ? '#334155' : '#e2e8f0')}`,
                                                        background: isDarkMode ? '#0f172a' : '#fff',
                                                        color: 'inherit',
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    {!isDarkOverridden && (
                                                        <option value={currentDarkVal || ''}>
                                                            Auto ({currentDarkVal?.replace(/[{}]/g, '').replace('color.', '').replace('darkTheme.', '')})
                                                        </option>
                                                    )}
                                                    {renderSelectOptions()}
                                                </select>
                                                {isDarkOverridden && (
                                                    <button
                                                        onClick={() => updateThemeSemanticOverride(activeTheme.id, darkOverridePath, undefined)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            borderRadius: '4px',
                                                        }}
                                                        title="Revert to Default"
                                                    >
                                                        <RotateCcw size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={!excludedSemanticTokens.has(path)}
                                                onChange={(e) => {
                                                    const newSet = new Set(excludedSemanticTokens);
                                                    if (e.target.checked) {
                                                        newSet.delete(path);
                                                    } else {
                                                        newSet.add(path);
                                                    }
                                                    setExcludedSemanticTokens(newSet);
                                                }}
                                                style={{ accentColor: isDarkMode ? '#C3E835' : '#0142FE', cursor: 'pointer', width: '16px', height: '16px', alignSelf: 'center' }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {activeTab === 'primitive' && (() => {
                        const colors = activeThemePayloadWithOptions.color;
                        const themeNames = activeTheme.colors.map((c: any) => c.name.toLowerCase().replace(/\s+/g, '-'));
                        const globalNames = globalColors.map((c: any) => c.name.toLowerCase().replace(/\s+/g, '-'));

                        // Build ordered array
                        const orderedPalettes: { name: string, steps: any, label: string }[] = [];
                        const seen = new Set<string>();

                        // 1. Theme palettes
                        themeNames.forEach((name: string) => {
                            if (colors[name] && !seen.has(name)) {
                                orderedPalettes.push({ name, steps: colors[name], label: `${name} Palette` });
                                seen.add(name);
                            }
                        });

                        // 2. Global palettes
                        globalNames.forEach((name: string) => {
                            if (colors[name] && !seen.has(name)) {
                                orderedPalettes.push({ name, steps: colors[name], label: `${name} Palette` });
                                seen.add(name);
                            }
                        });

                        // 3. White & Black
                        if (colors.white && !seen.has('white')) {
                            orderedPalettes.push({ name: 'white', steps: colors.white, label: 'White (Alpha)' });
                        }
                        if (colors.black && !seen.has('black')) {
                            orderedPalettes.push({ name: 'black', steps: colors.black, label: 'Black (Alpha)' });
                        }

                        return orderedPalettes.map(({ name, steps, label }) => (
                            <div key={name}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                                    paddingBottom: '0.5rem',
                                    marginBottom: '0.75rem',
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={!excludedPalettes.has(name)}
                                        onChange={(e) => {
                                            const newSet = new Set(excludedPalettes);
                                            if (e.target.checked) {
                                                newSet.delete(name);
                                            } else {
                                                newSet.add(name);
                                            }
                                            setExcludedPalettes(newSet);
                                        }}
                                        style={{ accentColor: isDarkMode ? '#C3E835' : '#0142FE', cursor: 'pointer', width: '16px', height: '16px' }}
                                    />
                                    <h3 style={{
                                        textTransform: 'capitalize',
                                        fontSize: '1rem',
                                        margin: 0,
                                        color: isDarkMode ? '#f8fafc' : '#0f172a',
                                        opacity: excludedPalettes.has(name) ? 0.5 : 1
                                    }}>
                                        {label}
                                    </h3>
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                    gap: '0.5rem',
                                    opacity: excludedPalettes.has(name) ? 0.3 : 1,
                                    pointerEvents: excludedPalettes.has(name) ? 'none' : 'auto'
                                }}>
                                    {Object.entries(steps).map(([stepKey, valObj]: [string, any]) => (
                                        <div key={stepKey} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                            <div style={{ height: '24px', backgroundColor: valObj.$value, borderRadius: '4px', border: '1px solid #ccc' }} />
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                                                <span style={{ fontWeight: 600 }}>{stepKey}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ));
                    })()}

                    {activeTab === 'geometry' && (() => {
                        const geometry = activeThemePayloadWithOptions.geometry;
                        if (!geometry) return null;

                        const geoCategories = ['radius', 'borderWidth'];

                        return geoCategories.map((category) => {
                            if (!geometry[category]) return null;
                            const steps = geometry[category];

                            return (
                                <div key={category}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                                        paddingBottom: '0.5rem',
                                        marginBottom: '0.75rem',
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={!excludedGeometry.has(category)}
                                            onChange={(e) => {
                                                const newSet = new Set(excludedGeometry);
                                                if (e.target.checked) {
                                                    newSet.delete(category);
                                                } else {
                                                    newSet.add(category);
                                                }
                                                setExcludedGeometry(newSet);
                                            }}
                                            style={{ accentColor: isDarkMode ? '#C3E835' : '#0142FE', cursor: 'pointer', width: '16px', height: '16px' }}
                                        />
                                        <h3 style={{
                                            textTransform: 'capitalize',
                                            fontSize: '1rem',
                                            margin: 0,
                                            color: isDarkMode ? '#f8fafc' : '#0f172a',
                                            opacity: excludedGeometry.has(category) ? 0.5 : 1
                                        }}>
                                            {category === 'radius' ? 'Border Radius' : 'Border Width'}
                                        </h3>
                                    </div>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                        gap: '0.5rem',
                                        opacity: excludedGeometry.has(category) ? 0.3 : 1,
                                        pointerEvents: excludedGeometry.has(category) ? 'none' : 'auto'
                                    }}>
                                        {Object.entries(steps).map(([stepKey, valObj]: [string, any]) => {
                                            const isAlias = valObj.$value.startsWith('{');

                                            return (
                                                <div key={stepKey} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.5rem', background: isDarkMode ? '#1e293b' : '#f8fafc', borderRadius: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                                        <span style={{ fontWeight: 600 }}>{stepKey}</span>
                                                        <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>{valObj.$value}</span>
                                                    </div>
                                                    {!isAlias && category === 'radius' && (
                                                        <div style={{
                                                            height: '24px',
                                                            backgroundColor: isDarkMode ? '#334155' : '#e2e8f0',
                                                            borderRadius: valObj.$value,
                                                            border: `1px solid ${isDarkMode ? '#475569' : '#cbd5e1'}`
                                                        }} />
                                                    )}
                                                    {!isAlias && category === 'borderWidth' && (
                                                        <div style={{
                                                            height: '24px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: isDarkMode ? '#0f172a' : '#fff',
                                                        }}>
                                                            <div style={{
                                                                width: '100%',
                                                                borderTop: `${valObj.$value} solid ${isDarkMode ? '#94a3b8' : '#64748b'}`
                                                            }} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>

                {/* Footer Controls */}
                <div style={{
                    padding: '1.5rem',
                    borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: isDarkMode ? '#1e293b' : '#f8fafc'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Format:</span>
                        <select
                            value={exportFormat}
                            onChange={(e: any) => setExportFormat(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                                background: isDarkMode ? '#0f172a' : '#fff',
                                color: 'inherit'
                            }}
                        >
                            <option value="json">Clean JSON (Standard)</option>
                            <option value="figma">Figma Variables (Tokens Studio)</option>
                        </select>
                    </div>

                    <button
                        onClick={handleExport}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: isDarkMode ? '#C3E835' : '#0142FE',
                            color: isDarkMode ? '#000' : '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        <Download size={18} /> Download
                    </button>
                </div>
            </div>
        </SystemicModal>
    );
};
