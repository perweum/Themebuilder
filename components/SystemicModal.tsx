import React, { useEffect, useState } from 'react';

export interface SystemicModalProps {
    /** 
     * 'centered' = standard full-screen modal with dark blurred overlay.
     * 'popover' = unstyled overlay, positioned wherever the parent DOM tree places it (useful inside react-aria Popovers).
     */
    variant?: 'centered' | 'popover';
    isDarkMode: boolean;
    onClose?: () => void;
    children: React.ReactNode;
    /** Maximum width of the modal content (default 600px) */
    maxWidth?: string;
    /** Whether the modal should have intrinsic padding (default: true) */
    noPadding?: boolean;
    /** Additional styles for the modal container itself */
    style?: React.CSSProperties;
}

export const SystemicModal: React.FC<SystemicModalProps> = ({
    variant = 'centered',
    isDarkMode,
    onClose,
    children,
    maxWidth = '600px',
    noPadding = false,
    style = {}
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        requestAnimationFrame(() => setIsVisible(true));

        if (variant === 'centered') {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape' && onClose) {
                    handleClose();
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [variant, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) {
            // Wait for exit animation
            setTimeout(onClose, 300);
        }
    };

    const isCentered = variant === 'centered';

    // Outer Overlay Layer
    const overlayStyle: React.CSSProperties = isCentered ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        padding: '2rem'
    } : {
        // Popover variant relies on the parent's fixed/absolute positioning context
        display: 'flex',
        flexDirection: 'column',
    };

    // Inner Modal Container Layer
    const modalStyle: React.CSSProperties = {
        width: '100%',
        maxWidth: maxWidth,
        backgroundColor: isDarkMode ? 'var(--color-surface-default, #1a1a1a)' : '#FFFFFF',
        color: isDarkMode ? '#FFFFFF' : '#1F1F1F',
        borderRadius: '24px',
        boxShadow: isDarkMode
            ? '0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
            : '0 24px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        // Only apply transform scale animations to the centered variant
        transform: isCentered ? (isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)') : 'none',
        opacity: isCentered ? (isVisible ? 1 : 0) : 1,
        transition: isCentered ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: isCentered ? '90vh' : 'auto',
        position: 'relative',
        ...style
    };

    const containerContent = (
        <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ padding: noPadding ? 0 : '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </div>
    );

    if (isCentered) {
        return (
            <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget && onClose) handleClose(); }}>
                {containerContent}
            </div>
        );
    }

    return containerContent;
};
