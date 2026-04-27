import React from "react";
import { useTheme, ThemeScope } from "../theme-context";
import { ThemeBlock } from "./ThemeBlock";
import { PaletteViz } from "./PaletteViz";
import { ExportScreen } from "./ExportScreen";
import { ImportScreen } from "./ImportScreen";
import { ContrastChecker } from "./ContrastChecker";
import { TestThemeWebsite } from "./TestThemeWebsite";
import { ThemeToggle } from "./ThemeToggle";
import { Menu } from "lucide-react";

export type ThemeMode = "system" | "light" | "dark";

export const KitchenSink: React.FC<{
  isDarkMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (val: ThemeMode) => void;
  onShowOnboarding: () => void;
  isMobile: boolean;
  onMenuClick: () => void;
  activeThemeId: string;
  setActiveThemeId: (id: string) => void;
}> = ({
  isDarkMode,
  themeMode,
  setThemeMode,
  onShowOnboarding,
  isMobile,
  onMenuClick,
  activeThemeId,
  setActiveThemeId,
}) => {
  const { themes, globalColors } = useTheme();
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [isContrastOpen, setIsContrastOpen] = React.useState(false);
  const [isDemoOpen, setIsDemoOpen] = React.useState(false);

  React.useEffect(() => {
    if (!themes.find((t) => t.id === activeThemeId) && themes.length > 0) {
      setActiveThemeId(themes[0].id);
    }
  }, [themes, activeThemeId]);

  const activeTheme = themes.find((t) => t.id === activeThemeId) || themes[0];

  const containerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
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
    borderRadius: "0px",
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
                    /* Basic dark mode overrides for un-tokenized elements in Kitchen Sink */
                    .dark-mode h1, .dark-mode h2, .dark-mode h3, .dark-mode h4 { color: #fff !important; }
                    .dark-mode p { color: #aaa !important; }
                    .dark-mode .palette-viz-container { background: #222 !important; box-shadow: var(--color-shadow-3) !important; color: #fff; }
                    .dark-mode .palette-viz-container h2 { border-bottom-color: #444 !important; }

                    .theme-header-controls {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .capitalize { text-transform: capitalize; }
                    .header-control-select { transition: all 0.2s ease; }
                    .header-control-select:hover {
                        border-color: ${isDarkMode ? "#C3E835" : "#0142FE"} !important;
                        color: ${isDarkMode ? "#C3E835" : "#0142FE"} !important;
                        background-image: url('data:image/svg+xml;utf8,<svg fill="none" stroke="${isDarkMode ? "%23C3E835" : "%230142FE"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><polyline points="6 9 12 15 18 9"></polyline></svg>') !important;
                    }
                    .header-control-btn { transition: all 0.2s ease; }
                    .header-control-btn:hover {
                        border-color: ${isDarkMode ? "#C3E835" : "#0142FE"} !important;
                        color: ${isDarkMode ? "#C3E835" : "#0142FE"} !important;
                    }
                    .header-export-btn { transition: opacity 0.2s ease; }
                    .header-export-btn:hover { opacity: 0.9 !important; }
                `}</style>

          {/* Top Controls: Theme Selector (left) & action buttons (right) */}
          <div
            className="theme-header-controls"
            style={{
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                width: isMobile ? "100%" : "auto",
              }}
            >
              {isMobile && !isDemoOpen && (
                <button
                  onClick={onMenuClick}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: isDarkMode ? "#fff" : "#000",
                    cursor: "pointer",
                    padding: 0.5,
                    display: "flex",
                  }}
                >
                  <Menu size={28} />
                </button>
              )}
              <div>
                {themes.length > 1 ? (
                  <select
                    className="header-control-select"
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
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
                width: isMobile ? "100%" : "auto",
              }}
            >
              <ThemeToggle
                isDarkMode={isDarkMode}
                onChange={(isDark) => setThemeMode(isDark ? "dark" : "light")}
              />
              <button
                className="header-control-btn"
                onClick={() => setIsContrastOpen(true)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "1rem",
                  borderRadius: "0px",
                  border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
                  backgroundColor: "transparent",
                  color: isDarkMode ? "#fff" : "#000",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flex: isMobile ? "1 1 auto" : "none",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 2a10 10 0 0 0 0 20"></path>
                </svg>
                Contrast
              </button>

              <button
                className="header-control-btn"
                onClick={() => setIsDemoOpen(true)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "1rem",
                  borderRadius: "0px",
                  border: `1px solid ${isDarkMode ? "#C3E835" : "#0142FE"}`,
                  backgroundColor: "transparent",
                  color: isDarkMode ? "#C3E835" : "#0142FE",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flex: isMobile ? "1 1 auto" : "none",
                  justifyContent: "center",
                  fontWeight: 600,
                }}
              >
                Test Theme
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("systemic_onboarding_completed");
                  onShowOnboarding();
                }}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "1rem",
                  borderRadius: "0px",
                  background: "transparent",
                  color: isDarkMode ? "#94a3b8" : "#64748b",
                  border: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`,
                  cursor: "pointer",
                  fontWeight: 400,
                  flex: isMobile ? "1 1 auto" : "none",
                  textAlign: "center",
                }}
              >
                Quick Setup
              </button>

              <button
                onClick={() => setIsImportOpen(true)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "1rem",
                  borderRadius: "0px",
                  background: "transparent",
                  color: isDarkMode ? "#94a3b8" : "#64748b",
                  border: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`,
                  cursor: "pointer",
                  fontWeight: 400,
                  flex: isMobile ? "1 1 100%" : "none",
                  textAlign: "center",
                }}
              >
                Import
              </button>

              <button
                className="header-export-btn"
                onClick={() => setIsExportOpen(true)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "1rem",
                  borderRadius: "0px",
                  background: isDarkMode ? "#C3E835" : "#0142FE",
                  color: isDarkMode ? "#000" : "#fff",
                  cursor: "pointer",
                  fontWeight: 400,
                  flex: isMobile ? "1 1 100%" : "none",
                  textAlign: "center",
                }}
              >
                Export Theme
              </button>
            </div>
          </div>

          {isExportOpen && (
            <ExportScreen isDarkMode={isDarkMode} onClose={() => setIsExportOpen(false)} />
          )}
          {isImportOpen && (
            <ImportScreen isDarkMode={isDarkMode} onClose={() => setIsImportOpen(false)} />
          )}
          {isContrastOpen && (
            <ContrastChecker isDarkMode={isDarkMode} onClose={() => setIsContrastOpen(false)} />
          )}
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
        </div>
      </div>
    </ThemeScope>
  );
};
