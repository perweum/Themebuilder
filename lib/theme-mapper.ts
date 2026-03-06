import { ColorStep, COLOR_STEPS, getAccessibleForeground, GeneratedRamp, getColorName, generateAlphaRamp, AlphaStep, getClosestLuminosityStep, generateRamp } from './palette-generator';
import { wcagContrast } from 'culori';

export interface Token<T = string> {
    $value: T;
    $type?: string;
}

export type ColorRampTokens = Record<ColorStep, Token<string>>;
export type AlphaRampTokens = Record<AlphaStep, Token<string>>;

export interface ThemeTokensPayload {
    color: Record<string, any>;
    theme: Record<string, any>;
    darkTheme: Record<string, any>;
    geometry: Record<string, any>;
}

// Helper to convert a raw ramp (keys 25-950) into Token format
function toTokenRamp(ramp: Record<ColorStep, string>): ColorRampTokens {
    const tokens = {} as ColorRampTokens;
    for (const stepStr in ramp) {
        const key = Number(stepStr) as ColorStep;
        tokens[key] = {
            $value: ramp[key],
            $type: 'color'
        };
    }
    return tokens;
}

function toAlphaTokenRamp(ramp: Record<AlphaStep, string>): AlphaRampTokens {
    const tokens = {} as AlphaRampTokens;
    for (const stepStr in ramp) {
        const key = Number(stepStr) as AlphaStep;
        tokens[key] = {
            $value: ramp[key],
            $type: 'color'
        };
    }
    return tokens;
}

function getOffsetStep(step: ColorStep, offset: number): ColorStep {
    const idx = COLOR_STEPS.indexOf(step);
    if (idx === -1) return step;
    const newIdx = Math.max(0, Math.min(COLOR_STEPS.length - 1, idx + offset));
    return COLOR_STEPS[newIdx];
}

/**
 * Checks if the contrast between background and text meets AAA (7:1).
 * If not, it forcefully returns pure white or pure black, depending on which is better.
 */
function getStrictAAAContrast(bgHex: string, textHex: string): { $value: string, $type: string } {
    const contrast = wcagContrast(textHex, bgHex);
    if (contrast >= 7) {
        return { $value: `{#${textHex}}`, $type: "color" }; // We will just return the literal hex if it's naturally AAA
    }
    const whiteC = wcagContrast('#ffffff', bgHex);
    const blackC = wcagContrast('#000000', bgHex);
    return { $value: whiteC > blackC ? '{color.white.100}' : '{color.black.100}', $type: "color" };
}

/**
 * Returns the best possible text color token (white or black) for a given background,
 * and the actual hex that was chosen.
 */
export function getBestTextForBg(bgHex: string): { token: string, hex: string, contrast: number } {
    const whiteC = wcagContrast('#ffffff', bgHex);
    const blackC = wcagContrast('#000000', bgHex);
    if (whiteC >= blackC) {
        return { token: '{color.white.100}', hex: '#ffffff', contrast: whiteC };
    }
    return { token: '{color.black.100}', hex: '#000000', contrast: blackC };
}

/**
 * If the preferred base step doesn't meet AA (4.5) with either white or black,
 * shift the base step until it does.
 */
