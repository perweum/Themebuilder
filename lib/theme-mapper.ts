import {
  ColorStep,
  COLOR_STEPS,
  getAccessibleForeground,
  GeneratedRamp,
  getColorName,
  generateAlphaRamp,
  AlphaStep,
  getClosestLuminosityStep,
  generateRamp,
  getBestTextForBg,
  getAccessibleBaseStep,
} from "./palette-generator";
import { wcagContrast } from "culori";

export interface Token<T = string> {
  $value: T;
  $type?: string;
}

export type ColorRampTokens = Record<ColorStep, Token<string>>;
export type AlphaRampTokens = Record<AlphaStep, Token<string>>;

export interface ThemeTokensPayload {
  color: Record<string, any>;
  theme: Record<string, any>; // light semantic tokens — becomes "light" in theme file export
  darkTheme: Record<string, any>; // dark semantic tokens  — becomes "dark" in theme file export
  geometry: Record<string, any>;
  typography: Record<string, any>;
}

// Helper to convert a raw ramp (keys 25-950) into Token format
function toTokenRamp(ramp: Record<ColorStep, string>): ColorRampTokens {
  const tokens = {} as ColorRampTokens;
  for (const stepStr in ramp) {
    const key = Number(stepStr) as ColorStep;
    tokens[key] = {
      $value: ramp[key],
      $type: "color",
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
      $type: "color",
    };
  }
  return tokens;
}

export interface NamedColorRamp {
  id?: string; // Stable ID for core tracking
  name: string; // The actual mapped name, like 'master' or 'secondary'
  gen: GeneratedRamp;
}

function getOffsetStep(base: ColorStep, offset: number): ColorStep {
  const idx = COLOR_STEPS.indexOf(base);
  const newIdx = Math.max(0, Math.min(COLOR_STEPS.length - 1, idx + offset));
  return COLOR_STEPS[newIdx];
}

/**
 * Maps generated ramps to the semantic token structure, aligned with Token Sync's
 * Primitives → Themes → Semantic three-layer architecture.
 *
 * Output:
 *   payload.color     → primitives/color.json  { color: {...} }
 *   payload.theme     → semantic/themes/{name}.json "light" section
 *   payload.darkTheme → semantic/themes/{name}.json "dark" section
 *   payload.geometry  → primitives/geometry.json { geometry: {...} }
 *   payload.typography → primitives/typography.json { typography: {...} }
 *
 * Icon tokens in theme/darkTheme use {light.text.*}/{dark.text.*} refs, matching
 * the Token Sync within-file reference format. ThemeScope's resolveAlias strips the
 * scheme prefix so these resolve correctly in the live preview.
 */
