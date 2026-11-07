<script setup lang="ts">
import {SWALLOW_PATH} from '../../shared/swallow'
defineProps<{ reversed?: boolean; assembling?: boolean }>()

const id = useId().replaceAll(':', '')
const rimAngles = Array.from({ length: 16 }, (_, index) => index * 22.5)
const petalAngles = Array.from({ length: 8 }, (_, index) => index * 45)

function point(radius: number, angle: number) {
  const radians = (angle - 90) * Math.PI / 180
  return `${(200 + radius * Math.cos(radians)).toFixed(2)} ${(200 + radius * Math.sin(radians)).toFixed(2)}`
}

const outline = [
  `M ${point(183, 0)}`,
  ...rimAngles.map(angle => `Q ${point(198, angle + 11.25)} ${point(183, angle + 22.5)}`),
  'Z'
].join(' ')
</script>

<template>
  <svg
    class="swallow-cut"
    :class="{ reversed, assembling }"
    viewBox="0 0 400 400"
    role="img"
    :aria-label="reversed ? '暖白团花中，朱红双燕反向展翅' : '朱红团花剪纸与暖白镂空纹样'"
  >
    <defs>
      <g :id="`${id}-rim`">
        <path d="M200 40c-8-4-11-9-9-15 7 2 10 7 9 15Zm0 0c8-4 11-9 9-15-7 2-10 7-9 15Z" />
        <path d="m220 30 3-4 3 4-3 4Z" />
        <circle cx="200" cy="23" r="1.4" />
      </g>
      <g :id="`${id}-sprig`">
        <path d="M200 49c-10 6-13 16 0 30 13-14 10-24 0-30Z" />
        <path d="M188 78c-10-1-16-8-15-16 10 2 16 8 15 16Zm24 0c10-1 16-8 15-16-10 2-16 8-15 16Z" />
        <path d="M193 83c-7 1-11 6-12 12 7-1 12-5 12-12Zm14 0c7 1 11 6 12 12-7-1-12-5-12-12Z" />
        <circle cx="200" cy="90" r="2" />
      </g>
      <g :id="`${id}-ornaments`">
        <use v-for="angle in rimAngles" :key="'rim-' + angle" :href="`#${id}-rim`" :transform="`rotate(${angle} 200 200)`" />
        <use v-for="angle in petalAngles" :key="'sprig-' + angle" :href="`#${id}-sprig`" :transform="`rotate(${angle} 200 200)`" />
        <path d="M266 158c12-12 23-11 32-2-11 8-22 9-32 2Zm-132 84c-12 12-23 11-32 2 11-8 22-9 32-2Z" />
        <path d="M269 176c10-5 18-3 22 4-8 3-16 2-22-4Zm-138 48c-10 5-18 3-22-4 8-3 16-2 22 4Z" />
        <path d="m200 193 3 7-3 7-3-7Z" />
      </g>
      <path :id="`${id}-swallow`" :d="SWALLOW_PATH" />
      <linearGradient :id="`${id}-paper`" x1="0%" y1="0%" x2="85%" y2="100%">
        <stop class="paper-light" />
        <stop class="paper-color" offset=".48" />
        <stop class="paper-shadow" offset="1" />
      </linearGradient>
      <mask v-if="!reversed" :id="`${id}-holes`" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">
        <rect width="400" height="400" fill="white" />
        <g fill="black">
          <use :href="`#${id}-ornaments`" />
          <g class="upper-swallow"><use :href="`#${id}-swallow`" /></g>
          <g class="lower-swallow"><use :href="`#${id}-swallow`" transform="rotate(180 200 200)" /></g>
        </g>
      </mask>
    </defs>

    <g class="paper-face">
      <path :d="outline" :fill="`url(#${id}-paper)`" :mask="reversed ? undefined : `url(#${id}-holes)`" />
      <circle class="cut-rule" cx="200" cy="200" r="178" />
      <g v-if="reversed" class="reverse-print">
        <use class="printed-ornaments" :href="`#${id}-ornaments`" />
        <use :href="`#${id}-swallow`" />
        <use :href="`#${id}-swallow`" transform="rotate(180 200 200)" />
        <g class="printed-eyes">
          <circle cx="239" cy="116.4" r="2" />
          <circle cx="161" cy="283.6" r="2" />
        </g>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.swallow-cut {
  --cut-red: var(--swallow-red, #a32b24);
  --cut-paper: var(--swallow-paper, #f7edda);
  --face: var(--cut-red);
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.paper-face { filter: drop-shadow(1px 7px 5px #4b1718a6); }
.paper-light { stop-color: color-mix(in srgb, var(--face) 81%, #ffd4a8); }
.paper-color { stop-color: var(--face); }
.paper-shadow { stop-color: color-mix(in srgb, var(--face) 82%, #451415); }
.cut-rule {
  fill: none;
  stroke: #ffd8a4;
  stroke-width: .65;
  opacity: .62;
}

.reversed { --face: var(--cut-paper); }
.reversed .paper-shadow { stop-color: color-mix(in srgb, var(--face) 90%, #85493b); }
.reversed .cut-rule { stroke: #a46540; }
.reverse-print { fill: var(--cut-red); }
.printed-ornaments { opacity: .43; }
.printed-eyes { fill: var(--cut-paper); }

@media (prefers-reduced-motion: no-preference) {
  .assembling .paper-face {
    transform-origin: center;
    animation: seat-paper 1.08s cubic-bezier(.18,.68,.24,1) both;
  }

  .assembling .upper-swallow, .assembling .lower-swallow {
    transform-box: fill-box;
    transform-origin: center;
    animation: find-cut 1.08s cubic-bezier(.18,.68,.24,1) both;
  }

  .upper-swallow { --offset-x: -19%; --offset-y: -24%; --angle: -12deg; }
  .lower-swallow { --offset-x: 19%; --offset-y: 24%; --angle: 12deg; }

  @keyframes seat-paper {
    from { opacity: .76; transform: rotate(-13deg) scale(.94); }
    to { opacity: 1; transform: none; }
  }

  @keyframes find-cut {
    from { transform: translate(var(--offset-x), var(--offset-y)) rotate(var(--angle)); }
    to { transform: none; }
  }
}
</style>
