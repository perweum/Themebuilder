import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { generateRamp } from './lib/palette-generator';
import { mapTheme, NamedColorRamp } from './lib/theme-mapper';

export type ThemeColorConfig = {
    id: string;   // e.g. 'brand-1'
    name: string; // e.g. 'brand', 'secondary', 'master'
    seed: string; // '#4f46e5'
};

export type ThemeGeometryConfig = {
    radiusBase: number;
    includeRadius: boolean;
    includeBorders: boolean;
    borderWidth: 'small' | 'medium' | 'large';
};

export type ThemeConfig = {
    id: string;
    name?: string;
    // Legacy support
    brandSeed?: string;
    accentSeed?: string;
    // New array-based dynamic support
    colors: ThemeColorConfig[];
    semanticOverrides?: Record<string, string>;
    primitiveOverrides?: Record<string, string>;
    geometry?: ThemeGeometryConfig;
};

export type GlobalColorConfig = {
    id: string;
    name: string;
    seed: string;
};

const DEFAULT_BRAND_SEED = '#014592';
const DEFAULT_ACCENT_SEED = '#ffbad9';

export const INITIAL_GLOBAL_COLORS: GlobalColorConfig[] = [
    { id: 'neutral', name: 'Neutral', seed: '#64748b' },
    { id: 'error', name: 'Error', seed: '#ef4444' },
    { id: 'success', name: 'Success', seed: '#22c55e' },
];

export const FULL_GLOBAL_PRESET: GlobalColorConfig[] = [
    ...INITIAL_GLOBAL_COLORS,
    { id: 'warning', name: 'Warning', seed: '#eab308' },
    { id: 'info', name: 'Info', seed: '#3b82f6' },
    { id: 'caution', name: 'Caution', seed: '#f97316' },
];

interface ThemeContextType {
    themes: ThemeConfig[];
    addTheme: () => void;

    // Updated robust actions targeting array indices
    updateThemeName: (themeId: string, newName: string) => void;
    updateThemeColor: (themeId: string, colorId: string, newName: string, newSeed: string) => void;
    addThemeColor: (themeId: string) => void;
    removeThemeColor: (themeId: string, colorId: string) => void;
    updateThemeSemanticOverride: (themeId: string, path: string, value: string | undefined) => void;
    updateThemePrimitiveOverride: (themeId: string, path: string, value: string | undefined) => void;
    updateThemeGeometryValue: <K extends keyof ThemeGeometryConfig>(themeId: string, key: K, value: ThemeGeometryConfig[K]) => void;

    removeTheme: (id: string) => void;

    globalColors: GlobalColorConfig[];
    addGlobalColorsPreset: () => void;
    addRandomGlobalColor: () => void;
    updateGlobalColor: (id: string, name: string, hex: string) => void;
    removeGlobalColor: (id: string) => void;

