import type { NitroConfig, NitroRouteRules } from 'nitropack'
import { useNuxt } from '@nuxt/kit'
import { createRequire } from 'node:module'
const nuxtResolver = createRequire(import.meta.resolve('nuxt'))
const routeRules: Record<string, NitroRouteRules> = {
    '/me': { headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } },
    '/admin': { headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'private, no-store' } },
    '/studio': { headers: { 'X-Robots-Tag': 'noindex' } },
    '/api/**': { headers: { 'Cache-Control': 'no-store' } }
  }
const nitroConfig = { preset: 'node-server', rollupConfig: { plugins: [{ name: 'resolve-shared-paper-model', resolveId(source: string) { const match = source.match(/(?:^|\/)shared\/(model|patterns|swallow)(?:\.ts)?$/); return match ? process.cwd().replaceAll('\\','/') + '/shared/' + match[1] + '.ts' : null } }] } } satisfies NitroConfig

export default defineNuxtConfig({
  hooks: {
    'modules:done'() {
      useNuxt().hook('prepare:types', ({ tsConfig }) => {
      const options = tsConfig.vueCompilerOptions
      if (options?.plugins) options.plugins = options.plugins.map(plugin =>
        plugin === 'vue-router/volar/sfc-route-blocks' ? nuxtResolver.resolve(plugin) : plugin)
      })
    }
  },
  buildDir: '.nuxt',
  vite: { ssr: { noExternal: [/shared\/(model|patterns|swallow)/] } },
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
  routeRules,
  typescript: { strict: true },
  nitro: nitroConfig
})
