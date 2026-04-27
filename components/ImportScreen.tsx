import React, { useState, useRef } from "react";
import { useTheme, ThemeConfig, GlobalColorConfig } from "../theme-context";
import { SystemicModal } from "./SystemicModal";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";

// ─── Parsing utilities ────────────────────────────────────────────────────────

const KNOWN_GLOBAL_IDS = new Set([
  "neutral",
  "success",
  "error",
  "warning",
  "info",
  "caution",
  "critical",
]);

function isHex(s: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(s.trim());
}

/** Extract a raw hex string from a token in any known format */
function extractHex(token: any): string | null {
  if (typeof token === "string" && isHex(token)) return token.trim();
  if (typeof token !== "object" || !token) return null;
  const v = token.$value ?? token.value;
  if (typeof v === "string" && isHex(v.trim()) && !v.includes("{")) return v.trim();
  return null;
}

/**
 * Relative luminance of a hex color (WCAG formula).
 * Returns 0 (black) → 1 (white).
 */
function luminance(hex: string): number {
  const full = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  const r = parseInt(full.slice(1, 3), 16) / 255;
  const g = parseInt(full.slice(3, 5), 16) / 255;
  const b = parseInt(full.slice(5, 7), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * True if a scale-entry key looks like a "step indicator" rather than a
 * semantic name. Numeric keys (25, 100, 500…), Material A-variants,
 * and recognised lightness-axis words all qualify.
 * Semantic names like "error", "primary", "success" do NOT.
 */
const STEP_WORDS = new Set([
  "default",
  "base",
  "light",
  "lighter",
  "lightest",
  "dark",
  "darker",
  "darkest",
  "mid",
  "medium",
  "pale",
  "deep",
  "bold",
  "soft",
  "subtle",
  "vivid",
  "muted",
]);
function isStepKey(key: string): boolean {
  if (/^\d+$/.test(key)) return true; // 25, 100, 500, 950
  if (/^A\d+$/i.test(key)) return true; // A100, A700
  return STEP_WORDS.has(key.toLowerCase());
}

/**
 * Detect whether an object looks like a color scale (ramp).
 * Requires 3+ direct hex children AND at least half the keys must
 * look like step indicators — this prevents groups of semantically-named
 * tokens (e.g. { error, success, warning }) from being mistaken for scales.
 */
function detectScale(obj: any): boolean {
  if (typeof obj !== "object" || !obj) return false;
  const hexEntries = Object.entries(obj).filter(
    ([k, v]) => !k.startsWith("$") && extractHex(v) !== null,
  );
  if (hexEntries.length < 3) return false;
  const stepLike = hexEntries.filter(([k]) => isStepKey(k)).length;
  return stepLike >= Math.ceil(hexEntries.length / 2);
}

/**
 * Pick the best representative "seed" hex from a scale.
 * Strategy:
 *   1. Try preferred step names (500, DEFAULT, base, …) but only accept
 *      if the colour isn't too light (luminance < 0.5). A very light step
 *      like Radix step-5 or Tailwind-100 makes a poor seed.
 *   2. Luminance-based fallback — pick the step whose luminance is
 *      closest to ~0.18 (perceptual mid-tone, good ramp anchor).
 */
function seedFromScale(obj: any): string | null {
  const entries = Object.entries(obj).filter(
    ([k, v]) => !k.startsWith("$") && extractHex(v) !== null,
  ) as [string, any][];

  if (entries.length === 0) return null;

  const preferred = [
    "500",
    "400",
    "600",
    "DEFAULT",
    "base",
    "default",
    "300",
    "700",
    "5",
    "6",
    "4",
  ];
  for (const step of preferred) {
    const entry = entries.find(([k]) => k === step);
    if (entry) {
      const hex = extractHex(entry[1])!;
      if (luminance(hex) < 0.5) return hex; // only accept non-washed-out steps
    }
  }

  // Luminance-based fallback: target ~0.18 (perceptual midpoint)
  const TARGET_LUMINANCE = 0.18;
  const withLum = entries.map(([, v]) => {
    const hex = extractHex(v)!;
    return { hex, dist: Math.abs(luminance(hex) - TARGET_LUMINANCE) };
  });
  withLum.sort((a, b) => a.dist - b.dist);
  return withLum[0]?.hex ?? null;
}

/**
 * Recursively mine color scales from any JSON structure.
 * Returns Map<name, seedHex>.
 * Deduplicates by name — first occurrence wins.
 */
function mineScales(obj: any, depth = 0): Map<string, string> {
  const result = new Map<string, string>();
  if (depth > 6 || typeof obj !== "object" || !obj) return result;

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    if (typeof value !== "object" || !value) continue;

    if (detectScale(value)) {
      const seed = seedFromScale(value);
      if (seed && !result.has(key)) result.set(key, seed);
    } else {
      for (const [k, s] of mineScales(value as any, depth + 1)) {
        if (!result.has(k)) result.set(k, s);
      }
    }
  }
  return result;
}

/**
 * Last-resort: find any individually-named hex color tokens anywhere in the tree.
 * Returns Map<name, hex>.
 */
function mineIndividual(obj: any, depth = 0): Map<string, string> {
  const result = new Map<string, string>();
  if (depth > 6 || typeof obj !== "object" || !obj) return result;

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    const hex = extractHex(value);
    if (hex) {
      if (!result.has(key)) result.set(key, hex);
    } else if (typeof value === "object") {
      for (const [k, s] of mineIndividual(value as any, depth + 1)) {
        if (!result.has(k)) result.set(k, s);
      }
    }
  }
  return result;
}

