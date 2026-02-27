import React, { useState } from 'react';

export interface DemoProps {
    primaryColorName?: string;
    accentColorName?: string;
}

export const TabsDemo: React.FC<DemoProps> = ({ primaryColorName = 'brand', accentColorName = 'accent' }) => {
    const [activeTab, setActiveTab] = useState(0);
    const tabs = ['General Settings', 'Appearance', 'Notifications', 'Account'];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '500px',
            fontFamily: 'inherit',
            gap: '1.5rem'
        }}>
            {/* Apple/Segmented Control Tab Style */}
            <div style={{
                display: 'flex',
                background: 'var(--color-surface-hover, #f1f5f9)',
                padding: '4px',
                borderRadius: 'var(--geometry-radius-2, 8px)',
                position: 'relative'
            }}>
                {tabs.map((tab, idx) => {
                    const isActive = activeTab === idx;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(idx)}
                            style={{
                                flex: 1,
                                background: isActive ? `var(--color-base-${primaryColorName}-default, #fff)` : 'transparent',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? `var(--color-text-${primaryColorName}-contrast)` : 'var(--color-text-subtle)',
                                borderRadius: 'var(--geometry-radius-1, 6px)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = `var(--color-text-${primaryColorName}-default)`;
                                    e.currentTarget.style.background = `var(--color-surface-${primaryColorName}-hover)`;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = 'var(--color-text-subtle)';
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content Placeholder */}
            <div style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                background: 'var(--color-surface-default)',
                borderRadius: 'var(--geometry-radius-2, 8px)',
                border: 'var(--geometry-borderWidth-default, 1px) solid var(--color-border-subtle)'
            }}>
                <div style={{ height: '24px', width: '150px', backgroundColor: 'var(--color-border-subtle)', borderRadius: '4px' }} />
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                    <div style={{ height: '12px', width: '100%', backgroundColor: 'var(--color-text-default)', borderRadius: '4px', opacity: 0.1 }} />
                    <div style={{ height: '12px', width: '80%', backgroundColor: 'var(--color-text-default)', borderRadius: '4px', opacity: 0.1 }} />
                </div>
            </div>
        </div>
    );
};