export function getAccessibleBaseStep(ramp: Record<ColorStep, string>, preferredStep: ColorStep): { bgStep: ColorStep, textToken: string, textHex: string } {
    const bgHex = ramp[preferredStep];
    const { token, hex: textHex, contrast } = getBestTextForBg(bgHex);

    if (contrast >= 4.5) {
        return { bgStep: preferredStep, textToken: token, textHex }; // It safely meets AA natively
    }

    // It fails AA entirely. We must find a step that passes AA with white or black.
    // Try scanning away from 500 towards the extremes to find one that works.
    let bestAltStep = preferredStep;
    let maxFoundContrast = contrast;
    let bestAltToken = token;

    for (const step of COLOR_STEPS) {
        const testBg = ramp[step];
        const testText = getBestTextForBg(testBg);
        if (testText.contrast >= 4.5) {
            // We found one that passes! Pick the one closest to the preferred step that passes.
            // But since this is a simple linear search, let's just grab the first one that passes when moving progressively darker (or lighter).
        }
        if (testText.contrast > maxFoundContrast) {
            maxFoundContrast = testText.contrast;
            bestAltStep = step;
            bestAltToken = testText.token;
        }
    }

    // Return the step that has the absolute highest possible contrast if none meet 4.5 (unlikely with a 12 step scale),
    // or return the first step moving away from the center that hits 4.5.

    // Better algorithm: Search outward from the preferred step to find the nearest compliant step.
    const preferredIdx = COLOR_STEPS.indexOf(preferredStep);
    let nearestCompliantStep = preferredStep;
    let nearestCompliantToken = token;
    let minDistance = Infinity;

    for (let i = 0; i < COLOR_STEPS.length; i++) {
        const step = COLOR_STEPS[i];
        const testBg = ramp[step];
        const testText = getBestTextForBg(testBg);

        if (testText.contrast >= 4.5) {
            const dist = Math.abs(i - preferredIdx);
            if (dist < minDistance) {
                minDistance = dist;
                nearestCompliantStep = step;
                nearestCompliantToken = testText.token;
            }
        }
    }

    if (minDistance !== Infinity) {
        return { bgStep: nearestCompliantStep, textToken: nearestCompliantToken, textHex: getBestTextForBg(ramp[nearestCompliantStep]).hex };
    }

    // Fallback if the entire scale is somehow low contrast
    return { bgStep: bestAltStep, textToken: bestAltToken, textHex: getBestTextForBg(ramp[bestAltStep]).hex };
}

export interface NamedColorRamp {
    id?: string;       // Stable ID for core tracking
    name: string;      // The actual mapped name, like 'master' or 'secondary'
    gen: GeneratedRamp;
}

/**
 * Maps generated ramps to the semantic token structure.
 * Implements W3C Design Token aliasing {namespace.path}.
 */
