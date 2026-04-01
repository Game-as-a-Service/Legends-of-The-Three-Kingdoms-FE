// https://nuxt.com/docs/api/configuration/nuxt-config
// import { defineNuxtConfig } from 'nuxt'
export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            apiBaseUrl: 'https://3k-api.parsons125.in/',
            brokerUrl: 'wss://3k-api.parsons125.in/legendsOfTheThreeKingdoms',
            // apiBaseUrl: 'http://54.238.232.62:8080/',
            // brokerUrl: 'ws://54.238.232.62:8080/legendsOfTheThreeKingdoms',
        },
    },
    production: {
        runtimeConfig: {
            public: {
                apiBaseUrl: 'https://3k-api.parsons125.in/',
                brokerUrl: 'wss://3k-api.parsons125.in/legendsOfTheThreeKingdoms',
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
