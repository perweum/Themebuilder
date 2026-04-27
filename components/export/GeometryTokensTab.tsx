import React from "react";
import { useTheme } from "../../theme-context";

interface GeometryTokensTabProps {
  isDarkMode: boolean;
  excludedGeometry: Set<string>;
  setExcludedGeometry: (s: Set<string>) => void;
}

export const GeometryTokensTab: React.FC<GeometryTokensTabProps> = ({
  isDarkMode,
  excludedGeometry,
  setExcludedGeometry,
}) => {
  const { resolvedThemes } = useTheme();
  const geometry = resolvedThemes[0]?.geometry;

  if (!geometry) return null;

  const geoCategories = ["radius", "borderWidth"];

  return (
    <>
      {geoCategories.map((category) => {
        if (!geometry[category]) return null;
        const steps = geometry[category];

        return (
          <div key={category}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                borderBottom: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`,
                paddingBottom: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <input
                type="checkbox"
                checked={!excludedGeometry.has(category)}
                onChange={(e) => {
                  const next = new Set(excludedGeometry);
                  e.target.checked ? next.delete(category) : next.add(category);
                  setExcludedGeometry(next);
                }}
                style={{
                  accentColor: isDarkMode ? "#C3E835" : "#0142FE",
                  cursor: "pointer",
                  width: "16px",
                  height: "16px",
                }}
              />
              <h3
                style={{
                  textTransform: "capitalize",
                  fontSize: "1rem",
                  margin: 0,
                  color: isDarkMode ? "#f8fafc" : "#0f172a",
                  opacity: excludedGeometry.has(category) ? 0.5 : 1,
                }}
              >
                {category === "radius" ? "Border Radius" : "Border Width"}
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: "0.5rem",
                opacity: excludedGeometry.has(category) ? 0.3 : 1,
                pointerEvents: excludedGeometry.has(category) ? "none" : "auto",
              }}
            >
              {Object.entries(steps).map(([stepKey, valObj]: [string, any]) => {
                const isAlias = valObj.$value.startsWith("{");
                return (
                  <div
                    key={stepKey}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                      padding: "0.5rem",
                      background: isDarkMode ? "#1e293b" : "#f8fafc",
                      borderRadius: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.75rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{stepKey}</span>
                      <span style={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>
                        {valObj.$value}
                      </span>
                    </div>
                    {!isAlias && category === "radius" && (
                      <div
                        style={{
                          height: "24px",
                          backgroundColor: isDarkMode ? "#334155" : "#e2e8f0",
                          borderRadius: valObj.$value,
                          border: `1px solid ${isDarkMode ? "#475569" : "#cbd5e1"}`,
                        }}
                      />
                    )}
                    {!isAlias && category === "borderWidth" && (
                      <div
                        style={{
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: isDarkMode ? "#0f172a" : "#fff",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            borderTop: `${valObj.$value} solid ${isDarkMode ? "#94a3b8" : "#64748b"}`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};