export function mapTheme(
    themeColors: NamedColorRamp[],
    globalColors: NamedColorRamp[],
    semanticOverrides?: Record<string, string>,
    primitiveOverrides?: Record<string, string>,
    geometryConfig?: { radiusBase: number; includeRadius: boolean; includeBorders: boolean; borderWidth: 'small' | 'medium' | 'large' }
): ThemeTokensPayload {

    // Lookup core semantics by stable ID so renaming them doesn't drop their required mapping
    const neutralRamp = globalColors.find(c => c.id === 'neutral');
    const successRamp = globalColors.find(c => c.id === 'success');
    const errorRamp = globalColors.find(c => c.id === 'error' || c.id === 'critical');

    // Extract default fallbacks if somehow missing
    const fallbackNeutral = generateRamp('#64748b');
    const fallbackSuccess = generateRamp('#22c55e');
    const fallbackError = generateRamp('#ef4444');

    const neutralGen = neutralRamp ? neutralRamp.gen : fallbackNeutral;
    const successGen = successRamp ? successRamp.gen : fallbackSuccess;
    const errorGen = errorRamp ? errorRamp.gen : fallbackError;

    const neutralKey = neutralRamp ? neutralRamp.name.toLowerCase().replace(/\s+/g, '-') : 'neutral';
    const successKey = successRamp ? successRamp.name.toLowerCase().replace(/\s+/g, '-') : 'success';
    const errorKey = errorRamp ? errorRamp.name.toLowerCase().replace(/\s+/g, '-') : 'error';

    const colors: Record<string, any> = {
        white: toAlphaTokenRamp(generateAlphaRamp('#ffffff')),
        black: toAlphaTokenRamp(generateAlphaRamp('#000000')),
        [neutralKey]: toTokenRamp(neutralGen.ramp),
        [successKey]: toTokenRamp(successGen.ramp),
        [errorKey]: toTokenRamp(errorGen.ramp),
    };

    // Initialize root objects
    const theme: Record<string, any> = {
        background: {
            default: {},
            [successKey]: { $value: `{color.${successKey}.25}`, $type: "color" },
            [errorKey]: { $value: `{color.${errorKey}.25}`, $type: "color" }
        },
        surface: {
            default: { $value: `{color.white.100}`, $type: "color" },
            disabled: { $value: `{color.${neutralKey}.50}`, $type: "color" },
            [successKey]: {
                default: { $value: `{color.${successKey}.50}`, $type: "color" },
                hover: { $value: `{color.${successKey}.100}`, $type: "color" },
                active: { $value: `{color.${successKey}.200}`, $type: "color" }
            },
            [errorKey]: {
                default: { $value: `{color.${errorKey}.50}`, $type: "color" },
                hover: { $value: `{color.${errorKey}.100}`, $type: "color" },
                active: { $value: `{color.${errorKey}.200}`, $type: "color" }
            }
        },
        border: {
            subtle: { $value: `{color.${neutralKey}.200}`, $type: "color" },
            default: { $value: `{color.${neutralKey}.300}`, $type: "color" },
            disabled: { $value: `{color.${neutralKey}.200}`, $type: "color" },
            focus: {},
            [successKey]: {
                default: { $value: `{color.${successKey}.300}`, $type: "color" },
                hover: { $value: `{color.${successKey}.400}`, $type: "color" }
            },
            [errorKey]: {
                default: { $value: `{color.${errorKey}.300}`, $type: "color" },
                hover: { $value: `{color.${errorKey}.400}`, $type: "color" }
            }
        },
        base: {
            disabled: { $value: `{color.${neutralKey}.200}`, $type: "color" },
            [successKey]: {
                default: { $value: `{color.${successKey}.500}`, $type: "color" },
                hover: { $value: `{color.${successKey}.600}`, $type: "color" },
                active: { $value: `{color.${successKey}.700}`, $type: "color" },
            },
            [errorKey]: {
                default: { $value: `{color.${errorKey}.500}`, $type: "color" },
                hover: { $value: `{color.${errorKey}.600}`, $type: "color" },
                active: { $value: `{color.${errorKey}.700}`, $type: "color" },
            }
        },
        text: {
            default: { $value: `{color.${neutralKey}.950}`, $type: "color" },
            subtle: { $value: `{color.${neutralKey}.500}`, $type: "color" },
            disabled: { $value: `{color.${neutralKey}.400}`, $type: "color" },
            [successKey]: {
                default: { $value: `{color.${successKey}.600}`, $type: "color" },
                contrast: { $value: `{color.white.100}`, $type: "color" }
            },
            [errorKey]: {
                default: { $value: `{color.${errorKey}.600}`, $type: "color" },
                contrast: { $value: `{color.white.100}`, $type: "color" }
            }
        },
        icon: {
            default: { $value: `{color.text.default}`, $type: "color" },
            subtle: { $value: `{color.text.subtle}`, $type: "color" },
            [successKey]: {
                default: { $value: `{color.text.${successKey}.default}`, $type: "color" },
                contrast: { $value: `{color.text.${successKey}.contrast}`, $type: "color" }
            },
            [errorKey]: {
                default: { $value: `{color.text.${errorKey}.default}`, $type: "color" },
                contrast: { $value: `{color.text.${errorKey}.contrast}`, $type: "color" }
            }
        },
        shadow: {
            color: { $value: `{color.black.30}`, $type: "color" },
            1: { $value: `0 1px 2px color-mix(in srgb, {color.shadow.color} 5%, transparent), 0 1px 3px color-mix(in srgb, {color.shadow.color} 10%, transparent)`, $type: "shadow" },
            2: { $value: `0 4px 6px -1px color-mix(in srgb, {color.shadow.color} 10%, transparent), 0 2px 4px -2px color-mix(in srgb, {color.shadow.color} 5%, transparent)`, $type: "shadow" },
            3: { $value: `0 10px 15px -3px color-mix(in srgb, {color.shadow.color} 10%, transparent), 0 4px 6px -4px color-mix(in srgb, {color.shadow.color} 5%, transparent)`, $type: "shadow" },
            4: { $value: `0 20px 25px -5px color-mix(in srgb, {color.shadow.color} 10%, transparent), 0 10px 10px -5px color-mix(in srgb, {color.shadow.color} 5%, transparent)`, $type: "shadow" },
        }
    };

    const darkTheme: Record<string, any> = {
        background: {
            default: {},
            [successKey]: { $value: `{color.${successKey}.900}`, $type: "color" },
            [errorKey]: { $value: `{color.${errorKey}.900}`, $type: "color" }
        },
        surface: {
            default: { $value: `{color.${neutralKey}.900}`, $type: "color" },
            disabled: { $value: `{color.${neutralKey}.900}`, $type: "color" },
            [successKey]: {
                default: { $value: `{color.${successKey}.900}`, $type: "color" },
                hover: { $value: `{color.${successKey}.800}`, $type: "color" },
                active: { $value: `{color.${successKey}.700}`, $type: "color" }
            },
            [errorKey]: {
                default: { $value: `{color.${errorKey}.900}`, $type: "color" },
                hover: { $value: `{color.${errorKey}.800}`, $type: "color" },
                active: { $value: `{color.${errorKey}.700}`, $type: "color" }
            }
        },
        border: {
            subtle: { $value: `{color.${neutralKey}.700}`, $type: "color" },
            default: { $value: `{color.${neutralKey}.500}`, $type: "color" },
            disabled: { $value: `{color.${neutralKey}.700}`, $type: "color" },
            focus: {},
            [successKey]: {
                default: { $value: `{color.${successKey}.500}`, $type: "color" },
                hover: { $value: `{color.${successKey}.400}`, $type: "color" }
            },
            [errorKey]: {
                default: { $value: `{color.${errorKey}.500}`, $type: "color" },
                hover: { $value: `{color.${errorKey}.400}`, $type: "color" }
            }
        },
        base: {
            disabled: { $value: `{color.${neutralKey}.800}`, $type: "color" },
            [successKey]: {
                default: { $value: `{color.${successKey}.400}`, $type: "color" },
                hover: { $value: `{color.${successKey}.300}`, $type: "color" },
                active: { $value: `{color.${successKey}.200}`, $type: "color" },
            },
            [errorKey]: {
                default: { $value: `{color.${errorKey}.400}`, $type: "color" },
                hover: { $value: `{color.${errorKey}.300}`, $type: "color" },
                active: { $value: `{color.${errorKey}.200}`, $type: "color" },
            }
        },
        text: {
            default: { $value: `{color.${neutralKey}.50}`, $type: "color" },
            subtle: { $value: `{color.${neutralKey}.400}`, $type: "color" },
            disabled: { $value: `{color.${neutralKey}.500}`, $type: "color" },
            [successKey]: {
                default: { $value: `{color.${successKey}.400}`, $type: "color" },
                contrast: { $value: `{color.white.100}`, $type: "color" }
            },
            [errorKey]: {
                default: { $value: `{color.${errorKey}.400}`, $type: "color" },
                contrast: { $value: `{color.white.100}`, $type: "color" }
            }
        },
        icon: {
            default: { $value: `{color.text.default}`, $type: "color" },
            subtle: { $value: `{color.text.subtle}`, $type: "color" },
            [successKey]: {
                default: { $value: `{color.text.${successKey}.default}`, $type: "color" },
                contrast: { $value: `{color.text.${successKey}.contrast}`, $type: "color" }
            },
            [errorKey]: {
                default: { $value: `{color.text.${errorKey}.default}`, $type: "color" },
                contrast: { $value: `{color.text.${errorKey}.contrast}`, $type: "color" }
            }
        },
        shadow: {
            color: { $value: `{color.white.30}`, $type: "color" },
            1: { $value: `0 1px 2px color-mix(in srgb, {color.shadow.color} 50%, transparent), 0 0 0 1px {color.white.5}`, $type: "shadow" },
            2: { $value: `0 4px 6px -1px color-mix(in srgb, {color.shadow.color} 50%, transparent), 0 0 0 1px {color.white.5}`, $type: "shadow" },
            3: { $value: `0 10px 15px -3px color-mix(in srgb, {color.shadow.color} 60%, transparent), 0 0 0 1px {color.white.5}`, $type: "shadow" },
            4: { $value: `0 20px 25px -5px color-mix(in srgb, {color.shadow.color} 70%, transparent), 0 0 0 1px {color.white.10}`, $type: "shadow" },
        }
    };

    // Grab the first color in the array to act as the primary structural background driver
    const primaryColor = themeColors.length > 0 ? themeColors[0] : null;

    // Force default backgrounds to absolute extremes for clean contrast
    theme.background.default = { $value: `{color.white.100}`, $type: "color" };
    darkTheme.background.default = { $value: `{color.black.100}`, $type: "color" };

    if (primaryColor) {
        // Also the global focus ring
        theme.border.focus = { $value: `{color.${primaryColor.name}.600}`, $type: "color" };
        darkTheme.border.focus = { $value: `{color.${primaryColor.name}.400}`, $type: "color" };
    } else {
        theme.border.focus = { $value: `{color.neutral.600}`, $type: "color" };
        darkTheme.border.focus = { $value: `{color.neutral.400}`, $type: "color" };
    }

    // Deduplication registry: prevents exporting identical primitive ramps.
    const canonicalSeeds = new Map<string, string>();

    // First, register all explicit global colors as canonical 
    // This allows "Water" to be used as a brand seed, and correctly alias to "water.X" 
    // instead of exploding the css payload with "brand.X" copies.
    globalColors.forEach(gc => {
        const seedStr = gc.gen.ramp[500].toLowerCase();
        const safeName = gc.name.toLowerCase().replace(/\s+/g, '-');

        // Only insert if missing, global colors are considered canonical.
        if (!canonicalSeeds.has(seedStr)) {
            canonicalSeeds.set(seedStr, safeName);
            // Non-core global colors aren't currently automatically exported to CSS globally, 
            // but if a theme needs them, they will be referenced!
            if (!['neutral', 'success', 'error', 'critical'].includes(safeName)) {
                colors[safeName] = toTokenRamp(gc.gen.ramp);
            }
        }
    });

    // Ensure core colors are registered in case globalColors lacked them
    if (!canonicalSeeds.has(neutralGen.ramp[500].toLowerCase())) canonicalSeeds.set(neutralGen.ramp[500].toLowerCase(), 'neutral');
    if (!canonicalSeeds.has(successGen.ramp[500].toLowerCase())) canonicalSeeds.set(successGen.ramp[500].toLowerCase(), 'success');
    if (!canonicalSeeds.has(errorGen.ramp[500].toLowerCase())) canonicalSeeds.set(errorGen.ramp[500].toLowerCase(), 'error');

    // Now map every single color the user defined dynamically!
    themeColors.forEach((config) => {
        const cName = config.name; // user-defined string like "master" or "brand"
        const gen = config.gen;
        const seedStr = gen.ramp[500].toLowerCase();

        let aliasName = cName;

        // If this seed is identical to a canonical global color, alias to it instead of duplicating the primitive tokens.
        if (canonicalSeeds.has(seedStr)) {
            aliasName = canonicalSeeds.get(seedStr)!;
        } else {
            // First time seeing this generated primitive ramp, add it to export and register it as canonical.
            canonicalSeeds.set(seedStr, cName);
            colors[cName] = toTokenRamp(gen.ramp);
        }

        const rest = gen.closestStep;

        // --- LIGHT THEME TOKENS ---
        const preferredLightStep = Math.max(rest, 200) as import('./palette-generator').ColorStep;
        const lightBaseAccess = getAccessibleBaseStep(gen.ramp, preferredLightStep);
        const lightBaseStep = lightBaseAccess.bgStep;
        const hover = getOffsetStep(lightBaseStep, lightBaseStep >= 600 ? -1 : 1);
        const press = getOffsetStep(lightBaseStep, lightBaseStep >= 600 ? -2 : 2);

        theme.background[cName] = { $value: `{color.${aliasName}.25}`, $type: "color" };

        theme.surface[cName] = {
            subtle: { $value: `color-mix(in srgb, {color.${aliasName}.${lightBaseStep}} 10%, transparent)`, $type: "color" },
            default: { $value: `{color.${aliasName}.50}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.100}`, $type: "color" },
            active: { $value: `{color.${aliasName}.200}`, $type: "color" },
        };

        theme.border[cName] = {
            default: { $value: `{color.${aliasName}.300}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.400}`, $type: "color" },
        };

        theme.base = theme.base || {};
        theme.base[cName] = {
            default: { $value: `{color.${aliasName}.${lightBaseStep}}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.${hover}}`, $type: "color" },
            active: { $value: `{color.${aliasName}.${press}}`, $type: "color" },
        };

        theme.text[cName] = {
            default: { $value: `{color.${aliasName}.600}`, $type: "color" },
            contrast: { $value: lightBaseAccess.textToken, $type: "color" }
        };

        theme.icon[cName] = {
            default: { $value: `{color.text.${cName}.default}`, $type: "color" },
            contrast: { $value: `{color.text.${cName}.contrast}`, $type: "color" },
        };

        // --- DARK THEME TOKENS ---
        const darkBaseAccess = getAccessibleBaseStep(gen.ramp, 300);
        const darkBaseStep = darkBaseAccess.bgStep;
        const darkHover = getOffsetStep(darkBaseStep, -1);
        const darkPress = getOffsetStep(darkBaseStep, -2);
        darkTheme.background[cName] = { $value: `{color.${aliasName}.900}`, $type: "color" };

        darkTheme.surface[cName] = {
            subtle: { $value: `color-mix(in srgb, {color.${aliasName}.${darkBaseStep}} 15%, transparent)`, $type: "color" },
            default: { $value: `{color.${aliasName}.900}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.800}`, $type: "color" },
            active: { $value: `{color.${aliasName}.700}`, $type: "color" },
        };

        darkTheme.border[cName] = {
            default: { $value: `{color.${aliasName}.500}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.400}`, $type: "color" },
        };

        darkTheme.base = darkTheme.base || {};
        darkTheme.base[cName] = {
            default: { $value: `{color.${aliasName}.${darkBaseStep}}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.${darkHover}}`, $type: "color" },
            active: { $value: `{color.${aliasName}.${darkPress}}`, $type: "color" },
        };

        // Dark text contrast logic
        darkTheme.text[cName] = {
            default: { $value: `{color.${aliasName}.300}`, $type: "color" },
            contrast: { $value: darkBaseAccess.textToken, $type: "color" },
        };

        darkTheme.icon[cName] = {
            default: { $value: `{darkTheme.text.${cName}.default}`, $type: "color" },
            contrast: { $value: `{darkTheme.text.${cName}.contrast}`, $type: "color" },
        };
    });

    // Automatically generate severity-level semantic tokens for ANY global color the user has
    // that wasn't already mapped as an interactive Theme Color (or core success/error).
    globalColors.forEach((gc) => {
        const safeName = gc.name.toLowerCase().replace(/\s+/g, '-');

        // Skip if this is a reserved core color, or if the interactive theme loop above already seeded it.
        // We check against the dynamic keys (successKey, errorKey) in case the user renamed them.
        if (['white', 'black', 'neutral', successKey, errorKey, 'critical'].includes(safeName) || theme.surface[safeName]) {
            return;
        }

        const gen = gc.gen;
        const aliasName = safeName; // We guaranteed global colors map their aliases accurately earlier

        // Use generic step offsets for severity semantic mapping
        const rest = gen.closestStep;

        const lightBaseAccess = getAccessibleBaseStep(gen.ramp, rest);
        const lightBaseStep = lightBaseAccess.bgStep;
        const hover = getOffsetStep(lightBaseStep, lightBaseStep >= 600 ? -1 : 1);
        const press = getOffsetStep(lightBaseStep, lightBaseStep >= 600 ? -2 : 2);

        // --- LIGHT THEME TOKENS ---
        theme.background[safeName] = { $value: `{color.${aliasName}.25}`, $type: "color" };

        theme.surface[safeName] = {
            default: { $value: `{color.${aliasName}.50}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.100}`, $type: "color" },
            active: { $value: `{color.${aliasName}.200}`, $type: "color" },
        };

        theme.border[safeName] = {
            default: { $value: `{color.${aliasName}.300}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.400}`, $type: "color" },
        };

        theme.base[safeName] = {
            default: { $value: `{color.${aliasName}.${lightBaseStep}}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.${hover}}`, $type: "color" },
            active: { $value: `{color.${aliasName}.${press}}`, $type: "color" },
        };

        theme.text[safeName] = {
            default: { $value: `{color.${aliasName}.600}`, $type: "color" },
            contrast: { $value: lightBaseAccess.textToken, $type: "color" },
        };

        theme.icon[safeName] = {
            default: { $value: `{color.text.${safeName}.default}`, $type: "color" },
            contrast: { $value: `{color.text.${safeName}.contrast}`, $type: "color" },
        };

        // --- DARK THEME TOKENS ---
        const darkBaseAccess = getAccessibleBaseStep(gen.ramp, 300);
        const darkBaseStep = darkBaseAccess.bgStep;
        const darkHover = getOffsetStep(darkBaseStep, -1);
        const darkPress = getOffsetStep(darkBaseStep, -2);

        darkTheme.background[safeName] = { $value: `{color.${aliasName}.900}`, $type: "color" };

        darkTheme.surface[safeName] = {
            default: { $value: `{color.${aliasName}.900}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.800}`, $type: "color" },
            active: { $value: `{color.${aliasName}.700}`, $type: "color" },
        };

        darkTheme.border[safeName] = {
            default: { $value: `{color.${aliasName}.500}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.400}`, $type: "color" },
        };

        darkTheme.base[safeName] = {
            default: { $value: `{color.${aliasName}.${darkBaseStep}}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.${darkHover}}`, $type: "color" },
            active: { $value: `{color.${aliasName}.${darkPress}}`, $type: "color" },
        };

        darkTheme.text[safeName] = {
            default: { $value: `{color.${aliasName}.300}`, $type: "color" },
            contrast: { $value: darkBaseAccess.textToken, $type: "color" },
        };

        darkTheme.icon[safeName] = {
            default: { $value: `{color.text.${safeName}.default}`, $type: "color" },
            contrast: { $value: `{color.text.${safeName}.contrast}`, $type: "color" },
        };
    });

    // --- APPLY PRIMITIVE OVERRIDES ---
    if (primitiveOverrides) {
        for (const [path, overrideHex] of Object.entries(primitiveOverrides)) {
            const [colorName, step] = path.split('.');
            if (colors[colorName] && colors[colorName][step]) {
                colors[colorName][step].$value = overrideHex;
            }
        }
    }

    const payload: ThemeTokensPayload = {
        color: colors,
        theme,
        darkTheme,
        geometry: {}
    };

    // --- GEOMETRY TOKENS ---
    const radiusBase = geometryConfig?.radiusBase ?? 4;
    const includeRadius = geometryConfig?.includeRadius ?? true;
    const includeBorders = geometryConfig?.includeBorders ?? true;
    const borderWidthType = geometryConfig?.borderWidth || 'small';

    const borderWidths: Record<string, string> = {
        'small': '1px',
        'medium': '2px',
        'large': '3px'
    };

    // The user's requested non-linear multiplier scale for base 4px: 0, 4, 8, 16, 24, 36, 56, 100
    // These correspond to multipliers of: 0, 1, 2, 4, 6, 9, 14, 25
    const radiusMultipliers = [0, 1, 2, 4, 6, 9, 14, 25];

    payload.geometry = {
        radius: {
            '0': { $value: includeRadius ? `${radiusBase * radiusMultipliers[0]}px` : '0px', $type: "dimension" },
            '1': { $value: includeRadius ? `${radiusBase * radiusMultipliers[1]}px` : '0px', $type: "dimension" },
            '2': { $value: includeRadius ? `${radiusBase * radiusMultipliers[2]}px` : '0px', $type: "dimension" },
            '3': { $value: includeRadius ? `${radiusBase * radiusMultipliers[3]}px` : '0px', $type: "dimension" },
            '4': { $value: includeRadius ? `${radiusBase * radiusMultipliers[4]}px` : '0px', $type: "dimension" },
            '5': { $value: includeRadius ? `${radiusBase * radiusMultipliers[5]}px` : '0px', $type: "dimension" },
            '6': { $value: includeRadius ? `${radiusBase * radiusMultipliers[6]}px` : '0px', $type: "dimension" },
            '7': { $value: includeRadius ? `${radiusBase * radiusMultipliers[7]}px` : '0px', $type: "dimension" },
            'full': { $value: includeRadius ? `9999px` : '0px', $type: "dimension" },
            'none': { $value: '{geometry.radius.0}', $type: "dimension" },
            'sm': { $value: '{geometry.radius.1}', $type: "dimension" },
            'md': { $value: '{geometry.radius.2}', $type: "dimension" },
            'lg': { $value: '{geometry.radius.3}', $type: "dimension" }
        },
        borderWidth: {
            default: { $value: includeBorders ? borderWidths[borderWidthType] : '0px', $type: "dimension" },
            base: { $value: '{geometry.borderWidth.default}', $type: "dimension" }
        }
    };

    if (semanticOverrides) {
        Object.entries(semanticOverrides).forEach(([path, value]) => {
            if (!value) return;

            // Route light mode overrides safely into the 'theme' object if they lack a prefix
            let fullPath = path;
            if (!path.startsWith('theme.') && !path.startsWith('darkTheme.')) {
                fullPath = `theme.${path}`;
            }

            const parts = fullPath.split('.');
            let current = payload as any;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            if (current[parts[parts.length - 1]]) {
                current[parts[parts.length - 1]].$value = value;
                current[parts[parts.length - 1]].$type = "color";
            } else {
                current[parts[parts.length - 1]] = { $value: value, $type: "color" };
            }
        });
    }

    return payload;
}
