import React from "react";
import { useTheme } from "../../theme-context";
import { ColorsTab } from "../controls/ColorsTab";
import FontPicker from "react-fontpicker-ts";
import "react-fontpicker-ts/dist/index.css";

type RadiusChoice = "sharp" | "rounded" | "pill";
type BorderChoice = "small" | "medium" | "large";

const RADIUS_OPTIONS: { id: RadiusChoice; label: string; px: number }[] = [
  { id: "sharp", label: "Sharp", px: 0 },
  { id: "rounded", label: "Rounded", px: 6 },
  { id: "pill", label: "Pill", px: 20 },
];

const BORDER_OPTIONS: { id: BorderChoice; label: string; px: number }[] = [
  { id: "small", label: "Thin", px: 1 },
  { id: "medium", label: "Medium", px: 2 },
  { id: "large", label: "Thick", px: 3 },
];

const SIZE_OPTIONS: { id: number; label: string; description: string }[] = [
  { id: 3, label: "Compact", description: "Tight spacing · 3px base" },
  { id: 4, label: "Default", description: "Standard spacing · 4px base" },
  { id: 6, label: "Spacious", description: "Open spacing · 6px base" },
];

const SHADOW_OPTIONS: { id: "none" | "on"; label: string; description: string }[] = [
  { id: "none", label: "No shadow", description: "Flat, no elevation" },
  { id: "on", label: "Shadow", description: "Depth via elevation" },
];

function radiusToChoice(px: number): RadiusChoice {
  if (px === 0) return "sharp";
  if (px <= 8) return "rounded";
  return "pill";
}

