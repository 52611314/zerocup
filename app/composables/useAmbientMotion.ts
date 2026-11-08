import type { Ref } from 'vue'

// Ambient loops only run while their own scene is visible. SSR stays static.
export function useAmbientMotion(root: Ref<HTMLElement | undefined>) {
  const running = ref(false)
  let observer: IntersectionObserver | undefined
  let preference: MediaQueryList | undefined
  let visible = false
  const sync = () => { running.value = visible && !document.hidden && !preference?.matches }

  onMounted(() => {
    preference = matchMedia('(prefers-reduced-motion: reduce)')
    observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
      sync()
    })
    if (root.value) observer.observe(root.value)
    document.addEventListener('visibilitychange', sync)
    preference.addEventListener('change', sync)
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
    document.removeEventListener('visibilitychange', sync)
    preference?.removeEventListener('change', sync)
  })
  return { running }
}
