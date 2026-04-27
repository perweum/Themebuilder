"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapTheme = mapTheme;
const palette_generator_1 = require("./palette-generator");
// Helper to convert a raw ramp (keys 25-950) into Token format
function toTokenRamp(ramp) {
  const tokens = {};
  for (const stepStr in ramp) {
    const key = Number(stepStr);
    tokens[key] = {
      $value: ramp[key],
      $type: "color",
    };
  }
  return tokens;
}
function toAlphaTokenRamp(ramp) {
  const tokens = {};
  for (const stepStr in ramp) {
    const key = Number(stepStr);
    tokens[key] = {
      $value: ramp[key],
      $type: "color",
    };
  }
  return tokens;
}
function getOffsetStep(step, offset) {
  const idx = palette_generator_1.COLOR_STEPS.indexOf(step);
  if (idx === -1) return step;
  const newIdx = Math.max(0, Math.min(palette_generator_1.COLOR_STEPS.length - 1, idx + offset));
  return palette_generator_1.COLOR_STEPS[newIdx];
}
/**
 * Maps generated ramps to the semantic token structure.
 * Implements W3C Design Token aliasing {namespace.path}.
 */
function mapTheme(themeColors, neutralGen, successGen, errorGen, semanticOverrides) {
  const colors = {
    white: toAlphaTokenRamp((0, palette_generator_1.generateAlphaRamp)("#ffffff")),
    black: toAlphaTokenRamp((0, palette_generator_1.generateAlphaRamp)("#000000")),
    neutral: toTokenRamp(neutralGen.ramp),
    global: {
      success: toTokenRamp(successGen.ramp),
      error: toTokenRamp(errorGen.ramp),
    },
  };
  // Initialize root objects
  const theme = {
    background: {
      default: {},
    },
    surface: {
      default: { $value: `{color.white.100}`, $type: "color" },
      global1: {
        rest: { $value: `{color.global.success.100}`, $type: "color" },
      },
      global2: {
        rest: { $value: `{color.global.error.100}`, $type: "color" },
      },
    },
    interactive: {
      global1: {
        rest: { $value: `{color.global.success.500}`, $type: "color" },
        hover: { $value: `{color.global.success.600}`, $type: "color" },
        press: { $value: `{color.global.success.700}`, $type: "color" },
      },
      global2: {
        rest: { $value: `{color.global.error.500}`, $type: "color" },
        hover: { $value: `{color.global.error.600}`, $type: "color" },
        press: { $value: `{color.global.error.700}`, $type: "color" },
      },
    },
    border: {
      subtle: { $value: `{color.neutral.200}`, $type: "color" },
      default: { $value: `{color.neutral.300}`, $type: "color" },
      strong: { $value: `{color.neutral.400}`, $type: "color" },
      focus: {},
    },
    text: {
      default: { $value: `{color.neutral.950}`, $type: "color" },
      subtle: { $value: `{color.neutral.500}`, $type: "color" },
      onInteractive: { $value: `{color.white.100}`, $type: "color" },
      global1: { $value: `{color.global.success.600}`, $type: "color" },
      global2: { $value: `{color.global.error.600}`, $type: "color" },
    },
    icon: {
      default: { $value: `{theme.text.default}`, $type: "color" },
      subtle: { $value: `{theme.text.subtle}`, $type: "color" },
      onInteractive: { $value: `{theme.text.onInteractive}`, $type: "color" },
    },
  };
  const darkTheme = {
    background: {
      default: {},
    },
    surface: {
      default: { $value: `{color.neutral.900}`, $type: "color" },
      global1: {
        rest: { $value: `{color.global.success.900}`, $type: "color" },
      },
      global2: {
        rest: { $value: `{color.global.error.900}`, $type: "color" },
      },
    },
    interactive: {
      global1: {
        rest: { $value: `{color.global.success.600}`, $type: "color" },
        hover: { $value: `{color.global.success.500}`, $type: "color" },
        press: { $value: `{color.global.success.400}`, $type: "color" },
      },
      global2: {
        rest: { $value: `{color.global.error.600}`, $type: "color" },
        hover: { $value: `{color.global.error.500}`, $type: "color" },
        press: { $value: `{color.global.error.400}`, $type: "color" },
      },
    },
    border: {
      subtle: { $value: `{color.neutral.800}`, $type: "color" },
      default: { $value: `{color.neutral.700}`, $type: "color" },
      strong: { $value: `{color.neutral.600}`, $type: "color" },
      focus: {},
    },
    text: {
      default: { $value: `{color.neutral.50}`, $type: "color" },
      subtle: { $value: `{color.neutral.400}`, $type: "color" },
      onInteractive: { $value: `{color.white.100}`, $type: "color" },
      global1: { $value: `{color.global.success.400}`, $type: "color" },
      global2: { $value: `{color.global.error.400}`, $type: "color" },
    },
    icon: {
      default: { $value: `{darkTheme.text.default}`, $type: "color" },
      subtle: { $value: `{darkTheme.text.subtle}`, $type: "color" },
      onInteractive: { $value: `{darkTheme.text.onInteractive}`, $type: "color" },
    },
  };
  // Grab the first color in the array to act as the primary structural background driver
  const primaryColor = themeColors.length > 0 ? themeColors[0] : null;
  // Force default backgrounds to absolute extremes for clean contrast
  theme.background.default = { $value: `{color.white.100}`, $type: "color" };
  darkTheme.background.default = { $value: `{color.black.100}`, $type: "color" };
  if (primaryColor) {
    // Also the global focus ring
    theme.border.focus = { $value: `{color.${primaryColor.name}.600}`, $type: "color" };
    darkTheme.border.focus = { $value: `{color.${primaryColor.name}.300}`, $type: "color" };
  } else {
    theme.border.focus = { $value: `{color.neutral.600}`, $type: "color" };
    darkTheme.border.focus = { $value: `{color.neutral.300}`, $type: "color" };
  }
  // Now map every single color the user defined dynamically!
  themeColors.forEach((config) => {
    const cName = config.name; // user-defined string like "master" or "brand"
    const gen = config.gen;
    // Inject primitive color steps into root
    colors[cName] = toTokenRamp(gen.ramp);
    const rest = gen.closestStep;
    const hover = getOffsetStep(rest, rest >= 600 ? -1 : 1);
    const press = getOffsetStep(rest, rest >= 600 ? -2 : 2);
    // --- LIGHT THEME TOKENS ---
    theme.background[cName] = { $value: `{color.${cName}.25}`, $type: "color" };
    theme.surface[cName] = {
      rest: { $value: `{color.${cName}.100}`, $type: "color" },
      hover: { $value: `{color.${cName}.200}`, $type: "color" },
      press: { $value: `{color.${cName}.300}`, $type: "color" },
    };
    theme.interactive[cName] = {
      rest: { $value: `{color.${cName}.${rest}}`, $type: "color" },
      hover: { $value: `{color.${cName}.${hover}}`, $type: "color" },
      press: { $value: `{color.${cName}.${press}}`, $type: "color" },
    };
    theme.text[cName] = {
      default: { $value: `{color.${cName}.600}`, $type: "color" },
      onSurface: {
        $value: `{color.${cName}.${(0, palette_generator_1.getAccessibleForeground)(gen.ramp, gen.ramp[100])}}`,
        $type: "color",
      },
      onInteractive: {
        $value: `{color.${cName}.${(0, palette_generator_1.getAccessibleForeground)(gen.ramp, gen.ramp[rest])}}`,
        $type: "color",
      },
    };
    theme.icon[cName] = {
      default: { $value: `{theme.text.${cName}.default}`, $type: "color" },
      onSurface: { $value: `{theme.text.${cName}.onSurface}`, $type: "color" },
      onInteractive: { $value: `{theme.text.${cName}.onInteractive}`, $type: "color" },
    };
    // --- DARK THEME TOKENS ---
    darkTheme.background[cName] = { $value: `{color.${cName}.900}`, $type: "color" };
    darkTheme.surface[cName] = {
      rest: { $value: `{color.${cName}.800}`, $type: "color" },
      hover: { $value: `{color.${cName}.700}`, $type: "color" },
      press: { $value: `{color.${cName}.600}`, $type: "color" },
    };
    darkTheme.interactive[cName] = {
      rest: { $value: `{color.${cName}.400}`, $type: "color" },
      hover: { $value: `{color.${cName}.300}`, $type: "color" },
      press: { $value: `{color.${cName}.200}`, $type: "color" },
    };
    // Dark text contrast logic
    darkTheme.text[cName] = {
      default: { $value: `{color.${cName}.300}`, $type: "color" },
      onSurface: {
        $value: `{color.${cName}.${(0, palette_generator_1.getAccessibleForeground)(gen.ramp, gen.ramp[800])}}`,
        $type: "color",
      },
      onInteractive: {
        $value: `{color.${cName}.${(0, palette_generator_1.getAccessibleForeground)(gen.ramp, gen.ramp[400])}}`,
        $type: "color",
      },
    };
    darkTheme.icon[cName] = {
      default: { $value: `{darkTheme.text.${cName}.default}`, $type: "color" },
      onSurface: { $value: `{darkTheme.text.${cName}.onSurface}`, $type: "color" },
      onInteractive: { $value: `{darkTheme.text.${cName}.onInteractive}`, $type: "color" },
    };
  });
  const payload = {
    color: colors,
    theme,
    darkTheme,
  };
  if (semanticOverrides) {
    Object.entries(semanticOverrides).forEach(([path, value]) => {
      if (!value) return;
      const parts = path.split(".");
      let current = payload;
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
