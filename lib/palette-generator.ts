import {
    oklch,
    formatHex,
    wcagContrast,
    Oklch,
    modeOklch,
    useMode
} from 'culori';

// Initializing OKLCH mode
useMode(modeOklch);

export type ColorStep = 25 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export const COLOR_STEPS: ColorStep[] = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export type AlphaStep = 100 | 90 | 80 | 70 | 60 | 50 | 40 | 30 | 20 | 10 | 5;
export const ALPHA_STEPS: AlphaStep[] = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5];

// Luminosity targets from Palette-Logic.md
export const LUMINOSITY_TARGETS: Record<ColorStep, number> = {
    25: 0.98,
    50: 0.95,
    100: 0.90,
    200: 0.82,
    300: 0.74,
    400: 0.62,
    500: 0.50, // Base Brand
    600: 0.42, // Delta 0.08
    700: 0.34, // Delta 0.08
    800: 0.26, // Delta 0.08
    900: 0.18, // Delta 0.08
    950: 0.14, // Delta 0.04 (Avoids crushing blacks)
};

export interface GeneratedRamp {
    ramp: Record<ColorStep, string>;
    closestStep: ColorStep;
}

/**
 * Generates a 12-step perceptual color ramp based on a seed color.
 * Returns the ramp and the step that most closely matches the seed's inherent luminosity.
 */
export function generateRamp(seedHex: string): GeneratedRamp {
    const seed = oklch(seedHex);
    if (!seed) {
        throw new Error(`Invalid seed color: ${seedHex}`);
    }

    const hue = seed.h ?? 0;
    const seedChroma = seed.c ?? 0;
    const seedLuminosity = seed.l;

    const ramp: Partial<Record<ColorStep, string>> = {};

    // 1. Determine closest step mathematically
    let closestStep: ColorStep = 500;
    let closestIndex = 6;
    let minDiff = Infinity;
    COLOR_STEPS.forEach((step, index) => {
        const diff = Math.abs(LUMINOSITY_TARGETS[step] - seedLuminosity);
        if (diff < minDiff) {
            minDiff = diff;
            closestStep = step;
            closestIndex = index;
        }
    });

    // 2. Calculate peak chroma based on where the seed landed to preserve saturation
    let peakChroma = seedChroma;
    if (closestIndex < 6) {
        const multiplier = 0.2 + 0.8 * (closestIndex / 6);
        peakChroma = seedChroma / multiplier;
    } else if (closestIndex > 6) {
        const multiplier = 1 - 0.8 * ((closestIndex - 6) / 5);
        peakChroma = seedChroma / multiplier;
    }

    // 3. Generate Base Steps
    COLOR_STEPS.forEach((step, index) => {
        const targetL = LUMINOSITY_TARGETS[step];
        let targetC = peakChroma;

        // Middle step is conceptually index 6 (500)
        if (index < 6) {
            targetC = peakChroma * (0.2 + 0.8 * (index / 6));
        } else if (index > 6) {
            targetC = peakChroma * (1 - 0.8 * ((index - 6) / 5));
        }

        const color: Oklch = {
            mode: 'oklch',
            l: targetL,
            c: targetC,
            h: hue
        };

        ramp[step] = formatHex(color);
    });

    // We skip the collision check hardcoding here, as mapTheme handles dynamic token assignments now.

    // Return the generated ramp and the dynamically identified step
    // The closestStep is EXACTLY the step the seed represents in the L-curve
    ramp[closestStep] = seedHex; // Overwrite the exact closest step with the *true* exact seed color to avoid imperceptible rounding errors

    return {
        ramp: ramp as Record<ColorStep, string>,
        closestStep
    };
}