function categorise(ramps: Map<string, string>): {
  themeColors: ThemeColorConfig[];
  globalColors: GlobalColorConfig[];
} {
  const themeColors: ThemeColorConfig[] = [];
  const globalColors: GlobalColorConfig[] = [];
  let idx = 0;
  for (const [name, seed] of ramps) {
    if (name === "white" || name === "black") continue;
    if (KNOWN_GLOBAL_IDS.has(name)) {
      globalColors.push({ id: name, name, seed });
    } else {
      themeColors.push({ id: `c-${Date.now()}-${idx++}`, name, seed });
    }
  }
  return { themeColors, globalColors };
}

function buildThemeConfig(themeColors: ThemeColorConfig[], name = "Imported Theme"): ThemeConfig {
  return {
    id: `imported-${Date.now()}`,
    name,
    colors:
      themeColors.length > 0
        ? themeColors
        : [{ id: `c-${Date.now()}`, name: "primary", seed: "#4f46e5" }],
    geometry: { radiusBase: 4, includeRadius: true, includeBorders: true, borderWidth: "small" },
    fontFamily: "Inter",
  };
}

// ─── Format detection + top-level parse ──────────────────────────────────────

interface ParseResult {
  themeConfigs: ThemeConfig[];
  globalColors: GlobalColorConfig[];
  format: "themebuilder-v1" | "themebuilder-raw" | "token-studio" | "generic";
  warnings: string[];
}

/**
 * Parse Token Studio `$themes` array into ThemeConfigs.
 * Each theme entry lists which token sets are active ("source" or "enabled").
 * Source sets contain actual hex values; enabled sets typically hold alias references.
 * We mine scales only from "source" sets to get the real palette, then deduplicate
 * themes that share identical source sets (e.g. Light and Dark over the same Primitives).
 */