    // Memoized output themes globally mapped so UI doesn't stutter on re-renders
    resolvedThemes: import('./lib/theme-mapper').ThemeTokensPayload[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export interface ThemeScopeProps {
    themeConfig: ThemeConfig;
    globalColors: GlobalColorConfig[];
    isDarkMode?: boolean;
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export const ThemeScope: React.FC<ThemeScopeProps> = ({
    themeConfig,
    globalColors,
    isDarkMode = false,
    children,
    className,
    style
}) => {
    const scopeRef = React.useRef<HTMLDivElement>(null);
    const [warnings, setWarnings] = useState<string[]>([]);

    useEffect(() => {
        if (!scopeRef.current) return;

        try {
            // Build the dynamic array of NamedColorRamp objects to feed to the mapper
            const mappedColors: NamedColorRamp[] = themeConfig.colors.map(c => ({
                name: c.name.toLowerCase().replace(/\s+/g, '-'),
                gen: generateRamp(c.seed)
            }));

            const mappedGlobal = globalColors.map(c => ({
                name: c.name.toLowerCase().replace(/\s+/g, '-'),
                gen: generateRamp(c.seed)
            }));

            const generatedTheme = mapTheme(
                mappedColors, // Passes [brand, accent, master, etc...]
                mappedGlobal,
                themeConfig.semanticOverrides,
                themeConfig.primitiveOverrides,
                themeConfig.geometry
            );

            const resolveAlias = (val: string) => {
                if (val.startsWith('{') && val.endsWith('}')) {
                    // Turn {color.brand.500} into var(--color-brand-500)
                    return `var(--${val.slice(1, -1).replace(/\./g, '-')})`;
                }
                return val;
            };

            const setVariables = (obj: any, prefix: string) => {
                Object.entries(obj).forEach(([key, value]) => {
                    if (value && typeof value === 'object' && '$value' in value) {
                        scopeRef.current?.style.setProperty(`--${prefix}-${key}`, resolveAlias(String(value.$value)));
                    } else if (value && typeof value === 'object') {
                        setVariables(value, `${prefix}-${key}`);
                    }
                });
            };

            if (generatedTheme) {
                setVariables(generatedTheme.color, 'color');
                setVariables(isDarkMode ? generatedTheme.darkTheme : generatedTheme.theme, 'color');
                setVariables(generatedTheme.geometry, 'geometry');
            }

            // Inject the custom global colors directly into the scope
            globalColors.forEach(color => {
                const name = color.name.toLowerCase().replace(/\s+/g, '-');
                if (!['neutral', 'success', 'error'].includes(name)) {
                    const customGen = generateRamp(color.seed);
                    Object.entries(customGen.ramp).forEach(([stepStr, hex]) => {
                        scopeRef.current?.style.setProperty(`--color-global-${name}-${stepStr}`, hex as string);
                    });
                }
            });

        } catch (e) {
            console.error("Failed to generate scoped theme:", e);
        }
    }, [themeConfig, globalColors, isDarkMode]);

    return (
        <div ref={scopeRef} className={className} style={{ display: 'contents', ...style }}>
            {warnings.length > 0 && (
                <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '1rem', marginTop: '1rem', border: '1px solid #f87171' }}>
                    {warnings.map((w, i) => (
                        <div key={i}><strong>Accessibility Alert:</strong> {w}</div>
                    ))}
                </div>
            )}
            {children}
        </div>
    );
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    // We attempt to pull from LocalStorage in a robust way to migrate old payload formats
    const loadThemes = (): ThemeConfig[] => {
        try {
            const saved = localStorage.getItem('systemic_themes');
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.map((t: any) => {
                    // Migration: If the old layout { brandSeed, accentSeed } exists, convert to new { colors: [] } array
                    if (!t.colors && (t.brandSeed || t.accentSeed)) {
                        return {
                            id: t.id,
                            colors: [
                                { id: 'brand', name: 'brand', seed: t.brandSeed || DEFAULT_BRAND_SEED },
                                { id: 'accent', name: 'accent', seed: t.accentSeed || DEFAULT_ACCENT_SEED }
                            ]
                        };
                    }
                    return t;
                });
            }
        } catch (e) {
            console.error("Failed to load themes", e);
        }
        return [{
            id: 'Theme 1',
            colors: [
                { id: 'brand', name: 'brand', seed: DEFAULT_BRAND_SEED },
                { id: 'accent', name: 'accent', seed: DEFAULT_ACCENT_SEED }
            ],
            geometry: { radiusBase: 4, includeRadius: true, includeBorders: true, borderWidth: 'small' }
        }];
    };

    const loadGlobal = (): GlobalColorConfig[] => {
        try {
            const saved = localStorage.getItem('systemic_global_colors');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to load global colors", e);
        }
        return INITIAL_GLOBAL_COLORS;
    };

    const [themes, setThemes] = useState<ThemeConfig[]>(loadThemes());
    const [globalColors, setGlobalColors] = useState<GlobalColorConfig[]>(loadGlobal());

    const pastRef = useRef<{ themes: ThemeConfig[], globalColors: GlobalColorConfig[] } | null>(null);

    const saveHistory = () => {
        pastRef.current = { themes, globalColors };
    };

    // Global Key Listener for simple one-step undo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                const target = e.target as HTMLElement;
                if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return; // Allow native undo in text inputs

