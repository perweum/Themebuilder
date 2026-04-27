import React from "react";
import { useTheme } from "../../theme-context";

interface PrimitiveTokensTabProps {
  isDarkMode: boolean;
  excludedPalettes: Set<string>;
  setExcludedPalettes: (s: Set<string>) => void;
}

export const PrimitiveTokensTab: React.FC<PrimitiveTokensTabProps> = ({
  isDarkMode,
  excludedPalettes,
  setExcludedPalettes,
}) => {
  const { themes, globalColors, resolvedThemes } = useTheme();
  const activeThemePayloadWithOptions = resolvedThemes[0];

  if (!activeThemePayloadWithOptions) return null;

  const colors = activeThemePayloadWithOptions.color;
  const themeNames =
    themes[0]?.colors.map((c: any) => c.name.toLowerCase().replace(/\s+/g, "-")) ?? [];
  const globalNames = globalColors.map((c: any) => c.name.toLowerCase().replace(/\s+/g, "-"));

  // Build ordered palette list: theme colors first, then globals, then white/black
  const orderedPalettes: { name: string; steps: any; label: string }[] = [];
  const seen = new Set<string>();

  themeNames.forEach((name: string) => {
    if (colors[name] && !seen.has(name)) {
      orderedPalettes.push({ name, steps: colors[name], label: `${name} Palette` });
      seen.add(name);
    }
  });
  globalNames.forEach((name: string) => {
    if (colors[name] && !seen.has(name)) {
      orderedPalettes.push({ name, steps: colors[name], label: `${name} Palette` });
      seen.add(name);
    }
  });
  if (colors.white && !seen.has("white"))
    orderedPalettes.push({ name: "white", steps: colors.white, label: "White (Alpha)" });
  if (colors.black && !seen.has("black"))
    orderedPalettes.push({ name: "black", steps: colors.black, label: "Black (Alpha)" });

  return (
    <>
      {orderedPalettes.map(({ name, steps, label }) => (
        <div key={name}>
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
              checked={!excludedPalettes.has(name)}
              onChange={(e) => {
                const next = new Set(excludedPalettes);
                e.target.checked ? next.delete(name) : next.add(name);
                setExcludedPalettes(next);
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
                opacity: excludedPalettes.has(name) ? 0.5 : 1,
              }}
            >
              {label}
            </h3>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
              gap: "0.5rem",
              opacity: excludedPalettes.has(name) ? 0.3 : 1,
              pointerEvents: excludedPalettes.has(name) ? "none" : "auto",
            }}
          >
            {Object.entries(steps).map(([stepKey, valObj]: [string, any]) => (
              <div
                key={stepKey}
                style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}
              >
                <div
                  style={{
                    height: "24px",
                    backgroundColor: valObj.$value,
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
                <div
                  style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem" }}
                >
                  <span style={{ fontWeight: 600 }}>{stepKey}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};
