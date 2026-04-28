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
const DRAWER_ANIM_MS = 320;

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

  // Drawer state: activeDrawer = logically active (controls header highlight)
  // renderedDrawer = what's in DOM (persists during close animation)
  // drawerOpen = CSS transition flag
  const [activeDrawer, setActiveDrawer] = React.useState<DrawerType>(null);
  const [renderedDrawer, setRenderedDrawer] = React.useState<DrawerType>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll indicator state
  const drawerScrollRef = React.useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = React.useState(false);

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

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openDrawer = (d: Exclude<DrawerType, null>) => {
    clearCloseTimer();
    setActiveDrawer(d);
    setRenderedDrawer(d);
    setShowScrollIndicator(false);
    // Double rAF so the DOM is painted before we trigger the transition
    requestAnimationFrame(() => requestAnimationFrame(() => setDrawerOpen(true)));
  };

  const closeDrawer = () => {
    setActiveDrawer(null);
    setDrawerOpen(false);
    closeTimerRef.current = setTimeout(() => {
      setRenderedDrawer(null);
      setShowScrollIndicator(false);
    }, DRAWER_ANIM_MS);
  };

  const handleToggleDrawer = (d: Exclude<DrawerType, null>) => {
    if (activeDrawer === d) {
      closeDrawer();
    } else if (activeDrawer !== null) {
      // Switch between drawers: swap content instantly (drawer stays open)
      setActiveDrawer(d);
      setRenderedDrawer(d);
      setShowScrollIndicator(false);
    } else {
      openDrawer(d);
    }
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeDrawer) closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeDrawer]);

  // Check scroll indicator whenever drawer opens or content changes
  React.useEffect(() => {
    if (!drawerOpen || !renderedDrawer) {
      setShowScrollIndicator(false);
      return;
    }
    const el = drawerScrollRef.current;
    if (!el) return;
    const check = () =>
      setShowScrollIndicator(el.scrollHeight - el.scrollTop - el.clientHeight > 20);
    check();
    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [drawerOpen, renderedDrawer]);

  const bg = isDarkMode ? "#111" : "#fff";
  const borderCol = isDarkMode ? "#2a2a2a" : "#eee";

  const scrollbarCss = `
    .drawer-scroll::-webkit-scrollbar { width: 6px; }
    .drawer-scroll::-webkit-scrollbar-track { background: transparent; }
    .drawer-scroll::-webkit-scrollbar-thumb {
      background: ${isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"};
      border-radius: 3px;
    }
    .drawer-scroll::-webkit-scrollbar-thumb:hover {
      background: ${isDarkMode ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.28)"};
    }
    .btn-remove { transition: color 0.2s ease; color: inherit !important; }
    .btn-remove:hover { color: #ef4444 !important; }
    .btn-action { transition: all 0.2s ease; }
    .btn-action:hover {
      border-color: ${isDarkMode ? "#C3E835" : "#0142FE"} !important;
      color: ${isDarkMode ? "#C3E835" : "#0142FE"} !important;
    }
  `;

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
      <style>{scrollbarCss}</style>

      {/* Header */}
      <TopHeader
        isDarkMode={isDarkMode}
        themeMode={themeMode}
        setThemeMode={handleThemeModeChange}
        activeDrawer={activeDrawer}
        onToggleDrawer={handleToggleDrawer}
        isMobile={isMobile}
        height={HEADER_HEIGHT}
      />

      {/* Backdrop overlay — fades in/out */}
      {renderedDrawer && (
        <div
          style={{
            position: "fixed",
            top: `${HEADER_HEIGHT}px`,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 80,
            backgroundColor: "rgba(0,0,0,0.45)",
            opacity: drawerOpen ? 1 : 0,
            transition: `opacity ${DRAWER_ANIM_MS}ms ease`,
          }}
          onClick={closeDrawer}
        />
      )}

      {/* Drawer panel — slides down */}
      {renderedDrawer && (
        <div
          style={{
            position: "fixed",
            top: `${HEADER_HEIGHT}px`,
            left: 0,
            right: 0,
            zIndex: 90,
            transform: drawerOpen ? "translateY(0)" : "translateY(-100%)",
            opacity: drawerOpen ? 1 : 0,
            transition: `transform ${DRAWER_ANIM_MS}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${DRAWER_ANIM_MS * 0.75}ms ease`,
            display: "flex",
            flexDirection: "column",
            backgroundColor: bg,
            borderBottom: `1px solid ${borderCol}`,
            boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
            maxHeight: "75vh",
            overflow: "hidden",
          }}
        >
          {/* Scrollable drawer content */}
          <div
            ref={drawerScrollRef}
            className="drawer-scroll"
            style={{ overflowY: "auto", flex: 1 }}
          >
            {renderedDrawer === "theme" && (
              <ThemeDrawer isDarkMode={isDarkMode} isMobile={isMobile} />
            )}
            {renderedDrawer === "customize" && <CustomizeDrawer isDarkMode={isDarkMode} />}
            {renderedDrawer === "import" && (
              <ImportScreen
                isDarkMode={isDarkMode}
                onClose={closeDrawer}
                noModal
              />
            )}
            {renderedDrawer === "export" && (
              <ExportScreen
                isDarkMode={isDarkMode}
                onClose={closeDrawer}
                noModal
              />
            )}
          </div>

          {/* Scroll indicator gradient */}
          {showScrollIndicator && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "72px",
                background: `linear-gradient(to top, ${bg} 0%, transparent 100%)`,
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          )}
        </div>
      )}

      {/* Main scrollable content */}
      <main style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>
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
