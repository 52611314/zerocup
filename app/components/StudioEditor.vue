<script setup lang="ts">
import {blankModel,cloneModel,ModelHistory,COLORS,cutPath,SECTOR_PATH,clampPosition,svgMarkup,type Cut,type CutType,type PaperModel} from '../../shared/model'
const route=useRoute(),{feedback}=useFeedback()
const history=new ModelHistory(blankModel()),model=ref<PaperModel>(blankModel()),revision=ref(0)
const selected=ref<string|null>(null),tool=ref<CutType>('drop'),title=ref('我的第一朵窗花'),description=ref('')
const id=ref<string|null>(null),version=ref(1),status=ref('draft'),savedSnapshot=ref(''),saving=ref(false),submitting=ref(false),saveError=ref(''),loading=ref(true),loadError=ref('')
const showTemplates=ref(false),showHelp=ref(false),unfolded=ref(false),unfolding=ref(false),sectors=ref(1),hasUnfolded=ref(false)
const chosen=computed(()=>model.value.cuts.find(c=>c.id===selected.value))
const editable=computed(()=>['draft','rejected'].includes(status.value))
const firstCutPosition={x:56,y:22}
const pickedTemplate=ref(false)
const guideStep=computed(()=>{
 if(!editable.value||id.value||route.query.draft||route.query.pattern||route.query.remix||route.query.tutorial||pickedTemplate.value||unfolding.value)return
 if(!model.value.cuts.length)return unfolded.value?undefined:'cut'
 return hasUnfolded.value?'save':'unfold'
})
const workshopStep=computed(()=>guideStep.value||(unfolded.value?'unfold':editable.value?'cut':undefined))
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
const step=ref(0),progressBusy=ref(false),progressError=ref('')
const activeStep=computed(()=>tutorial.value?.steps[step.value])
const requirementMet=computed(()=>{
 const req=activeStep.value?.require
 return req==='read'||req==='unfold'&&hasUnfolded.value||req==='save'&&!!id.value&&!dirty.value||model.value.cuts.some(c=>c.type===req)
})
async function nextStep(){if(!tutorial.value||!requirementMet.value)return;progressBusy.value=true;progressError.value='';try{await $fetch(`/api/me/progress/${tutorial.value.id}`,{method:'PUT',body:{step:step.value+1}});step.value++;feedback(step.value===tutorial.value.steps.length?'这段练习已完成，花也在你手里了。':'这一步已记下。')}catch(e){progressError.value=errorMessage(e)}finally{progressBusy.value=false}}
function commit(next:PaperModel){history.commit(next);model.value=cloneModel(history.current);revision.value++;hasUnfolded.value=false}
function undo(){model.value=history.undo();revision.value++;selected.value=null;hasUnfolded.value=false}
function redo(){model.value=history.redo();revision.value++;selected.value=null;hasUnfolded.value=false}
const fallingCut = ref<Cut|null>(null)
function add(position=firstCutPosition) {
 if(!editable.value)return
 if(model.value.cuts.length>=80){feedback('这张纸最多放置 80 个切口。','error');return}
 const c:Cut={id:crypto.randomUUID(),type:tool.value,...clampPosition(position.x,position.y),size:8,aspect:tool.value==='drop'?.55:1,angle:23}
 const next=cloneModel(model.value);next.cuts.push(c);commit(next);selected.value=c.id;fallingCut.value=matchMedia('(prefers-reduced-motion: reduce)').matches?null:c
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
function eventPosition(e:PointerEvent){const svg=board.value!;const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());return clampPosition(point.x,point.y)}
function pointerDown(e:PointerEvent,cutId?:string) {
 if(!editable.value||unfolded.value||e.button!==0)return
 if(!cutId){if((e.target as Element).closest('[data-paper]'))add(eventPosition(e));return}
 selected.value=cutId;drag.value={id:cutId,original:cloneModel(model.value),moved:false,pointer:e.pointerId};board.value?.setPointerCapture(e.pointerId)
}
function pointerMove(e:PointerEvent){if(!drag.value)return;const c=model.value.cuts.find(c=>c.id===drag.value!.id)!;const p=eventPosition(e);if(Math.abs(c.x-p.x)+Math.abs(c.y-p.y)<.4)return;Object.assign(c,p);drag.value.moved=true}
function pointerEnd(cancel=false){if(!drag.value)return;const d=drag.value;drag.value=null;if(cancel)model.value=cloneModel(d.original);else if(d.moved){const next=cloneModel(model.value);model.value=cloneModel(d.original);commit(next)} }
let animationGeneration=0
function unfold(){const token=++animationGeneration;unfolded.value=true;hasUnfolded.value=true
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){sectors.value=8;unfolding.value=false;return}
 sectors.value=1;unfolding.value=true
 for(const [n,ms] of [[2,100],[4,370],[8,720]] as const)setTimeout(()=>{if(token!==animationGeneration)return;sectors.value=n;if(n===8)setTimeout(()=>{if(token===animationGeneration)unfolding.value=false},240)},ms)
}
function skip(){animationGeneration++;sectors.value=8;unfolding.value=false}
function fold(){skip();unfolded.value=false}
let motionPreference:MediaQueryList|undefined
function motionChanged(event:MediaQueryListEvent) {
 if(!event.matches)return
 fallingCut.value=null
 canvasRegister.value?.getAnimations().forEach(animation=>animation.cancel())
 if(unfolding.value)skip()
}
async function save(asNew=false):Promise<boolean> {
 if(saving.value)return false
 saving.value=true;saveError.value=''
 const sent={model:cloneModel(model.value),title:title.value.trim(),description:description.value.trim()}
 try {
  const w=await $fetch<any>(id.value&&!asNew?`/api/works/${id.value}`:'/api/works',{method:id.value&&!asNew?'PATCH':'POST',body:{...sent,version:version.value}})
  id.value=w.id;version.value=w.version;status.value=w.status;savedSnapshot.value=JSON.stringify(sent)
  await navigateTo({path:'/studio',query:{draft:w.id,...(route.query.tutorial?{tutorial:route.query.tutorial}:{})}},{replace:true})
  feedback('已保存到服务器，可以从我的纸笺继续。');return true
 }catch(e){saveError.value=errorMessage(e);feedback('保存没有完成，当前编辑仍保留。','error');return false}finally{saving.value=false}
}
async function submit(){if(submitting.value)return;submitting.value=true;try{if(dirty.value||!id.value){if(!await save())return}if(dirty.value){feedback('保存期间有新的修改，请再次保存后投稿。','error');return}const w=await $fetch<any>(`/api/works/${id.value}/submit`,{method:'POST'});version.value=w.version;status.value=w.status;feedback('投稿已送达，审核通过后会出现在纸上展览。')}catch(e){feedback(errorMessage(e),'error')}finally{submitting.value=false}}
function download(blob:Blob,suffix:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${title.value.replace(/[\\/:*?"<>|]/g,'_')||'纸上生花'}.${suffix}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function exportArt(kind:'svg'|'png') {
 try{const svg=svgMarkup(model.value),blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});if(kind==='svg'){download(blob,'svg');return}const url=URL.createObjectURL(blob),image=new Image();try{await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=reject;image.src=url});const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1200;canvas.getContext('2d')!.drawImage(image,0,0,1200,1200);const png=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG 导出失败')),'image/png'));download(png,'png')}finally{URL.revokeObjectURL(url)}}catch{feedback('图像导出未完成，请重试或下载 SVG。','error')}
}
async function load(){loading.value=true;loadError.value='';try{
 if(route.query.draft){const w=await $fetch<any>(`/api/me/works/${route.query.draft}`);model.value=w.model;id.value=w.id;title.value=w.title;description.value=w.description;version.value=w.version;status.value=w.status;savedSnapshot.value=snapshot()}
 else if(route.query.remix){const w=await $fetch<any>(`/api/gallery/${route.query.remix}`);model.value=w.model;title.value=`${w.title} · 新意`.slice(0,60)}
 else if(route.query.pattern){const list=await $fetch<any[]>('/api/patterns'),p=list.find(p=>p.id===route.query.pattern);if(p){model.value=p.model;title.value=p.name}}
 history.current=cloneModel(model.value);revision.value++
 if(route.query.tutorial){const progress=await $fetch<any[]>('/api/me/progress');const t=(tutorials.value||await $fetch<any[]>('/api/tutorials')).find(t=>t.slug===route.query.tutorial);if(t)step.value=progress.find(p=>p.tutorial_id===t.id)?.step||0}
 }catch(e){loadError.value=errorMessage(e)}finally{loading.value=false}}
function beforeUnload(e:BeforeUnloadEvent){if(dirty.value&&model.value.cuts.length){e.preventDefault()}}
function keyboard(e:KeyboardEvent){if((e.target as HTMLElement).matches('input,textarea,select'))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&editable.value){e.preventDefault();e.shiftKey?redo():undo()}}
onMounted(async()=>{
 window.addEventListener('beforeunload',beforeUnload)
 window.addEventListener('keydown',keyboard)
 motionPreference=matchMedia('(prefers-reduced-motion: reduce)')
 motionPreference.addEventListener('change',motionChanged)
 await load()
 await nextTick()
 const hash=location.hash
 if(hash==='#work-title'||studioSteps.some(section=>section.hash===hash)) {
  document.getElementById(hash.slice(1))?.scrollIntoView({block:'start'})
 }
})
onBeforeUnmount(()=>{
 animationGeneration++
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
    <p class="eyebrow">02 / 指尖工坊 · PAPER WORKSHOP</p>
    <h1>一折一剪，都是<span>新意。</span></h1>
    <p class="studio-lead">在八分之一的纸面上落刀，看一处留白如何绕成一朵花。</p>
   </div>
   <div class="studio-header-actions">
    <NuxtLink class="text-link" to="/me">我的纸笺 ↗</NuxtLink>
    <button class="btn help-toggle" @click="showHelp=!showHelp" :aria-expanded="showHelp" aria-controls="studio-help">{{showHelp?'收起说明':'如何剪纸？'}}</button>
   </div>
  </header>
  <div v-show="showHelp" id="studio-help" class="studio-help">
   <h2>从一个切口开始</h2>
   <p>选择圆、三角或水滴，点纸面放置，或用“添加到纸面”。选中切口后，用方向按钮与滑杆调整。展开时，同一个切口经镜像和旋转组成完整图案。</p>
   <p>保存后可以回到我的纸笺继续创作，也可以下载透明背景的 SVG 或 PNG。待审核及已展出的作品可以查看、下载和另存为新草稿。</p>
  </div>
  <section v-if="tutorial" class="tutorial-guide" aria-label="渐进教程"><div><p class="eyebrow">正在练习 · {{tutorial.title}} / {{Math.min(step+1,tutorial.steps.length)}} of {{tutorial.steps.length}}</p><h2>{{activeStep?.title||'练习完成，花开在纸上。'}}</h2><p>{{activeStep?.text||'可以继续自由创作，也可以把这份心意送到展览。'}}</p><p v-if="progressError" class="inline-error" role="alert">{{progressError}}</p></div><button v-if="activeStep" class="btn" @click="nextStep" :disabled="!requirementMet||progressBusy">{{progressBusy?'正在记录…':requirementMet?'记下这一步 →':'完成当前操作后继续'}}</button><NuxtLink v-else class="text-link" to="/tutorials">继续下一段练习 ↗</NuxtLink></section>
  <div v-if="!editable" class="status-banner" role="status">{{status==='pending'?'这张纸已送审，审核期间暂时收好。':'这张纸已在展览中。'}}<button class="text-link" :disabled="saving" @click="save(true)">另存新草稿继续创作 ↗</button></div>
  <div class="studio-workspace" data-studio-controls>
   <nav class="studio-steps" aria-label="工坊流程">
    <NuxtLink v-for="(section,index) in studioSteps" :key="section.step" :to="{path:route.path,query:route.query,hash:section.hash}" custom v-slot="{navigate}">
     <a :href="section.hash" :aria-current="workshopStep===section.step?'step':undefined" @click="navigate"><span>0{{index+1}}</span> {{section.label}} <i aria-hidden="true">↘</i></a>
    </NuxtLink>
   </nav>
   <div class="studio-layout">
    <section class="studio-canvas-area" aria-label="创作纸面">
     <div class="canvas-top">
      <div class="canvas-mode"><span class="red-dot"/><span>{{unfolded?'展开预览':'折叠纸面'}}</span></div>
      <span class="cut-count">{{model.cuts.length}} / 80 个切口</span>
     </div>
     <div class="canvas-surface" :class="{expanded:unfolded}">
      <div ref="canvasRegister" class="surface-register" aria-hidden="true"><i/><i/><i/><i/></div>
      <div class="surface-meta" aria-hidden="true">{{unfolded?'展开纸面':'基础扇区'}}<span>{{unfolded?`${sectors*45}° · ${sectors}/8`:'45° · 1/8'}}</span></div>
      <Transition name="studio-paper">
      <div v-if="unfolded" class="unfold-stage" :class="{unfolding}">
       <PaperArt :model="model" :sectors="sectors" :label="title+'的真实展开图案'"/>
       <span v-if="unfolding" class="unfold-caption">一折，一折，花开了。</span>
      </div>
      <svg v-else ref="board" class="editing-board" viewBox="-12 -22 126 126" role="img"
       aria-label="基础扇区编辑纸面。选择形状后点击放置，或使用添加按钮。"
       @pointerdown="pointerDown($event)" @pointermove="pointerMove" @pointerup="pointerEnd()" @pointercancel="pointerEnd(true)">
       <defs>
        <clipPath id="edit-sector"><path :d="SECTOR_PATH"/></clipPath>
        <mask id="edit-mask" maskUnits="userSpaceOnUse" x="-5" y="-5" width="110" height="110">
         <path :d="SECTOR_PATH" fill="white"/>
         <path v-for="c in model.cuts" :key="c.id" :d="cutPath(c)" :transform="`translate(${c.x} ${c.y}) rotate(${c.angle})`" fill="black"/>
        </mask>
       </defs>
       <path class="sector-paper" :d="SECTOR_PATH" :fill="model.color" mask="url(#edit-mask)"/>
       <path data-paper :d="SECTOR_PATH" fill="transparent" stroke="#b28a48" stroke-width=".3"/>
       <path d="M -3 0 L 104 0 M 0 0 L 74 74" stroke="#b28a48" stroke-width=".35" stroke-dasharray="1 1.4" fill="none" pointer-events="none"/>
       <g v-if="guideStep==='cut'" class="first-cut-mark" :transform="`translate(${firstCutPosition.x} ${firstCutPosition.y})`" aria-hidden="true">
        <circle r="7" vector-effect="non-scaling-stroke"/>
        <path d="M -2.5 0 H 2.5 M 0 -2.5 V 2.5" vector-effect="non-scaling-stroke"/>
       </g>
       <g clip-path="url(#edit-sector)">
        <path v-for="c in model.cuts" :key="c.id" :d="cutPath(c)" :transform="`translate(${c.x} ${c.y}) rotate(${c.angle})`" fill="transparent"
         :stroke="selected===c.id?'#24201D':'#B28A48'" :stroke-width="selected===c.id?'.8':'.35'" class="cut-handle" @pointerdown.stop="pointerDown($event,c.id)"/>
       </g>
       <g v-if="fallingCut" :key="fallingCut.id" :transform="`translate(${fallingCut.x} ${fallingCut.y}) rotate(${fallingCut.angle})`" pointer-events="none" aria-hidden="true">
        <path class="cut-off" :d="cutPath(fallingCut)" :fill="model.color" @animationend="fallingCut=null"/>
       </g>
       <circle r="1" fill="#b28a48"/>
       <text x="5" y="-5" class="board-label">折线</text>
       <text x="72" y="83" class="board-label">1/8 纸面</text>
      </svg>
      </Transition>
      <div class="canvas-watermark" aria-hidden="true">纸上生花<span>留白 · 对称 · 展开</span></div>
     </div>
     <div id="unfold-tools" class="canvas-bottom" :class="{'guide-save-ready':guideStep==='save','studio-target':route.hash==='#unfold-tools'}" tabindex="-1" role="group" aria-label="展开作品操作">
      <p aria-live="polite">
       <template v-if="guideStep==='cut'"><strong>落下第一刀</strong><span class="guide-detail">点红纸上的标记，剪一个{{cutNames[tool]}}。</span></template>
       <template v-else-if="guideStep==='unfold'"><strong>展开看看</strong><span class="guide-detail">一个切口，会在八个方向成花。</span></template>
       <template v-else-if="guideStep==='save'"><strong>给这朵花起个名字</strong></template>
       <template v-else-if="unfolded">同一个切口，在八个方向照面。</template>
       <template v-else-if="editable">当前切口 <strong>{{cutNames[tool]}}</strong>。点按红纸放置。</template>
       <template v-else>展开查看完整图案。</template>
      </p>
      <div class="canvas-actions">
       <button v-if="unfolding" class="btn" @click="skip">跳过动效</button>
       <button class="btn" :class="{primary:!unfolded&&guideStep!=='cut'}" @click="unfolded?fold():unfold()">
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
      <p class="eyebrow">03 / 留存作品</p>
      <h2>把心意收好</h2>
      <label for="work-title">作品名称</label>
      <input id="work-title" v-model="title" maxlength="60" :disabled="!editable"/>
      <label for="work-description">写一点创作心意 <span>（选填）</span></label>
      <textarea id="work-description" v-model="description" maxlength="500" rows="2" :disabled="!editable" placeholder="这张纸，想留住什么？"/>
      <p class="save-status" :class="{stamped:id&&!dirty&&!saving}" role="status">{{saving?'正在保存到服务器…':id&&!dirty?'已保存到服务器':dirty?'有未保存的创作':'等待你的第一剪'}}</p>
      <p v-if="saveError" class="inline-error" role="alert">{{saveError}}</p>
      <button class="btn primary full" v-if="editable" :disabled="saving||!title.trim()" @click="save()">{{saving?'正在收好…':saveError?'重试保存 ↻':'保存草稿 ↓'}}</button>
      <button v-if="saveError" class="text-link" :disabled="saving" @click="save(true)">另存一份新草稿</button>
      <button v-if="editable" class="btn full" :disabled="saving||submitting||!title.trim()||!model.cuts.length" @click="submit">{{submitting?'正在送达…':'投稿到纸上展览 ↗'}}</button>
      <p class="fine-print">在此浏览器可恢复草稿。投稿通过审核后公开。</p>
     </section>
    </aside>
   </div>
  </div>
 </AsyncState>
</template>

<style scoped src="../assets/css/studio.css"></style>
