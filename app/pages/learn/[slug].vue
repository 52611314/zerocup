<script setup lang="ts">
interface ArticleLink {
  slug: string
  title: string
}

interface Article {
  title: string
  summary: string
  category: string
  pattern_id: string | null
  body: { heading: string; text: string }[]
  sources: { url: string; title: string }[]
  previous: ArticleLink | null
  next: ArticleLink | null
}

const route = useRoute()
const learnHref = useBrowseReturn('/learn')
const slug = encodeURIComponent(String(route.params.slug))
const { data: article, pending, error, refresh } = await useFetch<Article>(`/api/articles/${slug}`)
if (error.value?.statusCode === 404) throw createError({ statusCode: 404, message: '这篇纸上札记尚未公开。' })
usePageMeta(() => article.value?.title || '纸上札记', () => article.value?.summary || '剪纸文化与创作札记')
</script>

<template>
  <div class="wrap page journal-detail">
    <Breadcrumbs :items="[{ label: '纸上学堂', to: learnHref }, { label: article?.title || '纸上札记' }]" />
    <AsyncState :pending="pending" :error="error" @retry="refresh">
      <article v-if="article" class="article-layout" aria-labelledby="journal-title">
        <header class="journal-heading">
          <p class="eyebrow">01 / 纸上札记 <span>· {{ article.category }}</span></p>
          <h1 id="journal-title">{{ article.title }}</h1>
          <p class="article-lead">{{ article.summary }}</p>
        </header>
        <nav v-if="article.body.length" class="article-toc" aria-label="札记目录">
          <span class="eyebrow">本页目录</span>
          <ol>
            <li v-for="(section, index) in article.body" :key="index">
              <NuxtLink
                :to="{ path: route.path, query: route.query, hash: `#section-${index}` }"
                :aria-current="route.hash === `#section-${index}` ? 'location' : undefined"
              >
                <span aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
                {{ section.heading }}
              </NuxtLink>
            </li>
          </ol>
        </nav>
        <div class="article-main">
          <section
            v-for="(section, index) in article.body"
            :id="`section-${index}`"
            :key="index"
            class="article-section"
            :class="{ 'article-section-target': route.hash === `#section-${index}` }"
            tabindex="-1"
          >
            <span class="journal-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            <div>
              <h2>{{ section.heading }}</h2>
              <p>{{ section.text }}</p>
            </div>
          </section>
          <section v-if="article.sources.length" class="sources">
            <h2>循着来源，继续读</h2>
            <p>正文由项目整理。文化事实参考以下资料。</p>
            <ul>
              <li v-for="source in article.sources" :key="source.url">
                <a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.title }} <span aria-hidden="true">↗</span></a>
              </li>
            </ul>
          </section>
          <div class="article-cta">
            <h2>把读到的，变成一朵花。</h2>
            <div class="journal-actions">
              <NuxtLink class="btn primary" :to="{ path: '/studio', query: article.pattern_id ? { pattern: article.pattern_id } : {} }">
                {{ article.pattern_id ? '用此纹样开始' : '进入剪纸工坊' }} <span aria-hidden="true">↗</span>
              </NuxtLink>
              <NuxtLink to="/tutorials" class="text-link">跟着教程试一试 <span aria-hidden="true">→</span></NuxtLink>
            </div>
          </div>
          <nav v-if="article.previous || article.next" class="article-pagination" aria-label="相邻札记">
            <NuxtLink v-if="article.previous" :to="`/learn/${article.previous.slug}`">
              <small>← 上一篇</small>{{ article.previous.title }}
            </NuxtLink>
            <NuxtLink v-if="article.next" class="journal-next" :to="`/learn/${article.next.slug}`">
              <small>下一篇 →</small>{{ article.next.title }}
            </NuxtLink>
          </nav>
        </div>
      </article>
    </AsyncState>
  </div>
</template>

<style scoped>
.journal-detail { max-width: 1120px; }
.article-layout {
  grid-template-columns: minmax(145px, 1fr) minmax(0, 3.5fr);
  column-gap: clamp(25px, 5vw, 70px);
  row-gap: 24px;
  margin-top: clamp(22px, 3.5vw, 48px);
}

.journal-heading {
  grid-column: 1 / -1;
  padding: clamp(22px, 4vw, 52px) 0 clamp(24px, 4vw, 46px);
  border-block: 1px solid var(--line);
}

.journal-heading .eyebrow { margin: 0; font-weight: 700; }
.journal-heading .eyebrow span { color: var(--muted); }
.journal-heading h1 { font-size: clamp(34px, 5.4vw, 76px); overflow-wrap: anywhere; }
.journal-heading .article-lead { max-width: 38em; margin: 0; font-size: clamp(16px, 1.55vw, 21px); }
.article-main { grid-column: 2; min-width: 0; }

.article-toc {
  display: block;
  position: sticky;
  top: 24px;
  border-left: 1px solid var(--line);
  padding-left: 15px;
}

.article-toc ol { list-style: none; margin: 8px 0 0; padding: 0; }
.article-toc a { display: flex; gap: 8px; align-items: baseline; margin: 0; padding: 6px 0; font-size: 14px; }
.article-toc a[aria-current="location"] { color: var(--red); text-decoration: underline; text-underline-offset: .25em; }
.article-toc a span, .journal-number { color: var(--red); font: 14px Georgia, serif; font-variant-numeric: tabular-nums; }

.article-section {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: clamp(12px, 2.3vw, 30px);
  scroll-margin-top: 22px;
  margin: 0;
  padding: clamp(18px, 3vw, 33px) 0;
  border-bottom: 1px solid var(--line);
}

.article-section-target {
  border-bottom-color: var(--red);
}

.article-section-target h2 { color: var(--red); }

@media (prefers-reduced-motion: no-preference) {
  .article-section-target::after {
    position: absolute;
    inset: auto 0 -1px;
    height: 1px;
    background: var(--red);
    transform-origin: left;
    animation: mark-passage .42s ease-out both;
    content: '';
  }

  .article-section-target { border-bottom-color: var(--line); }

  @keyframes mark-passage {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
}

.article-section:first-child { padding-top: 0; }
.journal-number { margin-top: .35em; font-size: clamp(18px, 2vw, 25px); }
.article-section h2, .sources h2, .article-cta h2 { margin: 0 0 .45em; font-size: clamp(23px, 3.1vw, 37px); }
.article-section p { max-width: 48em; margin: 0; line-height: 1.9; overflow-wrap: anywhere; }
.sources, .article-cta { margin: 22px 0 0; padding: clamp(18px, 3vw, 30px); }
.sources { border: 1px solid var(--line); background: transparent; }
.sources p { color: var(--muted); margin: 0 0 8px; }
.sources ul { margin: 0; padding-left: 1.15em; }
.sources a { display: inline-block; margin: 4px 0; overflow-wrap: anywhere; text-underline-offset: .2em; }
.article-cta { background: #ecdfc8; }
.journal-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 16px; }
.journal-actions .text-link { gap: 5px; }
.article-pagination { align-items: start; }
.article-pagination small { color: var(--red); }
.journal-next { margin-left: auto; text-align: right; }

@media (max-width: 760px) {
  .article-layout { grid-template-columns: 1fr; gap: 20px; }
  .article-main { grid-column: 1; }
  .article-toc { position: static; }
  .article-toc ol { display: flex; flex-wrap: wrap; gap: 0 15px; }
}
</style>
