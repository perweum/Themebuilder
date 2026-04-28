import React from "react";
import { useTheme } from "../../theme-context";
import { COLOR_STEPS, ALPHA_STEPS } from "../../lib/palette-generator";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";

export const CustomizeDrawer: React.FC<{
  isDarkMode: boolean;
}> = ({ isDarkMode }) => {
  const { themes, resolvedThemes, resolvedDefaultThemes, updateThemeSemanticOverride } = useTheme();
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({});

  const accent = isDarkMode ? "#C3E835" : "#0142FE";
  const fg = isDarkMode ? "#F8F8F8" : "#1F1F1F";
  const bg = isDarkMode ? "#111" : "#fff";
  const borderCol = isDarkMode ? "#2a2a2a" : "#eee";
  const cardBg = isDarkMode ? "#1a1a1a" : "#f8fafc";
  const tokenBg = isDarkMode ? "#222" : "#fff";
  const mutedFg = isDarkMode ? "#888" : "#666";

  const activeTheme = themes[0];
  const defaultTheme = resolvedDefaultThemes[0];
  const activeThemePayloadWithOptions = resolvedThemes[0];

  const tokenCategories = React.useMemo(() => {
    if (!defaultTheme) return {};
    const cats: Record<string, string[]> = {};
    const flatten = (obj: any, currentPath = "") => {
      for (const key in obj) {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null) {
          if (obj[key].$value !== undefined) {
            if (obj[key].$type === "color") {
              const rootCategory = newPath.split(".")[0];
              if (!cats[rootCategory]) cats[rootCategory] = [];
              cats[rootCategory].push(newPath);
            }
          } else {
            flatten(obj[key], newPath);
          }
        }
      }
    };
    flatten(defaultTheme.theme);
    return cats;
  }, [defaultTheme]);

  const getValStr = (obj: any, path: string) => {
    let cur = obj;
    for (const part of path.split(".")) {
      if (cur && cur[part] !== undefined) cur = cur[part];
      else return null;
    }
    return cur?.$value || null;
  };

  if (!activeTheme) return null;

  return (
    <div
      style={{ backgroundColor: bg, color: fg, overflowY: "auto" }}
      className="no-scrollbar"
    >
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "2rem 2.5rem",
        }}
      >
        <p
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: accent,
            margin: "0 0 1.5rem 0",
          }}
        >
          Semantic Token Overrides
        </p>

        <p style={{ fontSize: "0.875rem", color: mutedFg, margin: "0 0 1.5rem 0" }}>
          Override specific token mappings for light and dark mode. Resets to default when cleared.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {Object.entries(tokenCategories).map(([category, paths]) => (
            <div
              key={category}
              style={{
                background: cardBg,
                borderRadius: "8px",
                padding: "1rem",
                border: `1px solid ${borderCol}`,
              }}
            >
              <button
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "none",
                  border: "none",
                  color: "inherit",
                  padding: 0,
                  width: "100%",
                  textAlign: "left",
                }}
                onClick={() =>
                  setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }))
                }
              >
                {expandedCategories[category] ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {category}
                </span>
                <span style={{ fontSize: "0.75rem", color: mutedFg, marginLeft: "auto" }}>
                  {paths.length}
                </span>
              </button>

              {expandedCategories[category] && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    marginTop: "0.75rem",
                  }}
                >
                  {paths.map((path) => {
                    const darkPath = `darkTheme.${path}`;
                    const isLightOverridden = activeTheme.semanticOverrides?.[path] !== undefined;
                    const isDarkOverridden =
                      activeTheme.semanticOverrides?.[darkPath] !== undefined;

                    const lightVal =
                      activeTheme.semanticOverrides?.[path] ||
                      getValStr(defaultTheme?.theme || {}, path);
                    const darkVal =
                      activeTheme.semanticOverrides?.[darkPath] ||
                      getValStr(defaultTheme?.darkTheme || defaultTheme?.theme || {}, path);

                    return (
                      <div
                        key={path}
                        style={{
                          padding: "0.5rem",
                          background: tokenBg,
                          borderRadius: "6px",
                          border: `1px solid ${borderCol}`,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.8125rem",
                            marginBottom: "0.375rem",
                            color: fg,
                          }}
                        >
                          {path.split(".").slice(1).join(" › ")}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                          {/* Light */}
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                                width: "20px",
                                color: mutedFg,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              L
                            </span>
                            <select
                              value={lightVal || ""}
                              onChange={(e) =>
                                updateThemeSemanticOverride(activeTheme.id, path, e.target.value)
                              }
                              style={{
                                flex: 1,
                                fontSize: "0.75rem",
                                padding: "2px 4px",
                                background: isDarkMode ? "#111" : "#fff",
                                color: "inherit",
                                border: `1px solid ${borderCol}`,
                                borderRadius: "3px",
                              }}
                            >
                              {Object.keys(activeThemePayloadWithOptions?.color || {}).map((p) => (
                                <optgroup key={p} label={p}>
                                  {(p === "white" || p === "black" ? ALPHA_STEPS : COLOR_STEPS).map(
                                    (s) => (
                                      <option key={s} value={`{color.${p}.${s}}`}>
                                        {p}-{s}
                                      </option>
                                    ),
                                  )}
                                </optgroup>
                              ))}
                            </select>
                            {isLightOverridden && (
                              <button
                                onClick={() =>
                                  updateThemeSemanticOverride(activeTheme.id, path, undefined)
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#ef4444",
                                  cursor: "pointer",
                                  padding: "2px",
                                  display: "flex",
                                }}
                                title="Reset to default"
                              >
                                <RotateCcw size={11} />
                              </button>
                            )}
                          </div>

                          {/* Dark */}
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                                width: "20px",
                                color: mutedFg,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              D
                            </span>
                            <select
                              value={darkVal || ""}
                              onChange={(e) =>
                                updateThemeSemanticOverride(
                                  activeTheme.id,
                                  darkPath,
                                  e.target.value,
                                )
                              }
                              style={{
                                flex: 1,
                                fontSize: "0.75rem",
                                padding: "2px 4px",
                                background: isDarkMode ? "#111" : "#fff",
                                color: "inherit",
                                border: `1px solid ${borderCol}`,
                                borderRadius: "3px",
                              }}
                            >
                              {Object.keys(activeThemePayloadWithOptions?.color || {}).map((p) => (
                                <optgroup key={p} label={p}>
                                  {(p === "white" || p === "black" ? ALPHA_STEPS : COLOR_STEPS).map(
                                    (s) => (
                                      <option key={s} value={`{color.${p}.${s}}`}>
                                        {p}-{s}
                                      </option>
                                    ),
                                  )}
                                </optgroup>
                              ))}
                            </select>
                            {isDarkOverridden && (
                              <button
                                onClick={() =>
                                  updateThemeSemanticOverride(activeTheme.id, darkPath, undefined)
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#ef4444",
                                  cursor: "pointer",
                                  padding: "2px",
                                  display: "flex",
                                }}
                                title="Reset to default"
                              >
                                <RotateCcw size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
