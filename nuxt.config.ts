export default defineNuxtConfig({
  buildDir: '.nuxt',
  vite: { ssr: { noExternal: [/shared\/(model|patterns)/] } },
  compatibilityDate: '2026-03-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css','~/assets/css/motion.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '纸上生花 · 剪纸互动工坊',
      meta: [{ name: 'theme-color', content: '#AD2920' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  },
  runtimeConfig: { public: { siteUrl: process.env.SITE_URL || 'http://127.0.0.1:3000' } },
  routeRules: {
    '/me': { headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } },
    '/admin': { headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } },
    '/studio': { headers: { 'X-Robots-Tag': 'noindex' } },
    '/api/**': { headers: { 'Cache-Control': 'no-store' } }
  },
  typescript: { strict: true },
  nitro: { preset: 'node-server', rollupConfig: { plugins: [{ name: 'resolve-shared-paper-model', resolveId(source) { const match = source.match(/(?:^|\/)shared\/(model|patterns)(?:\.ts)?$/); return match ? process.cwd().replaceAll('\\','/') + '/shared/' + match[1] + '.ts' : null } }] } }
})
