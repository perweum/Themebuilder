export type GeometryStyle = 'sharp' | 'rounded' | 'pill';

export interface OnboardingAnswers {
    brandColor: string;
    fontFamily: string;
    geometry: GeometryStyle;
    name: string;
}

export interface OnboardingStepDef {
    id: keyof Omit<OnboardingAnswers, never>;
    title: string;
    description: string;
}

// Add new steps here to extend the onboarding flow — order is preserved.
export const ONBOARDING_STEPS: OnboardingStepDef[] = [
    {
        id: 'brandColor',
        title: 'Choose your brand color',
        description: 'The primary color for buttons, links, and highlights across your system.',
    },
    {
        id: 'fontFamily',
        title: 'Pick a typeface',
        description: 'The font used across your UI. You can swap it any time from the sidebar.',
    },
    {
        id: 'geometry',
        title: 'Visual style',
        description: 'How sharp or soft should your components feel?',
    },
    {
        id: 'name',
        title: 'Name your theme',
        description: 'Give your design system a name.',
    },
];

export const GEOMETRY_RADIUS: Record<GeometryStyle, number> = {
    sharp:   0,
    rounded: 4,
    pill:    16,
};

export const SURPRISE_COLORS = [
    '#0142FE', '#6366f1', '#8b5cf6', '#a855f7',
    '#ec4899', '#f43f5e', '#10b981', '#14b8a6',
    '#f59e0b', '#ef4444', '#06b6d4', '#f97316',
    '#84cc16', '#e11d48', '#7c3aed', '#0ea5e9',
];
