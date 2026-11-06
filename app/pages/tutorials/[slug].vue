<script setup lang="ts">
interface Tutorial {
  slug: string
  title: string
  summary: string
  steps: { title: string; text: string }[]
}

const route = useRoute()
const slug = encodeURIComponent(String(route.params.slug))
const { data: tutorial, pending, error, refresh } = await useFetch<Tutorial>(`/api/tutorials/${slug}`)
if (error.value?.statusCode === 404) throw createError({ statusCode: 404, message: '教程尚未公开。' })
usePageMeta(() => tutorial.value?.title || '渐进教程', () => tutorial.value?.summary || '剪纸入门练习')
</script>

<template>
  <div class="wrap page lesson-detail">
    <Breadcrumbs :items="[{ label: '渐进教程', to: '/tutorials' }, { label: tutorial?.title || '教程' }]" />
    <AsyncState :pending="pending" :error="error" @retry="refresh">
      <article v-if="tutorial" aria-labelledby="lesson-title">
        <header class="page-heading lesson-heading">
          <p class="eyebrow">02 / 渐进教程 <span>· {{ tutorial.steps.length }} 步练习</span></p>
          <h1 id="lesson-title">{{ tutorial.title }}</h1>
          <p>{{ tutorial.summary }}</p>
        </header>
        <div class="lesson-layout">
          <ol class="lesson-steps" aria-label="练习步骤">
            <li v-for="(step, index) in tutorial.steps" :key="index">
              <span class="step-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <h2>{{ step.title }}</h2>
                <p>{{ step.text }}</p>
              </div>
            </li>
          </ol>
          <aside class="article-cta lesson-action" aria-label="工坊练习">
            <h2>现在，动手试一试。</h2>
            <p>每完成一步，工坊会解锁下一步。练习进度保存在当前访客的纸笺中。</p>
            <NuxtLink class="btn primary" :to="{ path: '/studio', query: { tutorial: tutorial.slug } }">
              带着教程进入工坊 <span aria-hidden="true">↗</span>
            </NuxtLink>
          </aside>
        </div>
        <NuxtLink class="text-link" to="/tutorials">← 看看其他练习</NuxtLink>
      </article>
    </AsyncState>
  </div>
</template>

<style scoped>
.lesson-detail { max-width: 1120px; }
.lesson-heading {
  margin: clamp(22px, 3.5vw, 48px) 0 24px;
  padding: clamp(22px, 4vw, 52px) 0 clamp(24px, 4vw, 46px);
  border-block: 1px solid var(--line);
}
.lesson-heading .eyebrow { color: var(--red); margin: 0; font-weight: 700; }
.lesson-heading .eyebrow span { color: var(--muted); }
.lesson-heading h1 { font-size: clamp(34px, 5.4vw, 76px); overflow-wrap: anywhere; }
.lesson-heading p:last-child { margin: 0; font-size: clamp(16px, 1.55vw, 21px); }
.lesson-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(250px, 1fr);
  gap: 24px clamp(24px, 5vw, 72px);
  align-items: start;
  margin-bottom: 16px;
}
.lesson-steps { margin: 0; }
.lesson-steps li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: clamp(14px, 2vw, 26px);
  margin: 0;
  padding: 21px 0;
}
.lesson-steps li:first-child { padding-top: 0; }
.step-number {
  display: grid;
  place-items: center;
  width: clamp(36px, 4vw, 50px);
  aspect-ratio: 1;
  border: 1px solid var(--line);
  color: var(--red);
  font: clamp(16px, 2vw, 22px) Georgia, serif;
  font-variant-numeric: tabular-nums;
}
.lesson-steps h2, .lesson-action h2 { margin: 0 0 5px; font-size: clamp(22px, 2.6vw, 32px); }
.lesson-steps p, .lesson-action p { margin: 0; color: var(--muted); }
.lesson-action { margin: 0; background: #ecdfc8; padding: clamp(18px, 3vw, 30px); }
.lesson-action p { margin: 10px 0 16px; }
.lesson-action .btn { justify-content: space-between; width: 100%; }

@media (max-width: 760px) {
  .lesson-layout { grid-template-columns: 1fr; }
  .lesson-steps li { padding: 16px 0; }
}
</style>
