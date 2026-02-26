declare module 'culori' {
    export interface Oklch {
        mode: string;
        l: number;
        c: number;
        h?: number;
    }
    export function oklch(color: string): Oklch | undefined;
    export function formatHex(color: any): string;
    export function wcagContrast(a: string, b: string): number;
    export function useMode(mode: any): void;
    export const modeOklch: any;
}

declare module '*.png';
