import React from "react";
import { useTheme } from "../../theme-context";
import FontPicker from "react-fontpicker-ts";
import "react-fontpicker-ts/dist/index.css";

export const GeometryTab: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const { themes, updateThemeGeometryValue, updateThemeFont } = useTheme();

  const label: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: isDarkMode ? "#C3E835" : "#0142FE",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "flex",
    justifyContent: "space-between",
  };

  const group: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginBottom: "1rem",
  };

  const actionBtn: React.CSSProperties = {
    background: "transparent",
    color: isDarkMode ? "#F8F8F8" : "#1F1F1F",
    border: `1px solid ${isDarkMode ? "#F8F8F8" : "#1F1F1F"}`,
    padding: "0.5rem",
    borderRadius: "0px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "all 0.2s ease",
    width: "100%",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "1.5rem" }}>
      {themes.map((theme) => {
        const geometry = theme.geometry || {
          radiusBase: 4,
          includeRadius: true,
          includeBorders: true,
          borderWidth: "small",
        };
        return (
          <div
            key={`geo-${theme.id}`}
            style={{
              border: "none",
              borderRadius: "8px",
              padding: "1.5rem",
              backgroundColor: isDarkMode ? "#1a1a1a" : "#f9fafb",
            }}
          >
            <div style={group}>
              <label style={label}>Global Font</label>
              <div
                style={{
                  border: `1px solid ${isDarkMode ? "#F8F8F8" : "#1F1F1F"}`,
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

            <div style={{ marginTop: "2rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 1rem 0" }}>Geometry</h3>

              <div style={group}>
                <label
                  style={{
                    ...label,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    textTransform: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={geometry.includeRadius}
                    onChange={(e) =>
                      updateThemeGeometryValue(theme.id, "includeRadius", e.target.checked)
                    }
                    style={{ accentColor: isDarkMode ? "#C3E835" : "#0142FE" }}
                  />
                  Include Border Radius
                </label>
                <label
                  style={{
                    ...label,
                    marginTop: "0.5rem",
                    opacity: geometry.includeRadius ? 1 : 0.5,
                  }}
                >
                  Radius Base (px)
                </label>
                <input
                  type="number"
                  min="0"
                  max="64"
                  value={geometry.radiusBase}
                  disabled={!geometry.includeRadius}
                  onChange={(e) =>
                    updateThemeGeometryValue(theme.id, "radiusBase", Number(e.target.value))
                  }
                  style={{ ...actionBtn, opacity: geometry.includeRadius ? 1 : 0.5 }}
                />
              </div>

              <div style={{ ...group, marginTop: "1.5rem" }}>
                <label
                  style={{
                    ...label,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    textTransform: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={geometry.includeBorders}
                    onChange={(e) =>
                      updateThemeGeometryValue(theme.id, "includeBorders", e.target.checked)
                    }
                    style={{ accentColor: isDarkMode ? "#C3E835" : "#0142FE" }}
                  />
                  Include Borders
                </label>
              </div>

              {geometry.includeBorders && (
                <div style={group}>
                  <label style={label}>Border Width</label>
                  <select
                    value={geometry.borderWidth}
                    onChange={(e) =>
                      updateThemeGeometryValue(theme.id, "borderWidth", e.target.value as any)
                    }
                    style={{ ...actionBtn, appearance: "auto" }}
                  >
                    <option value="small">Small (1px)</option>
                    <option value="medium">Medium (2px)</option>
                    <option value="large">Large (3px)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