function parseTokenStudioThemes(
  json: any,
): { themeConfigs: ThemeConfig[]; globalColors: GlobalColorConfig[] } | null {
  const themes: any[] = json["$themes"];
  if (!Array.isArray(themes) || themes.length === 0) return null;

  // Build a ThemeConfig per unique "source" set fingerprint
  const seen = new Map<
    string,
    { names: string[]; themeColors: ThemeColorConfig[]; globalColors: GlobalColorConfig[] }
  >();

  for (const theme of themes) {
    const { name, selectedTokenSets } = theme;
    if (!name || typeof selectedTokenSets !== "object") continue;

    // Collect all token sets with status "source" for this theme (these have real hex values)
    const sourceSetNames = Object.entries(selectedTokenSets as Record<string, string>)
      .filter(([, status]) => status === "source")
      .map(([setName]) => setName)
      .sort();

    // Fingerprint the source sets so we can deduplicate
    const fingerprint = sourceSetNames.join("|");

    if (!seen.has(fingerprint)) {
      // Merge all source token set objects into one for mining
      const merged: any = {};
      for (const setName of sourceSetNames) {
        if (json[setName] && typeof json[setName] === "object") {
          Object.assign(merged, json[setName]);
        }
      }

      const scales = mineScales(merged);
      if (scales.size === 0) continue;

      const { themeColors, globalColors: gc } = categorise(scales);
      seen.set(fingerprint, { names: [name], themeColors, globalColors: gc });
    } else {
      // Same source sets — just record the additional theme name
      seen.get(fingerprint)!.names.push(name);
    }
  }

  if (seen.size === 0) return null;

  const themeConfigs: ThemeConfig[] = [];
  const globalColors: GlobalColorConfig[] = [];

  for (const { names, themeColors, globalColors: gc } of seen.values()) {
    themeConfigs.push(buildThemeConfig(themeColors, names.join(" / ")));
    for (const g of gc) {
      if (!globalColors.find((x) => x.id === g.id)) globalColors.push(g);
    }
  }

  return { themeConfigs, globalColors };
}

function parseJson(json: any): ParseResult {
  // 1. Themebuilder v1 with metadata — perfect round-trip
  if (json["$themebuilder"]?.version === "1.0") {
    const meta = json["$themebuilder"];
    const theme: ThemeConfig = meta.theme;
    const gcs: GlobalColorConfig[] = meta.globalColors || [];
    if (theme?.colors?.length > 0) {
      return {
        themeConfigs: [
          {
            ...theme,
            id: `imported-${Date.now()}`,
            name: theme.name ? `${theme.name} (imported)` : "Imported Theme",
          },
        ],
        globalColors: gcs,
        format: "themebuilder-v1",
        warnings: [],
      };
    }
  }

  // 2. Token Studio format — use $themes to drive per-theme extraction
  if (json["$themes"]) {
    const tsResult = parseTokenStudioThemes(json);
    if (tsResult && tsResult.themeConfigs.length > 0) {
      return {
        ...tsResult,
        format: "token-studio",
        warnings: [],
      };
    }
    // Fell through (no source sets found) — fall back to generic mining below
  }

  // 3–5. Mine color scales from the whole file — works for Themebuilder raw,
  //       Style Dictionary, custom formats, etc.
  const scales = mineScales(json);

  if (scales.size > 0) {
    const { themeColors, globalColors } = categorise(scales);
    const isThemebuilderRaw = !!json.color && !!(json.theme || json.darkTheme);
    const format = isThemebuilderRaw ? "themebuilder-raw" : "generic";
    const warnings =
      format === "generic"
        ? ["Unrecognised token format — extracted color palettes automatically."]
        : ["Color seeds are approximate (extracted from ramp midpoint)."];

    return {
      themeConfigs: [buildThemeConfig(themeColors)],
      globalColors,
      format,
      warnings,
    };
  }

  // 5. Last resort: find any individual hex tokens
  const individuals = mineIndividual(json);
  if (individuals.size > 0) {
    const { themeColors, globalColors } = categorise(individuals);
    return {
      themeConfigs: [buildThemeConfig(themeColors)],
      globalColors,
      format: "generic",
      warnings: [
        `No color palettes detected — imported ${individuals.size} individual color value${individuals.size !== 1 ? "s" : ""} as seeds.`,
      ],
    };
  }

  return {
    themeConfigs: [],
    globalColors: [],
    format: "generic",
    warnings: ["No color values found in this file."],
  };
}

