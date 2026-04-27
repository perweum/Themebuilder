import { describe, it, expect } from "vitest";
import { mapTheme, NamedColorRamp } from "./theme-mapper";
import { generateRamp } from "./palette-generator";

// ────────────────────────────────────────────────────────────────
// Fixtures
// ────────────────────────────────────────────────────────────────

function makeRamp(name: string, hex: string, id?: string): NamedColorRamp {
  return { id, name, gen: generateRamp(hex) };
}

const brandRamp = makeRamp("brand", "#0142FE");
const accentRamp = makeRamp("accent", "#7c3aed");
const neutralRamp = makeRamp("neutral", "#64748b", "neutral");
const successRamp = makeRamp("success", "#22c55e", "success");
const errorRamp = makeRamp("error", "#ef4444", "error");
const warningRamp = makeRamp("warning", "#f59e0b");

const globalColors: NamedColorRamp[] = [neutralRamp, successRamp, errorRamp];

// ────────────────────────────────────────────────────────────────
// Payload shape
// ────────────────────────────────────────────────────────────────

describe("mapTheme — payload shape", () => {
  it("returns all required top-level keys", () => {
    const payload = mapTheme([brandRamp], globalColors);
    expect(payload).toHaveProperty("color");
    expect(payload).toHaveProperty("theme");
    expect(payload).toHaveProperty("darkTheme");
    expect(payload).toHaveProperty("geometry");
    expect(payload).toHaveProperty("typography");
  });

  it("color includes white, black, neutral, success, error", () => {
    const { color } = mapTheme([brandRamp], globalColors);
    expect(color).toHaveProperty("white");
    expect(color).toHaveProperty("black");
    expect(color).toHaveProperty("neutral");
    expect(color).toHaveProperty("success");
    expect(color).toHaveProperty("error");
  });

  it("color includes the brand ramp", () => {
    const { color } = mapTheme([brandRamp], globalColors);
    expect(color).toHaveProperty("brand");
  });

  it("all color tokens have $value and $type", () => {
    const { color } = mapTheme([brandRamp], globalColors);
    const brand = color["brand"] as Record<string, any>;
    for (const step of Object.values(brand)) {
      expect(step).toHaveProperty("$value");
      expect(step).toHaveProperty("$type", "color");
    }
  });
});

// ────────────────────────────────────────────────────────────────
// Semantic token categories
// ────────────────────────────────────────────────────────────────

describe("mapTheme — semantic token categories", () => {
  const { theme, darkTheme } = mapTheme([brandRamp], globalColors);

  const expectedCategories = [
    "background",
    "surface",
    "border",
    "base",
    "text",
    "icon",
    "elevation",
    "overlay",
  ];

  for (const cat of expectedCategories) {
    it(`theme has category "${cat}"`, () => {
      expect(theme).toHaveProperty(cat);
    });
    it(`darkTheme has category "${cat}"`, () => {
      expect(darkTheme).toHaveProperty(cat);
    });
  }

  it("theme.text.default has $value ref to neutral.950", () => {
    expect(theme.text.default.$value).toBe("{color.neutral.950}");
  });

  it("darkTheme.text.default has $value ref to neutral.50", () => {
    expect(darkTheme.text.default.$value).toBe("{color.neutral.50}");
  });

  it("theme.surface.default is white", () => {
    expect(theme.surface.default.$value).toBe("{color.white.950}");
  });

  it("darkTheme.surface.default refs neutral", () => {
    expect(darkTheme.surface.default.$value).toContain("neutral");
  });
});

// ────────────────────────────────────────────────────────────────
// Brand color tokens
// ────────────────────────────────────────────────────────────────

describe("mapTheme — brand color tokens", () => {
  const { theme, darkTheme } = mapTheme([brandRamp], globalColors);

  it("theme.base.brand.default is a primitive color ref", () => {
    expect(theme.base.brand.default.$value).toMatch(/^\{color\.brand\.\d+\}$/);
  });

  it("theme.text.brand.default is brand.700", () => {
    expect(theme.text.brand.default.$value).toBe("{color.brand.700}");
  });

  it("darkTheme.text.brand.default is brand.300", () => {
    expect(darkTheme.text.brand.default.$value).toBe("{color.brand.300}");
  });

  it("theme.icon.brand uses {light.*} aliases (within-file refs)", () => {
    expect(theme.icon.brand.default.$value).toBe("{light.text.brand.default}");
    expect(theme.icon.brand.contrast.$value).toBe("{light.text.brand.contrast}");
  });

  it("darkTheme.icon.brand uses {dark.*} aliases", () => {
    expect(darkTheme.icon.brand.default.$value).toBe("{dark.text.brand.default}");
  });

  it("focus ring defaults to brand color", () => {
    expect(theme.border.focus.$value).toBe("{color.brand.600}");
    expect(darkTheme.border.focus.$value).toBe("{color.brand.400}");
  });
});

// ────────────────────────────────────────────────────────────────
// Severity tokens (globalColors that are not neutral)
// ────────────────────────────────────────────────────────────────

describe("mapTheme — severity tokens", () => {
  const { theme, darkTheme } = mapTheme([brandRamp], globalColors);

  it("success tokens present in theme", () => {
    expect(theme.text).toHaveProperty("success");
    expect(theme.base).toHaveProperty("success");
  });

  it("error tokens present in darkTheme", () => {
    expect(darkTheme.text).toHaveProperty("error");
    expect(darkTheme.base).toHaveProperty("error");
  });

  it("core severity icon tokens (success/error) use {light.*} within-file refs", () => {
    // success/error are in the theme skeleton — they alias via {light.text.*}
    // just like brand colors do (not a dangling ref since they're in the same file)
    expect(theme.icon.success.default.$value).toBe("{light.text.success.default}");
    expect(theme.icon.error.default.$value).toBe("{light.text.error.default}");
  });

  it("dark core severity icon tokens use {dark.*} within-file refs", () => {
    expect(darkTheme.icon.error.default.$value).toBe("{dark.text.error.default}");
  });
});

