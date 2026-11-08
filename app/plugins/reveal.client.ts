// Reveal real line boxes without splitting text nodes or changing Vue's DOM.
export default defineNuxtPlugin(app => {
  const selector = 'h1,h2,h3,p,li,dt,dd,small,label,legend,a,button,img,.paper-art,.story-illustration,.work-mount,.detail-mount,.eyebrow,.art-stamp,.vertical-note,.display-number'
  const exclude = '.opening,.paper-windows,.paper-scenes,.hero-display,.hero-actions,[role="alert"],[role="status"],.sr-only'
  const preference = matchMedia('(prefers-reduced-motion: reduce)')
  const known = new WeakSet<Element>()
  const timers = new Map<Element,ReturnType<typeof setTimeout>>()
  const active = new Map<Element,Animation>()
  function finish(el:Element) {
    clearTimeout(timers.get(el)); timers.delete(el)
    active.get(el)?.cancel(); active.delete(el)
    el.removeAttribute('data-paper-wait')
    observer.unobserve(el)
  }
  function reveal(el:HTMLElement) {
    timers.delete(el)
    if (!el.isConnected || preference.matches) { finish(el); return }
    const box=el.getBoundingClientRect()
    if(box.bottom<=0 || box.top>=innerHeight)return
    const range=document.createRange()
    range.selectNodeContents(el)
    const centers=Array.from(range.getClientRects())
      .filter(r=>r.width>0 && r.height>0)
      .map(r=>(r.top+r.bottom)/2-box.top).sort((a,b)=>a-b)
    const lines:number[]=[]
    if(el.matches('h1,h2,h3,p,li,label,dd,dt,small') && !el.querySelector('button,input,svg')){
      for(const center of centers)if(!lines.length || center-lines[lines.length-1]!>8)lines.push(center)
    }
    if(!lines.length)lines.push(box.height/2)
    const edges=[0,...lines.slice(1).map((v,i)=>(v+lines[i]!)/2),box.height]
    const frames=Array.from({length:lines.length+3},(_,step)=>{
      const sizes=lines.map((_,i)=>Math.min(110,Math.max(0,(step-i)*55))+'% '+(edges[i+1]!-edges[i]!+.5)+'px')
      return {maskSize:sizes.join(','),opacity:step===0?0:1}
    })
    const style=el.style
    style.maskImage=lines.map(()=>'linear-gradient(90deg,black 0 90%,transparent)').join(',')
    style.maskRepeat='no-repeat'
    style.maskPosition=lines.map((_,i)=>'0 '+edges[i]+'px').join(',')
    el.removeAttribute('data-paper-wait')
    const animation=el.animate(frames,{duration:(300+lines.length*95)/.3,easing:'linear'})
    active.set(el,animation)
    animation.finished.catch(()=>{}).finally(()=>{
      style.maskImage='';style.maskPosition='';style.maskRepeat='';active.delete(el)
    })
    observer.unobserve(el)
  }
  const observer=new IntersectionObserver(entries=>{
    const group=new Map<Element,number>()
    for(const entry of entries.sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top || a.boundingClientRect.left-b.boundingClientRect.left)){
      const el=entry.target as HTMLElement
      clearTimeout(timers.get(el));timers.delete(el)
      if(!entry.isIntersecting)continue
      const parent=el.parentElement!
      const index=group.get(parent)||0
      group.set(parent,index+1)
      timers.set(el,setTimeout(()=>reveal(el),Math.min(index,5)*100))
    }
  })
  function scan(root:Element){
    const home=root.closest('.home-page')?root:root.querySelector('.home-page')
    if(preference.matches || !home || home.closest(exclude))return
    for(const el of [home,...home.querySelectorAll(selector)]){
      if(known.has(el)||!el.matches(selector)||el.closest(exclude)||el.parentElement?.closest(selector))continue
      known.add(el);el.setAttribute('data-paper-wait','');observer.observe(el)
    }
  }
  app.hook('app:mounted',()=>{
    scan(document.body)
    new MutationObserver(changes=>{
      for(const change of changes)for(const node of change.addedNodes)if(node instanceof Element)scan(node)
    }).observe(document.body,{childList:true,subtree:true})
    document.addEventListener('focusin',event=>{
      const el=(event.target as Element)?.closest('[data-paper-wait]')
      if(el)finish(el)
    })
    preference.addEventListener('change',()=>{
      if(preference.matches){document.querySelectorAll('[data-paper-wait]').forEach(finish);for(const el of active.keys())finish(el)}
      else scan(document.body)
    })
  })
})
