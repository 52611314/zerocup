<script setup lang="ts">
import {SWALLOW_PATH} from '../../shared/swallow'
defineProps<{reversed:boolean}>()
const id='swallow-reveal-'+useId().replaceAll(':','')
</script>
<template>
 <div class="swallow-reveal" :class="{'is-reversed':reversed}" role="img" :aria-label="reversed?'暖白团花留白中，朱红双燕展翅':'朱红团花，花瓣留白中藏着双燕'">
  <SwallowCut aria-hidden="true"/>
  <svg class="reveal-definitions" width="0" height="0" aria-hidden="true"><defs>
   <mask :id="id" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
    <g transform="scale(.0025)" fill="white">
     <g class="edge-trace" stroke="white" :style="{strokeWidth:reversed?500:0}">
      <path :d="SWALLOW_PATH"/><path :d="SWALLOW_PATH" transform="rotate(180 200 200)"/>
     </g>
    </g>
   </mask>
  </defs></svg>
  <div class="negative-reading" :style="{mask:'url(#'+id+')'}" aria-hidden="true"><SwallowCut reversed/></div>
 </div>
</template>
<style scoped>
.swallow-reveal{position:relative;isolation:isolate}
.negative-reading{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .25s}
.is-reversed .negative-reading{opacity:1}
.edge-trace{transition:stroke-width .75s cubic-bezier(.22,.65,.3,1)}
.reveal-definitions{position:absolute}
.swallow-reveal::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 32%,#fff8df55 49%,transparent 65%);animation:first-light 1.1s ease-out both;mask-image:radial-gradient(circle,black 55%,transparent 70%)}
@keyframes first-light{from{transform:translateX(-24%);opacity:0}35%{opacity:.7}to{transform:translateX(24%);opacity:0}}
@media(prefers-reduced-motion:reduce){.edge-trace,.negative-reading{transition:none}.swallow-reveal::after{display:none}}
</style>
