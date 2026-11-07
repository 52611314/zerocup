<script setup lang="ts">
import { measureWindowArtwork } from '../composables/useWindowFlight'

const flight=useWindowFlight(),route=useRoute(),nuxt=useNuxtApp()
const ghost=ref<HTMLElement>()
const preference=import.meta.client?matchMedia('(prefers-reduced-motion: reduce)'):null
let animation:Animation|undefined
let target:SVGSVGElement|null=null
let polling=0
let generation=0
function clear(){
 generation++;cancelAnimationFrame(polling);animation?.cancel();animation=undefined
 if(target)target.style.opacity=''
 target=null;flight.value=null
}
async function land(){
 if(!flight.value||route.path!=='/gallery')return
 const token=++generation,start=performance.now()
 const seek=()=>{
  if(token!==generation)return
  const destination=document.querySelector<SVGSVGElement>('[data-gallery-cover]')
  if(!destination){if(performance.now()-start<2200)polling=requestAnimationFrame(seek);else clear();return}
  const current=flight.value
  if(!current||destination.dataset.galleryCover!==current.work.id){clear();return}
  if(!ghost.value){clear();return}
  target=destination
  const to = measureWindowArtwork(destination)
  const from = current.pose
  if (preference?.matches || !from.width || !from.height || !to.width || !to.height) { clear(); return }
  destination.style.opacity='0'
  animation=ghost.value.animate([
   { transform: `translate(0, 0) rotate(${from.angle}deg) scale(1, 1)` },
   { transform: `translate(${to.x - from.x}px, ${to.y - from.y}px) rotate(${to.angle}deg) scale(${to.width / from.width}, ${to.height / from.height})` }
  ],{duration:650,easing:'cubic-bezier(.22,.75,.25,1)',fill:'forwards'})
  animation.finished.then(()=>{if(token===generation)clear()}).catch(()=>{})
 }
 await nextTick();seek()
}
nuxt.hook('page:transition:finish',land)
nuxt.hook('app:error',clear)
watch(()=>route.path,path=>{if(path!=='/gallery')clear()})
function motionChanged(){if(preference?.matches)clear()}
onMounted(()=>{
 preference?.addEventListener('change',motionChanged)
 window.addEventListener('resize',clear)
})
onBeforeUnmount(()=>{
 clear()
 preference?.removeEventListener('change',motionChanged)
 window.removeEventListener('resize',clear)
})
</script>
<template>
 <Teleport to="body">
  <div v-if="flight" ref="ghost" class="window-flight" aria-hidden="true" :style="{
    left: flight.pose.x - flight.pose.width / 2 + 'px',
    top: flight.pose.y - flight.pose.height / 2 + 'px',
    width: flight.pose.width + 'px',
    height: flight.pose.height + 'px',
    transform: 'rotate(' + flight.pose.angle + 'deg)'
  }">
   <PaperArt :model="flight.work.model"/>
  </div>
 </Teleport>
</template>
<style scoped>
.window-flight{position:fixed;z-index:20;pointer-events:none;filter:drop-shadow(0 5px 7px #5b1d242b)}
.window-flight :deep(svg){width:100%;height:100%}
@media(prefers-reduced-motion:reduce){.window-flight{display:none}}
</style>
