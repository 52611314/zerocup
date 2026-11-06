<script setup lang="ts">
const flight=useWindowFlight(),route=useRoute(),nuxt=useNuxtApp()
const ghost=ref<HTMLElement>()
const preference=import.meta.client?matchMedia('(prefers-reduced-motion: reduce)'):null
let animation:Animation|undefined
let target:HTMLElement|null=null
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
  const destination=document.querySelector<HTMLElement>('[data-gallery-cover]')
  if(!destination){if(performance.now()-start<2200)polling=requestAnimationFrame(seek);else clear();return}
  const current=flight.value
  if(!current||destination.dataset.galleryCover!==current.work.id){clear();return}
  if(!ghost.value){clear();return}
  target=destination
  const rect=destination.getBoundingClientRect(),from=current.rect
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){clear();return}
  destination.style.opacity='0'
  animation=ghost.value.animate([
   {transform:'translate(0,0) scale(1)',opacity:1},
   {transform:`translate(${rect.left-from.left}px,${rect.top-from.top}px) scale(${rect.width/from.width},${rect.height/from.height})`,opacity:1}
  ],{duration:650,easing:'cubic-bezier(.22,.75,.25,1)',fill:'forwards'})
  animation.finished.then(()=>{if(token===generation)clear()}).catch(()=>{})
 }
 await nextTick();seek()
}
nuxt.hook('page:transition:finish',land)
nuxt.hook('app:error',clear)
watch(()=>route.path,path=>{if(path!=='/gallery')clear()})
function motionChanged(){if(preference?.matches)clear()}
onMounted(()=>preference?.addEventListener('change',motionChanged))
onBeforeUnmount(()=>{clear();preference?.removeEventListener('change',motionChanged)})
</script>
<template>
 <Teleport to="body"><div v-if="flight" ref="ghost" class="window-flight" aria-hidden="true" :style="{left:flight.rect.left+'px',top:flight.rect.top+'px',width:flight.rect.width+'px',height:flight.rect.height+'px'}"><PaperArt :model="flight.work.model"/></div></Teleport>
</template>
<style scoped>
.window-flight{position:fixed;z-index:20;pointer-events:none;transform-origin:0 0;filter:drop-shadow(0 5px 7px #5b1d242b)}
.window-flight :deep(svg){width:100%;height:100%}
@media(prefers-reduced-motion:reduce){.window-flight{display:none}}
</style>
