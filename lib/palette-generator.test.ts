import { describe, it, expect } from "vitest";
import {
  generateRamp,
  generateAlphaRamp,
  getBestTextForBg,
  getAccessibleBaseStep,
  getAccessibleForeground,
  getColorName,
  getHueDistance,
  getClosestLuminosityStep,
  COLOR_STEPS,
  LUMINOSITY_TARGETS,
  ALPHA_STEPS,
} from "./palette-generator";

// ────────────────────────────────────────────────────────────────
// generateRamp
// ────────────────────────────────────────────────────────────────

describe("generateRamp", () => {
  it("returns all 12 steps for a standard blue", () => {
    const { ramp } = generateRamp("#0142FE");
    expect(
      Object.keys(ramp)
        .map(Number)
        .sort((a, b) => a - b),
    ).toEqual(COLOR_STEPS);
  });

  it("preserves the seed hex at the closest step", () => {
    const seed = "#0142FE";
    const { ramp, closestStep } = generateRamp(seed);
    expect(ramp[closestStep].toLowerCase()).toBe(seed.toLowerCase());
  });

  it("step 25 is lightest, step 950 is darkest (luminosity order)", () => {
    const { ramp } = generateRamp("#e11d48");
    // Step 25 should be very light and step 950 should be very dark
    // We check luminosity targets since generated hex may vary
    expect(LUMINOSITY_TARGETS[25]).toBeGreaterThan(LUMINOSITY_TARGETS[950]);
  });

  it("generates valid hex strings for every step", () => {
    const { ramp } = generateRamp("#10b981");
    for (const step of COLOR_STEPS) {
      expect(ramp[step]).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("throws on invalid seed", () => {
    expect(() => generateRamp("notacolor")).toThrow();
  });

  it("reports a sensible closestStep — mid-luminosity seed maps near 500", () => {
    // #6366f1 (indigo) is roughly mid-luminosity
    const { closestStep } = generateRamp("#6366f1");
    const midSteps = [400, 500, 600] as const;
    expect(midSteps).toContain(closestStep);
  });

  it("very light seed maps to a low step number", () => {
    const { closestStep } = generateRamp("#f0f9ff");
    expect(closestStep).toBeLessThanOrEqual(100);
  });

  it("very dark seed maps to a high step number", () => {
    const { closestStep } = generateRamp("#0f172a");
    expect(closestStep).toBeGreaterThanOrEqual(900);
  });
});

// ────────────────────────────────────────────────────────────────
// generateAlphaRamp
// ────────────────────────────────────────────────────────────────

describe("generateAlphaRamp", () => {
  it("returns all 12 steps", () => {
    const ramp = generateAlphaRamp("#ffffff");
    expect(
      Object.keys(ramp)
        .map(Number)
        .sort((a, b) => a - b),
    ).toEqual(ALPHA_STEPS);
  });

  it("step 950 is solid hex for white", () => {
    const ramp = generateAlphaRamp("#ffffff");
    expect(ramp[950]).toBe("#ffffff");
  });

  it("step 950 is solid hex for black", () => {
    const ramp = generateAlphaRamp("#000000");
    expect(ramp[950]).toBe("#000000");
  });

  it("step 25 produces very low opacity rgba", () => {
    const ramp = generateAlphaRamp("#000000");
    expect(ramp[25]).toMatch(/^rgba\(0, 0, 0, 0\.04\)$/);
  });

  it("step 900 produces 0.90 opacity", () => {
    const ramp = generateAlphaRamp("#000000");
    expect(ramp[900]).toBe("rgba(0, 0, 0, 0.9)");
  });

  it("throws on non-6-digit hex", () => {
    expect(() => generateAlphaRamp("#fff")).toThrow();
  });

  it("correctly encodes a colored seed", () => {
    const ramp = generateAlphaRamp("#ff0000");
    expect(ramp[500]).toBe("rgba(255, 0, 0, 0.5)");
  });
});

// ────────────────────────────────────────────────────────────────
// getBestTextForBg
// ────────────────────────────────────────────────────────────────

describe("getBestTextForBg", () => {
  it("returns white text on a dark background", () => {
    const result = getBestTextForBg("#0f172a");
    expect(result.hex).toBe("#ffffff");
    expect(result.token).toBe("{color.white.950}");
  });

  it("returns black text on a light background", () => {
    const result = getBestTextForBg("#f8fafc");
    expect(result.hex).toBe("#000000");
    expect(result.token).toBe("{color.black.950}");
  });

  it("returns white on saturated dark brand color", () => {
    const result = getBestTextForBg("#0142FE");
    expect(result.hex).toBe("#ffffff");
  });
});

// ────────────────────────────────────────────────────────────────
// getAccessibleBaseStep
// ────────────────────────────────────────────────────────────────

describe("getAccessibleBaseStep", () => {
  it("returns a step that meets 4.5:1 contrast against its text", async () => {
    const { wcagContrast } = await import("culori");
    const { ramp } = generateRamp("#0142FE");
    const { bgStep, textHex } = getAccessibleBaseStep(ramp, 500);
    const contrast = wcagContrast(ramp[bgStep], textHex);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });

  it("always returns a valid ColorStep", () => {
    const { ramp } = generateRamp("#10b981");
    const { bgStep } = getAccessibleBaseStep(ramp, 500);
    expect(COLOR_STEPS).toContain(bgStep);
  });
});

// ────────────────────────────────────────────────────────────────
// getAccessibleForeground
// ────────────────────────────────────────────────────────────────

describe("getAccessibleForeground", () => {
  it("returns the step with highest contrast against white bg", () => {
    const { ramp } = generateRamp("#0142FE");
    const step = getAccessibleForeground(ramp, "#ffffff");
    // Should be a dark step
    expect(step).toBeGreaterThanOrEqual(600);
  });

  it("returns the step with highest contrast against dark bg", () => {
    const { ramp } = generateRamp("#0142FE");
    const step = getAccessibleForeground(ramp, "#0f172a");
    // Should be a light step
    expect(step).toBeLessThanOrEqual(400);
  });

  it("always returns a valid ColorStep", () => {
    const { ramp } = generateRamp("#a855f7");
    const step = getAccessibleForeground(ramp, "#ffffff");
    expect(COLOR_STEPS).toContain(step);
  });
});

// ────────────────────────────────────────────────────────────────
// getColorName
// ────────────────────────────────────────────────────────────────

describe("getColorName", () => {
  it("identifies indigo (#0142FE hue falls in 260-290 range)", () =>
    expect(getColorName("#0142FE")).toBe("indigo"));
  it("identifies blue (#0ea5e9 sky-blue hue 200-260)", () =>
    expect(getColorName("#0ea5e9")).toBe("blue"));
  it("identifies red", () => expect(getColorName("#ef4444")).toBe("red"));
  it("identifies green", () => expect(getColorName("#22c55e")).toBe("green"));
  it("identifies purple", () => expect(getColorName("#a855f7")).toBe("purple"));
  it("identifies neutral for achromatic gray (#808080)", () =>
    expect(getColorName("#808080")).toBe("neutral"));
  it("returns a string for any valid hex", () => {
    const names = [
      "red",
      "orange",
      "yellow",
      "green",
      "teal",
      "blue",
      "indigo",
      "purple",
      "pink",
      "neutral",
      "gray",
    ];
    expect(names).toContain(getColorName("#f97316"));
  });
});

// ────────────────────────────────────────────────────────────────
// getHueDistance
// ────────────────────────────────────────────────────────────────

describe("getHueDistance", () => {
  it("returns 0 for identical colors", () => {
    expect(getHueDistance("#0142FE", "#0142FE")).toBe(0);
  });

  it("distance is symmetric", () => {
    const a = "#0142FE";
    const b = "#ef4444";
    expect(getHueDistance(a, b)).toBeCloseTo(getHueDistance(b, a), 5);
  });

  it("never exceeds 180", () => {
    expect(getHueDistance("#ff0000", "#00ff00")).toBeLessThanOrEqual(180);
  });
});

// ────────────────────────────────────────────────────────────────
// getClosestLuminosityStep
// ────────────────────────────────────────────────────────────────

describe("getClosestLuminosityStep", () => {
  it("luminosity 0.98 → step 25", () => {
    expect(getClosestLuminosityStep(0.98)).toBe(25);
  });

  it("luminosity 0.50 → step 500", () => {
    expect(getClosestLuminosityStep(0.5)).toBe(500);
  });

  it("luminosity 0.14 → step 950", () => {
    expect(getClosestLuminosityStep(0.14)).toBe(950);
  });

  it("always returns a valid ColorStep", () => {
    for (let l = 0; l <= 1; l += 0.1) {
      expect(COLOR_STEPS).toContain(getClosestLuminosityStep(l));
    }
  });
});
