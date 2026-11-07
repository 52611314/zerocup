<script setup lang="ts">
import type { PaperModel } from '../../../shared/model'


interface GalleryPage {
  items: { id: string; model: PaperModel; title: string; category: string; is_example: boolean }[]
  total: number
  pages: number
  page: number
}

usePageMeta('纸上展览', '欣赏经审核公开的原创剪纸作品，从一张纸的不同留白里寻找灵感。')

const route = useRoute()
useBrowseReturn('/gallery')
const search = computed(() => String(route.query.q || '').slice(0, 80))
const category = computed(() => String(route.query.category || ''))
const page = computed(() => Math.max(1, Math.min(10000, Math.floor(Number(route.query.page) || 1))))
const query = ref(search.value)
watch(search, value => { query.value = value })

const [{ data, pending, error, refresh }, { data: coverPage, refresh: refreshCover }] = await Promise.all([
  useFetch<GalleryPage>('/api/gallery', { query: { q: search, category, page } }),
  useFetch<GalleryPage>('/api/gallery', { key: 'gallery-public-cover' }),
])

const categories = ['花叶之间', '几何之美', '自由创作']
const coverWork=computed(()=>coverPage.value?.items[0]||null)
async function retryGallery(){await Promise.all([refresh(),refreshCover()])}
const hasFilters = computed(() => Boolean(search.value || category.value))
const catalogLayout = ref(!hasFilters.value && page.value === 1)
const resultRevision = ref(0)

watch(data, (result, previous) => {
  if (!result) return
  catalogLayout.value = !hasFilters.value && page.value === 1
  if (previous) resultRevision.value++
})

function browse(nextCategory = category.value, nextPage = 1, text = query.value.trim()) {
  query.value = text
  return navigateTo({
    path: '/gallery',
    query: {
      q: text || undefined,
      category: nextCategory || undefined,
      page: nextPage > 1 ? nextPage : undefined,
    },
  }, { replace: true })
}

function turn(delta: number) {
  return browse(category.value, page.value + delta, search.value)
}
</script>

