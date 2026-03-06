import React from 'react';
import { Button, ButtonProps } from 'react-aria-components';

export interface PressableCardProps extends Omit<ButtonProps, 'children'> {
    children?: React.ReactNode;
    title?: string;
    description?: string;
    colorName?: string;
}

export const PressableCard: React.FC<PressableCardProps> = ({ children, title, description, colorName = 'brand', ...props }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation(); // Don't trigger the card's main press action
        const codeSnippet = `<PressableCard colorName="${colorName}" title="${title}">\n  {/* Insert content here */}\n</PressableCard>`;
        navigator.clipboard.writeText(codeSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button {...props} style={{ outline: 'none', border: 'none', background: 'none', padding: 0, width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
            {({ isHovered, isPressed, isFocusVisible }) => {

                const bg = isPressed
                    ? `var(--color-surface-${colorName}-active)`
                    : isHovered
                        ? `var(--color-surface-${colorName}-hover)`
                        : `var(--color-surface-${colorName}-default)`;

                const shadow = isFocusVisible
                    ? '0 0 0 2px var(--color-background-default), 0 0 0 4px var(--color-border-focus)'
                    : isHovered
                        ? 'var(--color-shadow-3)'
                        : 'var(--color-shadow-1)';

                const transform = isPressed ? 'scale(0.98)' : isHovered ? 'translateY(-2px)' : 'translateY(0)';

                const borderCol = colorName === 'neutral'
                    ? 'var(--color-border-subtle)'
                    : `var(--color-border-${colorName}-default)`;

                return (
                    <div style={{
                        background: bg,
                        padding: '1.5rem',
                        borderRadius: 'var(--geometry-radius-lg)',
                        color: `var(--color-text-${colorName}-default)`,
                        transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                        boxShadow: shadow,
                        border: `1px solid ${borderCol}`,
                        transform: transform,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            {title && <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>{title}</h4>}
                            <div
                                onClick={handleCopy}
                                style={{
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    background: copied ? 'var(--color-success-600)' : `var(--color-surface-${colorName}-hover)`,
                                    color: copied ? '#fff' : `var(--color-text-${colorName}-default)`,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    opacity: isHovered || copied ? 1 : 0,
                                    transition: 'all 0.2s ease',
                                    zIndex: 10
                                }}
                            >
                                {copied ? 'Copied!' : 'Copy snippet'}
                            </div>
                        </div>
                        {description && <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>{description}</p>}
                        {children && <div style={{ marginTop: '0.5rem' }}>{children}</div>}
                    </div>
                );
            }}
        </Button>
    );
};
