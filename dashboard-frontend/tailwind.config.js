/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Professional Enterprise aesthetic, strictly no purple gradients
                primary: {
                    50: '#f0f9ff',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    900: '#0c4a6e',
                },
                surface: {
                    bg: '#f8fafc',
                    card: '#ffffff',
                    border: '#e2e8f0'
                }
            }
        },
    },
    plugins: [],
}
