import { ColorStep, COLOR_STEPS, getAccessibleForeground, GeneratedRamp, getColorName, generateAlphaRamp, AlphaStep, getClosestLuminosityStep, generateRamp } from './palette-generator';

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

export interface NamedColorRamp {
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

    const neutralRamp = globalColors.find(c => c.name.toLowerCase() === 'neutral');
    const successRamp = globalColors.find(c => c.name.toLowerCase() === 'success');
    const errorRamp = globalColors.find(c => c.name.toLowerCase() === 'error' || c.name.toLowerCase() === 'critical');

    // Extract default fallbacks if somehow missing
    const fallbackNeutral = generateRamp('#64748b');
    const fallbackSuccess = generateRamp('#22c55e');
    const fallbackError = generateRamp('#ef4444');

    const neutralGen = neutralRamp ? neutralRamp.gen : fallbackNeutral;
    const successGen = successRamp ? successRamp.gen : fallbackSuccess;
    const errorGen = errorRamp ? errorRamp.gen : fallbackError;

    const colors: Record<string, any> = {
        white: toAlphaTokenRamp(generateAlphaRamp('#ffffff')),
        black: toAlphaTokenRamp(generateAlphaRamp('#000000')),
        neutral: toTokenRamp(neutralGen.ramp),
        success: toTokenRamp(successGen.ramp),
        error: toTokenRamp(errorGen.ramp),
    };

    // Initialize root objects
    const theme: Record<string, any> = {
        background: {
            default: {},
            success: { $value: `{color.success.25}`, $type: "color" },
            error: { $value: `{color.error.25}`, $type: "color" }
        },
        surface: {
            default: { $value: `{color.white.100}`, $type: "color" },
            disabled: { $value: `{color.neutral.50}`, $type: "color" },
            success: {
                default: { $value: `{color.success.50}`, $type: "color" },
                hover: { $value: `{color.success.100}`, $type: "color" },
                active: { $value: `{color.success.200}`, $type: "color" }
            },
            error: {
                default: { $value: `{color.error.50}`, $type: "color" },
                hover: { $value: `{color.error.100}`, $type: "color" },
                active: { $value: `{color.error.200}`, $type: "color" }
            }
        },
        border: {
            subtle: { $value: `{color.neutral.200}`, $type: "color" },
            default: { $value: `{color.neutral.300}`, $type: "color" },
            disabled: { $value: `{color.neutral.200}`, $type: "color" },
            focus: {},
            success: {
                default: { $value: `{color.success.300}`, $type: "color" },
                hover: { $value: `{color.success.400}`, $type: "color" }
            },
            error: {
                default: { $value: `{color.error.300}`, $type: "color" },
                hover: { $value: `{color.error.400}`, $type: "color" }
            }
        },
        base: {
            disabled: { $value: `{color.neutral.200}`, $type: "color" },
            success: {
                default: { $value: `{color.success.500}`, $type: "color" },
                hover: { $value: `{color.success.600}`, $type: "color" },
                active: { $value: `{color.success.700}`, $type: "color" },
            },
            error: {
                default: { $value: `{color.error.500}`, $type: "color" },
                hover: { $value: `{color.error.600}`, $type: "color" },
                active: { $value: `{color.error.700}`, $type: "color" },
            }
        },
        text: {
            default: { $value: `{color.neutral.950}`, $type: "color" },
            subtle: { $value: `{color.neutral.500}`, $type: "color" },
            disabled: { $value: `{color.neutral.400}`, $type: "color" },
            success: {
                default: { $value: `{color.success.600}`, $type: "color" },
                contrast: { $value: `{color.white.100}`, $type: "color" }
            },
            error: {
                default: { $value: `{color.error.600}`, $type: "color" },
                contrast: { $value: `{color.white.100}`, $type: "color" }
            }
        },
        icon: {
            default: { $value: `{theme.text.default}`, $type: "color" },
            subtle: { $value: `{theme.text.subtle}`, $type: "color" },
            success: {
                default: { $value: `{theme.text.success.default}`, $type: "color" },
                contrast: { $value: `{theme.text.success.contrast}`, $type: "color" }
            },
            error: {
                default: { $value: `{theme.text.error.default}`, $type: "color" },
                contrast: { $value: `{theme.text.error.contrast}`, $type: "color" }
            }
        }
    };

