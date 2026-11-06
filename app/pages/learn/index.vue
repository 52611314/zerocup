<script setup lang="ts">
import { starterModels } from '../../../shared/patterns'

interface ArticleSummary {
  id: string
  slug: string
  title: string
  summary: string
  category: string
}

usePageMeta('纸上学堂', '阅读有来源的剪纸故事、技法与原创纹样练习，了解纸面与留白。')

const route = useRoute()
useBrowseReturn('/learn')
const search = computed(() => String(route.query.q || '').slice(0, 80))
const category = computed(() => String(route.query.category || ''))
const query = ref(search.value)
watch(search, value => { query.value = value })

const { data, pending, error, refresh } = await useFetch<ArticleSummary[]>('/api/articles', {
  query: { q: search, category },
})

const categories = ['纸上故事', '技法入门', '纹样观察', '创作手记']
const cover = { ...starterModels[6]!, color: '#ad2920' }
const hasFilters = computed(() => Boolean(search.value || category.value))

function find(nextCategory = category.value, text = query.value.trim()) {
  query.value = text
  return navigateTo({
    path: '/learn',
    query: { q: text || undefined, category: nextCategory || undefined },
  }, { replace: true })
}
</script>

<template>
  <div class="wrap page learn-page">
    <Breadcrumbs :items="[{ label: '纸上学堂' }]" />
    <BrowseMasthead
      number="01"
      section="纸上学堂"
      english="THE PAPER READER"
      title="纸薄，故事很长。"
      description="读懂一处留白，再剪下一片自己的风景。"
      stamp="观纸记"
      :model="cover"
    >
      <NuxtLink to="/tutorials">从阅读到动手 <span aria-hidden="true">↗</span></NuxtLink>
    </BrowseMasthead>

    <section aria-labelledby="journal-title">
      <div class="journal-heading">
        <h2 id="journal-title">学堂札记</h2>
        <span lang="en" aria-hidden="true">FIELD NOTES</span>
      </div>
      <BrowseFilters
        v-model="query"
        :categories="categories"
        :category="category"
        all-label="全部札记"
        category-label="文章分类"
        search-label="搜索知识"
        search-id="article-search"
        placeholder="找一个故事或纹样"
        @select="find($event)"
        @search="find()"
      />
      <div class="journal-status">
        <span role="status">
          {{ pending ? '正在查找札记…' : error ? '' : `共 ${data?.length ?? 0} 篇札记` }}
        </span>
        <button v-if="hasFilters" class="clear-filters" type="button" @click="find('', '')">
          清除筛选 <span aria-hidden="true">×</span>
        </button>
      </div>
      <AsyncState :pending="pending && !data" :error="error" :empty="!data?.length" @retry="refresh">
        <div class="journal-grid" :aria-busy="pending">
          <NuxtLink v-for="(article, index) in data" :key="article.id" :to="`/learn/${article.slug}`" class="journal-card">
            <div class="journal-art" aria-hidden="true">
              <PaperArt :model="starterModels[(index + 1) % starterModels.length]!" />
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
            </div>
            <div class="journal-copy">
              <span class="journal-category">{{ article.category }}</span>
              <h3>{{ article.title }}</h3>
              <p>{{ article.summary }}</p>
              <span class="journal-link">翻开这一页 <span aria-hidden="true">→</span></span>
            </div>
          </NuxtLink>
        </div>
      </AsyncState>
    </section>
  </div>
</template>

<style scoped>
.journal-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.journal-heading h2 {
  margin: 0;
  font-size: clamp(26px, 3vw, 42px);
}

.journal-heading span,
.journal-status {
  color: #765c4b;
  font-size: 13px;
  letter-spacing: .12em;
}

.journal-heading span {
  font-family: Georgia, serif;
}

.journal-status {
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

.journal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.journal-card {
  display: grid;
  grid-template-columns: minmax(100px, 1fr) minmax(0, 1.5fr);
  min-width: 0;
  border: 1px solid #cbbda6;
  background: #fff8e9;
  color: #281b16;
}

.journal-card:is(:hover, :focus-visible) {
  border-color: #ad2920;
  color: #281b16;
}

.journal-art {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 170px;
  overflow: hidden;
  border-inline-end: 1px solid #cbbda6;
  background: radial-gradient(ellipse at 50% 42%, #f9edda, #eadac0);
}

.journal-card:nth-child(4n + 2) .journal-art,
.journal-card:nth-child(4n + 3) .journal-art {
  background: radial-gradient(ellipse at 50% 42%, #f7e5d6, #e0c7b2);
}

.journal-art::before {
  position: absolute;
  inset: 10px;
  border: 1px solid #87563540;
  content: '';
}

.journal-art .paper-art {
  width: min(75%, 180px);
  transform: rotate(-10deg);
  filter: drop-shadow(3px 4px 3px #51271538);
}

.journal-art > span {
  position: absolute;
  left: 18px;
  bottom: 14px;
  color: #704d37;
  font: 13px Georgia, serif;
  letter-spacing: .1em;
}

.journal-copy {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 9px;
  padding: clamp(14px, 2.2vw, 30px);
}

.journal-copy::before {
  position: absolute;
  inset: 0 0 auto auto;
  width: 4px;
  height: 42%;
  transform: scaleY(0);
  transform-origin: top;
  background: var(--red);
  content: '';
}

.journal-card:is(:hover, :focus-visible) .journal-copy::before { transform: scaleY(1); }

@media (prefers-reduced-motion: no-preference) {
  .journal-copy::before { transition: transform .28s cubic-bezier(.22, .7, .25, 1); }
}

.journal-category,
.journal-link {
  color: #91291f;
  font-size: 13px;
  font-weight: 700;
}

.journal-category {
  letter-spacing: .13em;
}

.journal-copy h3 {
  margin: 0;
  font-size: clamp(21px, 2.2vw, 31px);
  line-height: 1.28;
}

.journal-copy p {
  margin: 0;
  color: #6b5647;
  font-size: 14px;
  line-height: 1.65;
}

.journal-link {
  margin-top: 5px;
}

.journal-card:is(:hover, :focus-visible) .journal-link {
  text-decoration: underline;
  text-underline-offset: .24em;
}

@media (max-width: 950px) {
  .journal-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .journal-card {
    grid-template-columns: 1fr;
  }

  .journal-art {
    min-height: 145px;
    border-inline-end: 0;
    border-bottom: 1px solid #cbbda6;
  }

  .journal-art .paper-art {
    width: min(42%, 135px);
  }
}

</style>
