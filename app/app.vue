<script setup lang="ts">
const route=useRoute(),menu=ref(false)
const {notice}=useFeedback()
watch(()=>route.fullPath,()=>{menu.value=false;notice.value.text=''})
const links=[['/','首页'],['/learn','纸上学堂'],['/studio','剪纸工坊'],['/gallery','纸上展览']]
</script>
<template>
 <div>
  <NuxtRouteAnnouncer />
  <a class="skip" href="#main">跳到主要内容</a>
  <header class="site-header">
   <NuxtLink to="/" class="brand" aria-label="纸上生花首页"><img src="/favicon.svg" width="38" height="38" alt=""/><span>纸上生花<small>一纸一世界 · 一剪一传承</small></span></NuxtLink>
   <button class="menu-toggle" @click="menu=!menu" :aria-expanded="menu" aria-controls="navigation">{{menu?'收起导航 −':'展开导航 ☰'}}</button>
   <nav id="navigation" :class="{open:menu}" aria-label="主导航"><NuxtLink v-for="[href,label] in links" :key="href" :to="href!" :class="{active:href==='/'?route.path==='/':route.path.startsWith(href!)}">{{label}}</NuxtLink></nav>
   <NuxtLink to="/me" class="personal-link">我的纸笺 <span aria-hidden="true">↗</span></NuxtLink>
  </header>
  <main id="main"><NuxtPage /></main>
  <div v-if="notice.text" class="toast" :class="notice.kind" role="status">{{notice.text}}<button @click="notice.text=''" aria-label="关闭提示">×</button></div>
  <footer class="site-footer"><div><NuxtLink class="footer-brand" to="/">纸上生花<span>让传统，在指尖继续生长。</span></NuxtLink><p>剪纸互动工坊 · 原创数字体验</p></div><div class="footer-links"><NuxtLink to="/tutorials">从这里学起</NuxtLink><NuxtLink to="/about">关于与来源</NuxtLink><NuxtLink to="/admin">展馆管理</NuxtLink><a href="#main">回到顶部 ↑</a></div><small>2026 零杯网页设计大赛<br/>匠心传成，非遗焕新</small></footer>
 </div>
</template>
