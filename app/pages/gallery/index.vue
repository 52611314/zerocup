<script setup lang="ts">
import type { PaperModel } from '../../../shared/model'
import { patternNames, starterModels } from '../../../shared/patterns'

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

const { data, pending, error, refresh } = await useFetch<GalleryPage>('/api/gallery', {
  query: { q: search, category, page },
})

const categories = ['花叶之间', '几何之美', '自由创作']
const cover = { ...starterModels[6]!, color: '#952d22' }
const coverTitle = patternNames[6]!
const hasFilters = computed(() => Boolean(search.value || category.value))

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
  <div class="wrap page gallery-page">
    <Breadcrumbs :items="[{ label: '纸上展览' }]" />
    <header class="catalog-hero">
      <div class="catalog-intro">
        <p class="catalog-kicker"><span aria-hidden="true">03</span> 纸上展览</p>
        <h1>纸间<span>万象</span></h1>
        <p class="catalog-lead">一张纸，展开各自的心意。<br/>从花叶、几何与留白里，慢慢看。</p>
        <div class="catalog-actions">
          <a class="catalog-enter" href="#gallery-collection">观看展品 <span aria-hidden="true">↓</span></a>
          <NuxtLink class="catalog-create" to="/studio">剪一张，来参展 <span aria-hidden="true">↗</span></NuxtLink>
        </div>
      </div>
      <figure class="catalog-wall">
        <span class="wall-edition" lang="en" aria-hidden="true">PAPER CUTS</span>
        <span class="wall-seal" aria-hidden="true">剪</span>
        <div class="print-stack">
          <div class="catalog-sheet">
            <PaperArt :model="cover" :label="coverTitle+'数字剪纸'"/>
          </div>
        </div>
        <figcaption class="wall-caption">
          <span>{{ coverTitle }}</span>
          <small>原创示例</small>
        </figcaption>
      </figure>
    </header>

    <section class="gallery-collection" aria-labelledby="gallery-collection">
      <div class="collection-heading">
        <div>
          <span class="collection-index" lang="en" aria-hidden="true">THE COLLECTION</span>
          <h2 id="gallery-collection" tabindex="-1">展出作品</h2>
        </div>
        <span class="collection-count" role="status">
          {{ pending ? '正在查找作品…' : error ? '' : `共 ${data?.total ?? 0} 件作品` }}
        </span>
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

      <div v-if="hasFilters" class="collection-status">
        <button class="clear-filters" type="button" @click="browse('', 1, '')">
          清除筛选 <span aria-hidden="true">×</span>
        </button>
      </div>

      <AsyncState :pending="pending" :error="error" :empty="!data?.items.length" @retry="refresh">
        <div class="works-grid exhibit-grid" :class="{ 'catalog-grid': !hasFilters && page === 1 }">
          <WorkCard
            v-for="(work, index) in data?.items"
            :key="work.id"
            :work="work"
            gallery-mount
            :exhibit-number="String((page - 1) * 6 + index + 1).padStart(2, '0')"
          />
        </div>
      </AsyncState>
      <nav v-if="!pending && !error && (page > 1 || (data?.pages ?? 1) > 1)" class="pagination" aria-label="展览翻页">
        <button class="btn" :disabled="page <= 1" @click="turn(-1)">← 上一页</button>
        <span>第 {{ page }} / {{ Math.max(1, data?.pages ?? 1) }} 页</span>
        <button class="btn" :disabled="page >= (data?.pages ?? 1)" @click="turn(1)">下一页 →</button>
      </nav>
      <p class="gallery-note">标注“原创示例”的作品由项目制作，用于说明数字创作方式。访客作品审核后在此展出。</p>
    </section>
  </div>
</template>

<style scoped>
.gallery-page {
  --catalog-red: #87271f;
  --catalog-ink: #2a1c18;
  --catalog-rule: #c8ad90;
  color: var(--catalog-ink);
}

.catalog-hero {
  display: grid;
  grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr);
  align-items: center;
  gap: clamp(22px, 5vw, 78px);
  margin: clamp(16px, 3vw, 42px) 0 clamp(36px, 5.4vw, 78px);
}

.catalog-kicker {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--catalog-red);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .2em;
}

.catalog-kicker span {
  border-inline-end: 1px solid var(--catalog-rule);
  padding-inline-end: 11px;
  font: italic 16px/1 Georgia, serif;
}

.catalog-intro h1 {
  margin: .21em 0 .25em;
  font-size: clamp(58px, 7.6vw, 118px);
  font-weight: 900;
  line-height: 1.06;
  letter-spacing: -.07em;
}

.catalog-intro h1 span { color: var(--catalog-red); }

.catalog-lead {
  margin: 0;
  color: #63483d;
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
  background: var(--catalog-red);
  color: #fff7e7;
}

