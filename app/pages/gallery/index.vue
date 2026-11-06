<script setup lang="ts">
import type { PaperModel } from '../../../shared/model'
import { starterModels } from '../../../shared/patterns'

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
const cover = { ...starterModels[0]!, color: '#f2d8ad' }
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
    <BrowseMasthead
      number="03"
      section="纸上展览"
      english="THE PAPER GALLERY"
      title="一人一纸，各自生花。"
      description="每一份心意，都值得好好展开。"
      stamp="纸间展"
      :model="cover"
      theme="red"
    >
      <NuxtLink to="/studio">剪一张，来参展 <span aria-hidden="true">↗</span></NuxtLink>
    </BrowseMasthead>

    <section aria-labelledby="gallery-collection">
      <div class="collection-heading">
        <h2 id="gallery-collection">展出作品</h2>
        <span lang="en" aria-hidden="true">ON DISPLAY</span>
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

      <div class="collection-status">
        <span role="status">
          {{ pending ? '正在查找作品…' : error ? '' : `共 ${data?.total ?? 0} 件作品` }}
        </span>
        <button v-if="hasFilters" class="clear-filters" type="button" @click="browse('', 1, '')">
          清除筛选 <span aria-hidden="true">×</span>
        </button>
      </div>

      <AsyncState :pending="pending" :error="error" :empty="!data?.items.length" @retry="refresh">
        <div class="works-grid exhibit-grid">
          <WorkCard
            v-for="(work, index) in data?.items"
            :key="work.id"
            :work="work"
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
.collection-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.collection-heading h2 {
  margin: 0;
  font-size: clamp(26px, 3vw, 42px);
}

.collection-heading span,
.collection-status {
  color: #765c4b;
  font-size: 13px;
  letter-spacing: .12em;
}

.collection-heading span {
  font-family: Georgia, serif;
}

.collection-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
}

.clear-filters {
  border: 0;
  padding-inline: 8px;
  color: #8e261d;
  text-decoration: underline;
  text-underline-offset: .2em;
}

.exhibit-grid {
  gap: clamp(16px, 2.4vw, 34px);
}

.gallery-note {
  margin: 32px 0 0;
  padding-top: 16px;
  border-top: 1px solid #cbbda6;
  letter-spacing: .04em;
}
</style>