    const darkTheme: Record<string, any> = {
        background: {
            default: {},
            success: { $value: `{color.success.900}`, $type: "color" },
            error: { $value: `{color.error.900}`, $type: "color" }
        },
        surface: {
            default: { $value: `{color.neutral.900}`, $type: "color" },
            disabled: { $value: `{color.neutral.900}`, $type: "color" },
            success: {
                default: { $value: `{color.success.900}`, $type: "color" },
                hover: { $value: `{color.success.800}`, $type: "color" },
                active: { $value: `{color.success.700}`, $type: "color" }
            },
            error: {
                default: { $value: `{color.error.900}`, $type: "color" },
                hover: { $value: `{color.error.800}`, $type: "color" },
                active: { $value: `{color.error.700}`, $type: "color" }
            }
        },
        border: {
            subtle: { $value: `{color.neutral.700}`, $type: "color" },
            default: { $value: `{color.neutral.500}`, $type: "color" },
            disabled: { $value: `{color.neutral.700}`, $type: "color" },
            focus: {},
            success: {
                default: { $value: `{color.success.500}`, $type: "color" },
                hover: { $value: `{color.success.400}`, $type: "color" }
            },
            error: {
                default: { $value: `{color.error.500}`, $type: "color" },
                hover: { $value: `{color.error.400}`, $type: "color" }
            }
        },
        base: {
            disabled: { $value: `{color.neutral.800}`, $type: "color" },
            success: {
                default: { $value: `{color.success.400}`, $type: "color" },
                hover: { $value: `{color.success.300}`, $type: "color" },
                active: { $value: `{color.success.200}`, $type: "color" },
            },
            error: {
                default: { $value: `{color.error.400}`, $type: "color" },
                hover: { $value: `{color.error.300}`, $type: "color" },
                active: { $value: `{color.error.200}`, $type: "color" },
            }
        },
        text: {
            default: { $value: `{color.neutral.50}`, $type: "color" },
            subtle: { $value: `{color.neutral.400}`, $type: "color" },
            disabled: { $value: `{color.neutral.500}`, $type: "color" },
            success: {
                default: { $value: `{color.success.400}`, $type: "color" },
                contrast: { $value: `{color.white.100}`, $type: "color" }
            },
            error: {
                default: { $value: `{color.error.400}`, $type: "color" },
                contrast: { $value: `{color.white.100}`, $type: "color" }
            }
        },
        icon: {
            default: { $value: `{darkTheme.text.default}`, $type: "color" },
            subtle: { $value: `{darkTheme.text.subtle}`, $type: "color" },
            success: {
                default: { $value: `{darkTheme.text.success.default}`, $type: "color" },
                contrast: { $value: `{darkTheme.text.success.contrast}`, $type: "color" }
            },
            error: {
                default: { $value: `{darkTheme.text.error.default}`, $type: "color" },
                contrast: { $value: `{darkTheme.text.error.contrast}`, $type: "color" }
            }
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
        const hover = getOffsetStep(rest, rest >= 600 ? -1 : 1);
        const press = getOffsetStep(rest, rest >= 600 ? -2 : 2);

        // --- LIGHT THEME TOKENS ---
        theme.background[cName] = { $value: `{color.${aliasName}.25}`, $type: "color" };

        theme.surface[cName] = {
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
            default: { $value: `{color.${aliasName}.${rest}}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.${hover}}`, $type: "color" },
            active: { $value: `{color.${aliasName}.${press}}`, $type: "color" },
        };

        theme.text[cName] = {
            default: { $value: `{color.${aliasName}.600}`, $type: "color" },
            contrast: { $value: `{color.${aliasName}.${getAccessibleForeground(gen.ramp, gen.ramp[rest])}}`, $type: "color" },
        };

        theme.icon[cName] = {
            default: { $value: `{theme.text.${cName}.default}`, $type: "color" },
            contrast: { $value: `{theme.text.${cName}.contrast}`, $type: "color" },
        };

        // --- DARK THEME TOKENS ---
        darkTheme.background[cName] = { $value: `{color.${aliasName}.900}`, $type: "color" };

        darkTheme.surface[cName] = {
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
            default: { $value: `{color.${aliasName}.300}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.200}`, $type: "color" },
            active: { $value: `{color.${aliasName}.100}`, $type: "color" },
        };

        // Dark text contrast logic
        darkTheme.text[cName] = {
            default: { $value: `{color.${aliasName}.300}`, $type: "color" },
            contrast: { $value: `{color.${aliasName}.${getAccessibleForeground(gen.ramp, gen.ramp[300])}}`, $type: "color" },
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
        if (['white', 'black', 'neutral', 'success', 'error', 'critical'].includes(safeName) || theme.surface[safeName]) {
            return;
        }

        const gen = gc.gen;
        const aliasName = safeName; // We guaranteed global colors map their aliases accurately earlier

        // Use generic step offsets for severity semantic mapping
        const rest = gen.closestStep;

        // --- LIGHT THEME TOKENS ---
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
            default: { $value: `{color.${aliasName}.500}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.600}`, $type: "color" },
            active: { $value: `{color.${aliasName}.700}`, $type: "color" },
        };

        theme.text[safeName] = {
            default: { $value: `{color.${aliasName}.600}`, $type: "color" },
            contrast: { $value: `{color.${aliasName}.${getAccessibleForeground(gen.ramp, gen.ramp[600])}}`, $type: "color" },
        };

        theme.icon[safeName] = {
            default: { $value: `{theme.text.${safeName}.default}`, $type: "color" },
            contrast: { $value: `{theme.text.${safeName}.contrast}`, $type: "color" },
        };

        // --- DARK THEME TOKENS ---
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
            default: { $value: `{color.${aliasName}.300}`, $type: "color" },
            hover: { $value: `{color.${aliasName}.200}`, $type: "color" },
            active: { $value: `{color.${aliasName}.100}`, $type: "color" },
        };

        darkTheme.text[safeName] = {
            default: { $value: `{color.${aliasName}.300}`, $type: "color" },
            contrast: { $value: `{color.${aliasName}.${getAccessibleForeground(gen.ramp, gen.ramp[300])}}`, $type: "color" },
        };

        darkTheme.icon[safeName] = {
            default: { $value: `{darkTheme.text.${safeName}.default}`, $type: "color" },
            contrast: { $value: `{darkTheme.text.${safeName}.contrast}`, $type: "color" },
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
