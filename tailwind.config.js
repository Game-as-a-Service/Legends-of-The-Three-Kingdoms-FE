/** @type {import('tailwindcss').Config} */
export default {
    content: [
        'index.html',
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './nuxt.config.{js,ts}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
