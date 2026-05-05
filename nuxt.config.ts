export default defineNuxtConfig({
  app: {
    head: {
      title: 'Linguesc',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
      ]
    }
  },
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss']
})