                e.preventDefault();
                if (pastRef.current) {
                    setThemes(pastRef.current.themes);
                    setGlobalColors(pastRef.current.globalColors);
                    pastRef.current = null;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Save to LocalStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('systemic_themes', JSON.stringify(themes));
    }, [themes]);

    useEffect(() => {
        localStorage.setItem('systemic_global_colors', JSON.stringify(globalColors));
    }, [globalColors]);

    const addTheme = () => {
        saveHistory();
        setThemes(prev => [
            ...prev,
            {
                id: `Theme ${prev.length + 1}`,
                name: `Theme ${prev.length + 1}`,
                colors: [
                    { id: `c-${Date.now()}-1`, name: 'brand', seed: '#4f46e5' },
                    { id: `c-${Date.now()}-2`, name: 'accent', seed: '#10b981' }
                ],
                geometry: { radiusBase: 4, includeRadius: true, includeBorders: true, borderWidth: 'small' }
            }
        ]);
    };

    const updateThemeName = (themeId: string, newName: string) => {
        saveHistory();
        setThemes(prev => prev.map(t => t.id === themeId ? { ...t, name: newName } : t));
    };

    const updateThemeColor = (themeId: string, colorId: string, newName: string, newSeed: string) => {
        saveHistory();
        const safeName = newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setThemes(prev => prev.map(t => {
            if (t.id === themeId) {
                return {
                    ...t,
                    colors: t.colors.map(c => c.id === colorId ? { ...c, name: safeName, seed: newSeed } : c)
                };
            }
            return t;
        }));
    };

    const addThemeColor = (themeId: string) => {
        saveHistory();
        setThemes(prev => prev.map(t => {
            if (t.id === themeId) {
                const newId = `c-${Date.now()}`;
                return {
                    ...t,
                    colors: [...t.colors, { id: newId, name: `color-${t.colors.length + 1}`, seed: '#000000' }]
                };
            }
            return t;
        }));
    };

    const removeThemeColor = (themeId: string, colorId: string) => {
        saveHistory();
        // Prevent deleting the very last color, as the app structurally needs at least 1 color to build components against
        setThemes(prev => prev.map(t => {
            if (t.id === themeId && t.colors.length > 1) {
                return {
                    ...t,
                    colors: t.colors.filter(c => c.id !== colorId)
                };
            }
            return t;
        }));
    };

    const updateThemeSemanticOverride = (themeId: string, path: string, value: string | undefined) => {
        saveHistory();
        setThemes(prev => prev.map(t => {
            if (t.id === themeId) {
                const newOverrides = { ...(t.semanticOverrides || {}) };
                if (value === undefined) {
                    delete newOverrides[path];
                } else {
                    newOverrides[path] = value;
                }
                return { ...t, semanticOverrides: newOverrides };
            }
            return t;
        }));
    };

    const updateThemePrimitiveOverride = (themeId: string, path: string, value: string | undefined) => {
        saveHistory();
        setThemes(prev => prev.map(t => {
            if (t.id === themeId) {
                const newOverrides = { ...(t.primitiveOverrides || {}) };
                if (value === undefined) {
                    delete newOverrides[path];
                } else {
                    newOverrides[path] = value;
                }
                return { ...t, primitiveOverrides: newOverrides };
            }
            return t;
        }));
    };

    const updateThemeGeometryValue = <K extends keyof ThemeGeometryConfig>(themeId: string, key: K, value: ThemeGeometryConfig[K]) => {
        saveHistory();
        setThemes(prev => prev.map(t => {
            if (t.id === themeId) {
                return {
                    ...t,
                    geometry: {
                        ...(t.geometry || { radiusBase: 4, includeRadius: true, includeBorders: true, borderWidth: 'small' }),
                        [key]: value
                    }
                };
            }
            return t;
        }));
    };

    const removeTheme = (id: string) => {
        saveHistory();
        setThemes(prev => prev.filter(t => t.id !== id));
    };

    const addGlobalColorsPreset = () => {
        saveHistory();
        setGlobalColors(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newColors = FULL_GLOBAL_PRESET.filter(fp => !existingIds.has(fp.id));
            return [...prev, ...newColors];
        });
    };

    const addRandomGlobalColor = () => {
        saveHistory();
        const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        setGlobalColors(prev => [
            ...prev,
            { id: `custom-${Date.now()}`, name: `custom-${prev.length + 1}`, seed: randomHex }
        ]);
    };

    const updateGlobalColor = (id: string, name: string, seed: string) => {
        saveHistory();
        const safeName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setGlobalColors(prev => prev.map(c => c.id === id ? { ...c, name: safeName, seed } : c));
    };

    const removeGlobalColor = (id: string) => {
        saveHistory();
        setGlobalColors(prev => prev.filter(c => c.id !== id));
    };

    // Calculate globally to avoid components like ExportScreen running generateRamp loops on tick
    const resolvedThemes = React.useMemo(() => {
        const mappedGlobal = globalColors.map(c => ({
            name: c.name.toLowerCase().replace(/\s+/g, '-'),
            gen: generateRamp(c.seed)
        }));

        return themes.map(t => {
            const mappedColors = t.colors.map(c => ({
                name: c.name.toLowerCase().replace(/\s+/g, '-'),
                gen: generateRamp(c.seed)
            }));
            return mapTheme(mappedColors, mappedGlobal, t.semanticOverrides, t.primitiveOverrides, t.geometry);
        });
    }, [themes, globalColors]);

    const value = {
        themes,
        addTheme,
        updateThemeName,
        updateThemeColor,
        addThemeColor,
        removeThemeColor,
        updateThemeSemanticOverride,
        updateThemePrimitiveOverride,
        updateThemeGeometryValue,
        removeTheme,
        globalColors,
        addGlobalColorsPreset,
        addRandomGlobalColor,
        updateGlobalColor,
        removeGlobalColor,
        resolvedThemes
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
