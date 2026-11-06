export default defineNuxtPlugin(nuxtApp => {
  const router = useRouter()
  const pageMotion = useState('paper-route-motion', () => 'paper-chapter')
  const paperWindowTarget = useState('paper-window-target', () => '')
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')

  router.beforeEach((to, from) => {
    if (to.path === from.path) return

    const throughWindow = paperWindowTarget.value === to.path
    paperWindowTarget.value = ''
    const [nextSection, ...nextDetail] = to.path.split('/').filter(Boolean)
    const [oldSection, ...oldDetail] = from.path.split('/').filter(Boolean)

    if (throughWindow) pageMotion.value = 'paper-window-arrival'
    else if (nextSection !== oldSection) pageMotion.value = 'paper-chapter'
    else if (nextDetail.length < oldDetail.length) pageMotion.value = 'paper-detail-return'
    else pageMotion.value = 'paper-detail-open'
  })

  // Nuxt installs its normal scroll behavior after resolving the initial route.
  nuxtApp.hook('app:mounted', () => {
    const scrollBehavior = router.options.scrollBehavior
    if (!scrollBehavior) return
    router.options.scrollBehavior = async (to, from, savedPosition) => {
      const samePage = to.path === from.path
      if (samePage && savedPosition) return savedPosition
      const queryChanged = to.fullPath.split('#', 1)[0] !== from.fullPath.split('#', 1)[0]
      if (samePage && queryChanged && (!to.hash || to.hash === from.hash)) return false
      const position = await scrollBehavior(to, from, savedPosition)
      if (!samePage || !to.hash || !position) return position

      const target = document.getElementById(to.hash.slice(1))
      if (target?.hasAttribute('tabindex')) target.focus({ preventScroll: true })
      return { ...position, behavior: reducedMotion.matches ? 'auto' : 'smooth' }
    }
  })
})
