import React from "react";
import { ThemeProvider, useTheme } from "./theme-context";
import { TopHeader } from "./components/TopHeader";
import type { DrawerType } from "./components/TopHeader";
import { KitchenSink } from "./components/KitchenSink";
import { OnboardingModal } from "./components/OnboardingModal";
import { ThemeDrawer } from "./components/drawers/ThemeDrawer";
import { CustomizeDrawer } from "./components/drawers/CustomizeDrawer";
import { ExportScreen } from "./components/ExportScreen";
import { ImportScreen } from "./components/ImportScreen";

export type { ThemeMode } from "./components/KitchenSink";
import type { ThemeMode } from "./components/KitchenSink";

const HEADER_HEIGHT = 60;

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    media.addEventListener("change", listener);
    listener();
    return () => {
      window.removeEventListener("resize", listener);
      media.removeEventListener("change", listener);
    };
  }, [matches, query]);

  return matches;
}

function AppInner({
  isMobile,
  themeMode,
  setThemeMode,
  systemIsDark,
}: {
  isMobile: boolean;
  themeMode: ThemeMode;
  setThemeMode: (val: ThemeMode) => void;
  systemIsDark: boolean;
}) {
  const { themes } = useTheme();
  const [activeThemeId, setActiveThemeId] = React.useState("");
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [activeDrawer, setActiveDrawer] = React.useState<DrawerType>(null);

  React.useEffect(() => {
    if (!activeThemeId && themes.length > 0) setActiveThemeId(themes[0].id);
  }, [themes, activeThemeId]);

  const isDarkMode = themeMode === "system" ? systemIsDark : themeMode === "dark";

  React.useEffect(() => {
    if (!localStorage.getItem("systemic_onboarding_completed")) setShowOnboarding(true);
  }, []);

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem("systemic_theme_mode", mode);
  };

  const handleToggleDrawer = (d: Exclude<DrawerType, null>) => {
    setActiveDrawer((prev) => (prev === d ? null : d));
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveDrawer(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const bg = isDarkMode ? "#111" : "#fff";
  const borderCol = isDarkMode ? "#2a2a2a" : "#eee";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: '"GT America", "Arial", sans-serif',
        overflow: "hidden",
        position: "relative",
        backgroundColor: bg,
      }}
    >
      <style>{`
        @keyframes drawerSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Fixed header */}
      <TopHeader
        isDarkMode={isDarkMode}
        themeMode={themeMode}
        setThemeMode={handleThemeModeChange}
        activeDrawer={activeDrawer}
        onToggleDrawer={handleToggleDrawer}
        isMobile={isMobile}
        height={HEADER_HEIGHT}
      />

      {/* Drawer overlay — fixed below header */}
      {activeDrawer && (
        <>
          {/* Transparent backdrop to close drawer */}
          <div
            style={{
              position: "fixed",
              top: `${HEADER_HEIGHT}px`,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 80,
            }}
            onClick={() => setActiveDrawer(null)}
          />
          {/* Drawer panel */}
          <div
            style={{
              position: "fixed",
              top: `${HEADER_HEIGHT}px`,
              left: 0,
              right: 0,
              zIndex: 90,
              backgroundColor: bg,
              borderBottom: `1px solid ${borderCol}`,
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              maxHeight: `calc(80vh - ${HEADER_HEIGHT}px)`,
              overflowY: "auto",
              animation: "drawerSlideDown 0.2s ease",
            }}
            className="no-scrollbar"
          >
            <style>{`
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            {activeDrawer === "theme" && (
              <ThemeDrawer isDarkMode={isDarkMode} isMobile={isMobile} />
            )}
            {activeDrawer === "customize" && <CustomizeDrawer isDarkMode={isDarkMode} />}
            {activeDrawer === "import" && (
              <ImportScreen
                isDarkMode={isDarkMode}
                onClose={() => setActiveDrawer(null)}
                noModal
              />
            )}
            {activeDrawer === "export" && (
              <ExportScreen
                isDarkMode={isDarkMode}
                onClose={() => setActiveDrawer(null)}
                noModal
              />
            )}
          </div>
        </>
      )}

      {/* Main scrollable content */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <KitchenSink
          isDarkMode={isDarkMode}
          themeMode={themeMode}
          setThemeMode={handleThemeModeChange}
          onShowOnboarding={() => {
            localStorage.removeItem("systemic_onboarding_completed");
            setShowOnboarding(true);
          }}
          isMobile={isMobile}
          activeThemeId={activeThemeId}
          setActiveThemeId={setActiveThemeId}
        />
      </main>

      {showOnboarding && (
        <OnboardingModal isDarkMode={isDarkMode} onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}

export default function App() {
  const isMobile = useMediaQuery("(max-width: 860px)");

  const [themeMode, setThemeMode] = React.useState<ThemeMode>(() => {
    const stored = localStorage.getItem("systemic_theme_mode");
    return stored === "light" || stored === "dark" || stored === "system"
      ? (stored as ThemeMode)
      : "system";
  });

  const [systemIsDark, setSystemIsDark] = React.useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false,
  );

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);

  return (
    <ThemeProvider>
      <AppInner
        isMobile={isMobile}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        systemIsDark={systemIsDark}
      />
    </ThemeProvider>
  );
}
