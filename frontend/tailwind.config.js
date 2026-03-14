/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1e40af",
                secondary: "#64748b",
                accent: "#f59e0b",
                danger: "#ef4444",
                success: "#22c55e",
            }
        },
    },
    plugins: [],
}