.catalog-enter:hover { color: #fff7e7; background: #6f2019; }
.catalog-create { color: var(--catalog-red); }
.catalog-create:hover { text-decoration: underline; text-underline-offset: .24em; }

.catalog-wall {
  position: relative;
  isolation: isolate;
  display: grid;
  place-items: center;
  min-height: clamp(280px, 33vw, 456px);
  margin: 0;
  overflow: hidden;
  background: radial-gradient(ellipse at 52% 34%, #a53a2b 0%, #87271f 56%, #5f1c18 100%);
  color: #fff0d5;
}

.catalog-wall::before {
  position: absolute;
  inset: 11px;
  border: 1px solid #f6d4a467;
  pointer-events: none;
  content: '';
}

.print-stack {
  position: relative;
  isolation: isolate;
  width: min(54%, 320px);
  margin: 12px 0 22px;
}

.print-stack::before {
  position: absolute;
  z-index: -1;
  inset: 3px;
  border: 1px solid #ead4af;
  background: #dfbc91;
  transform: translate(5%, 3%) rotate(9deg);
  box-shadow: 4px 9px 16px #46141065;
  content: '';
}

.catalog-sheet {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border: 1px solid #ead7b4;
  background: radial-gradient(ellipse at 40% 28%, #fff8e8, #f5e3c4 84%);
  box-shadow: 4px 12px 25px #46141065;
  transform: rotate(-7deg);
}

.catalog-sheet .paper-art {
  width: 85%;
  filter: drop-shadow(2px 4px 2px #591f1938);
}

.wall-edition, .wall-seal, .wall-caption { position: absolute; }
.wall-edition {
  inset: 23px auto auto 25px;
  font: 12px/1.2 Georgia, serif;
  letter-spacing: .18em;
}

.wall-seal {
  inset: 24px 26px auto auto;
  display: grid;
  place-items: center;
  width: 35px;
  aspect-ratio: 1;
  border: 1px solid #f6d4a4ac;
  transform: rotate(7deg);
  font: 700 21px/1 var(--serif);
}

.wall-caption {
  inset: auto 25px 22px auto;
  display: flex;
  align-items: baseline;
  gap: 9px;
  font: 700 17px/1.2 var(--serif);
}

.wall-caption small { color: #f4d5b4; font: 11px/1.3 system-ui, sans-serif; }

.collection-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  padding-top: 19px;
  border-top: 1px solid var(--catalog-rule);
}

.collection-heading h2 {
  margin: .1em 0 0;
  scroll-margin-top: 24px;
  font-size: clamp(31px, 4vw, 52px);
}

.collection-index,
.collection-count,
.collection-status {
  color: #6c4d3f;
  font-size: 13px;
  letter-spacing: .12em;
}

.collection-index { font: 11px/1.2 Georgia, serif; letter-spacing: .19em; }
.collection-count { padding-bottom: 4px; white-space: nowrap; }

.collection-status {
  display: flex;
  justify-content: flex-end;
}

.clear-filters {
  border: 0;
  padding-inline: 8px;
  color: #8e261d;
  text-decoration: underline;
  text-underline-offset: .2em;
}

.exhibit-grid {
  align-items: start;
  gap: clamp(18px, 3vw, 46px) clamp(13px, 2.2vw, 30px);
  margin-top: 26px;
}

@media (min-width: 901px) {
  .catalog-grid { grid-template-columns: minmax(0, 1.16fr) repeat(2, minmax(0, 1fr)); }
  .catalog-grid :deep(.gallery-mount-card:nth-child(3n + 2)) { margin-top: 14px; }
  .catalog-grid :deep(.gallery-mount-card:nth-child(3n)) { margin-top: 28px; }
}

.gallery-note {
  margin: 32px 0 0;
  padding-top: 16px;
  border-top: 1px solid #cbbda6;
  letter-spacing: .04em;
}

@media (max-width: 760px) {
  .catalog-hero { grid-template-columns: 1fr; gap: 20px; margin-block: 16px 31px; }
  .catalog-kicker { margin: 0; }
  .catalog-intro h1 { font-size: clamp(52px, 12vw, 80px); }
  .catalog-wall { min-height: clamp(210px, 54vw, 360px); }
  .print-stack { width: min(46%, 244px); }
}

@media (max-width: 540px) {
  .catalog-hero { gap: 15px; }
  .catalog-actions { gap: 6px 14px; margin-top: 14px; }
  .catalog-lead { font-size: 14px; }
  .catalog-lead br { display: none; }
  .catalog-wall::before { inset: 8px; }
  .print-stack { width: min(40%, 220px); margin: 0 0 32px; }
  .wall-edition { inset: 16px auto auto 17px; font-size: 10px; }
  .wall-seal { inset: 16px 17px auto auto; width: 27px; font-size: 16px; }
  .wall-caption { inset: auto 17px 14px auto; font-size: 14px; }
  .collection-heading { margin-bottom: 12px; padding-top: 12px; }
  .exhibit-grid { margin-top: 18px; }
}

@media (min-width: 380px) and (max-width: 540px) {
  .exhibit-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
