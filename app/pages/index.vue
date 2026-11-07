<script setup lang="ts">
import { starterModels } from '../../shared/patterns'

usePageMeta('一纸开天地','从红纸的留白看见双燕与远山，穿过剪纸窗，走进纸上生花的学堂、工坊与展览。')
const [{ data: articles, pending, error, refresh }, { data: gallery }] = await Promise.all([
  useFetch<any[]>('/api/articles'),
  useFetch<any>('/api/gallery')
])

const exhibit = starterModels[0]!
const reversed = ref(false)
const openingSeen = useState('swallow-opening-seen', () => false)
const playOpening = ref(!openingSeen.value)
const opening = ref<HTMLElement>()
const sectors = ref(8)
const unfolding = ref(false)
const foldTarget = ref(0)
const playing = ref(false)
const reducedMotion = ref(false)
const announcement = ref('')
const stages = [1, 2, 4, 8]
const foldInterval = 190
const unfoldInterval = 240
let preference: MediaQueryList | undefined
let timers: ReturnType<typeof setTimeout>[] = []
let openingFrame = 0
let openingTravel = -1

function toggleReading() {
  playOpening.value = false
  reversed.value = !reversed.value
}

function moveOpening() {
  if (reducedMotion.value || openingFrame) return
  openingFrame = requestAnimationFrame(() => {
    openingFrame = 0
    if (!opening.value) return
    const { top, height } = opening.value.getBoundingClientRect()
    const travel = Math.round(Math.max(0, Math.min(1, -top / Math.max(height * .8, 1))) * 1000) / 1000
    if (travel === openingTravel) return
    openingTravel = travel
    opening.value.style.setProperty('--paper-travel', String(travel))
  })
}

function finishDemo() {
  timers.forEach(timer => clearTimeout(timer))
  timers = []
  sectors.value = 8
  foldTarget.value = 0
  unfolding.value = false
  playing.value = false
}

function syncMotion() {
  reducedMotion.value = preference?.matches ?? false
  if (reducedMotion.value) {
    cancelAnimationFrame(openingFrame)
    openingFrame = 0
    openingTravel = 0
    opening.value?.style.setProperty('--paper-travel', '0')
  } else moveOpening()
  if (playing.value) announcement.value = '已显示完整窗花'
  finishDemo()
}

function demonstrate() {
  if (playing.value) return
  if (reducedMotion.value) {
    sectors.value = sectors.value === 8 ? 1 : 8
    announcement.value = sectors.value === 8 ? '已显示完整窗花' : '已显示折叠纸角'
    return
  }

  playing.value = true
  announcement.value = '正在演示窗花折展'
  const foldingStages = stages.slice(0, -1).reverse()
  foldTarget.value = foldingStages[0]!
  timers = foldingStages.map((stage, index) => setTimeout(() => {
    sectors.value = stage
    foldTarget.value = foldingStages[index + 1] ?? 0
  }, (index + 1) * foldInterval))

  const unfoldAt = foldingStages.length * foldInterval + 300
  timers.push(...stages.slice(1).map((stage, index) => setTimeout(() => {
    unfolding.value = true
    sectors.value = stage
  }, unfoldAt + index * unfoldInterval)))
  timers.push(setTimeout(() => {
    finishDemo()
    announcement.value = '折展完成，已显示完整窗花'
  }, unfoldAt + (stages.length - 1) * unfoldInterval))
}

onMounted(() => {
  openingSeen.value = true
  preference = matchMedia('(prefers-reduced-motion: reduce)')
  syncMotion()
  preference.addEventListener('change', syncMotion)
  window.addEventListener('scroll', moveOpening, { passive: true })
  window.addEventListener('resize', moveOpening)
})
onBeforeUnmount(() => {
  finishDemo()
  preference?.removeEventListener('change', syncMotion)
  window.removeEventListener('scroll', moveOpening)
  window.removeEventListener('resize', moveOpening)
  cancelAnimationFrame(openingFrame)
})
</script>