type ThemeColorConfig = { id: string; name: string; seed: string };

const FORMAT_LABELS: Record<string, string> = {
  "themebuilder-v1": "Themebuilder export — full fidelity",
  "themebuilder-raw": "Themebuilder export — approximate seeds",
  "token-studio": "Token Studio JSON",
  generic: "Custom token format",
};

export const ImportScreen: React.FC<{ isDarkMode: boolean; onClose: () => void }> = ({
  isDarkMode,
  onClose,
}) => {
  const { importThemes } = useTheme();
  const [status, setStatus] = useState<"idle" | "parsed" | "error">("idle");
  const [error, setError] = useState("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const result = parseJson(json);
        // Only hard-fail if zero colors were found at all
        if (result.themeConfigs.length === 0 && result.globalColors.length === 0) {
          setError(result.warnings[0] || "No color values found in this file.");
          setStatus("error");
        } else {
          setParseResult(result);
          setStatus("parsed");
        }
      } catch {
        setError("Could not parse this file — make sure it is valid JSON.");
        setStatus("error");
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

  const fg = isDarkMode ? "#f8fafc" : "#0f172a";
  const subtle = isDarkMode ? "#94a3b8" : "#64748b";
  const border = isDarkMode ? "#334155" : "#e2e8f0";
  const cardBg = isDarkMode ? "#0f172a" : "#fff";
  const chipBg = isDarkMode ? "#1e293b" : "#f1f5f9";
  const accent = isDarkMode ? "#C3E835" : "#0142FE";

  return (
    <SystemicModal
      variant="centered"
      isDarkMode={isDarkMode}
      onClose={onClose}
      maxWidth="540px"
      noPadding
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: `1px solid ${border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0, color: fg }}>
              Import Theme
            </h2>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: subtle }}>
              Load a Themebuilder or Token Studio JSON file
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: subtle,
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem" }}>
          {status !== "parsed" ? (
            <>
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? accent : border}`,
                  borderRadius: "8px",
                  padding: "3rem 2rem",
                  textAlign: "center",
                  cursor: "pointer",
                  background: isDragging
                    ? isDarkMode
                      ? "rgba(195,232,53,0.05)"
                      : "rgba(1,66,254,0.03)"
                    : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <Upload size={28} style={{ color: subtle, marginBottom: "0.75rem" }} />
                <p style={{ margin: 0, fontWeight: 600, color: fg, fontSize: "0.9375rem" }}>
                  Drop a JSON file here
                </p>
                <p style={{ margin: "0.375rem 0 0", fontSize: "0.875rem", color: subtle }}>
                  or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.tokens,.tokens.json"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>

              {status === "error" && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem 1rem",
                    background: isDarkMode ? "rgba(239,68,68,0.15)" : "#fee2e2",
                    borderRadius: "6px",
                    color: isDarkMode ? "#fca5a5" : "#b91c1c",
                    fontSize: "0.875rem",
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "flex-start",
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                  {error}
                </div>
              )}

              <div style={{ marginTop: "1.5rem" }}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: subtle,
                    margin: "0 0 0.625rem 0",
                  }}
                >
                  Supported formats
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[
                    {
                      label: "Themebuilder JSON",
                      desc: "Any JSON exported from this app — seeds preserved exactly",
                    },
                    {
                      label: "Token Studio / Figma Tokens",
                      desc: "Files from the Token Studio or Figma Tokens plugin",
                    },
                    {
                      label: "Style Dictionary, Tailwind, or custom",
                      desc: "Any JSON with named color scales or hex values",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        padding: "0.75rem 1rem",
                        background: cardBg,
                        border: `1px solid ${border}`,
                        borderRadius: "6px",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: fg }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: subtle, marginTop: "0.125rem" }}>
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            parseResult && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <CheckCircle size={17} color="#22c55e" />
                  <span style={{ fontWeight: 600, color: fg }}>Parsed successfully</span>
                  <span style={{ fontSize: "0.8125rem", color: subtle }}>
                    — {FORMAT_LABELS[parseResult.format] ?? parseResult.format}
                  </span>
                </div>

                {parseResult.themeConfigs.map((theme) => (
                  <div
                    key={theme.id}
                    style={{
                      padding: "1rem",
                      background: cardBg,
                      border: `1px solid ${border}`,
                      borderRadius: "6px",
                      marginBottom: "0.875rem",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: fg,
                        marginBottom: "0.25rem",
                        fontSize: "0.9375rem",
                      }}
                    >
                      {theme.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: subtle, marginBottom: "0.75rem" }}>
                      A new 12-step ramp will be generated from each extracted seed color
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {theme.colors.map((c) => (
                        <div
                          key={c.id}
                          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
                        >
                          {/* Seed swatch */}
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "4px",
                              background: c.seed,
                              display: "inline-block",
                              flexShrink: 0,
                              border: `1px solid rgba(0,0,0,0.12)`,
                            }}
                          />
                          {/* Mini generated ramp preview */}
                          <div style={{ display: "flex", gap: 2, flex: 1 }}>
                            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((pct) => (
                              <span
                                key={pct}
                                style={{
                                  flex: 1,
                                  height: 14,
                                  borderRadius: "2px",
                                  background: `color-mix(in oklch, ${c.seed} ${pct}%, white)`,
                                  display: "inline-block",
                                }}
                              />
                            ))}
                          </div>
                          {/* Name + seed hex */}
                          <div style={{ flexShrink: 0, textAlign: "right" }}>
                            <div style={{ fontWeight: 600, fontSize: "0.8125rem", color: fg }}>
                              {c.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: subtle,
                                fontFamily: "monospace",
                              }}
                            >
                              {c.seed}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {parseResult.globalColors.length > 0 && (
                  <div style={{ marginBottom: "0.875rem" }}>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: subtle,
                        margin: "0 0 0.5rem 0",
                      }}
                    >
                      Global colors to merge
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                      {parseResult.globalColors.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            padding: "0.3125rem 0.625rem",
                            background: chipBg,
                            borderRadius: "99px",
                            fontSize: "0.8125rem",
                          }}
                        >
                          <span
                            style={{
                              width: 11,
                              height: 11,
                              borderRadius: "50%",
                              background: c.seed,
                              display: "inline-block",
                              flexShrink: 0,
                              border: `1px solid rgba(0,0,0,0.1)`,
                            }}
                          />
                          <span style={{ color: fg }}>{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {parseResult.warnings.length > 0 && (
                  <div
                    style={{
                      marginBottom: "0.875rem",
                      padding: "0.75rem 1rem",
                      background: isDarkMode ? "rgba(234,179,8,0.12)" : "#fef9c3",
                      borderRadius: "6px",
                      color: isDarkMode ? "#fbbf24" : "#92400e",
                      fontSize: "0.8125rem",
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                    <div>{parseResult.warnings.join(" ")}</div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setStatus("idle");
                    setParseResult(null);
                    setError("");
                  }}
                  style={{
                    background: "none",
                    border: `1px solid ${border}`,
                    color: subtle,
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Choose a different file
                </button>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        {status === "parsed" && parseResult && (
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderTop: `1px solid ${border}`,
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              background: isDarkMode ? "#1e293b" : "#f8fafc",
            }}
          >
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: `1px solid ${border}`,
                color: fg,
                padding: "0.625rem 1.25rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.5rem",
                backgroundColor: accent,
                color: isDarkMode ? "#000" : "#fff",
                border: "none",
                borderRadius: "4px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Import{" "}
              {parseResult.themeConfigs.length > 1
                ? `${parseResult.themeConfigs.length} Themes`
                : "Theme"}
            </button>
          </div>
        )}
      </div>
    </SystemicModal>
  );
};
