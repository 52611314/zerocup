<script setup lang="ts">
import { cutPath, sectorTransform, SECTOR_PATH, type PaperModel } from '../../shared/model'

defineProps<{ model: PaperModel; visible: boolean }>()
const clipId = `cut-light-${useId()}`
</script>

<template>
  <svg class="cut-light" :class="{ 'light-visible': visible }" viewBox="-108 -108 216 216" aria-hidden="true">
    <defs>
      <clipPath :id="clipId"><path :d="SECTOR_PATH" /></clipPath>
    </defs>
    <g v-for="sector in 8" :key="sector" :transform="sectorTransform(sector - 1)">
      <g :clip-path="`url(#${clipId})`">
        <path
          v-for="cut in model.cuts"
          :key="cut.id"
          :d="cutPath(cut)"
          :transform="`translate(${cut.x} ${cut.y}) rotate(${cut.angle})`"
        />
      </g>
    </g>
  </svg>
</template>