// ────────────────────────────────────────────────────────────────
// Extra global colors (warning, info…)
// ────────────────────────────────────────────────────────────────

describe("mapTheme — extra global colors", () => {
  const globalsWithWarning = [...globalColors, warningRamp];
  const { theme, color } = mapTheme([brandRamp], globalsWithWarning);

  it("warning palette included in primitives", () => {
    expect(color).toHaveProperty("warning");
  });

  it("warning semantic tokens generated", () => {
    expect(theme.text).toHaveProperty("warning");
    expect(theme.base).toHaveProperty("warning");
  });

  it("warning icon uses direct primitive refs", () => {
    expect(theme.icon.warning.default.$value).toMatch(/^\{color\./);
  });
});

// ────────────────────────────────────────────────────────────────
// Geometry tokens
// ────────────────────────────────────────────────────────────────

describe("mapTheme — geometry tokens", () => {
  it("includes size, radius, borderWidth", () => {
    const { geometry } = mapTheme([brandRamp], globalColors);
    expect(geometry).toHaveProperty("size");
    expect(geometry).toHaveProperty("radius");
    expect(geometry).toHaveProperty("borderWidth");
  });

  it("radius.none is 0px", () => {
    const { geometry } = mapTheme([brandRamp], globalColors);
    expect(geometry.radius.none.$value).toBe("0px");
  });

  it("radiusBase 8 doubles all numeric radius steps", () => {
    const { geometry: g4 } = mapTheme([brandRamp], globalColors, undefined, undefined, {
      radiusBase: 4,
      includeRadius: true,
      includeBorders: true,
      borderWidth: "small",
    });
    const { geometry: g8 } = mapTheme([brandRamp], globalColors, undefined, undefined, {
      radiusBase: 8,
      includeRadius: true,
      includeBorders: true,
      borderWidth: "small",
    });
    expect(g8.radius["1"].$value).toBe("8px");
    expect(g4.radius["1"].$value).toBe("4px");
  });

  it("borderWidth thin/medium/thick always present", () => {
    const { geometry } = mapTheme([brandRamp], globalColors);
    expect(geometry.borderWidth.thin.$value).toBe("1px");
    expect(geometry.borderWidth.medium.$value).toBe("1.5px");
    expect(geometry.borderWidth.thick.$value).toBe("2px");
  });
});

// ────────────────────────────────────────────────────────────────
// Typography tokens
// ────────────────────────────────────────────────────────────────

describe("mapTheme — typography tokens", () => {
  it("includes fontFamily, fontWeight, fontSize, lineHeight, letterSpacing", () => {
    const { typography } = mapTheme([brandRamp], globalColors);
    expect(typography).toHaveProperty("fontFamily");
    expect(typography).toHaveProperty("fontWeight");
    expect(typography).toHaveProperty("fontSize");
    expect(typography).toHaveProperty("lineHeight");
    expect(typography).toHaveProperty("letterSpacing");
  });

  it("uses Inter as default font family", () => {
    const { typography } = mapTheme([brandRamp], globalColors);
    expect(typography.fontFamily.sans.$value).toBe("Inter");
  });

  it("respects custom fontFamily parameter", () => {
    const { typography } = mapTheme(
      [brandRamp],
      globalColors,
      undefined,
      undefined,
      undefined,
      "Geist",
    );
    expect(typography.fontFamily.sans.$value).toBe("Geist");
  });
});

// ────────────────────────────────────────────────────────────────
// Semantic overrides
// ────────────────────────────────────────────────────────────────

describe("mapTheme — semantic overrides", () => {
  it("override applies to the correct theme token", () => {
    const overrides = { "background.default": "{color.brand.25}" };
    const { theme } = mapTheme([brandRamp], globalColors, overrides);
    expect(theme.background.default.$value).toBe("{color.brand.25}");
  });

  it("darkTheme. prefix routes to darkTheme correctly", () => {
    const overrides = { "darkTheme.background.default": "{color.brand.950}" };
    const { darkTheme } = mapTheme([brandRamp], globalColors, overrides);
    expect(darkTheme.background.default.$value).toBe("{color.brand.950}");
  });
});

// ────────────────────────────────────────────────────────────────
// Deduplication — duplicate ramps by seed
// ────────────────────────────────────────────────────────────────

describe("mapTheme — color deduplication", () => {
  it("does not add duplicate palette when accent matches a global color seed", () => {
    // neutralRamp seed is #64748b; if we pass same as theme color it should alias
    const dupeRamp = makeRamp("dupe", neutralRamp.gen.ramp[500]);
    const { color } = mapTheme([dupeRamp], globalColors);
    // 'dupe' should not appear as a separate palette — aliased to neutral
    expect(color).not.toHaveProperty("dupe");
  });
});

// ────────────────────────────────────────────────────────────────
// Multiple theme colors
// ────────────────────────────────────────────────────────────────

describe("mapTheme — multiple theme colors", () => {
  const { theme, darkTheme, color } = mapTheme([brandRamp, accentRamp], globalColors);

  it("both brand and accent appear in color primitives", () => {
    expect(color).toHaveProperty("brand");
    expect(color).toHaveProperty("accent");
  });

  it("focus ring set by first theme color (brand)", () => {
    expect(theme.border.focus.$value).toBe("{color.brand.600}");
  });

  it("accent tokens generated in theme", () => {
    expect(theme.text).toHaveProperty("accent");
    expect(darkTheme.base).toHaveProperty("accent");
  });
});
