import {useState, useEffect} from 'react';
import {usePage} from '@inertiajs/react';

let themeModeCache = 'light';
let primaryColorCache = '#b4a0ff';
let isInitialized = false;

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

export const useTheme = (initialMode = null) => {
    const page = usePage();
    const [themeMode, setThemeMode] = useState(initialMode || themeModeCache);
    const [primaryColor, setPrimaryColor] = useState(primaryColorCache);

    useEffect(() => {
        if (page.props.primaryColor) {
            setPrimaryColor(page.props.primaryColor);
            primaryColorCache = page.props.primaryColor;
        }

        if (typeof window !== 'undefined' && !isInitialized) {
            const savedMode = localStorage.getItem('theme-mode');
            if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
                setThemeMode(savedMode);
                themeModeCache = savedMode;
            } else if (initialMode) {
                setThemeMode(initialMode);
                themeModeCache = initialMode;
            }
        }

        isInitialized = true;
    }, [page.props, initialMode]);

    useEffect(() => {
        if (typeof window !== 'undefined' && themeMode) {
            localStorage.setItem('theme-mode', themeMode);
            themeModeCache = themeMode;
        }
    }, [themeMode]);

    const toggleTheme = () => {
        setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const setMode = (mode) => {
        if (mode === 'light' || mode === 'dark') {
            setThemeMode(mode);
        }
    };

    const theme = getThemes(primaryColor)[themeMode] || getThemes(primaryColor).light;
    return {
        theme,
        themeMode,
        primaryColor,
        toggleTheme,
        setMode,
        isDark: themeMode === 'dark',
        isLight: themeMode === 'light',
    };
};

export const themes = getThemes();
export const theme = themes.light;
export const getTheme = (mode = 'light', primaryColor = '#b4a0ff') =>
    getThemes(primaryColor)[mode] || getThemes(primaryColor).light;
