<script setup lang="ts">
import {blankModel,cloneModel,ModelHistory,COLORS,cutPath,SECTOR_PATH,clampPosition,svgMarkup,sectorTransform,type Cut,type CutType,type PaperModel} from '../../shared/model'
import { FIRST_CUT_IMPRINT } from '../../shared/patterns'
const route=useRoute(),{feedback}=useFeedback()
const windowArrival = useState('paper-window-arrival-path', () => '')
const matArrival = ref(false)
const creaseGuides = 'M -3 0 L 104 0 M 0 0 L 74 74'
let history=new ModelHistory(blankModel()),model=ref<PaperModel>(blankModel()),revision=ref(0)
const selected=ref<string|null>(null),tool=ref<CutType>('drop'),title=ref('我的第一朵窗花'),description=ref('')
const id=ref<string|null>(null),version=ref(1),status=ref('draft'),savedSnapshot=ref(''),saving=ref(false),submitting=ref(false),saveError=ref(''),loading=ref(true),loadError=ref('')
const showTemplates=ref(false),showHelp=ref(false),unfolded=ref(false),unfolding=ref(false),sectors=ref(1),hasUnfolded=ref(false)
const visibleSectors=computed(()=>unfolded.value?sectors.value:1)
const chosen=computed(()=>model.value.cuts.find(c=>c.id===selected.value))
const editable=computed(()=>['draft','rejected'].includes(status.value)&&!restartRequested.value)
const toolImprint = computed<Cut>(() => ({
 id: 'guide', type: tool.value, ...FIRST_CUT_IMPRINT,
 aspect: tool.value === 'drop' ? FIRST_CUT_IMPRINT.aspect : 1
}))
const hoverPosition = shallowRef<{x: number; y: number} | null>(null)
const pickedTemplate=ref(false)
const guideStep=computed(()=>{
 if(!editable.value||id.value||route.query.draft||route.query.pattern||route.query.remix||route.query.tutorial||pickedTemplate.value||unfolding.value)return
 if(!model.value.cuts.length)return unfolded.value?undefined:'cut'
 return hasUnfolded.value?'save':'unfold'
})
const workshopStep=computed(()=>{
 if(tutorial.value&&activeStep.value){
  return activeStep.value.require==='save'?'save':activeStep.value.require==='unfold'?'unfold':'cut'
 }
 return guideStep.value||(unfolded.value?'unfold':editable.value?'cut':undefined)
})
const studioSteps=[
 {step:'cut',hash:'#cut-tools',label:'选形落刀'},
 {step:'unfold',hash:'#unfold-tools',label:'展开成花'},
 {step:'save',hash:'#save-tools',label:'留存作品'},
] as const
const cutNames:Record<CutType,string>={circle:'圆形',triangle:'三角形',drop:'水滴'}
const colorNames=['朱砂红','深绛红','赭红','墨黑']
const snapshot=()=>JSON.stringify({model:model.value,title:title.value,description:description.value})
const dirty=computed(()=>{revision.value;return snapshot()!==savedSnapshot.value})
const canUndo=computed(()=>{revision.value;return history.canUndo}),canRedo=computed(()=>{revision.value;return history.canRedo})
const {data:patterns,pending:patternsLoading,error:patternsError,refresh:retryPatterns}=await useFetch<any[]>('/api/patterns',{server:false})
const {data:tutorials}=await useFetch<any[]>('/api/tutorials',{server:false})
const tutorial=computed(()=>tutorials.value?.find(t=>t.slug===route.query.tutorial))
const runId=ref<string|null>(null), restartRequested=ref(route.query.restart==='1'), resumeChoices=ref<any[]>([]), legacyResume=ref(false)
const step=ref(0),progressBusy=ref(false),progressError=ref('')
const activeStep=computed(()=>tutorial.value?.steps[step.value])
const requirementMet=computed(()=>{
 const req=activeStep.value?.require
 return req==='read'||req==='unfold'&&hasUnfolded.value||req==='save'&&!!id.value&&!dirty.value||model.value.cuts.some(c=>c.type===req)
})
async function nextStep(){if(!tutorial.value||!requirementMet.value)return;progressBusy.value=true;progressError.value='';try{await writeApi(`/api/me/progress/${tutorial.value.id}`,{method:'PUT',body:{step:step.value+1,runId:runId.value}});step.value++;await nextTick();focusLessonTarget();feedback(step.value===tutorial.value.steps.length?'这段练习已完成，花也在你手里了。':'这一步已记下。')}catch(e){progressError.value=errorMessage(e)}finally{progressBusy.value=false}}
function commit(next:PaperModel){history.commit(next);model.value=cloneModel(history.current);revision.value++;hasUnfolded.value=false}
function undo(){model.value=history.undo();revision.value++;selected.value=null;hasUnfolded.value=false}
function redo(){model.value=history.redo();revision.value++;selected.value=null;hasUnfolded.value=false}
const fallingCut = ref<Cut|null>(null)
function add(position: { x: number; y: number } = FIRST_CUT_IMPRINT) {
 if(!editable.value)return
 if(model.value.cuts.length>=80){feedback('这张纸最多放置 80 个切口。','error');return}
 const c:Cut={...toolImprint.value,id:crypto.randomUUID(),...clampPosition(position.x,position.y)}
 const next=cloneModel(model.value);next.cuts.push(c);commit(next);selected.value=c.id;fallingCut.value=matchMedia('(prefers-reduced-motion: reduce)').matches?null:c
 hoverPosition.value = null
}
function patch(field:'size'|'aspect'|'angle',value:number){if(!chosen.value)return;const next=cloneModel(model.value),c=next.cuts.find(c=>c.id===selected.value)!;c[field]=value;commit(next)}
function move(dx:number,dy:number){if(!chosen.value)return;const next=cloneModel(model.value),c=next.cuts.find(c=>c.id===selected.value)!;Object.assign(c,clampPosition(c.x+dx,c.y+dy));commit(next)}
function remove(){const next=cloneModel(model.value);next.cuts=next.cuts.filter(c=>c.id!==selected.value);commit(next);selected.value=null}
function color(value:string){const next=cloneModel(model.value);next.color=value;commit(next)}
const templateControl=ref<HTMLButtonElement>()
const canvasRegister=ref<HTMLElement>()
function template(p:any) {
 if(!editable.value)return
 commit(p.model)
 pickedTemplate.value=true
 selected.value=null
 showTemplates.value=false
 templateControl.value?.focus({preventScroll:true})
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  canvasRegister.value?.animate(
   [{boxShadow:'0 0 0 1px #ad292060'},{boxShadow:'0 0 0 7px #ad292000'}],
   {duration:530,easing:'ease-out'},
  )
 }
 feedback(`已铺开「${p.name}」的起始纹样。`)
}
const board=ref<SVGSVGElement>(),drag=ref<{id:string;original:PaperModel;moved:boolean;pointer:number}|null>(null)
const unfoldStage=ref<HTMLElement>()
const unfoldControl=ref<HTMLButtonElement>()
function eventPosition(e:PointerEvent){const svg=board.value!;const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());return clampPosition(point.x,point.y)}
function pointerDown(e:PointerEvent,cutId?:string) {
 if(!editable.value||unfolded.value||e.button!==0)return
 if(!cutId){if((e.target as Element).closest('[data-paper]'))add(eventPosition(e));return}
 selected.value=cutId;drag.value={id:cutId,original:cloneModel(model.value),moved:false,pointer:e.pointerId};board.value?.setPointerCapture(e.pointerId)
}
function pointerMove(e:PointerEvent){
 if(!drag.value){
  const overPaper = e.pointerType === 'mouse' && !e.buttons && (e.target as Element).closest('[data-paper]')
  hoverPosition.value = overPaper && editable.value && model.value.cuts.length < 80 ? eventPosition(e) : null
  return
 }
 const c=model.value.cuts.find(c=>c.id===drag.value!.id)!
 const p=eventPosition(e)
 if(Math.abs(c.x-p.x)+Math.abs(c.y-p.y)<.4)return
 Object.assign(c,p)
 drag.value.moved=true
}
function pointerEnd(cancel=false){if(!drag.value)return;const d=drag.value;drag.value=null;if(cancel)model.value=cloneModel(d.original);else if(d.moved){const next=cloneModel(model.value);model.value=cloneModel(d.original);commit(next)} }
let animationGeneration=0
let paperHandoff:Animation|undefined
async function unfold(){
 const token=++animationGeneration
 const foldedMatrix=board.value?.getScreenCTM()
 hoverPosition.value = null
 fallingCut.value = null
 unfolded.value=true;hasUnfolded.value=true
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){sectors.value=8;unfolding.value=false;return}
 sectors.value=1;unfolding.value=true
 await nextTick()
 if(token!==animationGeneration)return
 const preview=unfoldStage.value?.querySelector('svg')
 const previewMatrix=preview?.getScreenCTM()
 if(preview&&foldedMatrix&&previewMatrix?.a){
  // Match the edit wedge's pivot and scale before moving it to the center of the mat.
  const x=foldedMatrix.e-previewMatrix.e,y=foldedMatrix.f-previewMatrix.f
  const scale=foldedMatrix.a/previewMatrix.a
  paperHandoff=preview.animate(
   [{transform:`translate(${x}px, ${y}px) scale(${scale})`},{transform:'none'}],
   {duration:180,easing:'cubic-bezier(.3, 0, .25, 1)'},
  )
 }
 for(const [n,ms] of [[2,180],[4,400],[8,720]] as const)setTimeout(()=>{if(token!==animationGeneration)return;sectors.value=n;if(n===8)setTimeout(()=>{if(token===animationGeneration)unfolding.value=false},240)},ms)
}
function skip(){animationGeneration++;paperHandoff?.cancel();paperHandoff=undefined;sectors.value=8;unfolding.value=false}
function fold(){skip();unfolded.value=false}
let motionPreference:MediaQueryList|undefined
function motionChanged(event:MediaQueryListEvent) {
 if(!event.matches)return
 matArrival.value = false
 fallingCut.value=null
 canvasRegister.value?.getAnimations().forEach(animation=>animation.cancel())
 if(unfolding.value)skip()
}
async function save(asNew=false):Promise<boolean> {
 if(saving.value)return false
 saving.value=true;saveError.value=''
 const sent={model:cloneModel(model.value),title:title.value.trim(),description:description.value.trim()}
 try {
  const w=await writeApi<any>(id.value&&!asNew?`/api/works/${id.value}`:'/api/works',{method:id.value&&!asNew?'PATCH':'POST',body:{...sent,version:version.value,runId:runId.value}})
  id.value=w.id;version.value=w.version;status.value=w.status;savedSnapshot.value=JSON.stringify(sent)
  await navigateTo({path:'/studio',query:{draft:w.id,...(route.query.tutorial?{tutorial:route.query.tutorial}:{})},hash:route.hash},{replace:true})
  feedback('已保存到服务器，可以从我的纸笺继续。');return true
 }catch(e){saveError.value=errorMessage(e);feedback('保存没有完成，当前编辑仍保留。','error');return false}finally{saving.value=false}
}
async function submit(){if(submitting.value)return;submitting.value=true;try{if(dirty.value||!id.value){if(!await save())return}if(dirty.value){feedback('保存期间有新的修改，请再次保存后投稿。','error');return}const w=await writeApi<any>(`/api/works/${id.value}/submit`,{method:'POST'});version.value=w.version;status.value=w.status;feedback('投稿已自动通过，作品已进入公开展览。')}catch(e){feedback(errorMessage(e),'error')}finally{submitting.value=false}}
function download(blob:Blob,suffix:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${title.value.replace(/[\\/:*?"<>|]/g,'_')||'纸上生花'}.${suffix}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function exportArt(kind:'svg'|'png') {
 try{const svg=svgMarkup(model.value),blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});if(kind==='svg'){download(blob,'svg');return}const url=URL.createObjectURL(blob),image=new Image();try{await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=reject;image.src=url});const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1200;canvas.getContext('2d')!.drawImage(image,0,0,1200,1200);const png=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG 导出失败')),'image/png'));download(png,'png')}finally{URL.revokeObjectURL(url)}}catch{feedback('图像导出未完成，请重试或下载 SVG。','error')}
}
function focusLessonTarget(){
 if(!activeStep.value)return
 const target=document.getElementById(lessonTarget.value.slice(1))
 if(!target)return
 target.focus({preventScroll:true})
 const box=target.getBoundingClientRect()
 if(box.top<70||box.top>innerHeight*.65)target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})
}
const lessonTarget=computed(()=>activeStep.value?.require==='save'?'#save-tools':activeStep.value?.require==='unfold'?'#unfold-tools':'#cut-tools')
async function restoreWork(workId:string){
 const work=await $fetch<any>('/api/me/works/'+workId)
 model.value=work.model;id.value=work.id;title.value=work.title;description.value=work.description;version.value=work.version;status.value=work.status;savedSnapshot.value=snapshot()
 history=new ModelHistory(model.value);revision.value++;resumeChoices.value=[];legacyResume.value=false
}
async function restartLesson(){
 if(!tutorial.value)return
 progressBusy.value=true;progressError.value=''
 try{
  const run=await writeApi<any>('/api/me/practice/'+tutorial.value.id,{method:'POST',body:{restart:true}})
  runId.value=run.id;step.value=0;id.value=null;status.value='draft';version.value=1
  model.value=blankModel();title.value='我的第一朵窗花';description.value='';savedSnapshot.value=''
  history=new ModelHistory(model.value);revision.value++;hasUnfolded.value=false;fold()
  restartRequested.value=false;resumeChoices.value=[]
  await navigateTo({path:'/studio',query:{tutorial:tutorial.value.slug},hash:route.hash},{replace:true})
 }catch(e){progressError.value=errorMessage(e)}finally{progressBusy.value=false}
}
async function load(){loading.value=true;loadError.value='';try{
 if(route.query.draft){const w=await $fetch<any>(`/api/me/works/${route.query.draft}`);model.value=w.model;id.value=w.id;title.value=w.title;description.value=w.description;version.value=w.version;status.value=w.status;savedSnapshot.value=snapshot()}
 else if(route.query.remix){const w=await $fetch<any>(`/api/gallery/${route.query.remix}`);model.value=w.model;title.value=`${w.title} · 新意`.slice(0,60)}
 else if(route.query.pattern){const list=await $fetch<any[]>('/api/patterns'),p=list.find(p=>p.id===route.query.pattern);if(p){model.value=p.model;title.value=p.name}}
 history=new ModelHistory(model.value);revision.value++
 if(route.query.tutorial){
  const t=(tutorials.value||await $fetch<any[]>('/api/tutorials')).find(t=>t.slug===route.query.tutorial)
  if(t && !restartRequested.value){
   const run=await writeApi<any>('/api/me/practice/'+t.id,{method:'POST',body:{restart:false}})
   runId.value=run.id;step.value=run.step
   if(run.work_id && !route.query.draft)await restoreWork(run.work_id)
   else if(!run.work_id){
    const progress=await $fetch<any[]>('/api/me/progress')
    if(progress.some(p=>p.tutorial_id===t.id&&p.step>0)){legacyResume.value=true;resumeChoices.value=(await $fetch<any[]>('/api/me/works')).filter(w=>['draft','rejected'].includes(w.status))}
   }
  }
 }
 }catch(e){loadError.value=errorMessage(e)}finally{loading.value=false}}
