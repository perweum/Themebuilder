import React from "react";
import { useTheme } from "../../theme-context";
import { COLOR_STEPS, ALPHA_STEPS } from "../../lib/palette-generator";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";

export const CustomizeDrawer: React.FC<{
  isDarkMode: boolean;
}> = ({ isDarkMode }) => {
  const { themes, globalColors, resolvedThemes, resolvedDefaultThemes, updateThemeSemanticOverride, clearAllSemanticOverrides } = useTheme();

  const accent = isDarkMode ? "#C3E835" : "#0142FE";
  const fg = isDarkMode ? "#F8F8F8" : "#1F1F1F";
  const bg = isDarkMode ? "#111" : "#fff";
  const borderCol = isDarkMode ? "#2a2a2a" : "#eee";
  const mutedFg = isDarkMode ? "#888" : "#666";
  const dividerCol = isDarkMode ? "#1f1f1f" : "#f3f4f6";

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

    // Build lookup sets for ordering
    const themeColorNames = new Map(
      (themes[0]?.colors ?? []).map((c, i) => [c.name.toLowerCase().replace(/\s+/g, "-"), i])
    );
    const GLOBAL_PREFERRED = ["neutral", "error", "success", "warning", "info", "caution", "critical"];
    const globalColorOrder = new Map<string, number>();
    GLOBAL_PREFERRED.forEach((n, i) => globalColorOrder.set(n, i));
    globalColors.forEach((gc) => {
      const key = gc.name.toLowerCase().replace(/\s+/g, "-");
      if (!globalColorOrder.has(key)) globalColorOrder.set(key, GLOBAL_PREFERRED.length + globalColorOrder.size);
    });

    for (const cat of Object.keys(cats)) {
      cats[cat].sort((a, b) => {
        const aKey = a.split(".")[1] ?? "";
        const bKey = b.split(".")[1] ?? "";
        const aThemeIdx = themeColorNames.get(aKey);
        const bThemeIdx = themeColorNames.get(bKey);
        const aGlobalIdx = globalColorOrder.get(aKey);
        const bGlobalIdx = globalColorOrder.get(bKey);
        // Groups: 0 = structural, 1 = theme colors, 2 = global colors
        const aGroup = aGlobalIdx !== undefined ? 2 : aThemeIdx !== undefined ? 1 : 0;
        const bGroup = bGlobalIdx !== undefined ? 2 : bThemeIdx !== undefined ? 1 : 0;
        if (aGroup !== bGroup) return aGroup - bGroup;
        if (aGroup === 1) return (aThemeIdx ?? 0) - (bThemeIdx ?? 0);
        if (aGroup === 2) return (aGlobalIdx ?? 99) - (bGlobalIdx ?? 99);
        return 0;
      });
    }

    return cats;
  }, [defaultTheme, themes, globalColors]);

  // First category open by default
  const categoryKeys = Object.keys(tokenCategories);
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>(() => {
    if (categoryKeys.length > 0) return { [categoryKeys[0]]: true };
    return {};
  });
  const categoryRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  // Open first category once categories load
  React.useEffect(() => {
    const keys = Object.keys(tokenCategories);
    if (keys.length > 0) {
      setExpandedCategories((prev) => {
        const hasAnyOpen = Object.values(prev).some(Boolean);
        if (hasAnyOpen) return prev;
        return { ...prev, [keys[0]]: true };
      });
    }
  }, [tokenCategories]);

  const getValueByPath = (obj: any, path: string) => {
    const parts = path.split(".");
    let current = obj;
    for (const part of parts) {
      if (!current) return null;
      current = current[part];
    }
    return current?.$value || null;
  };

  const resolveHex = (tokenRef: string | null): string | null => {
    if (!tokenRef) return null;
    let val = tokenRef;
    // Resolve one level of alias — translate {light.*}/{dark.*} to the payload's theme/darkTheme keys
    if (val?.startsWith("{")) {
      const inner = val.slice(1, -1);
      const mappedPath = inner.startsWith("light.")
        ? `theme.${inner.slice(6)}`
        : inner.startsWith("dark.")
        ? `darkTheme.${inner.slice(5)}`
        : inner;
      val = getValueByPath(activeThemePayloadWithOptions, mappedPath) || val;
    }
    // One more level in case it resolved to another ref
    if (val?.startsWith("{")) {
      const inner = val.slice(1, -1);
      const mappedPath = inner.startsWith("light.")
        ? `theme.${inner.slice(6)}`
        : inner.startsWith("dark.")
        ? `darkTheme.${inner.slice(5)}`
        : inner;
      val = getValueByPath(activeThemePayloadWithOptions, mappedPath) || val;
    }
    return val?.startsWith("#") ? val : null;
  };

  const getValStr = (obj: any, path: string) => {
    let cur = obj;
    for (const part of path.split(".")) {
      if (cur && cur[part] !== undefined) cur = cur[part];
      else return null;
    }
    return cur?.$value || null;
  };

  const renderSelectOptions = () => (
    <>
      {Object.keys(activeThemePayloadWithOptions?.color || {}).map((p) => (
        <optgroup key={p} label={p}>
          {(p === "white" || p === "black" ? ALPHA_STEPS : COLOR_STEPS).map((s) => (
            <option key={s} value={`{color.${p}.${s}}`}>
              {p}-{s}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );

  if (!activeTheme) return null;

  return (
    <div style={{ backgroundColor: bg, color: fg }}>
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "2rem 2rem 2.5rem",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.875rem", color: mutedFg, margin: 0 }}>
            Override specific token mappings for light and dark mode.
          </p>
          {Object.keys(activeTheme.semanticOverrides ?? {}).length > 0 && (
            <button
              onClick={() => clearAllSemanticOverrides(activeTheme.id)}
              style={{
                background: "none",
                border: `1px solid ${borderCol}`,
                borderRadius: "6px",
                color: "#ef4444",
                cursor: "pointer",
                padding: "0.375rem 0.75rem",
                fontSize: "0.8125rem",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                flexShrink: 0,
              }}
            >
              <RotateCcw size={13} />
              Reset all
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {Object.entries(tokenCategories).map(([category, paths], catIdx) => {
            const isExpanded = !!expandedCategories[category];

            return (
              <div key={category}>
                {catIdx > 0 && (
                  <div style={{ borderTop: `1px solid ${dividerCol}` }} />
                )}

                {/* Category header */}
                <button
                  ref={(el) => { categoryRefs.current[category] = el; }}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    background: "none",
                    border: "none",
                    color: "inherit",
                    padding: "1.25rem 0",
                    width: "100%",
                    textAlign: "left",
                  }}
                  onClick={() => {
                    const opening = !expandedCategories[category];
                    setExpandedCategories({ [category]: opening });
                    if (opening) {
                      requestAnimationFrame(() =>
                        categoryRefs.current[category]?.scrollIntoView({ behavior: "smooth", block: "start" })
                      );
                    }
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown size={16} style={{ flexShrink: 0, color: accent }} />
                  ) : (
                    <ChevronRight size={16} style={{ flexShrink: 0, color: mutedFg }} />
                  )}
                  <span style={{ fontSize: "1rem", fontWeight: 700, textTransform: "capitalize", flex: 1 }}>
                    {category}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: mutedFg }}>{paths.length} tokens</span>
                </button>

                {isExpanded && (
                  <div style={{ paddingBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    {/* Column headers */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto 1fr auto",
                        gap: "0.75rem",
                        padding: "0 0 0.5rem 0",
                        borderBottom: `1px solid ${dividerCol}`,
                        marginBottom: "0.375rem",
                      }}
                    >
                      {["Token", "Light Mode", "", "Dark Mode", ""].map((h, i) => (
                        <div key={i} style={{ fontSize: "0.8125rem", fontWeight: 700, color: mutedFg, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {h}
                        </div>
                      ))}
                    </div>

                    {paths.map((path) => {
                      const darkPath = `darkTheme.${path}`;
                      const isLightOverridden = activeTheme.semanticOverrides?.[path] !== undefined;
                      const isDarkOverridden = activeTheme.semanticOverrides?.[darkPath] !== undefined;

                      const lightVal =
                        activeTheme.semanticOverrides?.[path] ||
                        getValStr(defaultTheme?.theme || {}, path);
                      const darkVal =
                        activeTheme.semanticOverrides?.[darkPath] ||
                        getValStr(defaultTheme?.darkTheme || defaultTheme?.theme || {}, path);

                      const lightHex = resolveHex(
                        getValueByPath(activeThemePayloadWithOptions, `theme.${path}`) || lightVal
                      );
                      const darkHex = resolveHex(
                        getValueByPath(activeThemePayloadWithOptions, `darkTheme.${path}`) || darkVal
                      );

                      const tokenLabel = path.split(".").slice(1).join(" › ");

                      const swatchStyle: React.CSSProperties = {
                        width: 44,
                        height: 44,
                        borderRadius: "6px",
                        border: `1px solid ${borderCol}`,
                        flexShrink: 0,
                      };

                      const selectStyle: React.CSSProperties = {
                        flex: 1,
                        fontSize: "0.9375rem",
                        padding: "0.5rem 0.625rem",
                        background: isDarkMode ? "#1a1a1a" : "#f8f8f8",
                        color: "inherit",
                        border: `1px solid ${borderCol}`,
                        borderRadius: "6px",
                        minWidth: 0,
                        height: "44px",
                      };

                      const resetBtnStyle: React.CSSProperties = {
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,
                        opacity: 1,
                        width: "24px",
                      };

                      return (
                        <div
                          key={path}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr auto 1fr auto",
                            gap: "0.75rem",
                            alignItems: "center",
                            padding: "0.5rem 0",
                          }}
                        >
                          {/* Token name */}
                          <div style={{ fontSize: "1rem", fontWeight: 600, color: fg, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {tokenLabel}
                          </div>

                          {/* Light mode */}
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <div style={{ ...swatchStyle, background: lightHex || (isDarkMode ? "#2a2a2a" : "#e5e7eb") }} />
                            <select
                              value={lightVal || ""}
                              onChange={(e) =>
                                updateThemeSemanticOverride(activeTheme.id, path, e.target.value)
                              }
                              style={selectStyle}
                            >
                              {renderSelectOptions()}
                            </select>
                          </div>

                          {/* Light reset */}
                          <div style={{ width: "24px" }}>
                            {isLightOverridden && (
                              <button
                                onClick={() => updateThemeSemanticOverride(activeTheme.id, path, undefined)}
                                style={resetBtnStyle}
                                title="Reset light"
                              >
                                <RotateCcw size={14} />
                              </button>
                            )}
                          </div>

                          {/* Dark mode */}
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <div style={{ ...swatchStyle, background: darkHex || (isDarkMode ? "#2a2a2a" : "#e5e7eb") }} />
                            <select
                              value={darkVal || ""}
                              onChange={(e) =>
                                updateThemeSemanticOverride(activeTheme.id, darkPath, e.target.value)
                              }
                              style={selectStyle}
                            >
                              {renderSelectOptions()}
                            </select>
                          </div>

                          {/* Dark reset */}
                          <div style={{ width: "24px" }}>
                            {isDarkOverridden && (
                              <button
                                onClick={() => updateThemeSemanticOverride(activeTheme.id, darkPath, undefined)}
                                style={resetBtnStyle}
                                title="Reset dark"
                              >
                                <RotateCcw size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
