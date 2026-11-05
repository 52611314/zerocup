<script setup lang="ts">
import { starterModels } from '../../shared/patterns'
usePageMeta('让一张纸，生出万千风景','走近中国剪纸，在原创互动工坊中折叠、创作、展开，留住一朵属于自己的窗花。')
const {data:articles,pending,error,refresh}=await useFetch<any[]>('/api/articles')
const {data:gallery}=await useFetch<any>('/api/gallery')
const revealed=ref(false)
</script>
<template>
 <section class="hero wrap">
  <div class="hero-copy"><div class="eyebrow"><span class="red-dot"/> 匠心传成，非遗焕新 <span class="eyebrow-rule"/></div><h1>一纸之间，<br/>万象<span class="red">生花。</span></h1><p class="hero-description">把时光折进纸里，把心意剪成花。<br/>在一折一剪之间，遇见中国剪纸的温度，<br/>也留下一点，属于你的新意。</p><div class="hero-actions"><NuxtLink class="btn primary" to="/studio">剪一张自己的窗花 <span>↗</span></NuxtLink><NuxtLink class="quiet-link" to="/learn">先读一个纸上故事 <span>→</span></NuxtLink></div><p class="hero-note"><span>○</span> 无需注册 · 从第一刀开始</p></div>
  <div class="hero-display"><span class="vertical-note">把生活的热爱 · 剪进一纸红</span><div class="hero-orbit orbit-one"/><div class="hero-orbit orbit-two"/><div class="hero-art" :class="{revealed}"><PaperArt :model="starterModels[0]!" label="团花初绽，项目原创数字剪纸"/></div><span class="art-stamp">纸<br/>上<br/>生<br/>花</span><button class="art-label" @click="revealed=!revealed"><span class="tiny-cross">＋</span><span>{{revealed?'一朵花，八次相遇':'团花初绽'}}<small>{{revealed?'点击收起这份心意':'原创示例 · 点击赏花'}}</small></span><span>↗</span></button><span class="display-number">FIG. 01 / 纸的另一种可能</span></div>
  <div class="hero-bottom"><span>一张纸，一把剪，一份向美而生的心意。</span><a href="#discover">向下，慢慢看 <span>↓</span></a></div>
 </section>
 <section id="discover" class="intro-band"><div class="wrap intro-inner"><span class="intro-mark">剪</span><div><p class="eyebrow">PAPER, PATIENCE & POSSIBILITY</p><h2>剪去的是纸，<br class="mobile-break"/>留下的是生活。</h2></div><p>从窗上的一抹红，到指尖的一次尝试。<br/>我们以数字为纸，邀你读懂留白，<br/>亲手接续一份朴素的美。</p><NuxtLink to="/about" class="round-link" aria-label="了解纸上生花">↗</NuxtLink></div></section>
 <section class="wrap section"><div class="section-heading"><div><p class="eyebrow">01 / 纸上学堂</p><h2>每一剪，都有来处。</h2></div><NuxtLink class="text-link" to="/learn">走近剪纸的世界 ↗</NuxtLink></div><AsyncState :pending="pending" :error="error" @retry="refresh"><div class="story-grid"><NuxtLink v-for="(a,i) in articles?.slice(0,3)" :key="a.id" :to="`/learn/${a.slug}`" class="story-card"><div class="story-illustration" :class="`illustration-${i}`"><PaperArt :model="starterModels[i+1]!" :label="a.title+'的数字示意'"/><span class="illustration-label">{{['纸与生活','虚实之间','折叠之美'][i]}}</span></div><div class="story-meta"><span>{{a.category}}</span><span>0{{i+1}}</span></div><h3>{{a.title}}</h3><p>{{a.summary}}</p><span class="text-link">翻开这一页 →</span></NuxtLink></div></AsyncState></section>
 <section class="workshop-band"><div class="wrap workshop-promo"><div class="promo-paper"><PaperArt :model="starterModels[6]!" label="水滴连珠原创练习"/><span>从一个小小的切口开始</span></div><div><p class="eyebrow">02 / 指尖工坊</p><h2>你也可以，<br/>让一张纸开花。</h2><p>选一个纹样，留一点空白。<br/>圆、三角、水滴，简单的形状也有万千变化。<br/>跟着三段小练习，剪出你的第一张窗花。</p><div class="hero-actions"><NuxtLink class="btn primary" to="/studio">进入剪纸工坊 ↗</NuxtLink><NuxtLink class="text-link" to="/tutorials">看看入门教程 →</NuxtLink></div></div></div></section>
 <section class="wrap section"><div class="section-heading"><div><p class="eyebrow">03 / 纸上展览</p><h2>一人一纸，各自生花。</h2></div><NuxtLink class="text-link" to="/gallery">去展览里走走 ↗</NuxtLink></div><div class="works-grid"><WorkCard v-for="w in gallery?.items?.slice(0,3)" :key="w.id" :work="w"/></div><p v-if="!gallery" class="muted">展览暂时无法读取。<NuxtLink to="/gallery" class="text-link">前往展览重试 →</NuxtLink></p></section>
 <section class="closing-note wrap"><span>一纸，一念，一生花。</span><p>让下一朵窗花，从你手中开始。</p><NuxtLink to="/studio" class="text-link">现在动手 ↗</NuxtLink></section>
</template>
