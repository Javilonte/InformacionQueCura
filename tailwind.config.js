/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--color-bg)",
                primary: "var(--color-primary)",
                text: "var(--color-text)",
                muted: "var(--color-text-dim)",
            },
        },
    },
    plugins: [],
}
