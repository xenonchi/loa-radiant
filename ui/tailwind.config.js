/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{html,svelte,js,ts,}',
        './electron/**/*.{html,svelte,js,ts,}',
    ],
    theme: {
        screens: {
            mini: '240px',
        },
    },
    plugins: [],
}
