import React, { useState, useRef } from 'react';
import { useTheme, ThemeConfig, GlobalColorConfig } from '../theme-context';
import { SystemicModal } from './SystemicModal';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const KNOWN_GLOBAL_IDS = new Set(['neutral', 'success', 'error', 'warning', 'info', 'caution', 'critical']);
const RAMP_STEPS = new Set(['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']);

function isColorRamp(obj: any): boolean {
    if (typeof obj !== 'object' || !obj) return false;
    return Object.keys(obj).filter(k => RAMP_STEPS.has(k)).length >= 5;
}

function extractSeed(ramp: any): string | null {
    const step = ramp['500'];
    if (!step) return null;
    const val = typeof step === 'string' ? step : (step.$value ?? step.value);
    if (!val || typeof val !== 'string' || val.startsWith('{')) return null;
    return val;
}

function collectRamps(obj: any, depth = 0): Map<string, string> {
    const result = new Map<string, string>();
    if (depth > 4 || typeof obj !== 'object' || !obj) return result;
    for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith('$')) continue;
        if (isColorRamp(value)) {
            const seed = extractSeed(value as any);
            if (seed) result.set(key, seed);
        } else if (typeof value === 'object') {
            for (const [k, s] of collectRamps(value, depth + 1)) {
                if (!result.has(k)) result.set(k, s);
            }
        }
    }
    return result;
}

interface ParseResult {
    themeConfigs: ThemeConfig[];
    globalColors: GlobalColorConfig[];
    format: 'themebuilder-v1' | 'themebuilder-raw' | 'token-studio' | 'unknown';
    warnings: string[];
}

function parseJson(json: any): ParseResult {
    // Case 1: Themebuilder v1 with embedded metadata — perfect round-trip
    if (json['$themebuilder']?.version === '1.0') {
        const meta = json['$themebuilder'];
        const theme: ThemeConfig = meta.theme;
        const gcs: GlobalColorConfig[] = meta.globalColors || [];
        if (theme?.colors?.length > 0) {
            return {
                themeConfigs: [{
                    ...theme,
                    id: `imported-${Date.now()}`,
                    name: theme.name ? `${theme.name} (imported)` : 'Imported Theme'
                }],
                globalColors: gcs,
                format: 'themebuilder-v1',
                warnings: []
            };
        }
    }

    // Case 2: Token Studio format (has $themes)
    if (json['$themes']) {
        const ramps = collectRamps(json);
        const themeColors: ThemeColorConfig[] = [];
        const globalColors: GlobalColorConfig[] = [];
        let idx = 0;
        for (const [name, seed] of ramps) {
            if (name === 'white' || name === 'black') continue;
            if (KNOWN_GLOBAL_IDS.has(name)) {
                globalColors.push({ id: name, name, seed });
            } else {
                themeColors.push({ id: `c-${Date.now()}-${idx++}`, name, seed });
            }
        }
        if (themeColors.length === 0 && globalColors.length === 0) {
            return { themeConfigs: [], globalColors: [], format: 'token-studio', warnings: ['No color palettes found in this Token Studio JSON.'] };
        }
        const fallbackColor = themeColors[0] ?? { id: `c-${Date.now()}`, name: globalColors[0]?.name ?? 'primary', seed: globalColors[0]?.seed ?? '#4f46e5' };
        return {
            themeConfigs: [{
                id: `imported-${Date.now()}`,
                name: 'Imported Theme',
                colors: themeColors.length > 0 ? themeColors : [fallbackColor],
                geometry: { radiusBase: 4, includeRadius: true, includeBorders: true, borderWidth: 'small' },
                fontFamily: 'Inter'
            }],
            globalColors,
            format: 'token-studio',
            warnings: []
        };
    }

    // Case 3: Themebuilder standard JSON without metadata (has color + theme/darkTheme keys)
    if (json.color && (json.theme || json.darkTheme)) {
        const ramps = collectRamps(json.color);
        const themeColors: ThemeColorConfig[] = [];
        const globalColors: GlobalColorConfig[] = [];
        let idx = 0;
        for (const [name, seed] of ramps) {
            if (name === 'white' || name === 'black') continue;
            if (KNOWN_GLOBAL_IDS.has(name)) {
                globalColors.push({ id: name, name, seed });
            } else {
                themeColors.push({ id: `c-${Date.now()}-${idx++}`, name, seed });
            }
        }
        const warnings = themeColors.length === 0
            ? ['No theme-specific color palettes found — color seeds are approximate (extracted from ramp step 500).']
            : ['Color seeds are approximate (extracted from ramp step 500). Minor hue shifts may occur.'];
        return {
            themeConfigs: [{
                id: `imported-${Date.now()}`,
                name: 'Imported Theme',
                colors: themeColors.length > 0 ? themeColors : [{ id: `c-${Date.now()}`, name: 'primary', seed: '#4f46e5' }],
                geometry: { radiusBase: 4, includeRadius: true, includeBorders: true, borderWidth: 'small' },
                fontFamily: 'Inter'
            }],
            globalColors,
            format: 'themebuilder-raw',
            warnings
        };
    }

    return { themeConfigs: [], globalColors: [], format: 'unknown', warnings: ['Unrecognized format. Expected a Themebuilder or Token Studio JSON file.'] };
}

