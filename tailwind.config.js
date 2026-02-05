/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./resources/**/*.{vue,js,ts,jsx,tsx,blade.php}",
        "./resources/**/*.blade.php",
        "./resources/js/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: [
                    'Inter',
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'Helvetica Neue',
                    'Arial',
                    'sans-serif'
                ],
            },
        },
    },
    plugins: [],
}
