import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { useTheme } from '../theme-context';
import { X, Download } from 'lucide-react';
import { SystemicModal } from './SystemicModal';
import { SemanticTokensTab } from './export/SemanticTokensTab';
import { PrimitiveTokensTab } from './export/PrimitiveTokensTab';
import { GeometryTokensTab } from './export/GeometryTokensTab';

type ExportTab = 'semantic' | 'primitive' | 'geometry';
type ExportFormat = 'tokensync' | 'figma' | 'json';

const parseSetFromStorage = (key: string): Set<string> => {
    try {
        const saved = localStorage.getItem(key);
        if (saved) return new Set<string>(JSON.parse(saved));
    } catch (e) {}
    return new Set<string>();
};

export const ExportScreen: React.FC<{
    isDarkMode: boolean;
    onClose: () => void;
}> = ({ isDarkMode, onClose }) => {
    const { themes, resolvedThemes, resolvedDefaultThemes, globalColors } = useTheme();
    const activeTheme = themes[0];
    const activeThemePayloadWithOptions = resolvedThemes[0];

    const [activeTab, setActiveTab] = useState<ExportTab>('semantic');
    const [exportFormat, setExportFormat] = useState<ExportFormat>('tokensync');

    const [excludedPalettes, setExcludedPalettes] = useState<Set<string>>(() => parseSetFromStorage('sys_ex_palettes'));
    const [excludedSemanticCategories, setExcludedSemanticCategories] = useState<Set<string>>(() => parseSetFromStorage('sys_ex_sem_cats'));
    const [excludedSemanticTokens, setExcludedSemanticTokens] = useState<Set<string>>(() => parseSetFromStorage('sys_ex_sem_toks'));
    const [excludedGeometry, setExcludedGeometry] = useState<Set<string>>(() => parseSetFromStorage('sys_ex_geo'));

    useEffect(() => { localStorage.setItem('sys_ex_palettes', JSON.stringify([...excludedPalettes])); }, [excludedPalettes]);
    useEffect(() => { localStorage.setItem('sys_ex_sem_cats', JSON.stringify([...excludedSemanticCategories])); }, [excludedSemanticCategories]);
    useEffect(() => { localStorage.setItem('sys_ex_sem_toks', JSON.stringify([...excludedSemanticTokens])); }, [excludedSemanticTokens]);
    useEffect(() => { localStorage.setItem('sys_ex_geo', JSON.stringify([...excludedGeometry])); }, [excludedGeometry]);

    if (!activeTheme || !resolvedDefaultThemes[0] || !activeThemePayloadWithOptions) return null;

    const pruneEmpty = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return obj;
        if ('$value' in obj) return obj;
        for (const key of Object.keys(obj)) {
            obj[key] = pruneEmpty(obj[key]);
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && !('$value' in obj[key]) && Object.keys(obj[key]).length === 0) {
                delete obj[key];
            }
        }
        return obj;
    };

    const handleExport = async () => {
        const exportPayload = JSON.parse(JSON.stringify(activeThemePayloadWithOptions));

        excludedPalettes.forEach(name => { delete exportPayload.color?.[name]; });
        excludedSemanticCategories.forEach(category => {
            delete exportPayload.theme?.[category];
            delete exportPayload.darkTheme?.[category];
        });
        excludedSemanticTokens.forEach(path => {
            const parts = path.split('.');
            const deleteNested = (obj: any) => {
                let current = obj;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) return;
                    current = current[parts[i]];
                }
                if (current) delete current[parts[parts.length - 1]];
            };
            if (exportPayload.theme) deleteNested(exportPayload.theme);
            if (exportPayload.darkTheme) deleteNested(exportPayload.darkTheme);
        });
        excludedGeometry.forEach(category => { delete exportPayload.geometry?.[category]; });

        pruneEmpty(exportPayload.theme);
        pruneEmpty(exportPayload.darkTheme);
        pruneEmpty(exportPayload.color);
        pruneEmpty(exportPayload.geometry);

        const json = (obj: any) => JSON.stringify(obj, null, 2);
        const download = (blob: Blob, filename: string) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };

        if (exportFormat === 'tokensync') {
            const themeName = (activeTheme as any).name
                ? (activeTheme as any).name.toLowerCase().replace(/\s+/g, '-')
                : 'original';

            const zip = new JSZip();
            zip.file('primitives/color.json',      json({ color:     exportPayload.color }));
            zip.file('primitives/geometry.json',   json({ geometry:  exportPayload.geometry }));
            zip.file('primitives/typography.json', json({ typography: exportPayload.typography }));
            zip.file(`semantic/themes/${themeName}.json`, json({
                light: exportPayload.theme,
                dark:  exportPayload.darkTheme,
            }));

            const blob = await zip.generateAsync({ type: 'blob' });
            download(blob, `tokens-${themeName}.zip`);
        } else if (exportFormat === 'figma') {
            const exportData = {
                "Primitives": { color: exportPayload.color, geometry: exportPayload.geometry },
                "Light": { color: exportPayload.theme },
                "Dark": { color: exportPayload.darkTheme },
                "$themes": [
                    {
                        "id": "light",
                        "name": "Light",
                        "selectedTokenSets": { "Primitives": "source", "Light": "enabled", "Dark": "disabled" }
                    },
                    {
                        "id": "dark",
                        "name": "Dark",
                        "selectedTokenSets": { "Primitives": "source", "Light": "disabled", "Dark": "enabled" }
                    }
                ],
                "$metadata": { "tokenSetOrder": ["Primitives", "Light", "Dark"] }
            };
            download(new Blob([json(exportData)], { type: 'application/json' }), 'theme-figma.json');
        } else {
            const exportData = {
                ...exportPayload,
                "$themebuilder": { version: "1.0", theme: activeTheme, globalColors }
            };
            download(new Blob([json(exportData)], { type: 'application/json' }), 'theme-json.json');
        }
    };

    const tabBtn = (tab: ExportTab, label: string) => (
        <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === tab ? (isDarkMode ? '#C3E835' : '#0142FE') : (isDarkMode ? '#94a3b8' : '#64748b'),
                borderBottom: activeTab === tab ? `2px solid ${isDarkMode ? '#C3E835' : '#0142FE'}` : '2px solid transparent',
                padding: '0.75rem 0.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '-1px'
            }}
        >
            {label}
        </button>
    );

    return (
        <SystemicModal variant="centered" isDarkMode={isDarkMode} onClose={onClose} maxWidth="800px" noPadding>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                {/* Header & tabs */}
                <div style={{ borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}` }}>
                    <div style={{ padding: '1.5rem 1.5rem 0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                        {tabBtn('semantic', 'Semantic Tokens')}
                        {tabBtn('primitive', 'Primitive Tokens')}
                        {tabBtn('geometry', 'Geometry Tokens')}
                    </div>
                </div>

                {/* Tab body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="no-scrollbar">
                    {activeTab === 'semantic' && (
                        <SemanticTokensTab
                            isDarkMode={isDarkMode}
                            excludedSemanticCategories={excludedSemanticCategories}
                            setExcludedSemanticCategories={setExcludedSemanticCategories}
                            excludedSemanticTokens={excludedSemanticTokens}
                            setExcludedSemanticTokens={setExcludedSemanticTokens}
                        />
                    )}
                    {activeTab === 'primitive' && (
                        <PrimitiveTokensTab
                            isDarkMode={isDarkMode}
                            excludedPalettes={excludedPalettes}
                            setExcludedPalettes={setExcludedPalettes}
                        />
                    )}
                    {activeTab === 'geometry' && (
                        <GeometryTokensTab
                            isDarkMode={isDarkMode}
                            excludedGeometry={excludedGeometry}
                            setExcludedGeometry={setExcludedGeometry}
                        />
                    )}
                </div>

                {/* Footer: format selector + download */}
                <div style={{ padding: '1.5rem', borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDarkMode ? '#1e293b' : '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Format:</span>
                        <select
                            value={exportFormat}
                            onChange={(e: any) => setExportFormat(e.target.value)}
                            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, background: isDarkMode ? '#0f172a' : '#fff', color: 'inherit' }}
                        >
                            <option value="tokensync">Token Sync (ZIP)</option>
                            <option value="figma">Figma Variables (Tokens Studio)</option>
                            <option value="json">Clean JSON (Standard)</option>
                        </select>
                    </div>
                    <button
                        onClick={handleExport}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: isDarkMode ? '#C3E835' : '#0142FE', color: isDarkMode ? '#000' : '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                    >
                        <Download size={18} /> Download
                    </button>
                </div>
            </div>
        </SystemicModal>
    );
};
