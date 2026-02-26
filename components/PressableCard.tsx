import React from 'react';
import { Button, ButtonProps } from 'react-aria-components';

export interface PressableCardProps extends Omit<ButtonProps, 'children'> {
    children?: React.ReactNode;
    title?: string;
    description?: string;
    colorName?: string;
}

export const PressableCard: React.FC<PressableCardProps> = ({ children, title, description, colorName = 'brand', ...props }) => {
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
                        ? '0 4px 12px rgba(0,0,0,0.1)'
                        : '0 1px 3px rgba(0,0,0,0.1)';

                const transform = isPressed ? 'scale(0.98)' : 'scale(1)';

                return (
                    <div style={{
                        background: bg,
                        padding: '1.5rem',
                        borderRadius: 'var(--geometry-radius-lg)',
                        color: `var(--color-text-${colorName}-default)`,
                        transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
                        boxShadow: shadow,
                        transform: transform,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        {title && <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>{title}</h4>}
                        {description && <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>{description}</p>}
                        {children && <div style={{ marginTop: '0.5rem' }}>{children}</div>}
                    </div>
                );
            }}
        </Button>
    );
};