<template>
 <div class="home-page">
 <section ref="opening" class="opening" :class="{ 'opening-awake': playOpening }" aria-labelledby="opening-title">
  <OpeningLandscape/>
  <div class="opening-light" aria-hidden="true"/>
  <div class="wrap opening-grid">
   <div class="opening-copy">
    <p class="opening-kicker"><span aria-hidden="true">◇</span> 纸上生花 <span class="opening-divider" aria-hidden="true"/> 剪纸序章</p>
    <h1 id="opening-title">一纸<span>开天地。</span></h1>
    <p class="hero-description">光穿过剪口，花里有燕。<br/>沿着这一处留白，走进纸里的风景。</p>
    <div class="hero-actions">
     <ChapterLink class="opening-door" to="/studio">
      <span class="opening-door-mark" aria-hidden="true"><i/><i/></span>
      <span>推窗进工坊</span><span class="opening-door-arrow" aria-hidden="true">↗</span>
     </ChapterLink>
     <button class="btn opening-toggle" :class="{ 'is-reversed': reversed }" type="button" aria-controls="swallow-plate" @click="toggleReading">
      {{ reversed ? '看团花' : '看留白' }} <span aria-hidden="true">↔</span>
     </button>
    </div>
    <NuxtLink class="opening-next" :to="{ path: '/', hash: '#discover' }">穿过剪纸窗 <span aria-hidden="true">↓</span></NuxtLink>
   </div>
   <figure id="swallow-plate" class="opening-plate" :class="{ 'plate-negative': reversed }">
    <div class="opening-art"><SwallowReveal :reversed="reversed" :assembling="playOpening"/></div>
    <figcaption class="opening-caption">
     <span>《花里有燕》</span>
     <span role="status">{{ reversed ? '留白读法 · 双燕' : '纸面读法 · 团花' }}</span>
    </figcaption>
   </figure>
  </div>
 </section>

 <div id="discover" tabindex="-1"><PaperWindows :featured-work="gallery?.items?.[0]"/></div>
 <PaperScenes/>

 <section id="fold-and-light" class="workshop-band">
  <div class="wrap workshop-promo">
  <figure class="hero-display" aria-label="团花初绽，窗花展开演示">
   <PaperScraps/>
   <div class="exhibit-label">
    <span class="exhibit-index">01 / 纸上展签</span>
    <strong>团花初绽</strong>
   </div>
   <span class="exhibit-mark" aria-hidden="true">紙</span>
   <div class="hero-orbit" aria-hidden="true"/>
   <PaperCutLight :model="exhibit" :visible="sectors === 8 && !playing"/>
   <div class="hero-art" :class="{ unfolding, folded: sectors === 1 }" :data-fold-to="foldTarget || undefined">
    <PaperArt :model="exhibit" :sectors="sectors" label="团花初绽，项目原创数字剪纸"/>
   </div>
   <figcaption class="exhibit-controls">
    <div class="exhibit-stage">
     <span class="stage-caption">{{ foldTarget ? '沿折痕收拢' : sectors === 8 ? '八折成花' : sectors === 1 ? '折叠纸角' : '逐层展开' }}</span>
     <span class="stage-numbers" aria-hidden="true">
      <span v-for="stage in stages" :key="stage" :class="{ current: stage === sectors }">{{ stage }}</span>
     </span>
    </div>
    <span class="sr-only" role="status">{{ announcement }}</span>
    <button class="art-label" type="button" :aria-disabled="playing" @click="demonstrate">
     {{ reducedMotion ? sectors === 8 ? '查看纸角' : '查看完整窗花' : '演示折展' }}
     <span aria-hidden="true">{{ reducedMotion ? '↗' : '▷' }}</span>
    </button>
   </figcaption>
  </figure>
   <div class="promo-copy">
    <p class="eyebrow">指尖工坊 / 一刀见光</p>
    <h2>一角落刀，<br/>八面见光。</h2>
    <p>纸张沿折痕打开时，同一个切口在八个方向成花。<br/>光从镂空穿过，把你的刀痕留在纸面之外。</p>
    <div class="hero-actions">
     <NuxtLink class="btn primary" to="/studio">剪自己的窗花 ↗</NuxtLink>
     <NuxtLink class="text-link" to="/tutorials">看看入门教程 →</NuxtLink>
    </div>
   </div>
  </div>
 </section>

 <section class="wrap section home-stories">
  <div class="section-heading">
   <div><p class="eyebrow">01 / 纸上学堂</p><h2>每一剪，都有来处。</h2></div>
   <NuxtLink class="text-link home-section-link" to="/learn">走近剪纸的世界 ↗</NuxtLink>
  </div>
  <AsyncState :pending="pending" :error="error" @retry="refresh">
   <div class="story-grid">
    <NuxtLink v-for="(article, index) in articles?.slice(0,3)" :key="article.id" :to="`/learn/${article.slug}`" class="story-card">
     <div class="story-illustration" :class="`illustration-${index}`">
      <span class="story-index" aria-hidden="true">0{{ index + 1 }}</span>
      <PaperArt :model="starterModels[index+1]!" :label="article.title+'的数字示意'"/>
     </div>
     <div class="story-meta"><span>{{ article.category }}</span></div>
     <h3>{{ article.title }}</h3>
     <p>{{ article.summary }}</p>
     <span class="text-link">翻开这一页 →</span>
    </NuxtLink>
   </div>
  </AsyncState>
 </section>

 <section class="wrap section">
  <div class="section-heading">
   <div><p class="eyebrow">03 / 纸上展览</p><h2>一人一纸，各自生花。</h2></div>
   <NuxtLink class="text-link home-section-link" to="/gallery">去展览里走走 ↗</NuxtLink>
  </div>
  <div v-if="gallery?.items?.length" class="works-grid">
   <WorkCard v-for="work in gallery.items.slice(0,3)" :key="work.id" :work="work"/>
  </div>
  <p v-else-if="!gallery" class="muted">展览暂时无法读取。<NuxtLink to="/gallery" class="text-link">前往展览重试 →</NuxtLink></p>
  <p v-else class="muted">展厅正在等待第一件作品。</p>
 </section>
 <section class="closing-note wrap">
  <div>
   <p class="eyebrow">把这一页，留给自己</p>
   <h2>下一朵花，<br/>从你手中开始。</h2>
   <NuxtLink to="/studio" class="btn primary">打开工作台 <span aria-hidden="true">↗</span></NuxtLink>
  </div>
  <div class="closing-art" aria-hidden="true"><PaperArt :model="starterModels[5]!"/></div>
 </section>
 </div>
</template>

<style scoped src="../assets/css/home.css"></style>