export function mapTheme(
  themeColors: NamedColorRamp[],
  globalColors: NamedColorRamp[],
  semanticOverrides?: Record<string, string>,
  primitiveOverrides?: Record<string, string>,
  geometryConfig?: {
    radiusBase: number;
    includeRadius: boolean;
    includeBorders: boolean;
    borderWidth: "small" | "medium" | "large";
    sizeBase?: number;
    includeShadow?: boolean;
  },
  fontFamily?: string,
): ThemeTokensPayload {
  // Geometry config — needed early for conditional skeleton construction
  const includeShadow = geometryConfig?.includeShadow !== false;

  // Lookup core semantics by stable ID
  const neutralRamp = globalColors.find((c) => c.id === "neutral");
  const successRamp = globalColors.find((c) => c.id === "success");
  const errorRamp = globalColors.find((c) => c.id === "error" || c.id === "critical");

  const fallbackNeutral = generateRamp("#64748b");
  const fallbackSuccess = generateRamp("#22c55e");
  const fallbackError = generateRamp("#ef4444");

  const neutralGen = neutralRamp ? neutralRamp.gen : fallbackNeutral;
  const successGen = successRamp ? successRamp.gen : fallbackSuccess;
  const errorGen = errorRamp ? errorRamp.gen : fallbackError;

  const neutralKey = neutralRamp ? neutralRamp.name.toLowerCase().replace(/\s+/g, "-") : "neutral";
  const successKey = successRamp ? successRamp.name.toLowerCase().replace(/\s+/g, "-") : "success";
  const errorKey = errorRamp ? errorRamp.name.toLowerCase().replace(/\s+/g, "-") : "error";

  // ---------------------------------------------------------------------------
  // Primitive colour tokens
  // ---------------------------------------------------------------------------

  const colors: Record<string, any> = {
    white: toAlphaTokenRamp(generateAlphaRamp("#ffffff")),
    black: toAlphaTokenRamp(generateAlphaRamp("#000000")),
    [neutralKey]: toTokenRamp(neutralGen.ramp),
    [successKey]: toTokenRamp(successGen.ramp),
    [errorKey]: toTokenRamp(errorGen.ramp),
  };

  // ---------------------------------------------------------------------------
  // Light semantic token skeleton
  // Ref format: {light.text.X} for within-theme refs (icon → text aliases).
  // Primitive refs: {color.paletteName.step} — become cross-collection aliases in Figma.
  // ---------------------------------------------------------------------------

  const theme: Record<string, any> = {
    background: {
      default: {}, // set below
      subtle: {}, // set below
      [successKey]: { $value: `{color.${successKey}.25}`, $type: "color" },
      [errorKey]: { $value: `{color.${errorKey}.25}`, $type: "color" },
    },
    surface: {
      default: { $value: `{color.white.950}`, $type: "color" },
      raised: { $value: `{color.white.950}`, $type: "color" },
      overlay: { $value: `{color.white.950}`, $type: "color" },
      disabled: { $value: `{color.${neutralKey}.50}`, $type: "color" },
      [successKey]: {
        default: { $value: `{color.${successKey}.50}`, $type: "color" },
        hover: { $value: `{color.${successKey}.100}`, $type: "color" },
        active: { $value: `{color.${successKey}.200}`, $type: "color" },
      },
      [errorKey]: {
        default: { $value: `{color.${errorKey}.50}`, $type: "color" },
        hover: { $value: `{color.${errorKey}.100}`, $type: "color" },
        active: { $value: `{color.${errorKey}.200}`, $type: "color" },
      },
      neutral: {
        default: { $value: `{color.${neutralKey}.50}`, $type: "color" },
        hover: { $value: `{color.${neutralKey}.100}`, $type: "color" },
        active: { $value: `{color.${neutralKey}.200}`, $type: "color" },
      },
    },
    border: {
      subtle: { $value: `{color.${neutralKey}.100}`, $type: "color" },
      default: { $value: `{color.${neutralKey}.200}`, $type: "color" },
      strong: { $value: `{color.${neutralKey}.400}`, $type: "color" },
      disabled: { $value: `{color.${neutralKey}.200}`, $type: "color" },
      focus: {}, // set below
      [successKey]: {
        default: { $value: `{color.${successKey}.300}`, $type: "color" },
        hover: { $value: `{color.${successKey}.400}`, $type: "color" },
      },
      [errorKey]: {
        default: { $value: `{color.${errorKey}.300}`, $type: "color" },
        hover: { $value: `{color.${errorKey}.400}`, $type: "color" },
      },
      neutral: {
        default: { $value: `{color.${neutralKey}.200}`, $type: "color" },
        hover: { $value: `{color.${neutralKey}.400}`, $type: "color" },
      },
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
      },
      neutral: {
        default: { $value: `{color.${neutralKey}.600}`, $type: "color" },
        hover: { $value: `{color.${neutralKey}.700}`, $type: "color" },
        active: { $value: `{color.${neutralKey}.800}`, $type: "color" },
      },
    },
    text: {
      default: { $value: `{color.${neutralKey}.950}`, $type: "color" },
      subtle: { $value: `{color.${neutralKey}.600}`, $type: "color" },
      disabled: { $value: `{color.${neutralKey}.400}`, $type: "color" },
      inverse: { $value: `{color.white.950}`, $type: "color" },
      [successKey]: {
        default: { $value: `{color.${successKey}.600}`, $type: "color" },
        contrast: { $value: `{color.white.950}`, $type: "color" },
      },
      [errorKey]: {
        default: { $value: `{color.${errorKey}.600}`, $type: "color" },
        contrast: { $value: `{color.white.950}`, $type: "color" },
      },
      neutral: {
        default: { $value: `{color.${neutralKey}.600}`, $type: "color" },
        contrast: { $value: `{color.white.950}`, $type: "color" },
      },
    },
    icon: {
      default: { $value: `{light.text.default}`, $type: "color" },
      subtle: { $value: `{light.text.subtle}`, $type: "color" },
      disabled: { $value: `{light.text.disabled}`, $type: "color" },
      inverse: { $value: `{light.text.inverse}`, $type: "color" },
      [successKey]: {
        default: { $value: `{light.text.${successKey}.default}`, $type: "color" },
        contrast: { $value: `{light.text.${successKey}.contrast}`, $type: "color" },
      },
      [errorKey]: {
        default: { $value: `{light.text.${errorKey}.default}`, $type: "color" },
        contrast: { $value: `{light.text.${errorKey}.contrast}`, $type: "color" },
      },
      neutral: {
        default: { $value: `{light.text.neutral.default}`, $type: "color" },
        contrast: { $value: `{light.text.neutral.contrast}`, $type: "color" },
      },
    },
    elevation: includeShadow
      ? {
          "1": { $value: `0 1px 2px {color.black.50}, 0 1px 3px {color.black.100}`, $type: "shadow" },
          "2": { $value: `0 4px 6px {color.black.100}, 0 2px 4px {color.black.50}`, $type: "shadow" },
          "3": { $value: `0 10px 15px {color.black.100}, 0 4px 6px {color.black.50}`, $type: "shadow" },
          "4": { $value: `0 20px 25px {color.black.100}, 0 8px 10px {color.black.50}`, $type: "shadow" },
        }
      : {
          "1": { $value: "none", $type: "shadow" },
          "2": { $value: "none", $type: "shadow" },
          "3": { $value: "none", $type: "shadow" },
          "4": { $value: "none", $type: "shadow" },
        },
    overlay: {
      default: { $value: `{color.black.300}`, $type: "color" },
    },
  };

  // ---------------------------------------------------------------------------
  // Dark semantic token skeleton
  // ---------------------------------------------------------------------------

  const darkTheme: Record<string, any> = {
    background: {
      default: {}, // set below
      subtle: {}, // set below
      [successKey]: { $value: `{color.${successKey}.900}`, $type: "color" },
      [errorKey]: { $value: `{color.${errorKey}.900}`, $type: "color" },
    },
    surface: {
      default: { $value: `{color.${neutralKey}.900}`, $type: "color" },
      raised: { $value: `{color.${neutralKey}.800}`, $type: "color" },
      overlay: { $value: `{color.${neutralKey}.800}`, $type: "color" },
      disabled: { $value: `{color.${neutralKey}.800}`, $type: "color" },
      [successKey]: {
        default: { $value: `{color.${successKey}.900}`, $type: "color" },
        hover: { $value: `{color.${successKey}.800}`, $type: "color" },
        active: { $value: `{color.${successKey}.700}`, $type: "color" },
      },
      [errorKey]: {
        default: { $value: `{color.${errorKey}.900}`, $type: "color" },
        hover: { $value: `{color.${errorKey}.800}`, $type: "color" },
        active: { $value: `{color.${errorKey}.700}`, $type: "color" },
      },
      neutral: {
        default: { $value: `{color.${neutralKey}.800}`, $type: "color" },
        hover: { $value: `{color.${neutralKey}.700}`, $type: "color" },
        active: { $value: `{color.${neutralKey}.600}`, $type: "color" },
      },
    },
    border: {
      subtle: { $value: `{color.${neutralKey}.800}`, $type: "color" },
      default: { $value: `{color.${neutralKey}.700}`, $type: "color" },
      strong: { $value: `{color.${neutralKey}.500}`, $type: "color" },
      disabled: { $value: `{color.${neutralKey}.700}`, $type: "color" },
      focus: {}, // set below
      [successKey]: {
        default: { $value: `{color.${successKey}.500}`, $type: "color" },
        hover: { $value: `{color.${successKey}.400}`, $type: "color" },
      },
      [errorKey]: {
        default: { $value: `{color.${errorKey}.500}`, $type: "color" },
        hover: { $value: `{color.${errorKey}.400}`, $type: "color" },
      },
      neutral: {
        default: { $value: `{color.${neutralKey}.700}`, $type: "color" },
        hover: { $value: `{color.${neutralKey}.500}`, $type: "color" },
      },
    },
    base: {
      disabled: { $value: `{color.${neutralKey}.700}`, $type: "color" },
      [successKey]: {
        default: { $value: `{color.${successKey}.400}`, $type: "color" },
        hover: { $value: `{color.${successKey}.300}`, $type: "color" },
        active: { $value: `{color.${successKey}.200}`, $type: "color" },
      },
      [errorKey]: {
        default: { $value: `{color.${errorKey}.400}`, $type: "color" },
        hover: { $value: `{color.${errorKey}.300}`, $type: "color" },
        active: { $value: `{color.${errorKey}.200}`, $type: "color" },
      },
      neutral: {
        default: { $value: `{color.${neutralKey}.500}`, $type: "color" },
        hover: { $value: `{color.${neutralKey}.400}`, $type: "color" },
        active: { $value: `{color.${neutralKey}.300}`, $type: "color" },
      },
    },
    text: {
      default: { $value: `{color.${neutralKey}.50}`, $type: "color" },
      subtle: { $value: `{color.${neutralKey}.400}`, $type: "color" },
      disabled: { $value: `{color.${neutralKey}.600}`, $type: "color" },
      inverse: { $value: `{color.${neutralKey}.950}`, $type: "color" },
      [successKey]: {
        default: { $value: `{color.${successKey}.400}`, $type: "color" },
        contrast: { $value: `{color.${neutralKey}.950}`, $type: "color" },
      },
      [errorKey]: {
        default: { $value: `{color.${errorKey}.400}`, $type: "color" },
        contrast: { $value: `{color.${neutralKey}.950}`, $type: "color" },
      },
      neutral: {
        default: { $value: `{color.${neutralKey}.400}`, $type: "color" },
        contrast: { $value: `{color.${neutralKey}.950}`, $type: "color" },
      },
    },
    icon: {
      default: { $value: `{dark.text.default}`, $type: "color" },
      subtle: { $value: `{dark.text.subtle}`, $type: "color" },
      disabled: { $value: `{dark.text.disabled}`, $type: "color" },
      inverse: { $value: `{dark.text.inverse}`, $type: "color" },
      [successKey]: {
        default: { $value: `{dark.text.${successKey}.default}`, $type: "color" },
        contrast: { $value: `{dark.text.${successKey}.contrast}`, $type: "color" },
      },
      [errorKey]: {
        default: { $value: `{dark.text.${errorKey}.default}`, $type: "color" },
        contrast: { $value: `{dark.text.${errorKey}.contrast}`, $type: "color" },
      },
      neutral: {
        default: { $value: `{dark.text.neutral.default}`, $type: "color" },
        contrast: { $value: `{dark.text.neutral.contrast}`, $type: "color" },
      },
    },
    elevation: includeShadow
      ? {
          "1": { $value: `0 1px 2px {color.black.200}, 0 1px 3px {color.black.300}`, $type: "shadow" },
          "2": { $value: `0 4px 6px {color.black.300}, 0 2px 4px {color.black.200}`, $type: "shadow" },
          "3": { $value: `0 10px 15px {color.black.300}, 0 4px 6px {color.black.200}`, $type: "shadow" },
          "4": { $value: `0 20px 25px {color.black.300}, 0 8px 10px {color.black.200}`, $type: "shadow" },
        }
      : {
          "1": { $value: "none", $type: "shadow" },
          "2": { $value: "none", $type: "shadow" },
          "3": { $value: "none", $type: "shadow" },
          "4": { $value: "none", $type: "shadow" },
        },
    overlay: {
      default: { $value: `{color.black.300}`, $type: "color" },
    },
  };

  // ---------------------------------------------------------------------------
  // Static neutral background values (set after skeleton to use neutralKey)
  // ---------------------------------------------------------------------------

  theme.background.default = { $value: `{color.white.950}`, $type: "color" };
  theme.background.subtle = { $value: `{color.${neutralKey}.25}`, $type: "color" };
  darkTheme.background.default = { $value: `{color.${neutralKey}.950}`, $type: "color" };
  darkTheme.background.subtle = { $value: `{color.${neutralKey}.900}`, $type: "color" };

  // ---------------------------------------------------------------------------
  // Deduplication registry: prevents exporting identical primitive ramps.
  // ---------------------------------------------------------------------------

  const canonicalSeeds = new Map<string, string>();

  // Register all global colors as canonical
  globalColors.forEach((gc) => {
    const seedStr = gc.gen.ramp[500].toLowerCase();
    const safeName = gc.name.toLowerCase().replace(/\s+/g, "-");
    if (!canonicalSeeds.has(seedStr)) {
      canonicalSeeds.set(seedStr, safeName);
      if (!["neutral", "success", "error", "critical"].includes(safeName)) {
        colors[safeName] = toTokenRamp(gc.gen.ramp);
      }
    }
  });

  // Ensure core colors are registered even if globalColors omits them
  if (!canonicalSeeds.has(neutralGen.ramp[500].toLowerCase()))
    canonicalSeeds.set(neutralGen.ramp[500].toLowerCase(), "neutral");
  if (!canonicalSeeds.has(successGen.ramp[500].toLowerCase()))
    canonicalSeeds.set(successGen.ramp[500].toLowerCase(), "success");
  if (!canonicalSeeds.has(errorGen.ramp[500].toLowerCase()))
    canonicalSeeds.set(errorGen.ramp[500].toLowerCase(), "error");

  // Focus ring defaults to neutral until a primary brand color is found
  theme.border.focus = { $value: `{color.${neutralKey}.600}`, $type: "color" };
  darkTheme.border.focus = { $value: `{color.${neutralKey}.400}`, $type: "color" };

  // ---------------------------------------------------------------------------
  // Map each theme color (brand, accent, …)
  // ---------------------------------------------------------------------------

  themeColors.forEach((config) => {
    const cName = config.name;
    const gen = config.gen;
    const seedStr = gen.ramp[500].toLowerCase();

    let aliasName = cName;
    if (canonicalSeeds.has(seedStr)) {
      aliasName = canonicalSeeds.get(seedStr)!;
    } else {
      canonicalSeeds.set(seedStr, cName);
      colors[cName] = toTokenRamp(gen.ramp);
    }

    const rest = gen.closestStep;

    // ── Light ──────────────────────────────────────────────────────────────
    const preferredLightStep = Math.max(rest, 200) as ColorStep;
    const lightBaseAccess = getAccessibleBaseStep(gen.ramp, preferredLightStep);
    const lightBaseStep = lightBaseAccess.bgStep;
    const hover = getOffsetStep(lightBaseStep, lightBaseStep >= 600 ? -1 : 1);
    const press = getOffsetStep(lightBaseStep, lightBaseStep >= 600 ? -2 : 2);

    // First theme color overrides the focus ring
    if (themeColors.indexOf(config) === 0) {
      theme.border.focus = { $value: `{color.${aliasName}.600}`, $type: "color" };
      darkTheme.border.focus = { $value: `{color.${aliasName}.400}`, $type: "color" };
    }

    theme.background[cName] = { $value: `{color.${aliasName}.25}`, $type: "color" };
    theme.surface[cName] = {
      default: { $value: `{color.${aliasName}.50}`, $type: "color" },
      hover: { $value: `{color.${aliasName}.100}`, $type: "color" },
      active: { $value: `{color.${aliasName}.200}`, $type: "color" },
    };
    theme.border[cName] = {
      default: { $value: `{color.${aliasName}.200}`, $type: "color" },
      hover: { $value: `{color.${aliasName}.400}`, $type: "color" },
    };
    theme.base = theme.base || {};
    theme.base[cName] = {
      default: { $value: `{color.${aliasName}.${lightBaseStep}}`, $type: "color" },
      hover: { $value: `{color.${aliasName}.${hover}}`, $type: "color" },
      active: { $value: `{color.${aliasName}.${press}}`, $type: "color" },
    };
    theme.text[cName] = {
      default: { $value: `{color.${aliasName}.700}`, $type: "color" },
      contrast: { $value: lightBaseAccess.textToken, $type: "color" },
    };
    theme.icon[cName] = {
      default: { $value: `{light.text.${cName}.default}`, $type: "color" },
      contrast: { $value: `{light.text.${cName}.contrast}`, $type: "color" },
    };

    // ── Dark ───────────────────────────────────────────────────────────────
    const darkBaseAccess = getAccessibleBaseStep(gen.ramp, 300);
    const darkBaseStep = darkBaseAccess.bgStep;
    const darkHover = getOffsetStep(darkBaseStep, -1);
    const darkPress = getOffsetStep(darkBaseStep, -2);

    darkTheme.background[cName] = { $value: `{color.${aliasName}.950}`, $type: "color" };
    darkTheme.surface[cName] = {
      default: { $value: `{color.${aliasName}.900}`, $type: "color" },
      hover: { $value: `{color.${aliasName}.800}`, $type: "color" },
      active: { $value: `{color.${aliasName}.700}`, $type: "color" },
    };
    darkTheme.border[cName] = {
      default: { $value: `{color.${aliasName}.700}`, $type: "color" },
      hover: { $value: `{color.${aliasName}.500}`, $type: "color" },
    };
    darkTheme.base = darkTheme.base || {};
    darkTheme.base[cName] = {
      default: { $value: `{color.${aliasName}.${darkBaseStep}}`, $type: "color" },
      hover: { $value: `{color.${aliasName}.${darkHover}}`, $type: "color" },
      active: { $value: `{color.${aliasName}.${darkPress}}`, $type: "color" },
    };
    darkTheme.text[cName] = {
      default: { $value: `{color.${aliasName}.300}`, $type: "color" },
      contrast: { $value: darkBaseAccess.textToken, $type: "color" },
    };
    darkTheme.icon[cName] = {
      default: { $value: `{dark.text.${cName}.default}`, $type: "color" },
      contrast: { $value: `{dark.text.${cName}.contrast}`, $type: "color" },
    };
  });

  // ---------------------------------------------------------------------------
  // Severity-level semantic tokens for additional global colors (warning, info…)
  // ---------------------------------------------------------------------------

  globalColors.forEach((gc) => {
    const safeName = gc.name.toLowerCase().replace(/\s+/g, "-");

    // Skip reserved core colors and any already mapped by the theme loop
    if (
      ["white", "black", "neutral", successKey, errorKey, "critical"].includes(safeName) ||
      (theme.surface && theme.surface[safeName])
    ) {
      return;
    }

    const gen = gc.gen;
    const aliasName = safeName;
    const rest = gen.closestStep;

    const lightBaseAccess = getAccessibleBaseStep(gen.ramp, rest);
    const lightBaseStep = lightBaseAccess.bgStep;
    const hover = getOffsetStep(lightBaseStep, lightBaseStep >= 600 ? -1 : 1);
    const press = getOffsetStep(lightBaseStep, lightBaseStep >= 600 ? -2 : 2);

    // ── Light ──────────────────────────────────────────────────────────────
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
    // Severity icon tokens use direct primitive refs — they live in the semantic layer,
    // not the theme file, so {light.text.*} would be a dangling ref.
    theme.icon[safeName] = {
      default: { $value: theme.text[safeName].default.$value, $type: "color" },
      contrast: { $value: theme.text[safeName].contrast.$value, $type: "color" },
    };

    // ── Dark ───────────────────────────────────────────────────────────────
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
      default: { $value: darkTheme.text[safeName].default.$value, $type: "color" },
      contrast: { $value: darkTheme.text[safeName].contrast.$value, $type: "color" },
    };
  });

  // ---------------------------------------------------------------------------
  // Apply primitive overrides
  // ---------------------------------------------------------------------------

  if (primitiveOverrides) {
    for (const [path, overrideHex] of Object.entries(primitiveOverrides)) {
      const [colorName, step] = path.split(".");
      if (colors[colorName] && colors[colorName][step]) {
        colors[colorName][step].$value = overrideHex;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Build payload
  // ---------------------------------------------------------------------------

  const payload: ThemeTokensPayload = {
    color: colors,
    theme,
    darkTheme,
    geometry: {},
    typography: {},
  };

  // ---------------------------------------------------------------------------
  // Geometry tokens — aligned with Token Sync primitives/geometry.json
  // ---------------------------------------------------------------------------

  const radiusBase = geometryConfig?.radiusBase ?? 4;
  const sizeBase = geometryConfig?.sizeBase ?? 4;
  const borderAlias =
    geometryConfig?.borderWidth === "large"
      ? "thick"
      : geometryConfig?.borderWidth === "medium"
        ? "medium"
        : "thin";

  // Spacing scale: sizeBase px × step multipliers matching Token Sync
  const sizeSteps: Array<[string, number]> = [
    ["1", 1],
    ["2", 2],
    ["3", 3],
    ["4", 4],
    ["5", 5],
    ["6", 6],
    ["8", 8],
    ["10", 10],
    ["12", 12],
    ["14", 14],
    ["16", 16],
    ["20", 20],
    ["24", 24],
  ];

  payload.geometry = {
    size: Object.fromEntries(
      sizeSteps.map(([name, mult]) => [name, { $value: `${mult * sizeBase}px`, $type: "dimension" }]),
    ),
    radius: {
      none: { $value: "0px", $type: "dimension" },
      "1": { $value: `${radiusBase}px`, $type: "dimension" },
      "2": { $value: `${radiusBase * 2}px`, $type: "dimension" },
      "3": { $value: `${radiusBase * 3}px`, $type: "dimension" },
      "4": { $value: `${radiusBase * 4}px`, $type: "dimension" },
      "5": { $value: `${radiusBase * 6}px`, $type: "dimension" },
      "6": { $value: `${radiusBase * 8}px`, $type: "dimension" },
      full: { $value: "9999px", $type: "dimension" },
      // Semantic aliases kept for Themebuilder live preview (→ var(--geometry-radius-sm) etc.)
      sm: { $value: "{geometry.radius.1}", $type: "dimension" },
      md: { $value: "{geometry.radius.2}", $type: "dimension" },
      lg: { $value: "{geometry.radius.3}", $type: "dimension" },
    },
    borderWidth: {
      thin: { $value: "1px", $type: "dimension" },
      medium: { $value: "1.5px", $type: "dimension" },
      thick: { $value: "2px", $type: "dimension" },
      // Semantic alias kept for Themebuilder live preview (→ var(--geometry-borderWidth-default))
      default: { $value: `{geometry.borderWidth.${borderAlias}}`, $type: "dimension" },
    },
  };

  // ---------------------------------------------------------------------------
  // Typography tokens — aligned with Token Sync primitives/typography.json
  // ---------------------------------------------------------------------------

  const primaryFont = fontFamily || "Inter";

  payload.typography = {
    fontFamily: {
      sans: { $value: primaryFont, $type: "fontFamily" },
      serif: { $value: "Georgia", $type: "fontFamily" },
      mono: { $value: "Fira Code", $type: "fontFamily" },
    },
    fontWeight: {
      regular: { $value: "Regular", $type: "fontWeight" },
      medium: { $value: "Medium", $type: "fontWeight" },
      semibold: { $value: "SemiBold", $type: "fontWeight" },
      bold: { $value: "Bold", $type: "fontWeight" },
    },
    fontSize: {
      xs: { $value: "12", $type: "dimension" },
      sm: { $value: "14", $type: "dimension" },
      md: { $value: "16", $type: "dimension" },
      lg: { $value: "18", $type: "dimension" },
      xl: { $value: "20", $type: "dimension" },
      "2xl": { $value: "24", $type: "dimension" },
      "3xl": { $value: "30", $type: "dimension" },
      "4xl": { $value: "36", $type: "dimension" },
      "5xl": { $value: "48", $type: "dimension" },
      "6xl": { $value: "60", $type: "dimension" },
    },
    lineHeight: {
      tight: { $value: "120", $type: "number" },
      snug: { $value: "135", $type: "number" },
      normal: { $value: "150", $type: "number" },
      relaxed: { $value: "165", $type: "number" },
    },
    letterSpacing: {
      tight: { $value: "-2", $type: "number" },
      normal: { $value: "0", $type: "number" },
      wide: { $value: "4", $type: "number" },
      wider: { $value: "8", $type: "number" },
    },
  };

  // ---------------------------------------------------------------------------
  // Apply semantic overrides (path relative to payload root)
  // ---------------------------------------------------------------------------

  if (semanticOverrides) {
    Object.entries(semanticOverrides).forEach(([path, value]) => {
      if (!value) return;

      let fullPath = path;
      if (!path.startsWith("theme.") && !path.startsWith("darkTheme.")) {
        fullPath = `theme.${path}`;
      }

      const parts = fullPath.split(".");
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
