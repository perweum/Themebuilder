import React from 'react';
import { ThemeProvider, useTheme } from './theme-context';
import { ThemeControls } from './components/ThemeControls';
import { KitchenSink } from './components/KitchenSink';
import { OnboardingModal } from './components/OnboardingModal';

export type { ThemeMode } from './components/KitchenSink';
import type { ThemeMode } from './components/KitchenSink';

function useMediaQuery(query: string) {
    const [matches, setMatches] = React.useState(false);

    React.useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) setMatches(media.matches);
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        media.addEventListener('change', listener);
        listener();
        return () => {
            window.removeEventListener('resize', listener);
            media.removeEventListener('change', listener);
        };
    }, [matches, query]);

    return matches;
}

function AppInner({ isMobile, isMobileMenuOpen, setIsMobileMenuOpen, themeMode, setThemeMode, systemIsDark }: {
    isMobile: boolean;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (val: boolean) => void;
    themeMode: ThemeMode;
    setThemeMode: (val: ThemeMode) => void;
    systemIsDark: boolean;
}) {
    const { themes } = useTheme();
    const [activeThemeId, setActiveThemeId] = React.useState('');
    const [showOnboarding, setShowOnboarding] = React.useState(false);

    React.useEffect(() => {
        if (!activeThemeId && themes.length > 0) setActiveThemeId(themes[0].id);
    }, [themes, activeThemeId]);

    const isDarkMode = themeMode === 'system' ? systemIsDark : themeMode === 'dark';

    React.useEffect(() => {
        if (!localStorage.getItem('systemic_onboarding_completed')) setShowOnboarding(true);
    }, []);

    const handleThemeModeChange = (mode: ThemeMode) => {
        setThemeMode(mode);
        localStorage.setItem('systemic_theme_mode', mode);
    };

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: '"GT America", "Arial", sans-serif', overflow: 'hidden', position: 'relative' }}>
            {/* Mobile backdrop overlay */}
            {isMobile && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 40,
                        backdropFilter: 'blur(4px)',
                        opacity: isMobileMenuOpen ? 1 : 0,
                        pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
                        transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                />
            )}

            {/* Sidebar */}
            <div style={{
                width: isMobile ? '100vw' : '320px',
                flexShrink: 0,
                position: isMobile ? 'fixed' : 'relative',
                top: 0, bottom: 0, left: 0,
                transform: isMobile ? (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
                zIndex: 50,
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                backgroundColor: isDarkMode ? '#1a1f26' : '#ffffff',
                height: '100vh'
            }}>
                <ThemeControls
                    isDarkMode={isDarkMode}
                    isMobile={isMobile}
                    onClose={() => setIsMobileMenuOpen(false)}
                />
            </div>

            <KitchenSink
                isDarkMode={isDarkMode}
                themeMode={themeMode}
                setThemeMode={handleThemeModeChange}
                onShowOnboarding={() => setShowOnboarding(true)}
                isMobile={isMobile}
                onMenuClick={() => setIsMobileMenuOpen(true)}
                activeThemeId={activeThemeId}
                setActiveThemeId={setActiveThemeId}
            />

            {showOnboarding && <OnboardingModal isDarkMode={isDarkMode} onClose={() => setShowOnboarding(false)} />}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default function App() {
    const isMobile = useMediaQuery('(max-width: 860px)');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const [themeMode, setThemeMode] = React.useState<ThemeMode>(() => {
        const stored = localStorage.getItem('systemic_theme_mode');
        return (stored === 'light' || stored === 'dark' || stored === 'system') ? (stored as ThemeMode) : 'system';
    });

    const [systemIsDark, setSystemIsDark] = React.useState(() =>
        typeof window !== 'undefined' && window.matchMedia
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
            : false
    );

    React.useEffect(() => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
    }, []);

    return (
        <ThemeProvider>
            <AppInner
                isMobile={isMobile}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                themeMode={themeMode}
                setThemeMode={setThemeMode}
                systemIsDark={systemIsDark}
            />
        </ThemeProvider>
    );
}
