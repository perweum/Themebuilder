/**
 * Import parser test — runs realistic token file scenarios through the
 * same logic used in ImportScreen.tsx and prints what would be imported.
 *
 * Run with:  node scripts/test-import-parser.mjs
 */

// ─── Parser (mirrors ImportScreen.tsx) ───────────────────────────────────────

const KNOWN_GLOBAL_IDS = new Set(['neutral', 'success', 'error', 'warning', 'info', 'caution', 'critical']);

function isHex(s) { return /^#[0-9a-fA-F]{3,8}$/.test(s.trim()); }

function extractHex(token) {
    if (typeof token === 'string' && isHex(token)) return token.trim();
    if (typeof token !== 'object' || !token) return null;
    const v = token.$value ?? token.value;
    if (typeof v === 'string' && isHex(v.trim()) && !v.includes('{')) return v.trim();
    return null;
}

function luminance(hex) {
    const full = hex.length === 4
        ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
    const r = parseInt(full.slice(1,3),16)/255;
    const g = parseInt(full.slice(3,5),16)/255;
    const b = parseInt(full.slice(5,7),16)/255;
    const lin = c => c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4;
    return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
}

const STEP_WORDS = new Set(['default','base','light','lighter','lightest','dark','darker','darkest','mid','medium','pale','deep','bold','soft','subtle','vivid','muted']);
function isStepKey(key) {
    if (/^\d+$/.test(key)) return true;
    if (/^A\d+$/i.test(key)) return true;
    return STEP_WORDS.has(key.toLowerCase());
}

function detectScale(obj) {
    if (typeof obj !== 'object' || !obj) return false;
    const hexEntries = Object.entries(obj).filter(([k,v]) => !k.startsWith('$') && extractHex(v) !== null);
    if (hexEntries.length < 3) return false;
    const stepLike = hexEntries.filter(([k]) => isStepKey(k)).length;
    return stepLike >= Math.ceil(hexEntries.length / 2);
}

function seedFromScale(obj) {
    const entries = Object.entries(obj).filter(([k,v]) => !k.startsWith('$') && extractHex(v) !== null);
    if (!entries.length) return null;
    const preferred = ['500','400','600','DEFAULT','base','default','300','700','5','6','4'];
    for (const step of preferred) {
        const e = entries.find(([k]) => k === step);
        if (e) {
            const hex = extractHex(e[1]);
            if (luminance(hex) < 0.5) return { hex, step: e[0], method: 'named-step' };
        }
    }
    const TARGET = 0.18;
    const withLum = entries.map(([k,v]) => {
        const hex = extractHex(v);
        return { key: k, hex, dist: Math.abs(luminance(hex) - TARGET) };
    }).sort((a,b) => a.dist - b.dist);
    return { hex: withLum[0].hex, step: withLum[0].key, method: 'luminance-fallback' };
}

function mineScales(obj, depth = 0) {
    const result = new Map();
    if (depth > 6 || typeof obj !== 'object' || !obj) return result;
    for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith('$')) continue;
        if (typeof value !== 'object' || !value) continue;
        if (detectScale(value)) {
            const r = seedFromScale(value);
            if (r && !result.has(key)) result.set(key, r);
        } else {
            for (const [k,s] of mineScales(value, depth+1))
                if (!result.has(k)) result.set(k, s);
        }
    }
    return result;
}

function mineIndividual(obj, depth = 0) {
    const result = new Map();
    if (depth > 6 || typeof obj !== 'object' || !obj) return result;
    for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith('$')) continue;
        const hex = extractHex(value);
        if (hex) { if (!result.has(key)) result.set(key, { hex, step: '-', method: 'individual' }); }
        else if (typeof value === 'object')
            for (const [k,s] of mineIndividual(value, depth+1))
                if (!result.has(k)) result.set(k, s);
    }
    return result;
}

function parseJson(json) {
    if (json['$themebuilder']?.version === '1.0') {
        const t = json['$themebuilder'].theme;
        return { format: 'themebuilder-v1', colors: t?.colors?.map(c => ({ name: c.name, hex: c.seed, step: 'seed', method: 'metadata' })) ?? [], globals: json['$themebuilder'].globalColors?.map(g => g.name) ?? [], warnings: [] };
    }
    const scales = mineScales(json);
    if (scales.size > 0) {
        const colors = [], globals = [];
        for (const [name, info] of scales) {
            if (name === 'white' || name === 'black') continue;
            if (KNOWN_GLOBAL_IDS.has(name)) globals.push({ name, ...info });
            else colors.push({ name, ...info });
        }
        const fmt = json['$themes'] ? 'token-studio' : (json.color && (json.theme || json.darkTheme)) ? 'themebuilder-raw' : 'generic';
        return { format: fmt, colors, globals, warnings: fmt === 'generic' ? ['generic format'] : [] };
    }
    const individuals = mineIndividual(json);
    if (individuals.size > 0) {
        const colors = [], globals = [];
        for (const [name, info] of individuals) {
            if (name === 'white' || name === 'black') continue;
            if (KNOWN_GLOBAL_IDS.has(name)) globals.push({ name, ...info });
            else colors.push({ name, ...info });
        }
        return { format: 'generic-individual', colors, globals, warnings: ['no scales found — individual colors only'] };
    }
    return { format: 'FAIL', colors: [], globals: [], warnings: ['no colors found'] };
}