<template>
  <div class="page gallery-page">
    <header class="catalog-hero" aria-labelledby="gallery-room-title">
      <PaperRoomLight />
      <div class="wrap catalog-breadcrumbs">
        <Breadcrumbs :items="[{ label: '纸上展览' }]" />
      </div>
      <div class="wrap catalog-stage">
        <div class="catalog-intro">
          <p class="catalog-kicker"><span aria-hidden="true">03</span> 纸上展览</p>
          <h1 id="gallery-room-title">纸间<span>万象</span></h1>
          <p class="catalog-lead">一张纸，展开各自的心意。<br/>从花叶、几何与留白里，慢慢看。</p>
          <div class="catalog-actions">
            <NuxtLink class="catalog-enter" :to="{ path: route.path, query: route.query, hash: '#gallery-collection' }">
              观看展品 <span aria-hidden="true">↓</span>
            </NuxtLink>
            <NuxtLink class="catalog-create" to="/studio">剪一张，来参展 <span aria-hidden="true">↗</span></NuxtLink>
          </div>
        </div>
        <figure class="catalog-wall">
          <div class="catalog-aperture">
            <svg class="catalog-orbit" viewBox="0 0 600 600" aria-hidden="true">
              <circle cx="300" cy="300" r="282" opacity=".42" />
              <circle cx="300" cy="300" r="267" class="orbit-guide" />
              <circle cx="300" cy="300" r="246" opacity=".6" />
              <path v-for="mark in 8" :key="mark" :transform="`rotate(${(mark - 1) * 45} 300 300)`"
                d="m300 7 4 8-4 8-4-8z M300 36l3 5-3 5-3-5z" />
            </svg>
            <div class="catalog-sheet">
              <PaperArt v-if="coverWork" :model="coverWork.model" :label="coverWork.title+'数字剪纸'" :data-gallery-cover="coverWork.id"/>
              <span v-else class="empty-cover">等待新的纸上作品</span>
            </div>
          </div>
          <figcaption class="wall-caption">
            <small>{{ coverWork ? (coverWork.is_example ? '原创示例' : '访客创作') : '暂未展出' }}</small>
            <NuxtLink v-if="coverWork" class="wall-work-link" :to="`/gallery/${coverWork.id}`">
              <span class="sr-only">查看封面作品 </span>
              <span class="wall-work-title">{{ coverWork.title }}</span>
              <span class="wall-work-arrow" aria-hidden="true">↗</span>
            </NuxtLink>
            <span v-else class="wall-empty-title">留白，等待下一朵花</span>
          </figcaption>
        </figure>
      </div>
    </header>

    <section class="wrap gallery-collection" aria-labelledby="gallery-collection">
      <div class="collection-heading">
        <div>
          <span class="collection-index"><span aria-hidden="true">◆</span> 纸上图录 <span lang="en" aria-hidden="true">THE COLLECTION</span></span>
          <h2 id="gallery-collection" tabindex="-1">展出作品</h2>
        </div>
        <div class="collection-controls">
          <span class="collection-count" role="status">
            {{ pending ? '正在查找作品…' : error ? '' : `共 ${data?.total ?? 0} 件作品` }}
          </span>
          <button v-if="hasFilters" class="clear-filters" type="button" @click="browse('', 1, '')">
            清除筛选 <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
      <BrowseFilters
        v-model="query"
        :categories="categories"
        :category="category"
        all-label="全部作品"
        category-label="作品分类"
        search-label="搜索作品"
        search-id="work-search"
        placeholder="寻找一朵花"
        @select="browse($event)"
        @search="browse()"
      />

      <div class="collection-results" :aria-busy="pending">
        <AsyncState :pending="pending && !data" :error="error" :empty="!data?.items.length" @retry="retryGallery">
          <div
            :key="resultRevision"
            class="works-grid exhibit-grid"
            :class="{ 'catalog-grid': catalogLayout, 'exhibit-grid-fresh': resultRevision > 0 }"
          >
            <WorkCard
              v-for="(work, index) in data?.items"
              :key="work.id"
              :work="work"
              gallery-mount
              :exhibit-number="String(((data?.page ?? 1) - 1) * 6 + index + 1).padStart(2, '0')"
            />
          </div>
        </AsyncState>
      </div>
      <nav v-if="!error && data && (data.page > 1 || data.pages > 1)" class="pagination" aria-label="展览翻页">
        <button class="btn" :disabled="pending || data.page <= 1" @click="turn(-1)">← 上一页</button>
        <span>第 {{ data.page }} / {{ Math.max(1, data.pages) }} 页</span>
        <button class="btn" :disabled="pending || data.page >= data.pages" @click="turn(1)">下一页 →</button>
      </nav>
      <p class="gallery-note">标注“原创示例”的作品由项目制作，用于说明数字创作方式。展示期间访客投稿即时通过并在此展出。</p>
    </section>
  </div>
</template>

<style scoped>
.gallery-page {
  --catalog-ink: #2a1c18;
  --catalog-rule: #c8ad90;
  color: var(--catalog-ink);
  padding-top: 0;
}

