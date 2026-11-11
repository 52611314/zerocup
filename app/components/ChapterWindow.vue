<script setup lang="ts">
import { isNavigationFailure } from 'vue-router'
import { focusChapterMain, windowChapters, type ChapterWindowShot } from '../composables/useChapterWindow'

const { shot } = useChapterWindow()
const router = useRouter()
const nuxt = useNuxtApp()
const target = useState('paper-window-target', () => '')
const preference = import.meta.client ? matchMedia('(prefers-reduced-motion: reduce)') : null
useHead({ link: [{ rel: 'preload', as: 'image', href: '/art/lattice-window.svg' }] })
const chapter = computed(() => shot.value && windowChapters[shot.value.chapter])
let coverTimer: ReturnType<typeof setTimeout> | undefined
let exitTimer: ReturnType<typeof setTimeout> | undefined
let frame = 0
let pageReady = false
let sourceLeft = false
let sourceFocus: Element | null = null

function clear(current = shot.value, focus = false) {
  if (!current || shot.value !== current) return
  clearTimeout(coverTimer)
  clearTimeout(exitTimer)
  cancelAnimationFrame(frame)
  const activatedElement = sourceFocus
  sourceFocus = null
  shot.value = null
  if (focus && current.keyboard && router.currentRoute.value.fullPath === current.destination) {
    focusChapterMain(activatedElement)
  }
}

async function navigate(current: ChapterWindowShot) {
  if (shot.value !== current || current.phase !== 'cover') return
  const activatedElement = sourceFocus
  current.phase = 'waiting'
  target.value = current.chapter
  try {
    const failure = await router.push(current.destination)
    if (isNavigationFailure(failure)) clear(current)
    else if (!shot.value && current.keyboard && router.currentRoute.value.fullPath === current.destination) {
      focusChapterMain(activatedElement)
    }
  } catch {
    clear(current)
  } finally {
    if (target.value === current.chapter) target.value = ''
  }
}

watch(shot, current => {
  if (!current) return
  pageReady = false
  sourceLeft = false
  sourceFocus = current.keyboard ? document.activeElement : null
  coverTimer = setTimeout(() => void navigate(current), current.chapter === '/studio' ? 170 / 1.5 : 170)
  exitTimer = setTimeout(() => clear(current, true), 2800)
}, { flush: 'sync' })

const releaseGuard = router.beforeEach(to => {
  if (shot.value && to.fullPath !== shot.value.destination) clear()
})

function waitingForPage() {
  const current = shot.value
  if (!current || current.phase !== 'waiting' || router.currentRoute.value.fullPath !== current.destination) return
  return current
}

function reveal(current: ChapterWindowShot) {
  if (!pageReady || !sourceLeft) return
  const open = () => {
    if (shot.value !== current) return
    // The editor canvas is client-only, and may mount after the page shell.
    if (current.chapter === '/studio' && !document.querySelector('#main .canvas-surface')) {
      frame = requestAnimationFrame(open)
      return
    }
    clearTimeout(exitTimer)
    current.phase = 'opening'
    exitTimer = setTimeout(() => clear(current, true), windowChapters[current.chapter].revealMs)
  }
  // Let Nuxt apply the destination scroll before the gap reveals the page.
  frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(open)
  })
}

const releasePage = nuxt.hook('page:finish', () => {
  const current = waitingForPage()
  if (!current) return
  pageReady = true
  reveal(current)
})

const releaseTransition = nuxt.hook('page:transition:finish', () => {
  const current = waitingForPage()
  if (!current) return
  sourceLeft = true
  reveal(current)
})
const releaseError = nuxt.hook('app:error', () => clear())

function skip() {
  const current = shot.value
  if (!current) return
  if (current.phase === 'cover') void navigate(current)
  clear(current, true)
}

function updatePreference() {
  if (preference?.matches) skip()
}

function handleKey(event: KeyboardEvent) {
  if (event.key === 'Escape') skip()
}

function cancelOnHistory() {
  clear()
}

onMounted(() => {
  preference?.addEventListener('change', updatePreference)
  window.addEventListener('popstate', cancelOnHistory)
  window.addEventListener('keydown', handleKey)
})

