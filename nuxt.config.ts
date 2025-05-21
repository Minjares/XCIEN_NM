// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/ui'
  ],
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'XCIEN Network Graph Visualization',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  ui: {
    icons: ['heroicons'],
    colors: {
      primary: {
        50: '#e6eef5',
        100: '#ccdceb',
        200: '#99b9d7',
        300: '#6696c3',
        400: '#3373af',
        500: '#00509b',
        600: '#00407c',
        700: '#00305d',
        800: '#00205b', // XCIEN dark blue
        900: '#001029'
      },
      secondary: {
        50: '#edf7ed',
        100: '#dbefdb',
        200: '#b7dfb7',
        300: '#93cf93',
        400: '#6fbf6f',
        500: '#4caf50', // XCIEN green
        600: '#3d8c40',
        700: '#2e6930',
        800: '#1e4620',
        900: '#0f2310'
      }
    }
  }
})
