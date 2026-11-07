<script setup lang="ts">
import {SWALLOW_PATH} from '../../shared/swallow'
defineProps<{ reversed: boolean; assembling: boolean }>()
const id='swallow-reveal-'+useId().replaceAll(':','')
</script>
<template>
 <div class="swallow-reveal" :class="{'is-reversed':reversed}" role="img" :aria-label="reversed?'暖白团花留白中，朱红双燕展翅':'朱红团花，花瓣留白中藏着双燕'">
  <SwallowCut :assembling="assembling" aria-hidden="true"/>
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
  <svg v-if="reversed" class="cut-trace" viewBox="0 0 400 400" aria-hidden="true">
   <path :d="SWALLOW_PATH" pathLength="1"/>
   <path :d="SWALLOW_PATH" pathLength="1" transform="rotate(180 200 200)"/>
  </svg>
 </div>
</template>
<style scoped>
.swallow-reveal{position:relative;isolation:isolate;width:100%}
.negative-reading{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .25s}
.is-reversed .negative-reading{opacity:1}
.edge-trace{transition:stroke-width .75s cubic-bezier(.22,.65,.3,1)}
.reveal-definitions{position:absolute;width:0;height:0}
.cut-trace {
  position: absolute;
  inset: 0;
  width: 100%;
  pointer-events: none;
  fill: none;
  stroke: #ffd393;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-dasharray: 1;
  animation: trace-cut .76s cubic-bezier(.24,.63,.36,1) both;
}
@keyframes trace-cut {
  0% { stroke-dashoffset: 1; opacity: 0; }
  20% { opacity: .94; }
  68% { stroke-dashoffset: 0; opacity: .76; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}
@media(prefers-reduced-motion:reduce){.edge-trace,.negative-reading{transition:none}.cut-trace{display:none}}
</style>
