import React, { useState, useEffect, useRef } from 'react';
import FontPicker from 'react-fontpicker-ts';
import 'react-fontpicker-ts/dist/index.css';
import { ArrowRight, ChevronLeft, Shuffle, Check } from 'lucide-react';
import { oklch, formatHex } from 'culori';
import { useTheme } from '../theme-context';
import {
    ONBOARDING_STEPS, GEOMETRY_RADIUS, SURPRISE_COLORS,
    type OnboardingAnswers, type GeometryStyle,
} from '../lib/onboarding-steps';

interface Props {
    isDarkMode: boolean;
    onClose: () => void;
}

type Phase = 'welcome' | 'steps' | 'generate';

const PRIMARY = (dark: boolean) => dark ? '#C3E835' : '#0142FE';
const PRIMARY_TEXT = (dark: boolean) => dark ? '#000' : '#fff';
const BG = (dark: boolean) => dark ? '#0f172a' : '#ffffff';
const SURFACE = (dark: boolean) => dark ? '#1e293b' : '#f8fafc';
const BORDER = (dark: boolean) => dark ? '#334155' : '#e2e8f0';
const TEXT = (dark: boolean) => dark ? '#f8fafc' : '#0f172a';
const MUTED = (dark: boolean) => dark ? '#94a3b8' : '#64748b';

function shiftHue(hex: string, degrees: number): string {
    try {
        const c = oklch(hex);
        if (!c) return hex;
        return formatHex({ ...c, h: ((c.h ?? 0) + degrees) % 360 }) ?? hex;
    } catch {
        return hex;
    }
}

const GeometryTile: React.FC<{
    label: string;
    radius: number;
    selected: boolean;
    isDarkMode: boolean;
    onClick: () => void;
}> = ({ label, radius, selected, isDarkMode, onClick }) => (
    <button
        onClick={onClick}
        style={{
            flex: 1,
            padding: '1.25rem 1rem',
            borderRadius: '8px',
            border: `2px solid ${selected ? PRIMARY(isDarkMode) : BORDER(isDarkMode)}`,
            background: selected ? (isDarkMode ? 'rgba(195,232,53,0.08)' : 'rgba(1,66,254,0.06)') : SURFACE(isDarkMode),
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            transition: 'all 0.15s',
        }}
    >
        {/* Mini button preview */}
        <div style={{
            padding: '6px 16px',
            borderRadius: `${radius}px`,
            background: PRIMARY(isDarkMode),
            color: PRIMARY_TEXT(isDarkMode),
            fontSize: '0.75rem',
            fontWeight: 600,
            userSelect: 'none',
        }}>
            Button
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: selected ? 600 : 400, color: selected ? PRIMARY(isDarkMode) : TEXT(isDarkMode) }}>
            {label}
        </span>
    </button>
);