type ThemeColorConfig = { id: string; name: string; seed: string };

const FORMAT_LABELS: Record<string, string> = {
    'themebuilder-v1': 'Themebuilder export — full fidelity',
    'themebuilder-raw': 'Themebuilder export — approximate seeds',
    'token-studio': 'Token Studio JSON',
};

export const ImportScreen: React.FC<{ isDarkMode: boolean; onClose: () => void }> = ({ isDarkMode, onClose }) => {
    const { importThemes } = useTheme();
    const [status, setStatus] = useState<'idle' | 'parsed' | 'error'>('idle');
    const [error, setError] = useState('');
    const [parseResult, setParseResult] = useState<ParseResult | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = (file: File) => {
        if (!file.name.endsWith('.json')) {
            setError('Please upload a .json file.');
            setStatus('error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                const result = parseJson(json);
                if (result.format === 'unknown') {
                    setError(result.warnings[0] || 'Could not parse this file.');
                    setStatus('error');
                } else {
                    setParseResult(result);
                    setStatus('parsed');
                }
            } catch {
                setError('Invalid JSON — could not parse the file.');
                setStatus('error');
            }
        };
        reader.readAsText(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleImport = () => {
        if (!parseResult) return;
        importThemes(parseResult.themeConfigs, parseResult.globalColors);
        onClose();
    };

    const fg = isDarkMode ? '#f8fafc' : '#0f172a';
    const subtle = isDarkMode ? '#94a3b8' : '#64748b';
    const border = isDarkMode ? '#334155' : '#e2e8f0';
    const cardBg = isDarkMode ? '#0f172a' : '#fff';
    const chipBg = isDarkMode ? '#1e293b' : '#f1f5f9';
    const accent = isDarkMode ? '#C3E835' : '#0142FE';

    return (
        <SystemicModal variant="centered" isDarkMode={isDarkMode} onClose={onClose} maxWidth="540px" noPadding>
            <div style={{ display: 'flex', flexDirection: 'column' }}>

                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: fg }}>Import Theme</h2>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: subtle }}>
                            Load a Themebuilder or Token Studio JSON file
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: subtle, cursor: 'pointer', padding: '0.25rem' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem' }}>
                    {status !== 'parsed' ? (
                        <>
                            {/* Drop zone */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: `2px dashed ${isDragging ? accent : border}`,
                                    borderRadius: '8px',
                                    padding: '3rem 2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: isDragging ? (isDarkMode ? 'rgba(195,232,53,0.05)' : 'rgba(1,66,254,0.03)') : 'transparent',
                                    transition: 'all 0.15s'
                                }}
                            >
                                <Upload size={28} style={{ color: subtle, marginBottom: '0.75rem' }} />
                                <p style={{ margin: 0, fontWeight: 600, color: fg, fontSize: '0.9375rem' }}>Drop a JSON file here</p>
                                <p style={{ margin: '0.375rem 0 0', fontSize: '0.875rem', color: subtle }}>or click to browse</p>
                                <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
                            </div>

                            {status === 'error' && (
                                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: isDarkMode ? 'rgba(239,68,68,0.15)' : '#fee2e2', borderRadius: '6px', color: isDarkMode ? '#fca5a5' : '#b91c1c', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                                    {error}
                                </div>
                            )}

                            <div style={{ marginTop: '1.5rem' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: subtle, margin: '0 0 0.625rem 0' }}>Supported formats</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {[
                                        { label: 'Themebuilder JSON', desc: 'Any JSON exported from this app — seeds preserved exactly' },
                                        { label: 'Token Studio / Figma Tokens', desc: 'Files from the Token Studio or Figma Tokens plugin' },
                                    ].map(item => (
                                        <div key={item.label} style={{ padding: '0.75rem 1rem', background: cardBg, border: `1px solid ${border}`, borderRadius: '6px' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: fg }}>{item.label}</div>
                                            <div style={{ fontSize: '0.8125rem', color: subtle, marginTop: '0.125rem' }}>{item.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : parseResult && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                <CheckCircle size={17} color="#22c55e" />
                                <span style={{ fontWeight: 600, color: fg }}>Parsed successfully</span>
                                <span style={{ fontSize: '0.8125rem', color: subtle }}>
                                    — {FORMAT_LABELS[parseResult.format] ?? parseResult.format}
                                </span>
                            </div>

                            {parseResult.themeConfigs.map(theme => (
                                <div key={theme.id} style={{ padding: '1rem', background: cardBg, border: `1px solid ${border}`, borderRadius: '6px', marginBottom: '0.875rem' }}>
                                    <div style={{ fontWeight: 600, color: fg, marginBottom: '0.625rem', fontSize: '0.9375rem' }}>{theme.name}</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                        {theme.colors.map(c => (
                                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.3125rem 0.625rem', background: chipBg, borderRadius: '99px', fontSize: '0.8125rem' }}>
                                                <span style={{ width: 11, height: 11, borderRadius: '50%', background: c.seed, display: 'inline-block', flexShrink: 0, border: `1px solid rgba(0,0,0,0.1)` }} />
                                                <span style={{ color: fg }}>{c.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {parseResult.globalColors.length > 0 && (
                                <div style={{ marginBottom: '0.875rem' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: subtle, margin: '0 0 0.5rem 0' }}>
                                        Global colors to merge
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                        {parseResult.globalColors.map(c => (
                                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.3125rem 0.625rem', background: chipBg, borderRadius: '99px', fontSize: '0.8125rem' }}>
                                                <span style={{ width: 11, height: 11, borderRadius: '50%', background: c.seed, display: 'inline-block', flexShrink: 0, border: `1px solid rgba(0,0,0,0.1)` }} />
                                                <span style={{ color: fg }}>{c.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {parseResult.warnings.length > 0 && (
                                <div style={{ marginBottom: '0.875rem', padding: '0.75rem 1rem', background: isDarkMode ? 'rgba(234,179,8,0.12)' : '#fef9c3', borderRadius: '6px', color: isDarkMode ? '#fbbf24' : '#92400e', fontSize: '0.8125rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                                    <div>{parseResult.warnings.join(' ')}</div>
                                </div>
                            )}

                            <button
                                onClick={() => { setStatus('idle'); setParseResult(null); setError(''); }}
                                style={{ background: 'none', border: `1px solid ${border}`, color: subtle, padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}
                            >
                                Choose a different file
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {status === 'parsed' && parseResult && (
                    <div style={{ padding: '1.25rem 1.5rem', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: isDarkMode ? '#1e293b' : '#f8fafc' }}>
                        <button onClick={onClose} style={{ background: 'none', border: `1px solid ${border}`, color: fg, padding: '0.625rem 1.25rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}>
                            Cancel
                        </button>
                        <button
                            onClick={handleImport}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem', backgroundColor: accent, color: isDarkMode ? '#000' : '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                            Import {parseResult.themeConfigs.length > 1 ? `${parseResult.themeConfigs.length} Themes` : 'Theme'}
                        </button>
                    </div>
                )}
            </div>
        </SystemicModal>
    );
};