.catalog-hero {
  --room-glow: #ffae6168;
  --room-beam: #ffb1604d;
  --room-mullion: #47141750;
  --room-edge: #31090dac;
  position: relative;
  isolation: isolate;
  margin-bottom: clamp(36px, 5.4vw, 78px);
  padding: clamp(15px, 1.8vw, 25px) 0 clamp(24px, 3vw, 42px);
  overflow: hidden;
  background:
    repeating-linear-gradient(102deg, transparent 0 6px, #f5d0a40b 6px 7px),
    radial-gradient(ellipse at 68% 43%, #cb5340 0, #95291f 34%, transparent 69%),
    linear-gradient(151deg, #7b261b 1%, #5a191a 54%, #320d13);
  color: #fff0d7;
}

.catalog-hero::before,
.catalog-hero::after {
  position: absolute;
  z-index: -1;
  pointer-events: none;
  content: '';
}

.catalog-hero::before {
  inset: 0;
  background:
    linear-gradient(90deg, #35151d75, transparent 15% 85%, #210c1170),
    repeating-linear-gradient(90deg, transparent 0 9.8%, #4415144d 9.8% 9.94%, #f7b87c42 9.94% 10%, transparent 10% 19.8%);
  mask-image: linear-gradient(#000, #0008 76%, transparent 95%);
}

.catalog-hero::after {
  inset: auto 0 0;
  height: clamp(30px, 9.6vw, 145px);
  border-top: 1px solid #cb7a5663;
  background:
    radial-gradient(ellipse at 70% 0, #ca744a37, transparent 66%),
    repeating-linear-gradient(0deg, transparent 0 8px, #c5755127 8px 9px),
    linear-gradient(170deg, #511b19, #250d12);
  box-shadow: 0 -13px 40px #370d1742;
}

.catalog-breadcrumbs {
  color: #f4ccb1;
}

.catalog-breadcrumbs :deep(a:hover) { color: #fff7e7; }
.catalog-breadcrumbs :deep(a:focus-visible),
.catalog-hero :focus-visible { outline-color: #ffd3a5; }

.catalog-stage {
  display: grid;
  grid-template-columns: minmax(0, .79fr) minmax(0, 1.21fr);
  align-items: center;
  gap: clamp(16px, 2.4vw, 40px);
  padding-top: clamp(12px, 1.9vw, 27px);
}

.catalog-intro {
  position: relative;
  z-index: 1;
  padding-inline-start: clamp(12px, 2.5vw, 37px);
  border-inline-start: 1px solid #f3b58187;
}

.catalog-kicker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  color: #f4ccb1;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .2em;
}

.catalog-kicker span {
  border-inline-end: 1px solid #e1a17f;
  padding-inline-end: 11px;
  font: italic 16px/1 Georgia, serif;
}

.catalog-intro h1 {
  margin: .24em 0 .29em;
  font-size: clamp(72px, 10vw, 152px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -.07em;
  text-shadow: 2px 7px 22px #3c0e1691;
}

.catalog-intro h1 span {
  display: block;
  margin-inline-start: .32em;
  color: #ffc29b;
}

.catalog-lead {
  margin: 0;
  color: #f1d1b9;
  font-size: clamp(15px, 1.5vw, 20px);
  line-height: 1.78;
}

.catalog-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-top: clamp(18px, 3vw, 36px);
}

.catalog-actions a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  gap: 10px;
  font-size: 14px;
  font-weight: 700;
}

.catalog-enter {
  padding-inline: 14px;
  background: #f9e6c7;
  color: #532117;
}

.catalog-enter:hover { color: #532117; background: #fff3d9; }
.catalog-create { color: #ffe0c1; }
.catalog-create:hover { color: #fff3d9; text-decoration: underline; text-underline-offset: .24em; }

.catalog-wall {
  position: relative;
  isolation: isolate;
  display: grid;
  justify-items: center;
  min-width: 0;
  margin: 0;
}

.catalog-wall::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  transform: scale(1.25);
  background: radial-gradient(ellipse at 50% 43%, #fdbb766a, #ec82472e 37%, transparent 68%);
  content: '';
  pointer-events: none;
}

.catalog-aperture {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 660px, 78svh);
  aspect-ratio: 1;
}

.catalog-orbit {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: #ffd498;
  filter: drop-shadow(0 2px 0 #5f2217);
}

.catalog-orbit circle { fill: none; stroke: currentColor; stroke-width: 1; }
.catalog-orbit .orbit-guide { stroke-dasharray: 1 7; stroke-width: 2; opacity: .66; }
.catalog-orbit path { fill: currentColor; opacity: .9; }

.catalog-sheet {
  --rim: clamp(2px, .48vw, 7px);
  position: relative;
  display: grid;
  place-items: center;
  width: 75%;
  aspect-ratio: 1;
  border: 1px solid #ffe2a5;
  border-radius: 50%;
  background:
    repeating-linear-gradient(115deg, transparent 0 5px, #926b3812 5px 6px),
    radial-gradient(circle at 28% 22%, #fff9e7, #efd8aa 69%, #cca06b);
  box-shadow:
    inset 0 7px 16px #7a421865,
    0 0 0 var(--rim) #63331f,
    0 0 0 calc(var(--rim) * 1.3) #e6a968,
    0 0 0 calc(var(--rim) * 2.4) #a95434,
    0 0 0 calc(var(--rim) * 2.65) #f9c589,
    0 0 0 calc(var(--rim) * 3.7) #6b271e,
    0 19px 36px calc(var(--rim) * 3.3) #260a12c9;
}

.catalog-sheet .paper-art {
  width: 88%;
  filter: drop-shadow(3px 6px 3px #591f1954);
}

.empty-cover {
  padding-inline: 15px;
  color: #6f3c2b;
  text-align: center;
}

.wall-caption {
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  gap: clamp(8px, 1.2vw, 16px);
  padding-inline: 12px;
  border-block: 1px solid #e6aa7566;
  background: #2b0e16a3;
  font: 700 17px/1.2 var(--serif);
}

.wall-caption small { flex: none; color: #f4d5b4; font: 11px/1.3 system-ui, sans-serif; }

.wall-work-link {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  min-height: 44px;
  gap: 8px;
}

.wall-work-link::after {
  position: absolute;
  inset: 0;
  content: '';
}

.wall-work-link:is(:hover, :focus-visible) { color: #fff7e7; }
.wall-work-link:focus-visible { outline-color: #ffd6a6; }
.wall-work-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wall-work-link:is(:hover, :focus-visible) .wall-work-title { text-decoration: underline; text-underline-offset: .26em; }
.wall-work-arrow { flex: none; }
.wall-empty-title { display: flex; align-items: center; min-height: 44px; }

.collection-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: clamp(14px, 2.3vw, 31px);
  padding-top: clamp(16px, 2.8vw, 37px);
  border-top: 1px solid #a58263;
}

.collection-heading h2 {
  margin: .1em 0 0;
  scroll-margin-top: 24px;
  font-size: clamp(32px, 5vw, 72px);
  letter-spacing: -.055em;
}

.collection-index,
.collection-count {
  color: #6c4d3f;
  font-size: 13px;
  letter-spacing: .12em;
}

.collection-index {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 10px;
  color: #782d22;
  font-size: 12px;
  font-weight: 700;
}
.collection-index span:first-child { font-size: 8px; }
.collection-index [lang="en"] {
  padding-inline-start: 10px;
  border-inline-start: 1px solid #b59a7c;
  color: #6c4d3f;
  font: 10px/1.2 Georgia, serif;
  letter-spacing: .14em;
}
.collection-count { font-variant-numeric: tabular-nums; white-space: nowrap; }

.collection-controls {
  display: flex;
  align-items: center;
  justify-content: end;
  min-height: 44px;
  gap: 10px;
}

.clear-filters {
  border: 0;
  padding-inline: 8px;
  color: #8e261d;
  font-size: 14px;
  text-decoration: underline;
  text-underline-offset: .2em;
}

.exhibit-grid {
  align-items: start;
  gap: clamp(20px, 3.4vw, 50px) clamp(13px, 2.3vw, 34px);
  margin-top: clamp(18px, 2.6vw, 36px);
}

.catalog-grid:has(> :nth-child(3)) > :first-child {
  --mount-center: #3c5448;
  --mount-edge: #202d26;
  --mount-frame: #caa77d7a;
  --mount-border: #3a4837;
  --mount-aperture: radial-gradient(circle at 38% 30%, #fff9e7 15%, #eddbb9 85%, #d6b584);
  --mount-aperture-shadow: 0 0 0 1px #ebd1a594, 0 0 0 5px #ae8c5d47, 0 9px 24px #161b1366;
  --gallery-art-width: 55%;
  --gallery-art-max: 370px;
  --gallery-mount-ratio: 1.53;
}

@media (prefers-reduced-motion: no-preference) {
  .catalog-orbit { animation: settle-orbit 1s cubic-bezier(.18, .7, .3, 1) both; }
  .catalog-wall::before { animation: wake-wall 1.25s ease-out both; }
  .wall-work-arrow { transition: transform .24s ease; }
  .wall-work-link:is(:hover, :focus-visible) .wall-work-arrow { transform: translate(2px, -2px); }
  .exhibit-grid-fresh { animation: mount-exhibits .27s ease-out; }
  @keyframes settle-orbit {
    from { opacity: .2; transform: rotate(-13deg) scale(.91); }
    to { opacity: 1; transform: none; }
  }
  @keyframes wake-wall {
    from { opacity: .35; }
    to { opacity: 1; }
  }
  @keyframes mount-exhibits {
    from { opacity: .76; }
    to { opacity: 1; }
  }
}

@media (min-width: 1050px) {
  .catalog-grid:has(> :nth-child(3)) { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .catalog-grid:has(> :nth-child(3)) > .gallery-mount-card { grid-column: span 2; }
  .catalog-grid:has(> :nth-child(3)) > :first-child {
    grid-column: span 4;
    grid-row: span 2;
  }
  .catalog-grid:has(> :nth-child(3)) > .gallery-mount-card:is(:nth-child(2), :nth-child(3)) {
    --gallery-mount-ratio: 1.06;
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
    align-items: center;
    align-self: stretch;
    gap: clamp(10px, 1.2vw, 18px);
    border-block-start: 1px solid var(--catalog-rule);
    padding-block: 12px;
  }
  .catalog-grid:has(> :nth-child(3)) > .gallery-mount-card:nth-child(2) { border-block-end: 0; }
  .catalog-grid:has(> :nth-child(3)) > .gallery-mount-card:is(:nth-child(2), :nth-child(3)) :deep(.work-caption) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 9px 5px;
    padding: 0;
  }
  .catalog-grid:has(> :nth-child(3)) > .gallery-mount-card:is(:nth-child(2), :nth-child(3)) :deep(.gallery-label-number) {
    grid-column: 1 / -1;
    font-size: clamp(25px, 3vw, 43px);
  }
  .catalog-grid:has(> :nth-child(3)) > .gallery-mount-card:is(:nth-child(2), :nth-child(3)) :deep(h3) {
    font-size: clamp(20px, 1.85vw, 27px);
  }
}

@media (min-width: 380px) and (max-width: 1049px) {
  .catalog-grid:has(> :nth-child(3)) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .catalog-grid:has(> :nth-child(3)) > :first-child { grid-column: 1 / -1; }
}

.gallery-note {
  margin: 32px 0 0;
  padding-top: 16px;
  border-top: 1px solid #cbbda6;
  letter-spacing: .04em;
}

@media (max-width: 760px) {
  .catalog-hero { margin-bottom: 31px; }
  .catalog-stage { grid-template-columns: 1fr; gap: 12px; padding-top: 22px; }
  .catalog-intro { padding-inline-start: 12px; }
  .catalog-intro h1 { font-size: clamp(50px, 12vw, 80px); }
  .catalog-intro h1 span { display: inline; margin-inline-start: 0; }
  .catalog-aperture { width: min(100%, 425px); }
}

@media (max-width: 540px) {
  .catalog-stage { gap: 8px; }
  .catalog-actions { gap: 6px 14px; margin-top: 14px; }
  .catalog-lead { font-size: 14px; }
  .catalog-aperture { width: min(100%, 365px); }
  .wall-caption { font-size: 14px; }
  .collection-heading { margin-bottom: 12px; padding-top: 12px; }
  .collection-index [lang="en"] { display: none; }
  .collection-controls { min-height: 66px; flex-direction: column; align-items: end; gap: 0; }
  .exhibit-grid { margin-top: 18px; }
}

@media (min-width: 380px) and (max-width: 540px) {
  .exhibit-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .catalog-grid:has(> :nth-child(3)) > :first-child :deep(.gallery-label-origin) {
    display: inline-block;
    margin-inline-start: .45em;
    border-inline-start: 1px solid #a48169;
    padding-inline-start: .55em;
  }
}

@media (max-width: 360px) {
  .gallery-collection :deep(.browse-tabs) {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    width: 100%;
    gap: 4px;
  }
  .gallery-collection :deep(.browse-tabs button) {
    padding-inline: 3px;
    font-size: 13px;
  }
}
</style>
