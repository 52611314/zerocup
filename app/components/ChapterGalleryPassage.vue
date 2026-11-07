<script setup lang="ts">
const props = defineProps<{ phase: 'cover' | 'waiting' | 'opening' }>()
const paint = useId()
const center = shallowRef({ x: '50%', y: '52%' })

watch(() => props.phase, (phase) => {
  if (phase !== 'opening') return
  const mount = document.querySelector('#main .catalog-sheet')
  if (!mount) return
  const { left, top, width, height } = mount.getBoundingClientRect()
  const percent = (position: number, viewport: number) => `${Math.min(88, Math.max(12, position / viewport * 100))}%`
  center.value = {
    x: percent(left + width / 2, innerWidth),
    y: percent(top + height / 2, innerHeight),
  }
})
</script>

<template>
  <svg class="gallery-passage" :data-phase="phase" width="100%" height="100%" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient :id="`${paint}-wall`" :cx="center.x" :cy="center.y" r="78%">
        <stop offset="0" stop-color="#ad5838"/>
        <stop offset=".38" stop-color="#64261e"/>
        <stop offset=".78" stop-color="#301119"/>
        <stop offset="1" stop-color="#180e13"/>
      </radialGradient>
      <pattern :id="`${paint}-grain`" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(17)">
        <path d="M0 0v7" stroke="#ffc490" stroke-opacity=".16"/>
      </pattern>
      <mask :id="`${paint}-aperture`" x="0" y="0" width="100%" height="100%" maskUnits="userSpaceOnUse">
        <rect width="100%" height="100%" fill="white"/>
        <circle class="gallery-iris-hole" :cx="center.x" :cy="center.y" r="125%" fill="black"/>
      </mask>
    </defs>
    <g :mask="`url(#${paint}-aperture)`">
      <rect width="100%" height="100%" :fill="`url(#${paint}-wall)`"/>
      <rect width="100%" height="100%" :fill="`url(#${paint}-grain)`"/>
    </g>
    <g fill="none" stroke="#ffda9b">
      <circle class="gallery-iris-rim" :cx="center.x" :cy="center.y" r="125.3%" stroke-width="2" vector-effect="non-scaling-stroke"/>
      <circle class="gallery-iris-rim gallery-iris-guide" :cx="center.x" :cy="center.y" r="127.3%" stroke-dasharray="1 6" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    </g>
  </svg>
</template>

<style scoped>
.gallery-passage {
  position: absolute;
  inset: 0;
  display: block;
  overflow: hidden;
  pointer-events: none;
}

.gallery-iris-hole,
.gallery-iris-rim {
  transform: scale(0);
  transform-box: fill-box;
  transform-origin: center;
}

.gallery-iris-rim {
  opacity: 0;
  filter: drop-shadow(0 0 5px #ffbc7ab5);
}

.gallery-iris-guide { filter: none; }

.gallery-passage[data-phase='opening'] :is(.gallery-iris-hole, .gallery-iris-rim) {
  animation: open-gallery-iris .63s cubic-bezier(.44,.08,.25,1) both;
}

.gallery-passage[data-phase='opening'] .gallery-iris-rim {
  animation-name: open-gallery-iris, light-gallery-rim;
}

@keyframes open-gallery-iris {
  0% { transform: scale(0); }
  13% { transform: scale(.075); }
  100% { transform: scale(1); }
}

@keyframes light-gallery-rim {
  0%, 100% { opacity: 0; }
  24% { opacity: .84; }
  66% { opacity: .55; }
}
</style>
