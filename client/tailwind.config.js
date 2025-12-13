/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'gradient-shift': 'gradient-shift 4s linear infinite',
            },
        },
    },
    plugins: [],
}
