import React from 'react';
import { Button as AriaButton, ButtonProps as AriaButtonProps } from 'react-aria-components';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonColor = string; // can be 'brand', 'accent', 'secondary', 'master', 'destructive', etc.

export interface ButtonProps extends AriaButtonProps {
    variant?: ButtonVariant;
    color?: ButtonColor;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    color = 'brand',
    children,
    isDisabled,
    ...props
}) => {
    // Map 'destructive' to 'error' tokens since 'interactive.destructive' doesn't exist in standard schema
    const isDestructive = color === 'destructive';
    const c = isDestructive ? 'global-error' : color;

    // React Aria components use a render prop approach to easily style interaction states dynamically
    return (
        <AriaButton
            isDisabled={isDisabled}
            style={({ isHovered, isPressed, isFocusVisible }) => {
                // MATERIAL 3 STYLING CONSTANTS
                const baseStyle: React.CSSProperties = {
                    padding: '0.625rem 1.5rem', // M3 typical padding
                    borderRadius: 'var(--geometry-radius-full)', // Fully rounded pill shape
                    borderWidth: 'var(--geometry-borderWidth-default)',
                    fontSize: '0.875rem',        // M3 standard label size
                    fontWeight: 500,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1)',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    outline: 'none',             // Handle focus manually
                };

                let bg = 'transparent';
                let textColor = 'inherit';
                let borderColor = 'transparent';
                let shadow = 'none';
                let transform = 'scale(1)';

                // --- DISABLED STATE ---
                if (isDisabled) {
                    if (variant === 'primary') {
                        bg = 'var(--color-base-disabled)';
                        textColor = 'var(--color-text-disabled)';
                    } else if (variant === 'outline') {
                        borderColor = 'var(--color-border-disabled)';
                        textColor = 'var(--color-text-disabled)';
                    } else {
                        textColor = 'var(--color-text-disabled)';
                    }
                    return { ...baseStyle, background: bg, color: textColor, borderColor, borderStyle: 'solid', boxShadow: shadow, transform };
                }

                // --- ACTIVE STATES (Rest, Hover, Press) ---
                if (variant === 'primary') {
                    // M3 Filled Button
                    // Uses actionable token for text/bg to adapt, and interactive steps for hover/press state layers.
                    textColor = isDestructive ? 'var(--color-error-100)' : `var(--color-text-${c}-contrast)`;
                    bg = isDestructive ? 'var(--color-error-700)' : `var(--color-base-${c}-default)`;
                    shadow = 'var(--color-shadow-1)';

                    if (isPressed) {
                        bg = `var(--color-base-${c}-active)`;
                        transform = 'scale(0.98)';
                        shadow = 'none';
                    } else if (isHovered) {
                        bg = `var(--color-base-${c}-hover)`;
                        transform = 'scale(1.02)';
                        shadow = 'var(--color-shadow-2)';
                    }

                } else if (variant === 'outline') {
                    // M3 Outlined Button
                    // Uses high-contrast text to maintain legibility on light/dark backgrounds
                    textColor = isDestructive ? 'var(--color-error-700)' : `var(--color-text-${c}-default)`;
                    borderColor = isDestructive ? 'var(--color-error-700)' : `var(--color-border-${c}-default)`;

                    if (isPressed) {
                        bg = isDestructive ? 'var(--color-error-300)' : `var(--color-surface-${c}-active)`;
                        transform = 'scale(0.98)';
                    } else if (isHovered) {
                        bg = isDestructive ? 'var(--color-error-100)' : `var(--color-surface-${c}-hover)`;
                        transform = 'scale(1.02)';
                    }

                } else if (variant === 'ghost') {
                    // M3 Text Button
                    textColor = isDestructive ? 'var(--color-error-700)' : `var(--color-text-${c}-default)`;

                    if (isPressed) {
                        bg = isDestructive ? 'var(--color-error-300)' : `var(--color-surface-${c}-active)`;
                        transform = 'scale(0.98)';
                    } else if (isHovered) {
                        bg = isDestructive ? 'var(--color-error-100)' : `var(--color-surface-${c}-hover)`;
                        transform = 'scale(1.02)';
                    }
                }

                // --- FOCUS VISIBLE STATE ---
                if (isFocusVisible) {
                    // Focus ring style matching the color
                    shadow = `${shadow !== 'none' ? shadow + ', ' : ''}0 0 0 2px var(--color-background-default), 0 0 0 4px var(--color-border-focus)`;
                }

                return {
                    ...baseStyle,
                    background: bg,
                    color: textColor,
                    borderColor,
                    borderStyle: 'solid',
                    boxShadow: shadow,
                    transform
                };
            }}
            {...props}
        >
            {children}
        </AriaButton>
    );
};
