<script setup lang="ts">
const layer = ref<HTMLElement>()
const active = new Set<Animation>()
let observer: IntersectionObserver
let visible = false
let timer: ReturnType<typeof setInterval>
function emit(x:number,y:number,ambient=false) {
  if (!layer.value || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  for (let i=0;i<(ambient?1:6) && active.size<20;i++) {
    const chip=document.createElement('i')
    chip.className='paper-scrap'
    chip.style.cssText='left:'+x+'px;top:'+y+'px;width:'+(4+Math.random()*6)+'px'
    layer.value.append(chip)
    const dx=(Math.random()-.5)*(ambient?32:80)
    const animation=chip.animate([
      {transform:'translate(0,0) rotate(0deg)',opacity:.85},
      {transform:'translate('+dx+'px,'+(ambient?12:-15)+'px) rotate(55deg) rotateY(65deg)',opacity:.8,offset:.32},
      {transform:'translate('+dx*1.3+'px,60px) rotate(140deg) rotateY(145deg)',opacity:0}
    ],{duration:ambient?2100:680+Math.random()*200,easing:'ease-out'})
    active.add(animation)
    animation.finished.catch(()=>{}).finally(()=>{active.delete(animation);chip.remove()})
  }
}
function tap(event:PointerEvent) {
  const box=layer.value!.getBoundingClientRect()
  emit(event.clientX-box.left,event.clientY-box.top)
}
onMounted(()=>{
  layer.value!.parentElement!.addEventListener('pointerup',tap)
  observer=new IntersectionObserver(([entry])=>{visible=!!entry?.isIntersecting})
  observer.observe(layer.value!)
  timer=setInterval(()=>{if(visible&&layer.value)emit(layer.value.clientWidth*.7,layer.value.clientHeight*.65,true)},3100)
})
onBeforeUnmount(()=>{
  layer.value?.parentElement?.removeEventListener('pointerup',tap)
  observer?.disconnect();clearInterval(timer)
  for(const animation of active)animation.cancel()
})
</script>
<template><div ref="layer" class="paper-scraps" aria-hidden="true"/></template>