function beforeUnload(e:BeforeUnloadEvent){if(dirty.value&&model.value.cuts.length){e.preventDefault()}}
function keyboard(e:KeyboardEvent){if((e.target as HTMLElement).matches('input,textarea,select'))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&editable.value){e.preventDefault();e.shiftKey?redo():undo()}}
onMounted(async()=>{
 window.addEventListener('beforeunload',beforeUnload)
 window.addEventListener('keydown',keyboard)
 motionPreference=matchMedia('(prefers-reduced-motion: reduce)')
 motionPreference.addEventListener('change',motionChanged)
 matArrival.value = windowArrival.value === '/studio' && route.fullPath === '/studio' && !motionPreference.matches
 await load()
 await nextTick()
 const hash=location.hash
 if(hash==='#work-title'||studioSteps.some(section=>section.hash===hash)) {
  document.getElementById(hash.slice(1))?.scrollIntoView({block:'start'})
 }
})
onBeforeUnmount(()=>{
 animationGeneration++
 paperHandoff?.cancel()
 motionPreference?.removeEventListener('change',motionChanged)
 window.removeEventListener('beforeunload',beforeUnload)
 window.removeEventListener('keydown',keyboard)
})
onBeforeRouteLeave(()=>{if(dirty.value&&model.value.cuts.length&&!saving.value)return window.confirm('这张纸还有未保存的修改，确定离开吗？')})
</script>
<template>
 <AsyncState :pending="loading" :error="loadError" @retry="load">
  <header class="studio-heading">
   <div>
    <p class="eyebrow">02 / 指尖工坊 · 窗前纸桌</p>
    <h1>窗前，<span>落一刀。</span></h1>
    <p class="studio-lead">一角红纸，八重留白。</p>
   </div>
   <div class="studio-header-actions">
    <NuxtLink class="text-link" to="/me">我的纸笺 ↗</NuxtLink>
    <button class="btn help-toggle" @click="showHelp=!showHelp" :aria-expanded="showHelp" aria-controls="studio-help">{{showHelp?'收起说明':'如何剪纸？'}}</button>
   </div>
  </header>
  <div v-show="showHelp" id="studio-help" class="studio-help">
   <h2>从一个切口开始</h2>
   <p>选择圆、三角或水滴，点纸面放置，或用“添加到纸面”。选中切口后，用方向按钮与滑杆调整。展开时，同一个切口经镜像和旋转组成完整图案。</p>
   <p>保存后可以回到我的纸笺继续创作，也可以下载透明背景的 SVG 或 PNG。投稿会立即自动通过。已展出作品可以查看、下载和另存为新草稿。</p>
  </div>
  <section v-if="restartRequested" class="studio-help"><h2>再剪一次，从第一刀开始</h2><p>以前完成的学习记录与草稿会保留。这次从一张新纸开始。</p><button class="btn primary" :disabled="progressBusy" @click="restartLesson">开始新的练习</button><p v-if="progressError" role="alert">{{progressError}}</p></section>
  <section v-if="legacyResume" class="studio-help"><h2>已有学习足迹，选一张纸继续</h2><p>旧记录尚未关联作品，请选择自己的草稿；也可留在当前新纸，重新完成动作。</p><button v-for="work in resumeChoices" :key="work.id" class="btn" @click="restoreWork(work.id).catch(e=>feedback(errorMessage(e),'error'))">{{work.title}}</button><button class="btn" @click="resumeChoices=[];legacyResume=false">用当前新纸练习</button></section>
  <section v-if="tutorial&&!restartRequested" class="tutorial-guide" aria-label="渐进教程"><div><p class="eyebrow">正在练习 · {{tutorial.title}} / {{Math.min(step+1,tutorial.steps.length)}} of {{tutorial.steps.length}}</p><h2>{{activeStep?.title||'练习完成，花开在纸上。'}}</h2><p>{{activeStep?.text||'可以继续自由创作，也可以把这份心意送到展览。'}}</p><p v-if="progressError" class="inline-error" role="alert">{{progressError}}</p></div><button v-if="activeStep" class="btn" @click="nextStep" :disabled="!requirementMet||progressBusy||!runId">{{progressBusy?'正在记录…':requirementMet?'记下这一步 →':'完成当前操作后继续'}}</button><NuxtLink v-else class="text-link" to="/tutorials">继续下一段练习 ↗</NuxtLink></section>
  <div v-if="!editable" class="status-banner" role="status">{{status==='pending'?'这张纸已送审，审核期间暂时收好。':'这张纸已自动通过审核，正在展览中。'}}<NuxtLink v-if="status==='published'" class="text-link" :to="`/gallery/${id}`">查看已公开作品 ↗</NuxtLink><button class="text-link" :disabled="saving" @click="save(true)">另存新草稿继续创作 ↗</button></div>
  <div class="studio-workspace" data-studio-controls>
   <nav class="studio-steps" aria-label="工坊流程">
    <NuxtLink v-for="(section,index) in studioSteps" :key="section.step" :to="{path:route.path,query:route.query,hash:section.hash}" custom v-slot="{navigate}">
     <a :href="section.hash" :aria-current="workshopStep===section.step?'step':undefined" @click="navigate"><span>0{{index+1}}</span> {{section.label}} <i aria-hidden="true">↘</i></a>
    </NuxtLink>
   </nav>
   <div class="studio-layout">
    <section class="studio-canvas-area" aria-label="创作纸面">
     <div class="canvas-top" :class="{'canvas-first-cut':guideStep==='cut'}">
      <button v-if="guideStep==='cut'" class="btn primary first-cut-action" type="button" @click="add();unfoldControl?.focus({preventScroll:$event.detail>0})">剪下第一刀 <span aria-hidden="true">✦</span></button>
      <div v-else class="canvas-mode"><span class="red-dot"/><span>{{unfolding?'正在展开':unfolded?'展开预览':'折叠纸面'}}</span></div>
      <div class="sector-readout" aria-hidden="true">
       <svg viewBox="-108 -108 216 216" class="sector-dial">
        <path v-for="sector in 8" :key="sector" :d="SECTOR_PATH" :transform="sectorTransform(sector-1)" :class="{open:sector<=visibleSectors}"/>
       </svg>
       <span>{{visibleSectors*45}}° · {{visibleSectors}}/8</span>
      </div>
      <span class="cut-count">{{model.cuts.length}} / 80 个切口</span>
     </div>
     <div class="canvas-surface" :class="{expanded:unfolded}">
      <div v-if="matArrival" class="mat-arrival" aria-hidden="true" @animationend="matArrival = false"/>
      <div ref="canvasRegister" class="surface-register" aria-hidden="true"><i/><i/><i/><i/></div>
      <Transition name="studio-paper">
      <div v-if="unfolded" ref="unfoldStage" class="unfold-stage" :class="{unfolding}">
       <PaperArt :model="model" :sectors="sectors" :label="title+'的真实展开图案'"/>
      </div>
      <svg v-else ref="board" class="editing-board" viewBox="-15 -18 126 113" role="img"
       aria-label="基础扇区编辑纸面。选择形状后点击放置，或使用添加按钮。"
       @pointerdown="pointerDown($event)" @pointermove="pointerMove" @pointerleave="hoverPosition=null" @pointerup="pointerEnd()" @pointercancel="pointerEnd(true)">
       <defs>
        <clipPath id="edit-sector"><path :d="SECTOR_PATH"/></clipPath>
        <mask id="edit-mask" maskUnits="userSpaceOnUse" x="-5" y="-5" width="110" height="110">
         <path :d="SECTOR_PATH" fill="white"/>
         <path v-for="c in model.cuts" :key="c.id" :d="cutPath(c)" :transform="`translate(${c.x} ${c.y}) rotate(${c.angle})`" fill="black"/>
        </mask>
        <linearGradient id="edit-paper-graze" x1="0" y1="0" x2="1" y2="1">
         <stop stop-color="#ffcd8b" stop-opacity=".32"/>
         <stop offset=".52" stop-color="#ffcd8b" stop-opacity=".08"/>
         <stop offset="1" stop-color="#2a0e0e" stop-opacity=".15"/>
        </linearGradient>
       </defs>
       <path class="sector-paper" :d="SECTOR_PATH" :fill="model.color" mask="url(#edit-mask)"/>
       <path :d="SECTOR_PATH" fill="url(#edit-paper-graze)" mask="url(#edit-mask)" pointer-events="none" aria-hidden="true"/>
       <path data-paper :d="SECTOR_PATH" fill="transparent" stroke="#b28a48" stroke-width=".3"/>
       <path :d="creaseGuides" stroke="#b28a48" stroke-width=".35" stroke-dasharray="1 1.4" fill="none" pointer-events="none"/>
       <path v-if="matArrival" :d="creaseGuides" class="mat-arrival-crease" pathLength="1" vector-effect="non-scaling-stroke" aria-hidden="true"/>
       <g clip-path="url(#edit-sector)">
        <g v-if="guideStep==='cut'" class="first-cut-mark" :class="{'first-cut-inactive':hoverPosition}" :transform="`translate(${FIRST_CUT_IMPRINT.x} ${FIRST_CUT_IMPRINT.y})`" aria-hidden="true">
         <path d="M -12 -8 V -12 H -8 M 8 -12 H 12 V -8 M 12 8 V 12 H 8 M -8 12 H -12 V 8" vector-effect="non-scaling-stroke"/>
         <path :d="cutPath(toolImprint)" :transform="`rotate(${toolImprint.angle})`" class="cut-stencil" vector-effect="non-scaling-stroke"/>
        </g>
        <path v-if="hoverPosition" class="cut-stencil hover-stencil" :d="cutPath(toolImprint)"
         :transform="`translate(${hoverPosition.x} ${hoverPosition.y}) rotate(${toolImprint.angle})`"
         vector-effect="non-scaling-stroke" aria-hidden="true"/>
        <path v-for="c in model.cuts" :key="c.id" :d="cutPath(c)" :transform="`translate(${c.x} ${c.y}) rotate(${c.angle})`" fill="transparent"
         :stroke="selected===c.id?'#24201D':'#B28A48'" :stroke-width="selected===c.id?'.8':'.35'" class="cut-handle" @pointerdown.stop="pointerDown($event,c.id)"/>
        <path v-if="fallingCut" :key="'imprint-'+fallingCut.id" class="cut-imprint" :d="cutPath(fallingCut)"
         :transform="`translate(${fallingCut.x} ${fallingCut.y}) rotate(${fallingCut.angle})`" vector-effect="non-scaling-stroke" aria-hidden="true"/>
       </g>
       <g v-if="fallingCut" :key="fallingCut.id" :transform="`translate(${fallingCut.x} ${fallingCut.y}) rotate(${fallingCut.angle})`" pointer-events="none" aria-hidden="true">
        <path class="cut-off" :d="cutPath(fallingCut)" :fill="model.color" @animationend="fallingCut=null"/>
       </g>
       <circle r="1" fill="#b28a48"/>
       <text x="5" y="-5" class="board-label">折线</text>
       <text x="72" y="83" class="board-label">1/8 纸面</text>
      </svg>
      </Transition>
      <figure v-if="!unfolded" class="canvas-proof" :class="{ 'proof-empty': !model.cuts.length }">
       <div class="proof-mount">
        <PaperArt :model="model" label="当前纸面完整展开的实时成样"/>
        <span v-if="fallingCut" :key="fallingCut.id" class="proof-glint" aria-hidden="true"/>
       </div>
       <figcaption>实时成样 <span aria-hidden="true">8/8</span></figcaption>
      </figure>
      <div v-else class="canvas-watermark" aria-hidden="true"><span>指尖工坊</span>纸上生花</div>
     </div>
     <div id="unfold-tools" class="canvas-bottom" :class="{'guide-save-ready':guideStep==='save','studio-target':route.hash==='#unfold-tools'}" tabindex="-1" role="group" aria-label="展开作品操作">
      <LessonPrompt v-if="tutorial&&!restartRequested" :current="activeStep" :step="step" :total="tutorial.steps.length" area="unfold" :target="lessonTarget" :ready="requirementMet" :busy="progressBusy" :error="progressError" @next="nextStep"/>

      <p aria-live="polite">
       <template v-if="guideStep==='cut'"><strong>落下第一刀</strong><span class="guide-detail">点红纸放置{{cutNames[tool]}}，再展开看看。</span></template>
       <template v-else-if="guideStep==='unfold'"><strong>展开看看</strong><span class="guide-detail">一个切口，会在八个方向成花。</span></template>
       <template v-else-if="guideStep==='save'"><strong>给这朵花起个名字</strong></template>
       <template v-else-if="unfolded">同一个切口，在八个方向照面。</template>
       <template v-else-if="editable">当前切口 <strong>{{cutNames[tool]}}</strong>。点按红纸放置。</template>
       <template v-else>展开查看完整图案。</template>
      </p>
      <div class="canvas-actions">
       <button v-if="unfolding" class="btn" @click="skip();unfoldControl?.focus({preventScroll:true})">跳过动效</button>
       <button ref="unfoldControl" class="btn" :class="{primary:!unfolded&&guideStep!=='cut'}" @click="unfolded?fold():unfold()">
        <template v-if="unfolded">← 回到折叠纸面</template>
        <template v-else>展开作品 <span aria-hidden="true">✳</span></template>
       </button>
       <a v-if="guideStep==='save'" class="btn primary" href="#work-title">前往保存 <span aria-hidden="true">↘</span></a>
      </div>
     </div>
     <div class="export-row">
      <span class="export-label">导出作品 <small>镂空处透明</small></span>
      <button @click="exportArt('svg')">下载 SVG ↓</button>
      <button @click="exportArt('png')">下载 PNG ↓</button>
     </div>
    </section>
    <aside id="cut-tools" class="studio-tools" :class="{'studio-target':route.hash==='#cut-tools'}" tabindex="-1" aria-label="剪纸工具">
     <div class="tool-heading">
      <h2>剪纸工具</h2>
      <div class="history-tools"><button aria-label="撤销" :disabled="!canUndo||!editable" @click="undo">↶</button><button aria-label="重做" :disabled="!canRedo||!editable" @click="redo">↷</button></div>
     </div>
     <fieldset :disabled="!editable||unfolded">
      <LessonPrompt v-if="tutorial&&!restartRequested" :current="activeStep" :step="step" :total="tutorial.steps.length" area="cut" :target="lessonTarget" :ready="requirementMet" :busy="progressBusy" :error="progressError" @next="nextStep"/>

      <legend><span>01</span> 选一个切口</legend>
      <div class="shape-tools">
       <button v-for="(name,k) in cutNames" :key="k" :class="{selected:tool===k}" @click="tool=k as CutType" :aria-pressed="tool===k">
        <svg viewBox="-15 -15 30 30" aria-hidden="true"><path :d="cutPath({id:'icon',type:k as CutType,x:0,y:0,size:9,aspect:k==='drop'?.6:1,angle:0})"/></svg>
        {{name}}
       </button>
      </div>
      <button class="btn add-cut" @click="add()">＋ 添加到纸面</button>
      <div v-if="model.cuts.length" class="cut-selector">
       <label for="cut-list">选中切口</label>
       <select id="cut-list" v-model="selected">
        <option :value="null">请选择要调整的切口</option>
        <option v-for="(c,i) in model.cuts" :key="c.id" :value="c.id">{{i+1}} · {{cutNames[c.type]}}</option>
       </select>
      </div>
      <div v-if="chosen" class="cut-adjust">
       <div class="control-label"><span>调整位置</span><span>{{chosen.x.toFixed(0)}}, {{chosen.y.toFixed(0)}}</span></div>
       <div class="position-controls">
        <button aria-label="切口左移" @click="move(-3,0)">←</button>
        <button aria-label="切口上移" @click="move(0,-3)">↑</button>
        <button aria-label="切口下移" @click="move(0,3)">↓</button>
        <button aria-label="切口右移" @click="move(3,0)">→</button>
       </div>
       <label class="slider-label">大小 <output>{{chosen.size}}</output>
        <input aria-label="切口大小" type="range" min="1" max="28" step="1" :value="chosen.size" @input="patch('size',Number(($event.target as HTMLInputElement).value))"/>
       </label>
       <label class="slider-label">长宽 <output>{{chosen.aspect.toFixed(1)}}</output>
        <input aria-label="切口长宽比例" type="range" min=".3" max="2.5" step=".1" :value="chosen.aspect" @input="patch('aspect',Number(($event.target as HTMLInputElement).value))"/>
       </label>
       <label class="slider-label">角度 <output>{{chosen.angle}}°</output>
        <input aria-label="切口角度" type="range" min="-180" max="180" step="1" :value="chosen.angle" @input="patch('angle',Number(($event.target as HTMLInputElement).value))"/>
       </label>
       <button class="delete-cut" @click="remove">移除这个切口 ×</button>
      </div>
     </fieldset>
     <fieldset :disabled="!editable">
      <legend><span>02</span> 挑一张纸</legend>
      <div class="color-choices">
       <button v-for="(c,i) in COLORS" :key="c" :style="{background:c}" :class="{selected:model.color===c}" :aria-label="colorNames[i]" :aria-pressed="model.color===c" @click="color(c)"><span v-if="model.color===c">✓</span></button>
      </div>
      <button ref="templateControl" class="template-toggle" @click="showTemplates=!showTemplates" :aria-expanded="showTemplates" :aria-controls="showTemplates?'pattern-tray':undefined">从一个起始纹样开始 <span aria-hidden="true">{{showTemplates?'−':'＋'}}</span></button>
      <Transition name="pattern-tray">
       <div v-if="showTemplates" id="pattern-tray" class="pattern-tray">
        <div class="pattern-tray-body">
         <AsyncState :pending="patternsLoading" :error="patternsError" :empty="!patterns?.length" @retry="retryPatterns">
          <div class="template-grid">
           <button v-for="p in patterns" :key="p.id" @click="template(p)"><PaperArt :model="p.model" :label="p.name"/><span>{{p.name}}</span></button>
          </div>
         </AsyncState>
        </div>
       </div>
      </Transition>
     </fieldset>
     <section id="save-tools" class="save-panel" :class="{'studio-target':route.hash==='#save-tools'}" tabindex="-1" aria-label="留存作品">
      <LessonPrompt v-if="tutorial&&!restartRequested" :current="activeStep" :step="step" :total="tutorial.steps.length" area="save" :target="lessonTarget" :ready="requirementMet" :busy="progressBusy" :error="progressError" @next="nextStep"/>

      <p class="eyebrow">03 / 留存作品</p>
      <h2>把心意收好</h2>
      <label for="work-title">作品名称</label>
      <input id="work-title" v-model="title" maxlength="60" :disabled="!editable"/>
      <label for="work-description">写一点创作心意 <span>（选填）</span></label>
      <textarea id="work-description" v-model="description" maxlength="500" rows="2" :disabled="!editable" placeholder="这张纸，想留住什么？"/>
      <p class="save-status" role="status">{{saving?'正在保存到服务器…':id&&!dirty?'已保存到服务器':dirty?'有未保存的创作':'等待你的第一剪'}}</p>
      <p v-if="saveError" class="inline-error" role="alert">{{saveError}}</p>
      <button class="btn primary full" v-if="editable" :disabled="saving||!title.trim()" @click="save()">{{saving?'正在收好…':saveError?'重试保存 ↻':'保存草稿 ↓'}}</button>
      <button v-if="saveError" class="text-link" :disabled="saving" @click="save(true)">另存一份新草稿</button>
      <button v-if="editable" class="btn full" :disabled="saving||submitting||!title.trim()||!model.cuts.length" @click="submit">{{submitting?'正在送达…':'投稿到纸上展览 ↗'}}</button>
      <p class="fine-print">在此浏览器可恢复草稿。展示期间投稿即时通过并公开。</p>
     </section>
    </aside>
   </div>
  </div>
 </AsyncState>
</template>

<style scoped src="../assets/css/studio.css"></style>