onBeforeUnmount(() => {
  clear()
  releaseGuard()
  releasePage()
  releaseTransition()
  releaseError()
  preference?.removeEventListener('change', updatePreference)
  window.removeEventListener('popstate', cancelOnHistory)
  window.removeEventListener('keydown', handleKey)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="shot && chapter" class="chapter-window" :data-phase="shot.phase" :data-passage="chapter.kind"
      :style="{ '--window-aperture': shot.aperture }" aria-hidden="true">
      <div v-if="chapter.kind === 'window'" class="chapter-window-frame">
        <div class="chapter-window-shutters">
          <div v-for="side in ['left', 'right']" :key="side" class="chapter-window-leaf" :class="`window-leaf-${side}`">
            <div class="chapter-window-paper"><img src="/art/lattice-window.svg" alt="" width="360" height="720"/></div>
            <span class="chapter-window-pull"/>
          </div>
        </div>
        <div class="chapter-window-rim"/>
        <span class="chapter-window-seam"/>
        <div class="chapter-window-sill"/>
      </div>
      <ChapterGalleryPassage v-else-if="chapter.kind === 'iris'" :phase="shot.phase"/>
      <ChapterPaperPassage v-else :kind="chapter.kind" :phase="shot.phase"/>
    </div>
  </Teleport>
</template>

<style scoped>
.chapter-window {
  position: fixed;
  z-index: 100;
  inset: 0;
  overflow: clip;
  clip-path: inset(0);
  animation: chapter-window-approach .17s cubic-bezier(.22,.76,.25,1) both;
  touch-action: none;
}

.chapter-window[data-passage="window"] {
  animation: none;
  clip-path: none;
}

.chapter-window-frame {
  --wood: #673a23;
  --light: #edc08c;
  --frame: clamp(10px, 1.9vw, 29px);
  --joinery: clamp(5px, .78vw, 12px);
  --transom-height: 0%;
  position: absolute;
  inset: 0;
  transform-origin: 50% 50%;
}

.chapter-window-rim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow:
    inset 0 0 0 1px #472b1b,
    inset 0 0 0 calc(var(--frame) * .31) #9a6540,
    inset 0 0 0 calc(var(--frame) * .39) #bc8d60,
    inset 0 0 0 calc(var(--frame) * .81) var(--wood),
    inset 0 0 0 var(--frame) #3b2419,
    inset 0 2px 16px var(--frame) #331b1250;
}


.chapter-window-sill {
  position: absolute;
  inset: auto 0 0;
  height: calc(var(--frame) * 1.11);
  border: 1px solid #603a24;
  background:
    repeating-linear-gradient(2deg, transparent 0 2px, #5b301b23 2px 3px, transparent 3px 5px),
    linear-gradient(180deg, #c7945e 0 35%, #e1b77c 36% 43%, #8f5937 47%, #5a341f);
  box-shadow: 0 3px 2px #55352359, 0 10px 14px #57382065;
}

.chapter-window-shutters {
  position: absolute;
  inset: calc(var(--frame) * .78 + var(--transom-height)) calc(var(--frame) * .78) calc(var(--frame) * .78);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  perspective: max(700px, 96vw);
  perspective-origin: center 48%;
}

.chapter-window-leaf {
  --hinge-angle: 102deg;
  position: relative;
  display: grid;
  min-width: 0;
  padding: calc(var(--joinery) * 1.8);
  border: 1px solid #342013;
  background:
    repeating-linear-gradient(92deg, transparent 0 6px, #ffe0ad16 7px 8px, transparent 9px 18px, #42271630 19px 21px, transparent 24px 31px),
    repeating-linear-gradient(88deg, transparent 0 36px, #3b1b141c 38px 42px, transparent 46px 71px),
    linear-gradient(122deg, #ad7449, #744525 69%, #5c331f);
  box-shadow: inset 0 0 0 1px #f5ba7769, inset 0 0 0 3px #43271560;
  transform-origin: left center;
  backface-visibility: hidden;
}

.window-leaf-right {
  --hinge-angle: -102deg;
  transform-origin: right center;
}

.chapter-window-paper {
  position: relative;
  min-height: 0;
  overflow: hidden;
  background: #e9e3d1;
  border: 1px solid #402315;
  box-shadow: 0 1px #ecbc8555;
}

.chapter-window-paper img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: fill; }



.chapter-window-pull {
  position: absolute;
  z-index: 1;
  top: 49%;
  right: calc(var(--joinery) * .6);
  width: clamp(6px, 1vw, 14px);
  aspect-ratio: 1;
  border: 1px solid #e5b979;
  border-radius: 50%;
  background: #57341f;
  box-shadow: 0 4px 5px #2b170cbe, inset 0 0 0 1px #805a32;
}

.window-leaf-right .chapter-window-pull { right: auto; left: calc(var(--joinery) * .6); }

.chapter-window-seam {
  position: absolute;
  inset: calc(var(--frame) + var(--transom-height)) auto var(--frame) 50%;
  width: 1px;
  background: linear-gradient(transparent, var(--light) 42%, #fff4d8 51%, var(--light) 65%, transparent);
  box-shadow: 0 0 9px 1px color-mix(in srgb, var(--light), transparent 58%);
  opacity: .78;
}

.chapter-window[data-phase="opening"] { pointer-events: none; }
.chapter-window[data-phase="opening"] .chapter-window-leaf { animation: chapter-window-swing .693333s cubic-bezier(.52,.08,.36,.95) both; }
.chapter-window[data-phase="opening"] .window-leaf-right { animation-delay: .036667s; }
.chapter-window[data-phase="opening"] .chapter-window-frame { animation: chapter-window-cross .826667s cubic-bezier(.5,.08,.28,1) both; }
.chapter-window[data-phase="opening"] .chapter-window-seam { animation: chapter-window-unlatch .153333s ease-in both; }

@keyframes chapter-window-approach {
  from { clip-path: var(--window-aperture); }
  to { clip-path: inset(0); }
}

@keyframes chapter-window-swing {
  from { transform: rotateY(0); }
  to { transform: rotateY(var(--hinge-angle)); }
}

@keyframes chapter-window-cross {
  0%, 46% { transform: scale(1); }
  90% { opacity: 1; }
  100% { transform: scale(1.48); opacity: 0; }
}

@keyframes chapter-window-unlatch {
  to { opacity: 0; transform: scale(.86); }
}

@media (max-aspect-ratio: 4/5) {
  .chapter-window-frame { --transom-height: 0%; }
}

@media (prefers-reduced-motion: reduce) {
  .chapter-window { display: none; }
}
</style>
