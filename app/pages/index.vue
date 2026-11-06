<script setup lang="ts">
import { starterModels } from '../../shared/patterns'

usePageMeta('一纸之间，万象生花','走近中国剪纸，在原创互动工坊中折叠、创作、展开，留住一朵属于自己的窗花。')
const { data: articles, pending, error, refresh } = await useFetch<any[]>('/api/articles')
const { data: gallery } = await useFetch<any>('/api/gallery')

const exhibit = starterModels[0]!
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
  preference = matchMedia('(prefers-reduced-motion: reduce)')
  syncMotion()
  preference.addEventListener('change', syncMotion)
})
onBeforeUnmount(() => {
  finishDemo()
  preference?.removeEventListener('change', syncMotion)
})
</script>

<template>
 <section class="hero wrap">
  <div class="hero-copy">
   <div class="eyebrow hero-kicker"><span class="red-dot" aria-hidden="true"/> 非遗剪纸互动展 <span class="edition">VOL. 01</span></div>
   <h1>一纸之间，<br/>万象<span class="red">生花。</span></h1>
   <p class="hero-description">一张红纸，折出对称的天地。<br/>一把小剪，留住寻常日子里的好意头。</p>
   <div class="hero-actions">
    <NuxtLink class="btn primary" to="/studio">剪一张自己的窗花 <span aria-hidden="true">↗</span></NuxtLink>
    <NuxtLink class="quiet-link" to="/learn">走进纸上学堂 <span aria-hidden="true">→</span></NuxtLink>
   </div>
   <p class="hero-note"><span aria-hidden="true">◇</span> 无需注册，落下你的第一刀。</p>
  </div>

  <figure class="hero-display" aria-label="团花初绽，窗花展开演示">
   <PaperScraps/>
   <div class="exhibit-label">
    <span class="exhibit-index">01 / 纸上展签</span>
    <strong>团花初绽</strong>
   </div>
   <span class="exhibit-mark" aria-hidden="true">紙</span>
   <div class="hero-orbit" aria-hidden="true"/>
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

  <div class="hero-bottom">
   <span>2026 零杯网页设计大赛 <span class="hero-divider">/</span> 匠心传成，非遗焕新</span>
   <a href="#discover">向下，慢慢看 <span aria-hidden="true">↓</span></a>
  </div>
 </section>

 <section id="discover" class="intro-band">
  <div class="wrap intro-inner">
   <div class="intro-title"><p class="eyebrow">观 · 学 · 剪 · 展</p><h2>剪去的是纸，<br class="mobile-break"/>留下的是生活。</h2></div>
   <p class="intro-text">窗上的一抹红，可以是节庆里的祝愿，<br/>也可以是你第一次亲手剪成的花。</p>
   <NuxtLink to="/about" class="round-link" aria-label="了解纸上生花">↗</NuxtLink>
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

 <section class="workshop-band">
  <div class="wrap workshop-promo">
   <div class="promo-paper">
    <span class="promo-index">习作 / 水滴连珠</span>
    <PaperArt :model="starterModels[6]!" label="水滴连珠原创练习"/>
   </div>
   <div class="promo-copy">
    <p class="eyebrow">02 / 指尖工坊</p>
    <h2>落下第一刀，<br/>让一张纸开花。</h2>
    <p>在折起的一角放下圆、三角或水滴。<br/>慢慢展开，看你的切口如何长成一朵团花。</p>
    <div class="hero-actions">
     <NuxtLink class="btn primary" to="/studio">进入剪纸工坊 ↗</NuxtLink>
     <NuxtLink class="text-link" to="/tutorials">看看入门教程 →</NuxtLink>
    </div>
   </div>
  </div>
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
  <span aria-hidden="true">✳</span>
  <h2>下一朵花，从你手中开始。</h2>
  <NuxtLink to="/studio" class="text-link">打开工作台 ↗</NuxtLink>
 </section>
</template>

<style scoped src="../assets/css/home.css"></style>