export function generateAlphaRamp(seedHex: string): Record<AlphaStep, string> {
    // Simple hex to RGB parser for reliable 6-digit hex parsing without relying on external lib formats
    const hex = seedHex.replace(/^#/, '');
    if (hex.length !== 6) {
        throw new Error(`Invalid seed hex for alpha ramp (must be 6 digits): ${seedHex}`);
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const ramp: Partial<Record<AlphaStep, string>> = {};

    ALPHA_STEPS.forEach(step => {
        const decimalAlpha = step / 100;
        ramp[step] = `rgba(${r}, ${g}, ${b}, ${decimalAlpha})`;
    });

    return ramp as Record<AlphaStep, string>;
}

export interface AdaptiveColor {
    bg: string;
    text: string;
    isFallback: boolean;
}

export function getAdaptivePrimary(seedHex: string, fallbackHex: string): AdaptiveColor {
    const seed = seedHex;
    const white = '#ffffff';
    const black = '#111111'; // A softer, modern deep black

    // AAA Requirement: 7:1. Strict check.
    const getBestText = (bgHex: string) => {
        const cw = wcagContrast(bgHex, white);
        const cb = wcagContrast(bgHex, black);
        return {
            text: cw >= cb ? white : black,
            contrast: Math.max(cw, cb)
        };
    };

    const seedTest = getBestText(seed);

    // Check if the exact brand seed supports AAA
    if (seedTest.contrast >= 7) {
        return { bg: seed, text: seedTest.text, isFallback: false };
    }

    // Try fallback (Step 500 equivalent) which is usually better balanced
    const fallbackTest = getBestText(fallbackHex);

    // If step 500 passes AAA, or merely provides significantly higher contrast, use it
    if (fallbackTest.contrast >= 7 || fallbackTest.contrast > seedTest.contrast) {
        return { bg: fallbackHex, text: fallbackTest.text, isFallback: true };
    }

    // Fall back to seed with best text if neither resolves well
    return { bg: seed, text: seedTest.text, isFallback: true };
}

/**
 * Finds the nearest step in a color ramp that provides at least a 4.5:1 contrast ratio 
 * against the provided background color. If no step provides 4.5:1, returns the step 
 * with the absolute highest contrast.
 * 
 * Used for Ghost/Outline text where the brand color must be legible against Light/Dark backgrounds.
 */
export function getAccessibleForeground(ramp: Record<ColorStep, string>, bgHex: string): ColorStep {
    let bestStep: ColorStep = 500;
    let maxContrast = 0;

    // Scan all steps and always choose the one with the absolute highest contrast
    for (const step of COLOR_STEPS) {
        const color = ramp[step];
        const contrast = wcagContrast(color, bgHex);

        if (contrast > maxContrast) {
            maxContrast = contrast;
            bestStep = step;
        }
    }

    return bestStep;
}

/**
 * Returns a generic color name (e.g., "blue", "red") based on the OKLCH hue of a color.
 */
export function getColorName(hex: string): string {
    const color = oklch(hex);
    if (!color) return 'gray';

    // Very low chroma implies a neutral
    if (color.c !== undefined && color.c < 0.02) return 'neutral';

    const h = color.h !== undefined ? color.h : 0;

    if (h >= 0 && h < 30) return 'red';
    if (h >= 30 && h < 70) return 'orange';
    if (h >= 70 && h < 110) return 'yellow';
    if (h >= 110 && h < 150) return 'green';
    if (h >= 150 && h < 200) return 'teal';
    if (h >= 200 && h < 260) return 'blue';
    if (h >= 260 && h < 290) return 'indigo';
    if (h >= 290 && h < 330) return 'purple';
    if (h >= 330 && h < 360) return 'pink';

    return 'neutral';
}

/**
 * Gets the shortest angular distance between two okLCH hues.
 */
export function getHueDistance(hex1: string, hex2: string): number {
    const c1 = oklch(hex1);
    const c2 = oklch(hex2);
    if (!c1 || !c2 || c1.h === undefined || c2.h === undefined) return 0;

    let diff = Math.abs(c1.h - c2.h);
    if (diff > 180) {
        diff = 360 - diff;
    }
    return diff;
}

/**
 * Given an OKLCH luminosity (0-1), returns the closest matching 12-step target.
 */
export function getClosestLuminosityStep(l: number): ColorStep {
    let closestStep: ColorStep = 500;
    let minDiff = Infinity;
    COLOR_STEPS.forEach((step) => {
        const diff = Math.abs(LUMINOSITY_TARGETS[step] - l);
        if (diff < minDiff) {
            minDiff = diff;
            closestStep = step;
        }
    });
    return closestStep;
}
