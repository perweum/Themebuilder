import React from 'react';
import { ArrowRight, ShieldCheck, Zap, LayoutDashboard, Database, Smartphone, CheckCircle2, AlertTriangle, Info, BellRing } from 'lucide-react';
import { ThemeConfig } from '../theme-context';
import { Button } from './Button';
import { Input } from './Form';
import { PressableCard } from './PressableCard';
import { ThemeToggle } from './ThemeToggle';

export const TestThemeWebsite: React.FC<{ isDarkMode: boolean, activeTheme: ThemeConfig, onClose: () => void, onToggleTheme: () => void }> = ({ isDarkMode, activeTheme, onClose, onToggleTheme }) => {

    const primaryColorName = activeTheme.colors[0]?.name.toLowerCase().replace(/\s+/g, '-') || 'brand';
    const secondaryColorName = activeTheme.colors[1]?.name.toLowerCase().replace(/\s+/g, '-') || primaryColorName;

    // Helper functions for tokenized inline styles
    const tColor = (name: string) => `var(--${name})`;
    const tRadius = (level: string) => `var(--theme-radius-${level}, 8px)`;
    const tShadow = (level: string) => `var(--theme-shadow-${level}, none)`;

    const styles = {
        page: {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            overflowY: 'auto' as const,
            zIndex: 100,
            backgroundColor: tColor('color-background-default'),
            color: tColor('color-text-default'),
            fontFamily: 'var(--theme-font-family)',
            animation: 'fadeIn 0.3s ease-out',
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem',
        },
        card: {
            backgroundColor: tColor('color-surface-default'),
            borderRadius: tRadius('lg'),
            padding: '2rem',
            boxShadow: tShadow('1'),
            border: `1px solid ${tColor('color-border-subtle')}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
        },
        cardHover: {
            transform: 'translateY(-4px)',
            boxShadow: tShadow('3'),
        },
        nav: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.5rem 0',
            borderBottom: `1px solid ${tColor('color-border-subtle')}`,
        },
        navLink: {
            color: tColor('color-text-description'),
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '1rem',
        },
        floatingCloseBtn: {
            position: 'fixed' as const,
            bottom: '2rem',
            right: '2rem',
            backgroundColor: tColor('color-base-neutral-800'),
            color: tColor('color-text-neutral-50'),
            padding: '1rem 2rem',
            borderRadius: tRadius('full'),
            boxShadow: tShadow('4'),
            zIndex: 1000,
            border: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        }
    };

    const FeatureData = [
        { icon: <ShieldCheck size={32} color={tColor(`color-base-${secondaryColorName}-default`)} />, title: 'Enterprise Security', desc: 'Bank-grade encryption protecting your data at rest and in transit.' },
        { icon: <Zap size={32} color={tColor(`color-base-${secondaryColorName}-default`)} />, title: 'Lightning Fast', desc: 'Global CDN distribution ensures sub-second load times anywhere.' },
        { icon: <LayoutDashboard size={32} color={tColor(`color-base-${secondaryColorName}-default`)} />, title: 'Intuitive Dashboard', desc: 'No learning curve. Beautiful interfaces designed for humans.' },
        { icon: <Database size={32} color={tColor(`color-base-${secondaryColorName}-default`)} />, title: 'Infinite Scaling', desc: 'Our architecture grows with you. From 10 to 10M users.' },
        { icon: <Smartphone size={32} color={tColor(`color-base-${secondaryColorName}-default`)} />, title: 'Mobile Native', desc: 'Flawless experiences across all devices and screen sizes.' },
        { icon: <ArrowRight size={32} color={tColor(`color-base-${primaryColorName}-default`)} />, title: 'API Driven', desc: 'Integrate effortlessly with our comprehensive REST and GraphQL APIs.' },
    ];

    return (
        <div style={styles.page}>
            {/* Floating Close Action */}
            <button style={styles.floatingCloseBtn} onClick={onClose} className="demo-close-btn">
                Exit Theme Demo
                <ArrowRight size={18} />
            </button>

            {/* Global Alert Banner representing Error/Warning states */}
            <div style={{ backgroundColor: tColor('color-surface-error-default'), color: tColor('color-text-error-default'), padding: '0.75rem', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, borderBottom: `1px solid ${tColor('color-border-error-default')}` }}>
                <AlertTriangle size={16} />
                <span>Scheduled maintenance: Our APIs will be degraded for 10 minutes on Saturday.</span>
            </div>

            {/* Navigation */}
            <nav style={{ backgroundColor: tColor('color-background-default'), position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={styles.container}>
                    <div style={styles.nav}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: tColor(`color-text-${primaryColorName}-default`), letterSpacing: '-0.02em' }}>
                            AcmeCorp.
                        </div>
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <a href="#" style={styles.navLink}>Products</a>
                            <a href="#" style={styles.navLink}>Solutions</a>
                            <a href="#" style={styles.navLink}>Pricing</a>
                            <ThemeToggle
                                isDarkMode={isDarkMode}
                                onChange={() => onToggleTheme()}
                            />
                            <Button variant="ghost" color="neutral">
                                Log in
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{ padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
                <div style={styles.container}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4rem' }}>

                        <div style={{ flex: '1 1 500px', zIndex: 2 }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '0.25rem 1rem',
                                backgroundColor: tColor(`color-surface-${primaryColorName}-subtle`),
                                color: tColor(`color-text-${primaryColorName}-default`),
                                borderRadius: tRadius('full'),
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                marginBottom: '1.5rem',
                                border: `1px solid ${tColor(`color-border-${primaryColorName}-default`)}`
                            }}>
                                v2.0 IS NOW LIVE
                            </div>
                            <h1 style={{
                                fontSize: '4.5rem',
                                fontWeight: 800,
                                lineHeight: 1.1,
                                marginBottom: '1.5rem',
                                color: tColor('color-text-default'),
                                letterSpacing: '-0.03em'
                            }}>
                                Build the future of <span style={{ color: tColor(`color-text-${primaryColorName}-default`) }}>software</span> together.
                            </h1>
                            <p style={{
                                fontSize: '1.25rem',
                                color: tColor('color-text-description'),
                                marginBottom: '2.5rem',
                                lineHeight: 1.6,
                                maxWidth: '600px'
                            }}>
                                Empower your team with the world's most flexible and scalable platform. Design, deploy, and dominate your market.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <Button variant="primary" color={primaryColorName}>
                                    Start Building Free
                                    <ArrowRight size={20} />
                                </Button>
                                <Button variant="outline" color={primaryColorName}>
                                    Explore API Docs
                                </Button>
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div style={{ flex: '1 1 400px', position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                top: '-10%', left: '-10%', right: '-10%', bottom: '-10%',
                                background: `radial-gradient(circle at center, ${tColor(`color-surface-${primaryColorName}-subtle`)} 0%, transparent 70%)`,
                                zIndex: 0,
                                opacity: 0.5
                            }} />
                            <img
                                src="./hero_collaboration.png"
                                alt="Abstract platform blocks"
                                style={{
                                    width: '100%',
                                    borderRadius: tRadius('xl'),
                                    boxShadow: tShadow('4'),
                                    position: 'relative',
                                    zIndex: 1,
                                    aspectRatio: '16/9',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>

                    </div>
                </div>
            </header>

            {/* Social Proof / Stats */}
            <section style={{ backgroundColor: tColor('color-surface-subtle'), padding: '4rem 0', borderTop: `1px solid ${tColor('color-border-subtle')}`, borderBottom: `1px solid ${tColor('color-border-subtle')}` }}>
                <div style={styles.container}>
                    <p style={{ textAlign: 'center', color: tColor('color-text-description'), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3rem' }}>
                        Trusted by industry leaders
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
                        {[
                            { stat: '99.99%', label: 'Uptime SLA' },
                            { stat: '10M+', label: 'Active Users' },
                            { stat: '<50ms', label: 'Global Latency' },
                            { stat: '24/7', label: 'Expert Support' }
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 800, color: tColor('color-text-default'), letterSpacing: '-0.03em' }}>{s.stat}</div>
                                <div style={{ fontSize: '1rem', color: tColor(`color-text-${primaryColorName}-default`), fontWeight: 600 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '8rem 0' }}>
                <div style={styles.container}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem', maxWidth: '800px', margin: '0 auto 5rem auto' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: 800, color: tColor('color-text-default'), marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                            Everything you need to <span style={{ color: tColor(`color-text-${secondaryColorName}-default`) }}>scale</span>.
                        </h2>
                        <p style={{ fontSize: '1.25rem', color: tColor('color-text-description'), lineHeight: 1.6 }}>
                            A comprehensive suite of tools designed to remove friction from your workflow and drastically reduce your time to market.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        {FeatureData.map((feature, index) => {
                            const isHighlight = index === FeatureData.length - 1;
                            return (
                                <PressableCard
                                    key={index}
                                    title={feature.title}
                                    colorName={isHighlight ? primaryColorName : 'neutral'}
                                >
                                    <div style={{
                                        width: '64px', height: '64px',
                                        backgroundColor: isHighlight ? tColor(`color-surface-${primaryColorName}-subtle`) : tColor('color-surface-subtle'),
                                        borderRadius: tRadius('lg'),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '0.5rem',
                                        marginTop: '0.5rem'
                                    }}>
                                        {feature.icon}
                                    </div>
                                    <p style={{
                                        fontSize: '1rem',
                                        color: isHighlight ? tColor(`color-text-${primaryColorName}-default`) : tColor('color-text-description'),
                                        lineHeight: 1.6,
                                        margin: 0
                                    }}>
                                        {feature.desc}
                                    </p>
                                </PressableCard>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Split Highlight Section */}
            <section style={{ padding: '4rem 0', overflow: 'hidden' }}>
                <div style={styles.container}>
                    <div style={{ backgroundColor: tColor(`color-base-${primaryColorName}-default`), borderRadius: tRadius('xl'), padding: '0', display: 'flex', flexWrap: 'wrap', overflow: 'hidden', boxShadow: tShadow('3') }}>

                        <div style={{ flex: '1 1 500px', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: tColor(`color-text-${primaryColorName}-contrast`), marginBottom: '1.5rem', lineHeight: 1.2 }}>
                                Unlock your data's true potential.
                            </h2>
                            <p style={{ fontSize: '1.25rem', color: tColor(`color-text-${primaryColorName}-contrast`), opacity: 0.9, marginBottom: '2.5rem', lineHeight: 1.6 }}>
                                Gain real-time insights with our advanced analytics engine. Make decisions faster, backed by beautiful, impossible-to-ignore data visualization.
                            </p>
                            <div>
                                <Button variant="primary" color="neutral">
                                    Explore Analytics
                                </Button>
                            </div>
                        </div>

                        <div style={{ flex: '1 1 400px', backgroundColor: isDarkMode ? tColor('color-neutral-900') : tColor('color-neutral-25'), padding: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img
                                src="./analytics_dashboard.png"
                                alt="Analytics visualization"
                                style={{ width: '100%', maxWidth: '350px', borderRadius: tRadius('lg'), boxShadow: tShadow('3'), transform: 'rotate(-5deg) scale(1.1)' }}
                            />
                        </div>

                    </div>
                </div>
            </section>

            {/* UI Component Showcase (Forms & Shadows) */}
            <section style={{ padding: '8rem 0' }}>
                <div style={styles.container}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: tColor('color-text-default'), marginBottom: '1rem' }}>Component Library</h2>
                        <p style={{ fontSize: '1.125rem', color: tColor('color-text-description') }}>Built perfectly on top of semantic UI tokens.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

                        {/* Form Examples */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: `1px solid ${tColor('color-border-subtle')}`, paddingBottom: '0.5rem' }}>Inputs & States</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <Input label="Standard Input" placeholder="user@company.com" />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <Input label="Success Input" placeholder="Valid data" colorName="success" />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <Input label="Disabled State" isDisabled placeholder="Cannot edit" />
                            </div>
                        </div>

                        {/* Shadow Depths */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, borderBottom: `1px solid ${tColor('color-border-subtle')}`, paddingBottom: '0.5rem' }}>Shadow Depths</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {[1, 2, 3, 4].map(depth => (
                                    <div key={depth} style={{
                                        backgroundColor: tColor('color-surface-default'),
                                        borderRadius: tRadius('md'),
                                        padding: '1.5rem',
                                        boxShadow: tShadow(depth.toString()),
                                        border: `1px solid ${tColor('color-border-subtle')}`,
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}>
                                        <div style={{ fontWeight: 600, color: tColor('color-text-default') }}>Shadow {depth}</div>
                                        <div style={{ fontSize: '0.75rem', color: tColor('color-text-description') }}>var(--theme-shadow-{depth})</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section style={{ padding: '8rem 0', backgroundColor: tColor('color-surface-subtle') }}>
                <div style={styles.container}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: 800, color: tColor('color-text-default'), marginBottom: '1rem' }}>Simple, transparent pricing.</h2>
                        <p style={{ fontSize: '1.25rem', color: tColor('color-text-description') }}>No surprise fees. Just the features you need.</p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', alignItems: 'center' }}>

                        {/* Standard Card */}
                        <div style={{ ...styles.card, flex: '1 1 350px', maxWidth: '450px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: tColor('color-text-default'), marginBottom: '0.5rem' }}>Starter</h3>
                            <p style={{ color: tColor('color-text-description'), marginBottom: '2rem' }}>Perfect for side projects and indie developers.</p>
                            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: tColor('color-text-default'), marginBottom: '2rem', letterSpacing: '-0.04em' }}>
                                $0<span style={{ fontSize: '1rem', color: tColor('color-text-description'), fontWeight: 500 }}>/mo</span>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
                                {['1 Project', '10,000 API requests/mo', 'Community Support'].map(item => (
                                    <li key={item} style={{ padding: '0.75rem 0', borderBottom: `1px solid ${tColor('color-border-subtle')}`, color: tColor('color-text-default'), display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ArrowRight size={16} color={tColor('color-success-base')} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Button variant="outline" color={primaryColorName}>Get Started</Button>
                            </div>
                        </div>

                        {/* Highlighted Card */}
                        <div style={{
                            backgroundColor: tColor('color-surface-default'),
                            color: tColor('color-text-default'),
                            borderRadius: tRadius('lg'),
                            padding: '3rem 2rem',
                            boxShadow: tShadow('4'),
                            border: `2px solid ${tColor(`color-border-${secondaryColorName}-default`)}`,
                            flex: '1 1 350px',
                            maxWidth: '450px',
                            position: 'relative',
                            transform: 'scale(1.05)',
                            zIndex: 2
                        }}>
                            <div style={{ position: 'absolute', top: 0, right: '2rem', transform: 'translateY(-50%)', backgroundColor: tColor(`color-base-${secondaryColorName}-default`), color: tColor(`color-text-${secondaryColorName}-contrast`), padding: '0.25rem 1rem', borderRadius: tRadius('full'), fontWeight: 700, fontSize: '0.875rem' }}>
                                MOST POPULAR
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pro</h3>
                            <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.03em' }}>$49<span style={{ fontSize: '1rem', color: tColor('color-text-description'), fontWeight: 500 }}>/mo</span></div>
                            <p style={{ color: tColor('color-text-description'), marginBottom: '2rem' }}>For growing teams that need more power.</p>

                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
                                {['Unlimited Projects', '1,000,000 API requests/mo', 'Priority 24/7 Support', 'Custom Domains'].map(item => (
                                    <li key={item} style={{ padding: '0.75rem 0', borderBottom: `1px solid ${tColor('color-border-subtle')}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ArrowRight size={16} color={tColor(`color-icon-${secondaryColorName}-default`)} />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Button variant="primary" color={secondaryColorName}>Get Started</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ backgroundColor: tColor(`color-base-${primaryColorName}-default`), color: tColor(`color-text-${primaryColorName}-contrast`), padding: '4rem 0' }}>
                <div style={styles.container}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>AcmeCorp.</div>
                            <p style={{ opacity: 0.8, lineHeight: 1.6 }}>Building the primitives of the web.</p>
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Products</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, opacity: 0.8, lineHeight: 2 }}>
                                <li>Databases</li>
                                <li>Authentication</li>
                                <li>Storage</li>
                                <li>Functions</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Company</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, opacity: 0.8, lineHeight: 2 }}>
                                <li>About Us</li>
                                <li>Careers</li>
                                <li>Blog</li>
                                <li>Contact</li>
                            </ul>
                        </div>
                    </div>
                    <div style={{ borderTop: `1px solid rgba(255,255,255,0.1)`, paddingTop: '2rem', textAlign: 'center', opacity: 0.6, fontSize: '0.875rem' }}>
                        © 2024 AcmeCorp Inc. All rights reserved.
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .feature-card:hover {
                    transform: translateY(-8px);
                    box-shadow: ${tShadow('3')} !important;
                }
            `}</style>
        </div>
    );
};
