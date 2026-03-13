import React from 'react';
import { useTheme } from '../../theme-context';
import { COLOR_STEPS, ALPHA_STEPS } from '../../lib/palette-generator';
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';

export const SemanticTab: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
    const { themes, resolvedThemes, resolvedDefaultThemes, updateThemeSemanticOverride } = useTheme();

    const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({});

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

    const getValStr = (obj: any, path: string) => {
        let cur = obj;
        for (const part of path.split('.')) {
            if (cur && cur[part] !== undefined) cur = cur[part];
            else return null;
        }
        return cur?.$value || null;
    };

    if (!activeTheme) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
            {Object.entries(tokenCategories).map(([category, paths]) => (
                <div key={category} style={{ background: isDarkMode ? '#1a1a1a' : '#f8fafc', borderRadius: '12px', padding: '1rem 0.5rem' }}>
                    <div
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                    >
                        {expandedCategories[category] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{category} Tokens</h3>
                    </div>

                    {expandedCategories[category] && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {paths.map(path => {
                                const darkPath = `darkTheme.${path}`;
                                const isLightOverridden = activeTheme.semanticOverrides?.[path] !== undefined;
                                const isDarkOverridden = activeTheme.semanticOverrides?.[darkPath] !== undefined;

                                const lightVal = activeTheme.semanticOverrides?.[path] || getValStr(defaultTheme?.theme || {}, path);
                                const darkVal = activeTheme.semanticOverrides?.[darkPath] || getValStr(defaultTheme?.darkTheme || defaultTheme?.theme || {}, path);

                                return (
                                    <div key={path} style={{ padding: '0.5rem', background: isDarkMode ? '#222' : '#fff', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#333' : '#eee'}` }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{path.split('.').slice(1).join(' ')}</div>
                                        <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>

                                            {/* Light mode override */}
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', width: '30px' }}>L</span>
                                                <select
                                                    value={lightVal || ''}
                                                    onChange={(e) => updateThemeSemanticOverride(activeTheme.id, path, e.target.value)}
                                                    style={{ flex: 1, fontSize: '0.75rem', padding: '2px', background: isDarkMode ? '#111' : '#fff', color: 'inherit' }}
                                                >
                                                    {Object.keys(activeThemePayloadWithOptions?.color || {}).map(p => (
                                                        <optgroup key={p} label={p}>
                                                            {(p === 'white' || p === 'black' ? ALPHA_STEPS : COLOR_STEPS).map(s => (
                                                                <option key={s} value={`{color.${p}.${s}}`}>{p}-{s}</option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                                {isLightOverridden && (
                                                    <button onClick={() => updateThemeSemanticOverride(activeTheme.id, path, undefined)} style={{ background: 'none', border: 'none', color: '#ef4444' }}>
                                                        <RotateCcw size={12} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Dark mode override */}
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', width: '30px' }}>D</span>
                                                <select
                                                    value={darkVal || ''}
                                                    onChange={(e) => updateThemeSemanticOverride(activeTheme.id, darkPath, e.target.value)}
                                                    style={{ flex: 1, fontSize: '0.75rem', padding: '2px', background: isDarkMode ? '#111' : '#fff', color: 'inherit' }}
                                                >
                                                    {Object.keys(activeThemePayloadWithOptions?.color || {}).map(p => (
                                                        <optgroup key={p} label={p}>
                                                            {(p === 'white' || p === 'black' ? ALPHA_STEPS : COLOR_STEPS).map(s => (
                                                                <option key={s} value={`{color.${p}.${s}}`}>{p}-{s}</option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                                {isDarkOverridden && (
                                                    <button onClick={() => updateThemeSemanticOverride(activeTheme.id, darkPath, undefined)} style={{ background: 'none', border: 'none', color: '#ef4444' }}>
                                                        <RotateCcw size={12} />
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
    );
};