// ─── Test runner ──────────────────────────────────────────────────────────────

let passed = 0, failed = 0;

function test(label, json, expect) {
    const result = parseJson(json);
    const colorNames = result.colors.map(c => c.name);
    const globalNames = result.globals.map(g => typeof g === 'string' ? g : g.name);

    const ok_format  = !expect.format  || result.format === expect.format;
    const ok_colors  = !expect.colors  || expect.colors.every(n => colorNames.includes(n));
    const ok_globals = !expect.globals || expect.globals.every(n => globalNames.includes(n));
    const ok_noExtra = !expect.noExtraColors || colorNames.every(n => expect.colors.includes(n));
    const ok_seedApprox = !expect.seedApprox || expect.seedApprox.every(({ name, contains }) => {
        const c = result.colors.find(c => c.name === name) || result.globals.find(c => c.name === name);
        return c && c.hex.toLowerCase().includes(contains.toLowerCase().replace('#',''));
    });

    const ok = ok_format && ok_colors && ok_globals && ok_noExtra && ok_seedApprox;
    if (ok) passed++;
    else failed++;

    const icon = ok ? '✅' : '❌';
    console.log(`\n${icon} ${label}`);
    console.log(`   format  : ${result.format}`);
    console.log(`   colors  : ${result.colors.map(c => `${c.name}(${c.hex} via ${c.method}@${c.step})`).join(', ') || '(none)'}`);
    console.log(`   globals : ${globalNames.join(', ') || '(none)'}`);
    if (result.warnings.length) console.log(`   warnings: ${result.warnings.join('; ')}`);
    if (!ok) {
        if (!ok_format)  console.log(`   ⚠ format expected "${expect.format}" got "${result.format}"`);
        if (!ok_colors)  console.log(`   ⚠ missing colors: ${expect.colors?.filter(n => !colorNames.includes(n))}`);
        if (!ok_globals) console.log(`   ⚠ missing globals: ${expect.globals?.filter(n => !globalNames.includes(n))}`);
        if (!ok_noExtra) console.log(`   ⚠ unexpected colors: ${colorNames.filter(n => !expect.colors?.includes(n))}`);
    }
}

// ─── Scenarios ────────────────────────────────────────────────────────────────

// 1. Themebuilder v1 round-trip
test('1. Themebuilder v1 — perfect round-trip', {
    color: {}, theme: {}, darkTheme: {}, geometry: {},
    $themebuilder: {
        version: '1.0',
        theme: { id: 't1', name: 'My Brand', colors: [{ id: 'c1', name: 'brand', seed: '#014592' }, { id: 'c2', name: 'accent', seed: '#ffbad9' }], geometry: {}, fontFamily: 'Inter' },
        globalColors: [{ id: 'neutral', name: 'neutral', seed: '#64748b' }]
    }
}, { format: 'themebuilder-v1', colors: ['brand', 'accent'], globals: ['neutral'] });

// 2. Token Studio format (our own export)
test('2. Token Studio ($themes) — our export format', {
    $themes: [
        { id: 'light', name: 'Light', selectedTokenSets: { Primitives: 'source', Light: 'enabled', Dark: 'disabled' } },
        { id: 'dark',  name: 'Dark',  selectedTokenSets: { Primitives: 'source', Light: 'disabled', Dark: 'enabled' } }
    ],
    $metadata: { tokenSetOrder: ['Primitives', 'Light', 'Dark'] },
    Primitives: {
        color: {
            brand:   { 25: { $value: '#f0f7ff', $type: 'color' }, 100: { $value: '#dbeafe', $type: 'color' }, 300: { $value: '#93c5fd', $type: 'color' }, 500: { $value: '#3b82f6', $type: 'color' }, 700: { $value: '#1d4ed8', $type: 'color' }, 900: { $value: '#1e3a8a', $type: 'color' } },
            neutral: { 25: { $value: '#f8fafc', $type: 'color' }, 100: { $value: '#f1f5f9', $type: 'color' }, 300: { $value: '#cbd5e1', $type: 'color' }, 500: { $value: '#64748b', $type: 'color' }, 700: { $value: '#334155', $type: 'color' }, 900: { $value: '#0f172a', $type: 'color' } },
        }
    },
    Light: { color: { background: { default: { $value: '{Primitives.color.brand.25}', $type: 'color' } } } },
    Dark:  { color: { background: { default: { $value: '{Primitives.color.brand.900}', $type: 'color' } } } },
}, { format: 'token-studio', colors: ['brand'], globals: ['neutral'] });

