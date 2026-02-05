import {usePage} from '@inertiajs/react';

export const getThemes = (primaryColor = '#b4a0ff') => ({
    light: {
        bg: '#ffffff',
        bgSecondary: '#f8f9fa',
        bgCard: '#ffffff',
        bgHover: '#f3f4f6',
        border: '#e5e7eb',
        text: '#111827',
        textMuted: '#6b7280',
        textLight: '#9ca3af',
        primary: primaryColor,
        primaryLight: `${primaryColor}20`,
        primaryDark: primaryColor,
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        pink: '#EC4899',
    },
    dark: {
        bg: '#0f1219',
        bgSecondary: '#1a1d2e',
        bgCard: '#1e2139',
        bgHover: '#252945',
        border: '#2d3250',
        text: '#ffffff',
        textMuted: '#9ca3af',
        textLight: '#6b7280',
        primary: primaryColor,
        primaryLight: `${primaryColor}30`,
        primaryDark: '#9b84ff',
        success: '#4ADE80',
        warning: '#FBBF24',
        danger: '#F87171',
        pink: '#c084fc',
    }
});

export const useTheme = (mode = 'light') => {
    const {primaryColor} = usePage().props;
    return getThemes(primaryColor)[mode] || getThemes(primaryColor).light;
};

export const themes = getThemes();
export const theme = themes.light;
export const getTheme = (mode = 'light', primaryColor = '#b4a0ff') =>
    getThemes(primaryColor)[mode] || getThemes(primaryColor).light;