export const OnboardingModal: React.FC<Props> = ({ isDarkMode, onClose }) => {
    const { themes, importThemes } = useTheme();

    const [phase, setPhase] = useState<Phase>('welcome');
    const [stepIdx, setStepIdx] = useState(0);
    const [answers, setAnswers] = useState<OnboardingAnswers>({
        brandColor: '#0142FE',
        fontFamily: 'Inter',
        geometry: 'rounded',
        name: '',
    });
    const [generating, setGenerating] = useState(false);
    const [done, setDone] = useState(false);
    const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const step = ONBOARDING_STEPS[stepIdx];
    const isLastStep = stepIdx === ONBOARDING_STEPS.length - 1;

    const dismiss = () => {
        localStorage.setItem('systemic_onboarding_completed', 'true');
        onClose();
    };

    const advance = () => {
        if (phase === 'welcome') { setPhase('steps'); return; }
        if (!isLastStep) { setStepIdx(i => i + 1); return; }
        setPhase('generate');
    };

    const back = () => {
        if (phase === 'steps' && stepIdx > 0) { setStepIdx(i => i - 1); return; }
        if (phase === 'steps' && stepIdx === 0) { setPhase('welcome'); return; }
        if (phase === 'generate') { setPhase('steps'); setStepIdx(ONBOARDING_STEPS.length - 1); }
    };

    // Kick off generation when entering the generate phase
    useEffect(() => {
        if (phase !== 'generate' || generating || done) return;
        setGenerating(true);
        generateTimerRef.current = setTimeout(() => {
            const resolvedName = answers.name.trim() || 'My Theme';
            const slug = resolvedName.toLowerCase().replace(/\s+/g, '-');
            importThemes([{
                id: slug,
                name: resolvedName,
                colors: [
                    { id: 'brand',  name: 'brand',  seed: answers.brandColor },
                    { id: 'accent', name: 'accent', seed: shiftHue(answers.brandColor, 60) },
                ],
                fontFamily: answers.fontFamily,
                geometry: {
                    radiusBase:     GEOMETRY_RADIUS[answers.geometry],
                    includeRadius:  true,
                    includeBorders: true,
                    borderWidth:    'small',
                },
            }]);
            setDone(true);
        }, 1600);
        return () => { if (generateTimerRef.current) clearTimeout(generateTimerRef.current); };
    }, [phase]);

    // Close after done flash
    useEffect(() => {
        if (!done) return;
        const t = setTimeout(dismiss, 600);
        return () => clearTimeout(t);
    }, [done]);

    const setAnswer = <K extends keyof OnboardingAnswers>(key: K, val: OnboardingAnswers[K]) =>
        setAnswers(prev => ({ ...prev, [key]: val }));

    const surprise = () => {
        const current = answers.brandColor;
        const pool = SURPRISE_COLORS.filter(c => c !== current);
        setAnswer('brandColor', pool[Math.floor(Math.random() * pool.length)]);
    };

    // ─── Overlay ──────────────────────────────────────────────────────────────
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.2s ease',
        }}>
            <div style={{
                width: '100%', maxWidth: '480px',
                background: BG(isDarkMode),
                borderRadius: '12px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
                overflow: 'hidden',
                animation: 'fadeIn 0.25s ease',
            }}>

                {/* ── Welcome ─────────────────────────────────────────────── */}
                {phase === 'welcome' && (
                    <div style={{ padding: '3rem 2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ fontSize: '2rem' }}>🎨</div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem', color: TEXT(isDarkMode) }}>
                                Set up your design system
                            </h2>
                            <p style={{ fontSize: '0.9375rem', color: MUTED(isDarkMode), margin: 0, lineHeight: 1.6 }}>
                                Four quick questions to get you started with a working theme.
                            </p>
                        </div>
                        <button
                            onClick={advance}
                            style={{
                                width: '100%', padding: '0.875rem 1.5rem',
                                background: PRIMARY(isDarkMode), color: PRIMARY_TEXT(isDarkMode),
                                border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                marginTop: '0.5rem',
                            }}
                        >
                            Quick Setup <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={dismiss}
                            style={{ background: 'none', border: 'none', color: MUTED(isDarkMode), fontSize: '0.875rem', cursor: 'pointer', padding: '0.25rem' }}
                        >
                            Skip for now
                        </button>
                    </div>
                )}

                {/* ── Steps ───────────────────────────────────────────────── */}
                {phase === 'steps' && (
                    <div style={{ padding: '2rem 2.5rem 2.5rem' }}>
                        {/* Progress dots */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '2rem', justifyContent: 'center' }}>
                            {ONBOARDING_STEPS.map((_, i) => (
                                <div key={i} style={{
                                    width: i === stepIdx ? '20px' : '6px', height: '6px',
                                    borderRadius: '3px',
                                    background: i <= stepIdx ? PRIMARY(isDarkMode) : BORDER(isDarkMode),
                                    transition: 'all 0.2s',
                                }} />
                            ))}
                        </div>

                        {/* Step heading */}
                        <div style={{ marginBottom: '1.75rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.4rem', color: TEXT(isDarkMode) }}>
                                {step.title}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: MUTED(isDarkMode), margin: 0, lineHeight: 1.5 }}>
                                {step.description}
                            </p>
                        </div>

                        {/* Step input */}
                        <div style={{ marginBottom: '2rem' }}>
                            {step.id === 'brandColor' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <input
                                            type="color"
                                            value={answers.brandColor}
                                            onChange={e => setAnswer('brandColor', e.target.value)}
                                            style={{ width: '52px', height: '52px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '2px', background: 'none' }}
                                        />
                                        <input
                                            type="text"
                                            value={answers.brandColor}
                                            onChange={e => {
                                                const v = e.target.value;
                                                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setAnswer('brandColor', v);
                                            }}
                                            style={{
                                                flex: 1, padding: '0.75rem 1rem', borderRadius: '8px',
                                                border: `1px solid ${BORDER(isDarkMode)}`,
                                                background: SURFACE(isDarkMode), color: TEXT(isDarkMode),
                                                fontSize: '1rem', fontFamily: 'monospace',
                                            }}
                                        />
                                        <button
                                            onClick={surprise}
                                            title="Surprise me"
                                            style={{
                                                padding: '0.75rem', borderRadius: '8px',
                                                border: `1px solid ${BORDER(isDarkMode)}`,
                                                background: SURFACE(isDarkMode), color: MUTED(isDarkMode),
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0,
                                            }}
                                        >
                                            <Shuffle size={18} />
                                        </button>
                                    </div>
                                    {/* Accent preview */}
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: answers.brandColor, flexShrink: 0 }} />
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: shiftHue(answers.brandColor, 60), flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.8125rem', color: MUTED(isDarkMode) }}>Brand + accent (auto-derived)</span>
                                    </div>
                                </div>
                            )}

                            {step.id === 'fontFamily' && (
                                <FontPicker
                                    defaultValue={answers.fontFamily}
                                    value={(val: string) => setAnswer('fontFamily', val)}
                                    autoLoad
                                />
                            )}

                            {step.id === 'geometry' && (
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {(['sharp', 'rounded', 'pill'] as GeometryStyle[]).map(g => (
                                        <GeometryTile
                                            key={g}
                                            label={g.charAt(0).toUpperCase() + g.slice(1)}
                                            radius={GEOMETRY_RADIUS[g]}
                                            selected={answers.geometry === g}
                                            isDarkMode={isDarkMode}
                                            onClick={() => setAnswer('geometry', g)}
                                        />
                                    ))}
                                </div>
                            )}

                            {step.id === 'name' && (
                                <input
                                    type="text"
                                    value={answers.name}
                                    placeholder={themes[0]?.name || themes[0]?.id || 'My Theme'}
                                    onChange={e => setAnswer('name', e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') advance(); }}
                                    autoFocus
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                                        border: `1px solid ${BORDER(isDarkMode)}`,
                                        background: SURFACE(isDarkMode), color: TEXT(isDarkMode),
                                        fontSize: '1rem', boxSizing: 'border-box',
                                    }}
                                />
                            )}
                        </div>

                        {/* Navigation */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button
                                onClick={back}
                                style={{
                                    background: 'none', border: 'none', color: MUTED(isDarkMode),
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    fontSize: '0.875rem', padding: '0.5rem 0',
                                }}
                            >
                                <ChevronLeft size={16} /> Back
                            </button>
                            <button
                                onClick={advance}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: PRIMARY(isDarkMode), color: PRIMARY_TEXT(isDarkMode),
                                    border: 'none', borderRadius: '8px',
                                    fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                }}
                            >
                                {isLastStep ? 'Create' : 'Continue'} <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Generate ────────────────────────────────────────────── */}
                {phase === 'generate' && (
                    <div style={{ padding: '3rem 2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                        {done ? (
                            <>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    background: PRIMARY(isDarkMode), display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Check size={24} color={PRIMARY_TEXT(isDarkMode)} />
                                </div>
                                <p style={{ fontSize: '1.125rem', fontWeight: 600, color: TEXT(isDarkMode), margin: 0 }}>Done!</p>
                            </>
                        ) : (
                            <>
                                {/* Summary */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', textAlign: 'left' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem', color: TEXT(isDarkMode), textAlign: 'center' }}>
                                        Building your design system
                                    </h3>
                                    {[
                                        { label: 'Brand color', preview: <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: answers.brandColor }} />, value: answers.brandColor },
                                        { label: 'Typeface', preview: null, value: answers.fontFamily },
                                        { label: 'Style', preview: null, value: answers.geometry.charAt(0).toUpperCase() + answers.geometry.slice(1) },
                                        { label: 'Name', preview: null, value: answers.name.trim() || 'My Theme' },
                                    ].map(({ label, preview, value }) => (
                                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.75rem', background: SURFACE(isDarkMode), borderRadius: '6px' }}>
                                            <span style={{ fontSize: '0.875rem', color: MUTED(isDarkMode) }}>{label}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {preview}
                                                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: TEXT(isDarkMode) }}>{value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress bar */}
                                <div style={{ width: '100%', height: '4px', background: BORDER(isDarkMode), borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', background: PRIMARY(isDarkMode),
                                        borderRadius: '2px',
                                        animation: 'onboardingProgress 1.5s ease-out forwards',
                                    }} />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes onboardingProgress {
                    from { width: 0%; }
                    to   { width: 100%; }
                }
            `}</style>
        </div>
    );
};