// 3. Tailwind config (50–900 steps, raw hex strings)
test('3. Tailwind palette — 50-900 steps, raw hex strings', {
    dominant: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
    secondary: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' },
    neutral:   { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' },
}, { format: 'generic', colors: ['dominant', 'secondary'], globals: ['neutral'],
     seedApprox: [{ name: 'dominant', contains: '3b82f6' }, { name: 'secondary', contains: '22c55e' }] });

// 4. Material Design palette (100-900 + A variants)
test('4. Material Design — 100-900 + A100/A200/A400/A700', {
    primary: { 100: '#bbdefb', 200: '#90caf9', 300: '#64b5f6', 400: '#42a5f5', 500: '#2196f3', 600: '#1e88e5', 700: '#1976d2', 800: '#1565c0', 900: '#0d47a1', A100: '#82b1ff', A200: '#448aff', A400: '#2979ff', A700: '#2962ff' },
    error:   { 100: '#ffcdd2', 300: '#e57373', 500: '#f44336', 700: '#d32f2f', 900: '#b71c1c' },
}, { format: 'generic', colors: ['primary'], globals: ['error'],
     seedApprox: [{ name: 'primary', contains: '2196f3' }] });

// 5. "dominant"/"secondary" as single seed colors (flat, no scale)
test('5. Single seed colors — dominant/secondary flat hex', {
    dominant:  '#4f46e5',
    secondary: '#10b981',
    neutral:   '#64748b',
}, { format: 'generic-individual', colors: ['dominant', 'secondary'], globals: ['neutral'] });

// 6. Custom named steps: light / DEFAULT / dark
test('6. Custom named steps — light/DEFAULT/dark', {
    brand: { light: '#a5b4fc', mid: '#6366f1', DEFAULT: '#4f46e5', dark: '#3730a3', darker: '#1e1b4b' },
    accent: { light: '#6ee7b7', DEFAULT: '#10b981', dark: '#065f46' },
}, { format: 'generic', colors: ['brand', 'accent'],
     seedApprox: [{ name: 'brand', contains: '4f46e5' }, { name: 'accent', contains: '10b981' }] });

// 7. 1–10 numeric scale (Radix UI style)
// Step "5" is very light in Radix — luminance check should reject it
// and pick a darker, more representative step via luminance targeting
test('7. Radix UI style — 1-10, light step-5 rejected', {
    violet: { 1: '#fdfcfe', 2: '#faf8ff', 3: '#f4f0fe', 4: '#ebe4ff', 5: '#e1d9ff', 6: '#d4cafe', 7: '#c2b5f5', 8: '#aa99ec', 9: '#6e56cf', 10: '#644fc1' },
    green:  { 1: '#fbfefb', 2: '#f3fcf3', 3: '#ebf9eb', 4: '#daf6da', 5: '#c9f0ca', 6: '#b2e5b4', 7: '#94d6a0', 8: '#65c27c', 9: '#46a758', 10: '#3d9a50' },
}, { format: 'generic', colors: ['violet', 'green'],
     seedApprox: [{ name: 'violet', contains: '6e56cf' }, { name: 'green', contains: '3d9a50' }] });

// 8. Style Dictionary nested format
test('8. Style Dictionary — nested color groups', {
    color: {
        brand: {
            primary:   { value: '#0142FE', type: 'color' },
            secondary: { value: '#C3E835', type: 'color' },
        },
        feedback: {
            error:   { value: '#ef4444', type: 'color' },
            success: { value: '#22c55e', type: 'color' },
            warning: { value: '#eab308', type: 'color' },
        }
    }
}, { format: 'generic-individual', colors: ['primary', 'secondary'], globals: ['error', 'success', 'warning'] });

// 9. Deeply nested with noise (spacing, typography mixed in)
test('9. Mixed tokens — colors buried among non-color tokens', {
    typography: { fontFamily: { body: { value: 'Inter', type: 'fontFamily' }, heading: { value: 'Playfair Display', type: 'fontFamily' } } },
    spacing:    { sm: { value: '4px', type: 'dimension' }, md: { value: '8px', type: 'dimension' } },
    color: {
        palette: {
            indigo: { 100: '#e0e7ff', 300: '#a5b4fc', 500: '#6366f1', 700: '#4338ca', 900: '#312e81' },
            rose:   { 100: '#ffe4e6', 300: '#fda4af', 500: '#f43f5e', 700: '#be123c', 900: '#881337' },
            neutral: { 100: '#f5f5f5', 300: '#d4d4d4', 500: '#737373', 700: '#404040', 900: '#171717' },
        }
    }
}, { format: 'generic', colors: ['indigo', 'rose'], globals: ['neutral'] });

// 10. Alias-heavy file (most values are references, not hex)
test('10. Alias-heavy file — aliases skipped, real hex still found', {
    primitive: {
        coral: { 300: { $value: '#fca5a5', $type: 'color' }, 500: { $value: '#f87171', $type: 'color' }, 700: { $value: '#dc2626', $type: 'color' } },
    },
    semantic: {
        danger: { default: { $value: '{primitive.coral.500}', $type: 'color' } }, // alias — should be skipped
        info:   { $value: '{primitive.blue.500}', $type: 'color' },               // alias
    }
}, { format: 'generic', colors: ['coral'], globals: [] });

// 11. Figma Tokens plugin "old" format (value without $)
test('11. Old Figma Tokens format — value (non-$)', {
    global: {
        brand:   { 100: { value: '#dbeafe', type: 'color' }, 300: { value: '#93c5fd', type: 'color' }, 500: { value: '#3b82f6', type: 'color' }, 700: { value: '#1d4ed8', type: 'color' }, 900: { value: '#1e3a8a', type: 'color' } },
        success: { 100: { value: '#d1fae5', type: 'color' }, 300: { value: '#6ee7b7', type: 'color' }, 500: { value: '#10b981', type: 'color' }, 700: { value: '#047857', type: 'color' }, 900: { value: '#064e3b', type: 'color' } },
    }
}, { format: 'generic', colors: ['brand'], globals: ['success'],
     seedApprox: [{ name: 'brand', contains: '3b82f6' }] });

// 12. Scale where step 500 is an alias but other steps are real hex
test('12. Scale with aliased 500 — luminance fallback kicks in', {
    brand: {
        100: { $value: '#dbeafe', $type: 'color' },
        300: { $value: '#93c5fd', $type: 'color' },
        500: { $value: '{semantic.brand}', $type: 'color' },   // alias — must be skipped
        700: { $value: '#1d4ed8', $type: 'color' },
        900: { $value: '#1e3a8a', $type: 'color' },
    }
}, { format: 'generic', colors: ['brand'] });
// Should pick 700 (#1d4ed8) or 300 (#93c5fd) via luminance

// 13. Completely unknown format — just a flat object of hex values
test('13. Unknown format — plain color map, no scale structure', {
    '--color-primary': '#4f46e5',
    '--color-secondary': '#10b981',
    '--color-danger': '#ef4444',
}, { format: 'generic-individual' });
// These start with -- so they won't be found (key check) — expected to FAIL gracefully
// Actually — let me check if our code handles '--' prefixed keys

// 14. CSS custom property names (dashes)
test('14. CSS variable names — dash-prefixed keys', {
    colors: {
        'primary': '#4f46e5',
        'accent': '#10b981',
        'gray': '#64748b',
    }
}, { format: 'generic-individual', colors: ['primary', 'accent'], globals: [] });
// 'gray' is not in KNOWN_GLOBAL_IDS so it would be a theme color

// 15. Multi-brand Token Studio: two separate brand sets
test('15. Multi-brand Token Studio — two brand color sets', {
    $themes: [
        { id: 'brand-a-light', name: 'Brand A Light', selectedTokenSets: { 'brand-a': 'source', base: 'source', 'light-semantic': 'enabled' } },
        { id: 'brand-b-light', name: 'Brand B Light', selectedTokenSets: { 'brand-b': 'source', base: 'source', 'light-semantic': 'enabled' } },
    ],
    $metadata: { tokenSetOrder: ['brand-a', 'brand-b', 'base', 'light-semantic'] },
    'brand-a': { primary: { 100: '#fce7f3', 300: '#f9a8d4', 500: '#ec4899', 700: '#be185d', 900: '#831843' } },
    'brand-b': { primary: { 100: '#e0f2fe', 300: '#7dd3fc', 500: '#0ea5e9', 700: '#0369a1', 900: '#0c4a6e' } },
    base:      { neutral: { 100: '#f5f5f5', 300: '#d4d4d4', 500: '#737373', 700: '#404040', 900: '#171717' } },
}, { format: 'token-studio', colors: ['primary'], globals: ['neutral'] });
// NOTE: Both brand-a.primary and brand-b.primary have the same name "primary"
// First one wins by dedup — this is a limitation we should note

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) console.log('Review ❌ cases above for issues to fix.');
