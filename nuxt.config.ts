// https://nuxt.com/docs/api/configuration/nuxt-config
// import { defineNuxtConfig } from 'nuxt'
export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            apiBaseUrl: 'http://54.238.232.62:8080/',
            brokerUrl: 'ws://54.238.232.62:8080/legendsOfTheThreeKingdoms',
        },
    },
    devtools: { enabled: true },
    modules: ['@nuxtjs/tailwindcss'],
})
