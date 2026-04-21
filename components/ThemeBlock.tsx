import React from 'react';
import { generateRamp } from '../lib/palette-generator';
import { getAccessibleBaseStep } from '../lib/palette-generator';
import { wcagContrast } from 'culori';
import { FeedbackCard } from './Feedback';
import { ThemeComponentCard } from './ThemeComponentCard';

export const ThemeBlock: React.FC<{
    themeConfig: any;
    globalColors: any;
    isDarkMode?: boolean;
}> = ({ themeConfig, globalColors, isDarkMode }) => {
    const primaryColorName = themeConfig.colors.length > 0
        ? themeConfig.colors[0].name.toLowerCase().replace(/\s+/g, '-')
        : 'neutral';

    return (
        <div style={{ marginBottom: '4rem' }}>
            {/* Contrast Warnings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                {themeConfig.colors.map((color: any) => {
                    const gen = generateRamp(color.seed);
                    const preferredStep = (isDarkMode ? 300 : gen.closestStep) as import('../lib/palette-generator').ColorStep;
                    const { bgStep, textHex } = getAccessibleBaseStep(gen.ramp, preferredStep);
                    const bgHex = gen.ramp[bgStep];
                    const contrast = wcagContrast(textHex, bgHex);

                    if (contrast === undefined) return null;

                    if (contrast < 4.5) {
                        return (
                            <FeedbackCard key={`warning-${color.id}`} colorName="error" isDarkMode={isDarkMode}>
                                <strong>Low Contrast ({color.name})!</strong> Primary button text ratio is only {contrast.toFixed(2)}:1. This fails WCAG AA standards.
                            </FeedbackCard>
                        );
                    } else if (contrast < 7) {
                        return (
                            <FeedbackCard key={`warning-${color.id}`} colorName="neutral" isDarkMode={isDarkMode}>
                                <strong>AA Contrast ({color.name}) ({contrast.toFixed(2)}:1).</strong> Good, but consider adjusting for AAA (7:1).
                            </FeedbackCard>
                        );
                    }
                    return null;
                })}
            </div>

            {/* Structured Card Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                alignItems: 'start'
            }}>
                {themeConfig.colors.map((color: any) => (
                    <ThemeComponentCard
                        key={color.id}
                        colorName={color.name.toLowerCase().replace(/\s+/g, '-')}
                        primaryColorName={primaryColorName}
                        isDarkMode={isDarkMode}
                    />
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '4rem' }}>
                <section>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', borderBottom: 'var(--geometry-borderWidth-default, 1px) solid var(--color-border-subtle)', paddingBottom: '0.5rem' }}>Global Feedback States</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {globalColors.map((color: any) => (
                            <FeedbackCard key={color.id} colorName={color.name} isDarkMode={isDarkMode}>
                                <strong>{color.name}</strong>
                            </FeedbackCard>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
