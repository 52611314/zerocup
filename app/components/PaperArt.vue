<script setup lang="ts">
import { cutPath,sectorTransform,SECTOR_PATH,type PaperModel } from '../../shared/model'
const props=withDefaults(defineProps<{model:PaperModel;label?:string;sectors?:number;folded?:boolean}>(),{label:'原创数字剪纸',sectors:8,folded:false})
const id=useId().replaceAll(':','')
</script>
<template>
 <svg class="paper-art" viewBox="-108 -108 216 216" role="img" :aria-label="label">
  <title>{{label}}</title>
  <defs><clipPath :id="`${id}-sector`"><path :d="SECTOR_PATH"/></clipPath><mask :id="`${id}-mask`" maskUnits="userSpaceOnUse" x="-108" y="-108" width="216" height="216"><circle r="100" fill="white"/><g fill="black"><g v-for="i in (folded?1:8)" :key="i" :transform="sectorTransform(i-1)"><g :clip-path="`url(#${id}-sector)`"><path v-for="c in model.cuts" :key="c.id" :d="cutPath(c)" :transform="`translate(${c.x} ${c.y}) rotate(${c.angle})`"/></g></g></g></mask></defs>
  <g :mask="`url(#${id}-mask)`" :fill="model.color"><path v-for="i in (folded?1:8)" v-show="i<=sectors" :key="i" :d="SECTOR_PATH" :transform="sectorTransform(i-1)"/></g>
 </svg>
</template>
