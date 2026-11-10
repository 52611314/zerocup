<script setup lang="ts">
const route = useRoute()
const menu = ref(false)
const menuButton = ref<HTMLButtonElement>()
const { notice } = useFeedback()
const currentSection = computed(() => '/' + route.path.split('/')[1])
const pageMotion = useState('paper-route-motion', () => 'paper-chapter')
const pageTransition = computed(() => ({ name: pageMotion.value, mode: 'out-in' as const }))

watch(() => route.path, () => {
  menu.value = false
  notice.value.text = ''
})

const links = [
  { href: '/', label: '首页' },
  { href: '/learn', label: '纸上学堂' },
  { href: '/tutorials', label: '入门教程' },
  { href: '/studio', label: '剪纸工坊' },
  { href: '/gallery', label: '纸上展览' }
]

function dismissMenu() {
  if (!menu.value) return
  menu.value = false
  menuButton.value?.focus()
}

function closeCurrentMenu(event: MouseEvent, href: string) {
  if (route.path === href && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) dismissMenu()
}
</script>

<template>
 <div id="site-top" tabindex="-1">
  <NuxtRouteAnnouncer />
  <PaperNavigation/>
  <ChapterWindow/>
  <PaperWeather/>
  <a class="skip" href="#main">跳到主要内容</a>
  <div class="header-frame" :class="{ 'header-opening': route.path === '/' }" @keydown.esc="dismissMenu">
   <header class="site-header">
    <NuxtLink to="/" class="brand" aria-label="纸上生花首页">
     <img src="/favicon.svg" width="38" height="38" alt=""/>
     <span>纸上生花<small>中国剪纸 · 数字工坊</small></span>
    </NuxtLink>
    <button ref="menuButton" class="menu-toggle" type="button" @click="menu = !menu" :aria-expanded="menu" aria-controls="navigation">
     导航 <span aria-hidden="true">{{ menu ? '×' : '☰' }}</span>
    </button>
    <nav id="navigation" :class="{ open: menu }" aria-label="主导航">
     <NuxtLink v-for="({ href, label }, index) in links" :key="href" :to="href" :class="{ active: currentSection === href }" :aria-current="currentSection === href ? 'page' : undefined" @click="closeCurrentMenu($event, href)">
      <span class="nav-index" aria-hidden="true">0{{ index + 1 }}</span>{{ label }}
     </NuxtLink>
    </nav>
    <NuxtLink to="/me" class="personal-link" @click="menu = false">我的纸笺 <span aria-hidden="true">↗</span></NuxtLink>
   </header>
  </div>
  <main id="main" tabindex="-1"><NuxtPage :transition="pageTransition" /></main>
  <Transition name="paper-note">
   <div v-if="notice.text" class="toast" :class="notice.kind" role="status">{{ notice.text }}<button @click="notice.text = ''" aria-label="关闭提示">×</button></div>
  </Transition>
  <div class="footer-frame">
   <footer class="site-footer">
    <div>
     <NuxtLink class="footer-brand" to="/">纸上生花</NuxtLink>
     <p>从一张纸开始，读、剪、展。</p>
    </div>
    <div class="footer-links">
     <NuxtLink to="/tutorials">入门教程</NuxtLink>
     <NuxtLink to="/about">关于与来源</NuxtLink>
     <NuxtLink to="/admin">展馆管理</NuxtLink>
     <NuxtLink :to="{ path: route.path, query: route.query, hash: '#site-top' }">回到顶部 ↑</NuxtLink>
    </div>
    <small>2026 零杯网页设计大赛<br/>匠心传承，非遗焕新</small>
   </footer>
  </div>
 </div>
</template>
