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
  const borderCol = isDarkMode ? "#2a2a2a" : "#eee";
  const mutedFg = isDarkMode ? "#888" : "#666";

  const sectionLabel: React.CSSProperties = {
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: accent,
    margin: "0 0 1.25rem 0",
  };

  const tileBase = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "0.875rem 0.5rem",
    border: `2px solid ${isActive ? accent : borderCol}`,
    background: isActive
      ? isDarkMode
        ? "rgba(195,232,53,0.07)"
        : "rgba(1,66,254,0.04)"
      : "transparent",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.625rem",
    color: isActive ? accent : fg,
    transition: "border-color 0.15s ease, background 0.15s ease, color 0.15s ease",
  });

  const tileLabel: React.CSSProperties = {
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.01em",
  };

  return (
    <div
      style={{
        backgroundColor: bg,
        color: fg,
        overflowY: "auto",
      }}
      className="no-scrollbar"
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .btn-remove { transition: color 0.2s ease; color: inherit !important; }
        .btn-remove:hover { color: #ef4444 !important; }
        .btn-action { transition: all 0.2s ease; }
        .btn-action:hover {
          border-color: ${accent} !important;
          color: ${accent} !important;
        }
        .drawer-tile:hover { border-color: ${accent} !important; }
      `}</style>

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: isMobile ? "1.5rem 1rem" : "2rem 2.5rem",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "2rem" : "4rem",
          alignItems: "start",
        }}
      >
        {/* ── Left column: Colors ── */}
        <div>
          <p style={sectionLabel}>Colors</p>
          <ColorsTab isDarkMode={isDarkMode} isMobile={isMobile} />
        </div>

        {/* ── Right column: Typography + Geometry ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {/* Typography */}
          <div>
            <p style={sectionLabel}>Typography</p>
            {themes.map((theme) => (
              <div key={`font-${theme.id}`} style={{ marginBottom: themes.length > 1 ? "2rem" : 0 }}>
                {themes.length > 1 && (
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", color: mutedFg }}>
                    {theme.name || theme.id}
                  </div>
                )}
                <div
                  style={{
                    fontFamily: `"${theme.fontFamily || "Inter"}", sans-serif`,
                    fontSize: "3rem",
                    fontWeight: 700,
                    lineHeight: 1,
                    marginBottom: "0.375rem",
                    color: fg,
                  }}
                >
                  Aa
                </div>
                <div
                  style={{
                    fontFamily: `"${theme.fontFamily || "Inter"}", sans-serif`,
                    fontSize: "0.9375rem",
                    color: mutedFg,
                    marginBottom: "1rem",
                    lineHeight: 1.5,
                  }}
                >
                  The quick brown fox jumps over the lazy dog
                </div>
                <div
                  style={{
                    border: `1px solid ${borderCol}`,
                    padding: "0.25rem",
                    background: "transparent",
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
          </div>

          {/* Geometry */}
          <div>
            <p style={sectionLabel}>Geometry</p>
            {themes.map((theme) => {
              const geometry = theme.geometry || {
                radiusBase: 4,
                includeRadius: true,
                includeBorders: true,
                borderWidth: "small" as const,
              };
              const currentRadius = radiusToChoice(geometry.radiusBase ?? 4);

              const applyRadius = (choice: RadiusChoice) => {
                const px = choice === "sharp" ? 0 : choice === "rounded" ? 4 : 20;
                updateThemeGeometryValue(theme.id, "radiusBase", px);
                updateThemeGeometryValue(theme.id, "includeRadius", choice !== "sharp");
              };

              return (
                <div key={`geo-${theme.id}`} style={{ marginBottom: themes.length > 1 ? "2rem" : 0 }}>
                  {themes.length > 1 && (
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem", color: mutedFg }}>
                      {theme.name || theme.id}
                    </div>
                  )}

                  {/* Corner Radius */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: mutedFg,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.625rem",
                      }}
                    >
                      Corner Radius
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {RADIUS_OPTIONS.map(({ id, label, px }) => (
                        <button
                          key={id}
                          className="drawer-tile"
                          onClick={() => applyRadius(id)}
                          style={tileBase(currentRadius === id)}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "24px",
                              border: "2px solid currentColor",
                              borderRadius: `${px}px`,
                            }}
                          />
                          <span style={tileLabel}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border Width */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.625rem",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: mutedFg,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={geometry.includeBorders}
                          onChange={(e) =>
                            updateThemeGeometryValue(theme.id, "includeBorders", e.target.checked)
                          }
                          style={{ accentColor: accent }}
                        />
                        Border Width
                      </label>
                    </div>
                    {geometry.includeBorders && (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {BORDER_OPTIONS.map(({ id, label, px }) => {
                          const isActive = geometry.borderWidth === id;
                          return (
                            <button
                              key={id}
                              className="drawer-tile"
                              onClick={() => updateThemeGeometryValue(theme.id, "borderWidth", id)}
                              style={tileBase(isActive)}
                            >
                              <div
                                style={{
                                  width: "32px",
                                  height: `${px * 2}px`,
                                  minHeight: "2px",
                                  background: "currentColor",
                                  borderRadius: "1px",
                                }}
                              />
                              <span style={tileLabel}>{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
