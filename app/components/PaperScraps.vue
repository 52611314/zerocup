<script setup lang="ts">
const layer = ref<HTMLElement>()
const active = new Set<Animation>()
function emit(x:number,y:number) {
  if (!layer.value || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  for (let i=0;i<3 && active.size<6;i++) {
    const chip=document.createElement('i')
    chip.className='paper-scrap'
    chip.style.cssText='left:'+x+'px;top:'+y+'px;width:'+(4+Math.random()*6)+'px'
    layer.value.append(chip)
    const dx=(Math.random()-.5)*54
    const animation=chip.animate([
      {transform:'translate(0,0) rotate(0deg)',opacity:.64},
      {transform:'translate('+dx+'px,-12px) rotate(55deg) rotateY(65deg)',opacity:.48,offset:.32},
      {transform:'translate('+dx*1.3+'px,60px) rotate(140deg) rotateY(145deg)',opacity:0}
    ],{duration:680+Math.random()*160,easing:'ease-out'})
    active.add(animation)
    animation.finished.catch(()=>{}).finally(()=>{active.delete(animation);chip.remove()})
  }
}
function tap(event:PointerEvent) {
  if (!(event.target instanceof Element) || !event.target.closest('.hero-art')) return
  const box=layer.value!.getBoundingClientRect()
  emit(event.clientX-box.left,event.clientY-box.top)
}
onMounted(()=>{
  layer.value!.parentElement!.addEventListener('pointerup',tap)
})
onBeforeUnmount(()=>{
  layer.value?.parentElement?.removeEventListener('pointerup',tap)
  for(const animation of active)animation.cancel()
})
</script>
<template><div ref="layer" class="paper-scraps" aria-hidden="true"/></template>
