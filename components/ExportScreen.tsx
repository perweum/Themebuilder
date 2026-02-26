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
    const { themes, globalColors, updateThemeSemanticOverride } = useTheme();
    // Assuming we export the first theme or have a selector. Keep simple: export active theme (first one).
    const activeTheme = themes[0];

    const [expandedColor, setExpandedColor] = useState<string | null>(
        activeTheme?.colors[0]?.name.toLowerCase().replace(/\s+/g, '-') || null
    );

    const [exportFormat, setExportFormat] = useState<'figma' | 'json'>('json');
    const [activeTab, setActiveTab] = useState<'semantic' | 'primitive'>('semantic');
    const [excludedPalettes, setExcludedPalettes] = useState<Set<string>>(new Set());

    // Generate defaults on the fly to show what they are
    const defaultTheme = useMemo(() => {
        if (!activeTheme) return null;
        const mappedColors = activeTheme.colors.map(c => ({
            name: c.name.toLowerCase().replace(/\s+/g, '-'),
            gen: generateRamp(c.seed)
        }));

        const neutralHex = globalColors.find(c => c.name.toLowerCase() === 'neutral')?.seed || '#64748b';
        const successHex = globalColors.find(c => c.name.toLowerCase() === 'success')?.seed || '#22c55e';
        const errorHex = globalColors.find(c => c.name.toLowerCase() === 'error' || c.name.toLowerCase() === 'critical')?.seed || '#ef4444';

        const neutralGen = generateRamp(neutralHex);
        const successGen = generateRamp(successHex);
        const errorGen = generateRamp(errorHex);

        // Map WITHOUT overrides to get base
        return mapTheme(mappedColors, neutralGen, successGen, errorGen);
    }, [activeTheme, globalColors]);

    const activeThemePayloadWithOptions = useMemo(() => {
        if (!activeTheme) return null;
        const mappedColors = activeTheme.colors.map(c => ({
            name: c.name.toLowerCase().replace(/\s+/g, '-'),
            gen: generateRamp(c.seed)
        }));

        const neutralHex = globalColors.find(c => c.name.toLowerCase() === 'neutral')?.seed || '#64748b';
        const successHex = globalColors.find(c => c.name.toLowerCase() === 'success')?.seed || '#22c55e';
        const errorHex = globalColors.find(c => c.name.toLowerCase() === 'error' || c.name.toLowerCase() === 'critical')?.seed || '#ef4444';

        const neutralGen = generateRamp(neutralHex);
        const successGen = generateRamp(successHex);
        const errorGen = generateRamp(errorHex);

        // Map WITH overrides to get final
        return mapTheme(mappedColors, neutralGen, successGen, errorGen, activeTheme.semanticOverrides, activeTheme.geometry);
    }, [activeTheme, globalColors]);


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

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const element = document.createElement('a');
        element.setAttribute("href", dataStr);
        element.setAttribute("download", `theme-${exportFormat}.json`);
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
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

                    <div style={{ display: 'flex', gap: '1.5rem', padding: '0 1.5rem' }}>
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
                            Semantic Tokens (Editable)
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
                            Primitive Tokens (Read-Only)
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="no-scrollbar">
                    {activeTab === 'semantic' && Object.entries(tokenCategories).map(([category, paths]) => (
                        <div key={category}>
                            <h3 style={{
                                textTransform: 'capitalize',
                                fontSize: '1.125rem',
                                borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                                paddingBottom: '0.5rem',
                                marginBottom: '1rem',
                                color: isDarkMode ? '#f8fafc' : '#0f172a'
                            }}>
                                {category} Tokens
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {paths.map(path => {
                                    const lightPath = `theme.${path}`;
                                    const darkPath = `darkTheme.${path}`;

                                    const getValueByPath = (obj: any, p: string) => {
                                        const parts = p.split('.');
                                        let current = obj;
                                        for (const part of parts) {
                                            if (!current) return null;
                                            current = current[part];
                                        }
                                        return current?.$value || null;
                                    };

                                    const currentLightVal = getValueByPath(activeThemePayloadWithOptions, lightPath);
                                    const currentDarkVal = getValueByPath(activeThemePayloadWithOptions, darkPath);

                                    let lightHex = currentLightVal;
                                    if (lightHex?.startsWith('{')) {
                                        lightHex = getValueByPath(activeThemePayloadWithOptions, lightHex.slice(1, -1)) || lightHex;
                                    }
                                    let darkHex = currentDarkVal;
                                    if (darkHex?.startsWith('{')) {
                                        darkHex = getValueByPath(activeThemePayloadWithOptions, darkHex.slice(1, -1)) || darkHex;
                                    }

                                    const isLightOverridden = !!activeTheme.semanticOverrides?.[lightPath];
                                    const isDarkOverridden = !!activeTheme.semanticOverrides?.[darkPath];

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
                                                <optgroup label="Neutral">
                                                    {COLOR_STEPS.map((step: any) => (
                                                        <option key={`neutral-${step}`} value={`{color.neutral.${step}}`}>neutral-{step}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Success">
                                                    {COLOR_STEPS.map((step: any) => (
                                                        <option key={`success-${step}`} value={`{color.success.${step}}`}>success-{step}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Error">
                                                    {COLOR_STEPS.map((step: any) => (
                                                        <option key={`error-${step}`} value={`{color.error.${step}}`}>error-{step}</option>
                                                    ))}
                                                </optgroup>
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
                                        <div key={path} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1fr 1fr', gap: '1rem', padding: '1rem', background: isDarkMode ? '#1e293b' : '#f8fafc', borderRadius: '8px', border: 'none', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatPathLabel(path)}</div>
                                                <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>{path}</div>
                                            </div>

                                            {/* Light Mode Picker */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isDarkMode ? '#94a3b8' : '#64748b' }}>Light Mode</span>
                                                    {isLightOverridden && (
                                                        <button onClick={() => updateThemeSemanticOverride(activeTheme.id, lightPath, undefined)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Revert to Default">
                                                            <RotateCcw size={12} /> <span style={{ fontSize: '0.7rem' }}>Revert</span>
                                                        </button>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: lightHex || 'transparent', border: '1px solid #ccc', flexShrink: 0 }} />
                                                    <select
                                                        value={currentLightVal || ''}
                                                        onChange={(e) => updateThemeSemanticOverride(activeTheme.id, lightPath, e.target.value)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.5rem',
                                                            borderRadius: '4px',
                                                            border: `1px solid ${isLightOverridden ? '#3b82f6' : (isDarkMode ? '#334155' : '#e2e8f0')}`,
                                                            background: isDarkMode ? '#0f172a' : '#fff',
                                                            color: 'inherit',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {renderSelectOptions()}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Dark Mode Picker */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isDarkMode ? '#94a3b8' : '#64748b' }}>Dark Mode</span>
                                                    {isDarkOverridden && (
                                                        <button onClick={() => updateThemeSemanticOverride(activeTheme.id, darkPath, undefined)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Revert to Default">
                                                            <RotateCcw size={12} /> <span style={{ fontSize: '0.7rem' }}>Revert</span>
                                                        </button>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: darkHex || 'transparent', border: '1px solid #ccc', flexShrink: 0 }} />
                                                    <select
                                                        value={currentDarkVal || ''}
                                                        onChange={(e) => updateThemeSemanticOverride(activeTheme.id, darkPath, e.target.value)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.5rem',
                                                            borderRadius: '4px',
                                                            border: `1px solid ${isDarkOverridden ? '#3b82f6' : (isDarkMode ? '#334155' : '#e2e8f0')}`,
                                                            background: isDarkMode ? '#0f172a' : '#fff',
                                                            color: 'inherit',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {renderSelectOptions()}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {activeTab === 'primitive' && (() => {
                        const colors = activeThemePayloadWithOptions.color;
                        const themeNames = activeTheme.colors.map((c: any) => c.name.toLowerCase().replace(/\s+/g, '-'));

                        // Build ordered array
                        const orderedPalettes: { name: string, steps: any, label: string }[] = [];

                        // 1. Theme palettes
                        themeNames.forEach((name: string) => {
                            if (colors[name]) {
                                orderedPalettes.push({ name, steps: colors[name], label: `${name} Palette` });
                            }
                        });

                        // 2. Neutral
                        if (colors.neutral) {
                            orderedPalettes.push({ name: 'neutral', steps: colors.neutral, label: 'Neutral Palette' });
                        }

                        // 3. Global (Success, Error)
                        if (colors.success) {
                            orderedPalettes.push({ name: 'success', steps: colors.success, label: 'Success Palette' });
                        }
                        if (colors.error) {
                            orderedPalettes.push({ name: 'error', steps: colors.error, label: 'Error Palette' });
                        }

                        // 4. White & Black
                        if (colors.white) {
                            orderedPalettes.push({ name: 'white', steps: colors.white, label: 'White (Alpha)' });
                        }
                        if (colors.black) {
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
