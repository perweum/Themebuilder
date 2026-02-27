import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { SystemicModal } from './SystemicModal';

import imgSlide1 from '../img/people_building.png';
import imgSlide2 from '../img/man_climbing.png';
import imgSlide3 from '../img/business_people.png';
import imgSlide4 from '../img/export.png';

interface OnboardingModalProps {
    onClose: () => void;
    isDarkMode: boolean;
}

const UIButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'outline' | 'ghost' | 'primary', isDarkMode: boolean }> = ({ variant = 'outline', isDarkMode, style, children, ...props }) => {
    const isPrimary = variant === 'primary';
    const isGhost = variant === 'ghost';

    return (
        <button
            {...props}
            style={{
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                borderRadius: '0px',
                border: isGhost ? 'none' : (isPrimary ? 'none' : `1px solid ${isDarkMode ? '#fff' : '#000'}`),
                backgroundColor: isPrimary ? 'var(--color-base-brand-default)' : 'transparent',
                color: isPrimary ? 'var(--color-text-brand-contrast)' : (isDarkMode ? '#fff' : '#000'),
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: isPrimary ? 600 : 400,
                opacity: isGhost ? 0.7 : 1,
                transition: 'all 0.2s ease',
                ...style
            }}
            onMouseEnter={(e) => {
                if (!isPrimary && !isGhost) {
                    e.currentTarget.style.borderColor = isDarkMode ? '#C3E835' : '#0142FE';
                    e.currentTarget.style.color = isDarkMode ? '#C3E835' : '#0142FE';
                }
                if (isGhost) e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
                if (!isPrimary && !isGhost) {
                    e.currentTarget.style.borderColor = isDarkMode ? '#fff' : '#000';
                    e.currentTarget.style.color = isDarkMode ? '#fff' : '#000';
                }
                if (isGhost) e.currentTarget.style.opacity = '0.7';
            }}
        >
            {children}
        </button>
    );
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose, isDarkMode }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide]);

    const slideCount = 4;

    const handleClose = () => {
        onClose();
        localStorage.setItem('systemic_onboarding_completed', 'true');
    };

    const nextSlide = () => {
        if (currentSlide < slideCount - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };



    const contentContainerStyle: React.CSSProperties = {
        display: 'flex',
        width: `${slideCount * 100}%`,
        transform: `translateX(-${currentSlide * (100 / slideCount)}%)`,
        transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
    };

    const slideStyle: React.CSSProperties = {
        width: `${100 / slideCount}%`,
        padding: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        minHeight: '520px',
        backgroundColor: isDarkMode ? 'var(--color-surface-default)' : '#FDFCFC',
    };

    return (
        <SystemicModal variant="centered" isDarkMode={isDarkMode} onClose={handleClose} maxWidth="600px" noPadding>
            {/* Header controls (Close button) */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1.5rem', display: 'flex', justifyContent: 'flex-end', zIndex: 10 }}>
                <UIButton variant="ghost" isDarkMode={isDarkMode} onClick={handleClose} style={{ padding: '0.5rem' }}>
                    <X size={20} />
                </UIButton>
            </div>

            {/* Slides content */}
            <div style={{ overflow: 'hidden' }}>
                <div style={contentContainerStyle}>

                    {/* Slide 1 */}
                    <div style={slideStyle}>
                        <div style={{ padding: '3rem 3rem 1rem 3rem', zIndex: 2, position: 'relative' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Welcome to Systemic</h2>
                            <p style={{ fontSize: '1.125rem', color: isDarkMode ? '#aaa' : '#666', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto' }}>
                                Generate comprehensive, accessible design systems from a single color seed. Stop guessing hex codes and start building.
                            </p>
                        </div>
                        <img src={imgSlide1} alt="People Building" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 'calc(100% - 150px)', objectFit: 'contain', objectPosition: 'bottom', zIndex: 1 }} />
                    </div>

                    {/* Slide 2 */}
                    <div style={slideStyle}>
                        <div style={{ padding: '3rem 3rem 1rem 3rem', zIndex: 2, position: 'relative' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>The 12-Step Scale</h2>
                            <p style={{ fontSize: '1rem', color: isDarkMode ? '#aaa' : '#666', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto' }}>
                                Every color palette expands into exactly 12 luminance steps, ensuring consistent contrast across light and dark modes.
                            </p>
                        </div>
                        <img src={imgSlide2} alt="Man Climbing" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 'calc(100% - 140px)', objectFit: 'contain', objectPosition: 'bottom', zIndex: 1 }} />
                    </div>

                    {/* Slide 3 */}
                    <div style={slideStyle}>
                        <div style={{ padding: '3rem 3rem 1rem 3rem', zIndex: 2, position: 'relative' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Semantic Architecture</h2>
                            <p style={{ fontSize: '1rem', color: isDarkMode ? '#aaa' : '#666', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto' }}>
                                You don't have to memorize the 12 steps. The app automatically maps them into intuitive semantic tokens.
                            </p>
                        </div>
                        <img src={imgSlide3} alt="Business People" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 'calc(100% - 140px)', objectFit: 'contain', objectPosition: 'bottom', zIndex: 1 }} />
                    </div>

                    {/* Slide 4 */}
                    <div style={slideStyle}>
                        <div style={{ padding: '3rem 3rem 1rem 3rem', zIndex: 2, position: 'relative' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Export Anywhere</h2>
                            <p style={{ fontSize: '1rem', color: isDarkMode ? '#aaa' : '#666', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto' }}>
                                Take your theme tokens with you. Export directly to Figma Tokens Studio or as raw CSS variables for modern web frameworks.
                            </p>
                        </div>
                        <img src={imgSlide4} alt="Export Data" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 'calc(100% - 140px)', objectFit: 'contain', objectPosition: 'bottom', zIndex: 1 }} />
                    </div>
                </div>
            </div>

            {/* Footer Controls */}
            <div style={{ padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${isDarkMode ? '#333' : '#eee'}`, background: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}>

                {/* Skip or Prev */}
                {currentSlide === 0 ? (
                    <UIButton variant="ghost" isDarkMode={isDarkMode} onClick={handleClose}>
                        Skip intro
                    </UIButton>
                ) : (
                    <UIButton variant="ghost" isDarkMode={isDarkMode} onClick={prevSlide}>
                        <ChevronLeft size={16} /> Back
                    </UIButton>
                )}

                {/* Progress Dots */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {Array.from({ length: slideCount }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: i === currentSlide ? 'var(--color-base-brand-default)' : 'var(--color-border-subtle)',
                                transition: 'background 0.3s ease'
                            }}
                        />
                    ))}
                </div>

                {/* Next or Finish */}
                <UIButton
                    variant={currentSlide === slideCount - 1 ? 'primary' : 'outline'}
                    isDarkMode={isDarkMode}
                    onClick={nextSlide}
                >
                    {currentSlide === slideCount - 1 ? "Get Started" : "Next"} {currentSlide < slideCount - 1 && <ChevronRight size={16} />}
                </UIButton>
            </div>

        </SystemicModal>
    );
};