export const ThemeDrawer: React.FC<{
  isDarkMode: boolean;
  isMobile: boolean;
}> = ({ isDarkMode, isMobile }) => {
  const { themes, updateThemeGeometryValue, updateThemeFont } = useTheme();

  const accent = isDarkMode ? "#C3E835" : "#0142FE";
  const fg = isDarkMode ? "#F8F8F8" : "#1F1F1F";
  const bg = isDarkMode ? "#111" : "#fff";
  const borderCol = isDarkMode ? "#2a2a2a" : "#e5e7eb";
  const mutedFg = isDarkMode ? "#666" : "#9ca3af";
  const dividerCol = isDarkMode ? "#1f1f1f" : "#f3f4f6";

  const sectionHeading: React.CSSProperties = {
    fontSize: "1.125rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: fg,
    margin: 0,
  };

  const tileBase = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "0.875rem 0.75rem",
    borderRadius: "4px",
    border: `1.5px solid ${isActive ? accent : borderCol}`,
    background: isActive
      ? isDarkMode
        ? "rgba(195,232,53,0.07)"
        : "rgba(1,66,254,0.04)"
      : "transparent",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    color: isActive ? accent : fg,
    transition: "border-color 0.15s ease, background 0.15s ease, color 0.15s ease",
    minWidth: 0,
  });

  const tileLabel: React.CSSProperties = {
    fontSize: "0.8125rem",
    fontWeight: 600,
    letterSpacing: "0.01em",
    textAlign: "center",
  };

  const tileDesc: React.CSSProperties = {
    fontSize: "0.6875rem",
    color: mutedFg,
    textAlign: "center",
    lineHeight: 1.3,
  };

  const divider: React.CSSProperties = {
    borderTop: `1px solid ${dividerCol}`,
    margin: 0,
  };

  return (
    <div style={{ backgroundColor: bg, color: fg }}>
      <style>{`.drawer-tile:hover { border-color: ${accent} !important; }`}</style>

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: isMobile ? "1.5rem 1rem 2rem" : "2rem 2rem 2.5rem",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* ── COLORS ─────────────────────────────── */}
        <section style={{ paddingBottom: "2rem" }}>
          <h2 style={{ ...sectionHeading, marginBottom: "1.25rem" }}>Colors</h2>
          <ColorsTab isDarkMode={isDarkMode} isMobile={isMobile} />
        </section>

        <hr style={divider} />

        {/* ── TYPOGRAPHY ─────────────────────────── */}
        <section style={{ padding: "2rem 0" }}>
          <h2 style={{ ...sectionHeading, marginBottom: "1.25rem" }}>Typography</h2>
          {themes.map((theme) => (
            <div key={`font-${theme.id}`} style={{ marginBottom: themes.length > 1 ? "2rem" : 0 }}>
              {themes.length > 1 && (
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: mutedFg, marginBottom: "0.75rem" }}>
                  {theme.name || theme.id}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "2rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                <div
                  style={{
                    fontFamily: `"${theme.fontFamily || "Inter"}", sans-serif`,
                    fontSize: "3.5rem",
                    fontWeight: 700,
                    lineHeight: 1,
                    color: fg,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Aa
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: `"${theme.fontFamily || "Inter"}", sans-serif`,
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: fg,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {theme.fontFamily || "Inter"}
                  </div>
                  <div
                    style={{
                      fontFamily: `"${theme.fontFamily || "Inter"}", sans-serif`,
                      fontSize: "0.875rem",
                      color: mutedFg,
                      lineHeight: 1.5,
                    }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </div>
                </div>
              </div>
              <div
                style={{
                  border: `1px solid ${borderCol}`,
                  borderRadius: "4px",
                  padding: "0.25rem",
                  background: "transparent",
                  maxWidth: "360px",
                }}
              >
                <FontPicker
                  defaultValue={theme.fontFamily || "Inter"}
                  value={(val: any) => updateThemeFont(theme.id, val)}
                  autoLoad={true}
                />
              </div>
            </div>
          ))}
        </section>

        <hr style={divider} />

        {/* ── GEOMETRY ───────────────────────────── */}
        {themes.map((theme, ti) => {
          const geometry = theme.geometry || {
            radiusBase: 4,
            includeRadius: true,
            includeBorders: true,
            borderWidth: "small" as const,
            sizeBase: 4,
            includeShadow: true,
          };
          const currentRadius = radiusToChoice(geometry.radiusBase ?? 4);
          const currentSizeBase = geometry.sizeBase ?? 4;
          const hasShadow = geometry.includeShadow !== false;

          const applyRadius = (choice: RadiusChoice) => {
            const px = choice === "sharp" ? 0 : choice === "rounded" ? 4 : 20;
            updateThemeGeometryValue(theme.id, "radiusBase", px);
            updateThemeGeometryValue(theme.id, "includeRadius", choice !== "sharp");
          };

          return (
            <React.Fragment key={`geo-${theme.id}`}>
              {/* Corner Radius */}
              <section style={{ padding: "2rem 0" }}>
                {themes.length > 1 && ti === 0 && (
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: mutedFg, marginBottom: "0.5rem" }}>
                    {theme.name || theme.id}
                  </div>
                )}
                <h2 style={{ ...sectionHeading, marginBottom: "1rem" }}>Corner Radius</h2>
                <div style={{ display: "flex", gap: "0.625rem" }}>
                  {RADIUS_OPTIONS.map(({ id, label, px }) => (
                    <button
                      key={id}
                      className="drawer-tile"
                      onClick={() => applyRadius(id)}
                      style={tileBase(currentRadius === id)}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "28px",
                          border: "2px solid currentColor",
                          borderRadius: `${px}px`,
                        }}
                      />
                      <span style={tileLabel}>{label}</span>
                    </button>
                  ))}
                  <div style={{ flex: 3 }} />
                </div>
              </section>

              <hr style={divider} />

              {/* Border Width */}
              <section style={{ padding: "2rem 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <h2 style={sectionHeading}>Border Width</h2>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: mutedFg }}>
                    <input
                      type="checkbox"
                      checked={geometry.includeBorders}
                      onChange={(e) => updateThemeGeometryValue(theme.id, "includeBorders", e.target.checked)}
                      style={{ accentColor: accent }}
                    />
                    Include borders
                  </label>
                </div>
                {geometry.includeBorders ? (
                  <div style={{ display: "flex", gap: "0.625rem" }}>
                    {BORDER_OPTIONS.map(({ id, label, px }) => {
                      const isActive = geometry.borderWidth === id;
                      return (
                        <button
                          key={id}
                          className="drawer-tile"
                          onClick={() => updateThemeGeometryValue(theme.id, "borderWidth", id)}
                          style={tileBase(isActive)}
                        >
                          <div style={{ width: "40px", height: `${px * 2}px`, minHeight: "2px", background: "currentColor", borderRadius: "1px" }} />
                          <span style={tileLabel}>{label}</span>
                        </button>
                      );
                    })}
                    <div style={{ flex: 3 }} />
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: "0.875rem", color: mutedFg }}>Borders disabled for this theme.</p>
                )}
              </section>

              <hr style={divider} />

              {/* Size Scale */}
              <section style={{ padding: "2rem 0" }}>
                <h2 style={{ ...sectionHeading, marginBottom: "1rem" }}>Size Scale</h2>
                <div style={{ display: "flex", gap: "0.625rem" }}>
                  {SIZE_OPTIONS.map(({ id, label, description }) => {
                    const isActive = currentSizeBase === id;
                    return (
                      <button
                        key={id}
                        className="drawer-tile"
                        onClick={() => updateThemeGeometryValue(theme.id, "sizeBase", id)}
                        style={{ ...tileBase(isActive), alignItems: "flex-start", padding: "0.875rem 1rem" }}
                      >
                        <div style={{ display: "flex", gap: "3px", alignItems: "flex-end", height: "20px", marginBottom: "0.25rem" }}>
                          {[1, 2, 3].map((n) => (
                            <div
                              key={n}
                              style={{
                                width: `${n * id + 2}px`,
                                height: `${n * id + 2}px`,
                                background: "currentColor",
                                borderRadius: "1px",
                                opacity: 0.9,
                              }}
                            />
                          ))}
                        </div>
                        <span style={tileLabel}>{label}</span>
                        <span style={tileDesc}>{description}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <hr style={divider} />

              {/* Shadow */}
              <section style={{ padding: "2rem 0 0" }}>
                <h2 style={{ ...sectionHeading, marginBottom: "1rem" }}>Shadow</h2>
                <div style={{ display: "flex", gap: "0.625rem" }}>
                  {SHADOW_OPTIONS.map(({ id, label, description }) => {
                    const isActive = id === "none" ? !hasShadow : hasShadow;
                    return (
                      <button
                        key={id}
                        className="drawer-tile"
                        onClick={() => updateThemeGeometryValue(theme.id, "includeShadow", id !== "none")}
                        style={{ ...tileBase(isActive), alignItems: "flex-start", padding: "0.875rem 1rem" }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "24px",
                            background: isDarkMode ? "#333" : "#e5e7eb",
                            borderRadius: "3px",
                            boxShadow:
                              id === "on"
                                ? "0 4px 8px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1)"
                                : "none",
                            marginBottom: "0.25rem",
                          }}
                        />
                        <span style={tileLabel}>{label}</span>
                        <span style={tileDesc}>{description}</span>
                      </button>
                    );
                  })}
                  <div style={{ flex: 2 }} />
                </div>
              </section>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
