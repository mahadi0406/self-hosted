import {createContext, useContext, useState, useEffect} from 'react';

export const colors = {
    primary: "#e8a95d",
    primaryDark: "#d4952a",
    primaryLight: "rgba(232, 169, 93, 0.12)",
    primaryGlow: "rgba(232, 169, 93, 0.2)",
};

export const getTheme = (isDark) => ({
    bg: isDark ? "#0a0a0c" : "#ffffff",
    bgSecondary: isDark ? "#111114" : "#f8f9fa",
    bgTertiary: isDark ? "#18181c" : "#f1f3f4",
    text: isDark ? "#ffffff" : "#1a1a1a",
    textMuted: isDark ? "#888" : "#666",
    textLight: isDark ? "#555" : "#999",
    border: isDark ? "#222" : "#e8e8e8",
    borderLight: isDark ? "#1a1a1a" : "#f0f0f0",
    card: isDark ? "#111114" : "#ffffff",
    cardHover: isDark ? "#18181c" : "#fafafa",
    isDark,
    ...colors,
});

const ThemeContext = createContext(null);

export function ThemeProvider({children}) {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        setIsDark(savedTheme ? savedTheme === 'dark' : true);
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const theme = getTheme(isDark);
    const toggleTheme = () => setIsDark(!isDark);

    return (
        <ThemeContext.Provider value={{theme, isDark, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
