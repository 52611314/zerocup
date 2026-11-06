<script setup lang="ts">
import {SWALLOW_PATH} from '../../shared/swallow'
withDefaults(defineProps<{ reversed?: boolean }>(), { reversed: false })

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
    :class="{ reversed }"
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
      <g :id="`${id}-swallow`">
        <path :d="SWALLOW_PATH" />
        <circle class="swallow-eye" cx="239" cy="116.4" r="2" />
      </g>
    </defs>

    <path class="cut-ground" :d="outline" />

    <g class="cut-ornament">
      <circle class="cut-rule" cx="200" cy="200" r="180" />
      <circle class="cut-rule cut-rule-inner" cx="200" cy="200" r="155" />
      <use
        v-for="angle in rimAngles"
        :key="angle"
        :href="`#${id}-rim`"
        :transform="`rotate(${angle} 200 200)`"
      />
      <use
        v-for="angle in petalAngles"
        :key="angle"
        :href="`#${id}-sprig`"
        :transform="`rotate(${angle} 200 200)`"
      />
      <path d="M266 158c12-12 23-11 32-2-11 8-22 9-32 2Zm-132 84c-12 12-23 11-32 2 11-8 22-9 32-2Z" />
      <path d="M269 176c10-5 18-3 22 4-8 3-16 2-22-4Zm-138 48c-10 5-18 3-22-4 8-3 16-2 22 4Z" />
      <path d="m200 193 3 7-3 7-3-7Z" />
    </g>

    <g class="swallow-forms">
      <use :href="`#${id}-swallow`" />
      <use :href="`#${id}-swallow`" transform="rotate(180 200 200)" />
    </g>
  </svg>
</template>

<style scoped>
.swallow-cut {
  --cut-red: var(--swallow-red, #a32b24);
  --cut-paper: var(--swallow-paper, #f7edda);
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.cut-ground {
  fill: var(--cut-red);
  filter: drop-shadow(0 10px 9px #59201833);
  transition: fill .5s ease, filter .5s ease;
}

.cut-ornament, .swallow-forms {
  color: var(--cut-paper);
  fill: currentColor;
  transition: color .5s ease, opacity .5s ease;
}

.swallow-forms { color: color-mix(in srgb, var(--cut-paper) 86%, var(--cut-red)); }

.cut-rule {
  fill: none;
  stroke: currentColor;
  stroke-width: .75;
  opacity: .77;
}

.cut-rule-inner { stroke-dasharray: 1.5 2.3; opacity: .6; }
.swallow-eye {
  fill: var(--cut-red);
  opacity: .45;
  transition: fill .5s ease, opacity .5s ease;
}

.reversed .cut-ground {
  fill: var(--cut-paper);
  filter: drop-shadow(0 8px 9px #5920181f);
}

.reversed .cut-ornament, .reversed .swallow-forms { color: var(--cut-red); }
.reversed .cut-ornament { opacity: .42; }
.reversed .swallow-eye { fill: var(--cut-paper); opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .cut-ground, .cut-ornament, .swallow-forms, .swallow-eye { transition: none; }
}
</style>
