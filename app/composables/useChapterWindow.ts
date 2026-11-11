import type { RouteLocationRaw } from 'vue-router'

export const windowChapters = {
  '/learn': { kind: 'folio', revealMs: 680 },
  '/tutorials': { kind: 'fold', revealMs: 680 },
  '/studio': { kind: 'window', revealMs: 1240 / 1.5 },
  '/gallery': { kind: 'iris', revealMs: 680 },
} as const

type WindowChapter = keyof typeof windowChapters

export interface ChapterWindowShot {
  chapter: WindowChapter
  destination: string
  aperture: string
  keyboard: boolean
  phase: 'cover' | 'waiting' | 'opening'
}

export function isPlainChapterActivation(event: MouseEvent) {
  return !event.defaultPrevented && event.button === 0
    && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
}

export function focusChapterMain(source: Element | null) {
  const active = document.activeElement
  if (active === source || active === document.body) {
    document.getElementById('main')?.focus({ preventScroll: true })
  }
}

export function useChapterWindow() {
  const shot = useState<ChapterWindowShot | null>('chapter-window', () => null)
  const router = useRouter()

  function openChapterWindow(event: MouseEvent, to: RouteLocationRaw) {
    if (!import.meta.client || !isPlainChapterActivation(event)) return false
    const link = event.currentTarget
    if (!(link instanceof HTMLAnchorElement) || link.hasAttribute('download')
      || (link.target && link.target !== '_self')) return false

    const next = router.resolve(to)
    const origin = router.currentRoute.value
    if (!Object.hasOwn(windowChapters, next.path) || next.path === origin.path
      || next.hash || matchMedia('(prefers-reduced-motion: reduce)').matches) return false

    event.preventDefault()
    if (shot.value) return true

    const bounds = (link.querySelector('.window-cut') ?? link).getBoundingClientRect()
    const clamp = (value: number, size: number) => Math.round(Math.min(size - 1, Math.max(0, value)))
    const inset = [
      clamp(bounds.top, innerHeight),
      clamp(innerWidth - bounds.right, innerWidth),
      clamp(innerHeight - bounds.bottom, innerHeight),
      clamp(bounds.left, innerWidth),
    ]
    shot.value = {
      chapter: next.path as WindowChapter,
      destination: next.fullPath,
      aperture: `inset(${inset.map(value => `${value}px`).join(' ')})`,
      keyboard: event.detail === 0,
      phase: 'cover',
    }
    return true
  }

  return { shot, openChapterWindow }
}
