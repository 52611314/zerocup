<script setup lang="ts">
const layer=ref<HTMLElement>()
let timer:ReturnType<typeof setInterval>
const reduced=import.meta.client?matchMedia('(prefers-reduced-motion: reduce)'):null
function scatter(){
  const root=layer.value
  if(!root || root.childElementCount>=3)return
  const petal=document.createElement('i')
  petal.className='wind-petal shape-'+Math.floor(Math.random()*4)
  const size=5+Math.random()*6
  petal.style.width=size+'px'
  petal.style.height=size*(.48+Math.random()*.55)+'px'
  petal.style.left=(68+30*Math.random())+'%'
  petal.style.backgroundColor=['#a9372d','#bd503a','#c48365','#a54c42'][Math.floor(Math.random()*4)]!
  root.append(petal)
  const drift=innerWidth*(.06+Math.random()*.24)
  const fall=innerHeight*(.42+Math.random()*.64)
  const pose=(x:number,y:number,a:number,b:number)=>'translate3d('+x+'px,'+y+'px,0) rotate('+a+'deg) rotateY('+b+'deg)'
  const animation=petal.animate([
    {transform:pose(0,0,0,0),opacity:0},
    {transform:pose(-drift*.1,fall*.15,34,55),opacity:.34,offset:.16},
    {transform:pose(-drift*.55,fall*.58,118,160),opacity:.22,offset:.6},
    {transform:pose(-drift,fall,185,255),opacity:0}
  ],{duration:3000+Math.random()*2000,easing:'linear'})
  animation.finished.catch(()=>{}).finally(()=>petal.remove())
}
function sync(){
  clearInterval(timer)
  if(document.hidden || reduced?.matches){
    layer.value?.getAnimations({subtree:true}).forEach(a=>a.cancel());return
  }
  scatter();timer=setInterval(scatter,innerWidth<600?2800:2000)
}
onMounted(()=>{sync();document.addEventListener('visibilitychange',sync);reduced?.addEventListener('change',sync)})
onBeforeUnmount(()=>{clearInterval(timer);document.removeEventListener('visibilitychange',sync);reduced?.removeEventListener('change',sync)})
</script>
<template><div ref="layer" class="paper-weather" aria-hidden="true"/></template>
