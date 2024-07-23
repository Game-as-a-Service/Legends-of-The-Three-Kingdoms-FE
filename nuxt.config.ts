// https://nuxt.com/docs/api/configuration/nuxt-config
// import { defineNuxtConfig } from 'nuxt'
export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            apiBaseUrl: 'https://scolley31.com/',
            brokerUrl: 'wss://scolley31.com/legendsOfTheThreeKingdoms',
            // apiBaseUrl: 'http://54.238.232.62:8080/',
            // brokerUrl: 'ws://54.238.232.62:8080/legendsOfTheThreeKingdoms',
        },
    },
    production: {
        runtimeConfig: {
            public: {
                apiBaseUrl: 'https://scolley31.com/',
                brokerUrl: 'wss://scolley31.com/legendsOfTheThreeKingdoms',
            },
        },
    },
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    devtools: { enabled: true },
    modules: ['@nuxtjs/tailwindcss'],
})
