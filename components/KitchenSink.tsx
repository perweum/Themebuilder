import React from "react";
import { useTheme, ThemeScope } from "../theme-context";
import { ThemeBlock } from "./ThemeBlock";
import { PaletteViz } from "./PaletteViz";
import { ContrastChecker } from "./ContrastChecker";
import { TestThemeWebsite } from "./TestThemeWebsite";

export type ThemeMode = "system" | "light" | "dark";

export const KitchenSink: React.FC<{
  isDarkMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (val: ThemeMode) => void;
  onShowOnboarding: () => void;
  isMobile: boolean;
  activeThemeId: string;
  setActiveThemeId: (id: string) => void;
}> = ({
  isDarkMode,
  themeMode,
  setThemeMode,
  onShowOnboarding,
  isMobile,
  activeThemeId,
  setActiveThemeId,
}) => {
  const { themes, globalColors } = useTheme();
  const [isDemoOpen, setIsDemoOpen] = React.useState(false);

  React.useEffect(() => {
    if (!themes.find((t) => t.id === activeThemeId) && themes.length > 0) {
      setActiveThemeId(themes[0].id);
    }
  }, [themes, activeThemeId]);

  const activeTheme = themes.find((t) => t.id === activeThemeId) || themes[0];

  const containerStyle: React.CSSProperties = {
    flex: 1,
    padding: isMobile ? "1.5rem 1rem" : "3rem",
    backgroundColor: "var(--color-background-default, #F8F8F8)",
    color: "var(--color-text-default, #1F1F1F)",
    fontFamily: "var(--theme-font-family)",
    transition: "all 0.4s cubic-bezier(0.2, 0, 0, 1)",
    width: "100%",
    boxSizing: "border-box",
  };

  const selectStyle: React.CSSProperties = {
    padding: "0.5rem 2.5rem 0.5rem 1rem",
    fontSize: "1rem",
    borderRadius: "4px",
    border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
    backgroundColor: "transparent",
    color: isDarkMode ? "#fff" : "#000",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="${isDarkMode ? "%23FFF" : "%23000"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg>')`,
    backgroundRepeat: "no-repeat",
    backgroundPositionX: "calc(100% - 0.5rem)",
    backgroundPositionY: "50%",
  };

  const ghostBtn: React.CSSProperties = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "0.5rem 0.75rem",
    borderRadius: "4px",
    fontSize: "0.875rem",
    fontWeight: 400,
    color: isDarkMode ? "#94a3b8" : "#64748b",
  };

  return (
    <ThemeScope themeConfig={activeTheme} globalColors={globalColors} isDarkMode={isDarkMode}>
      <div style={containerStyle} className={isDarkMode ? "dark-mode" : ""}>
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "3rem",
            transition: "all 0.4s cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          <style>{`
            .dark-mode h1, .dark-mode h2, .dark-mode h3, .dark-mode h4 { color: #fff !important; }
            .dark-mode p { color: #aaa !important; }
            .dark-mode .palette-viz-container { background: #222 !important; box-shadow: var(--color-shadow-3) !important; color: #fff; }
            .dark-mode .palette-viz-container h2 { border-bottom-color: #444 !important; }
            .ks-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; }
            .ks-ghost-btn { transition: color 0.15s ease; }
            .ks-ghost-btn:hover { color: ${isDarkMode ? "#C3E835" : "#0142FE"} !important; }
            .capitalize { text-transform: capitalize; }
          `}</style>

          {/* Toolbar: theme selector + actions */}
          <div className="ks-toolbar">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {themes.length > 1 ? (
                <select
                  value={activeTheme?.id || ""}
                  onChange={(e) => setActiveThemeId(e.target.value)}
                  style={selectStyle}
                >
                  {themes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name || t.id} Components
                    </option>
                  ))}
                </select>
              ) : (
                <span style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                  {activeTheme?.name || activeTheme?.id || "Theme"} Components
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <button
                className="ks-ghost-btn"
                onClick={() => setIsDemoOpen(true)}
                style={{
                  ...ghostBtn,
                  color: isDarkMode ? "#C3E835" : "#0142FE",
                  fontWeight: 600,
                  border: `1px solid ${isDarkMode ? "#C3E835" : "#0142FE"}`,
                  borderRadius: "4px",
                  padding: "0.5rem 1rem",
                  flex: isMobile ? "1 1 auto" : "none",
                  textAlign: "center",
                }}
              >
                Test Theme
              </button>
              <button
                className="ks-ghost-btn"
                onClick={onShowOnboarding}
                style={{
                  ...ghostBtn,
                  border: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`,
                  borderRadius: "4px",
                  padding: "0.5rem 1rem",
                  flex: isMobile ? "1 1 auto" : "none",
                  textAlign: "center",
                }}
              >
                Quick Setup
              </button>
            </div>
          </div>

          {isDemoOpen && activeTheme && (
            <TestThemeWebsite
              isDarkMode={isDarkMode}
              activeTheme={activeTheme}
              onClose={() => setIsDemoOpen(false)}
              onToggleTheme={() => setThemeMode(isDarkMode ? "light" : "dark")}
            />
          )}

          {activeTheme && (
            <ThemeBlock
              themeConfig={activeTheme}
              globalColors={globalColors}
              isDarkMode={isDarkMode}
            />
          )}

          <PaletteViz isDarkMode={isDarkMode} />

          <ContrastChecker isDarkMode={isDarkMode} inline />
        </div>
      </div>
    </ThemeScope>
  );
};
