import React, { useMemo } from 'react';
import { useTheme } from '../../theme-context';
import { COLOR_STEPS, ALPHA_STEPS } from '../../lib/palette-generator';
import { RotateCcw } from 'lucide-react';

interface SemanticTokensTabProps {
    isDarkMode: boolean;
    excludedSemanticCategories: Set<string>;
    setExcludedSemanticCategories: (s: Set<string>) => void;
    excludedSemanticTokens: Set<string>;
    setExcludedSemanticTokens: (s: Set<string>) => void;
}

export const SemanticTokensTab: React.FC<SemanticTokensTabProps> = ({
    isDarkMode,
    excludedSemanticCategories, setExcludedSemanticCategories,
    excludedSemanticTokens, setExcludedSemanticTokens
}) => {
    const { themes, globalColors, resolvedThemes, resolvedDefaultThemes, updateThemeSemanticOverride } = useTheme();
    const activeTheme = themes[0];
    const activeThemePayloadWithOptions = resolvedThemes[0];
    const defaultTheme = resolvedDefaultThemes[0];

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

    const formatPathLabel = (path: string) =>
        path.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

    const getValueByPath = (obj: any, p: string) => {
        const parts = p.split('.');
        let current = obj;
        for (const part of parts) {
            if (!current) return null;
            current = current[part];
        }
        return current?.$value || null;
    };

    const renderSelectOptions = () => (
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

    if (!activeTheme) return null;

    return (
        <>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 1fr) 1fr 1fr auto', gap: '0.75rem', padding: '1rem 0.75rem 0.5rem', borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, marginBottom: '-0.75rem', alignItems: 'end' }}>
                {['Token Name', 'Light Mode', 'Dark Mode', 'Export'].map((h, i) => (
                    <div key={h} style={{ fontSize: '0.75rem', fontWeight: 600, color: isDarkMode ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', justifySelf: i === 3 ? 'center' : undefined }}>{h}</div>
                ))}
            </div>

            {Object.entries(tokenCategories).map(([category, paths]) => (
                <div key={category}>
                    {/* Category header with include/exclude toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, paddingTop: '0.5rem', paddingBottom: '1rem', marginBottom: '0.75rem' }}>
                        <input
                            type="checkbox"
                            checked={!excludedSemanticCategories.has(category)}
                            onChange={(e) => {
                                const next = new Set(excludedSemanticCategories);
                                e.target.checked ? next.delete(category) : next.add(category);
                                setExcludedSemanticCategories(next);
                            }}
                            style={{ accentColor: isDarkMode ? '#C3E835' : '#0142FE', cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                        <h3 style={{ textTransform: 'capitalize', fontSize: '1rem', margin: 0, color: isDarkMode ? '#f8fafc' : '#0f172a', opacity: excludedSemanticCategories.has(category) ? 0.5 : 1 }}>
                            {category} Tokens
                        </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: excludedSemanticCategories.has(category) ? 0.3 : 1, pointerEvents: excludedSemanticCategories.has(category) ? 'none' : 'auto' }}>
                        {paths.map(path => {
                            const lightOverridePath = path;
                            const darkOverridePath = `darkTheme.${path}`;

                            const currentLightVal = getValueByPath(activeThemePayloadWithOptions, `theme.${path}`);
                            const currentDarkVal = getValueByPath(activeThemePayloadWithOptions, `darkTheme.${path}`);

                            let lightHex = currentLightVal;
                            if (lightHex?.startsWith('{')) lightHex = getValueByPath(activeThemePayloadWithOptions, lightHex.slice(1, -1)) || lightHex;
                            let darkHex = currentDarkVal;
                            if (darkHex?.startsWith('{')) darkHex = getValueByPath(activeThemePayloadWithOptions, darkHex.slice(1, -1)) || darkHex;

                            const isLightOverridden = !!activeTheme.semanticOverrides?.[lightOverridePath];
                            const isDarkOverridden = !!activeTheme.semanticOverrides?.[darkOverridePath];

                            const selectStyle = (overridden: boolean): React.CSSProperties => ({
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '4px',
                                border: `1px solid ${overridden ? '#3b82f6' : (isDarkMode ? '#334155' : '#e2e8f0')}`,
                                background: isDarkMode ? '#0f172a' : '#fff',
                                color: 'inherit',
                                fontSize: '0.875rem'
                            });

                            const revertBtn: React.CSSProperties = { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' };

                            return (
                                <div key={path} style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 1fr) 1fr 1fr auto', gap: '0.75rem', padding: '0.75rem', background: isDarkMode ? '#1e293b' : '#f8fafc', borderRadius: '6px', alignItems: 'center', opacity: excludedSemanticTokens.has(path) ? 0.3 : 1 }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatPathLabel(path)}</div>
                                        <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>{path}</div>
                                    </div>

                                    {/* Light */}
                                    <div style={{ position: 'relative', display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: lightHex || 'transparent', border: '1px solid #ccc', flexShrink: 0 }} />
                                        <select value={isLightOverridden ? activeTheme.semanticOverrides![lightOverridePath] : (currentLightVal || '')} onChange={(e) => updateThemeSemanticOverride(activeTheme.id, lightOverridePath, e.target.value)} style={selectStyle(isLightOverridden)}>
                                            {!isLightOverridden && <option value={currentLightVal || ''}>Auto ({currentLightVal?.replace(/[{}]/g, '').replace('color.', '').replace('darkTheme.', '')})</option>}
                                            {renderSelectOptions()}
                                        </select>
                                        {isLightOverridden && <button onClick={() => updateThemeSemanticOverride(activeTheme.id, lightOverridePath, undefined)} style={revertBtn} title="Revert to Default"><RotateCcw size={16} /></button>}
                                    </div>

                                    {/* Dark */}
                                    <div style={{ position: 'relative', display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: darkHex || 'transparent', border: '1px solid #ccc', flexShrink: 0 }} />
                                        <select value={isDarkOverridden ? activeTheme.semanticOverrides![darkOverridePath] : (currentDarkVal || '')} onChange={(e) => updateThemeSemanticOverride(activeTheme.id, darkOverridePath, e.target.value)} style={selectStyle(isDarkOverridden)}>
                                            {!isDarkOverridden && <option value={currentDarkVal || ''}>Auto ({currentDarkVal?.replace(/[{}]/g, '').replace('color.', '').replace('darkTheme.', '')})</option>}
                                            {renderSelectOptions()}
                                        </select>
                                        {isDarkOverridden && <button onClick={() => updateThemeSemanticOverride(activeTheme.id, darkOverridePath, undefined)} style={revertBtn} title="Revert to Default"><RotateCcw size={16} /></button>}
                                    </div>

                                    <input
                                        type="checkbox"
                                        checked={!excludedSemanticTokens.has(path)}
                                        onChange={(e) => {
                                            const next = new Set(excludedSemanticTokens);
                                            e.target.checked ? next.delete(path) : next.add(path);
                                            setExcludedSemanticTokens(next);
                                        }}
                                        style={{ accentColor: isDarkMode ? '#C3E835' : '#0142FE', cursor: 'pointer', width: '16px', height: '16px', alignSelf: 'center' }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </>
    );
};
