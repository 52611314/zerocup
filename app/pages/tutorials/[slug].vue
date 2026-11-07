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
          <div>
            <p class="eyebrow">02 / 渐进教程 <span>· {{ tutorial.steps.length }} 步练习</span></p>
            <h1 id="lesson-title">{{ tutorial.title }}</h1>
            <p class="lesson-summary">{{ tutorial.summary }}</p>
          </div>
          <div class="lesson-action">
            <span class="action-label">练习签 <span aria-hidden="true">◆</span></span>
            <p>准备好了，就把这份练习带到纸面上。</p>
            <NuxtLink class="btn primary" :to="{ path: '/studio', query: { tutorial: tutorial.slug } }">
              带着教程进入工坊 <span aria-hidden="true">↗</span>
            </NuxtLink>
          </div>
        </header>
        <section class="lesson-layout" aria-labelledby="lesson-sequence">
          <header class="lesson-index">
            <p class="eyebrow">折剪笔记</p>
            <h2 id="lesson-sequence">练习步骤</h2>
            <p>每完成一步，工坊会解锁下一步。练习进度保存在当前访客的纸笺中。</p>
          </header>
          <ol class="lesson-steps" aria-label="练习步骤">
            <li v-for="(step, index) in tutorial.steps" :key="index">
              <span class="step-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <h3>{{ step.title }}</h3>
                <p>{{ step.text }}</p>
              </div>
            </li>
          </ol>
        </section>
        <NuxtLink class="text-link" to="/tutorials">← 看看其他练习</NuxtLink>
      </article>
    </AsyncState>
  </div>
</template>

<style scoped>
.lesson-detail { max-width: 1120px; --lesson-ink: #29372e; }
.lesson-heading {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(220px, 1fr);
  gap: clamp(16px, 3vw, 40px);
  align-items: end;
  margin: clamp(22px, 3.5vw, 48px) 0 clamp(23px, 3.8vw, 52px);
  padding: clamp(22px, 4vw, 52px) 0 clamp(24px, 4vw, 46px);
  border-block: 1px solid var(--line);
}
.lesson-heading .eyebrow { color: var(--red); margin: 0; font-weight: 700; }
.lesson-heading .eyebrow span { color: var(--muted); }
.lesson-heading h1 { color: var(--lesson-ink); font-size: clamp(36px, 6vw, 84px); overflow-wrap: anywhere; }
.lesson-summary { margin: 0; color: var(--muted); font-size: clamp(16px, 1.55vw, 21px); }
.lesson-layout {
  display: grid;
  grid-template-columns: minmax(170px, .64fr) minmax(0, 1.36fr);
  gap: 24px clamp(24px, 5vw, 72px);
  align-items: start;
  margin-bottom: 16px;
}
.lesson-index .eyebrow { margin: 0; }
.lesson-index h2 { margin: .3em 0; color: var(--lesson-ink); }
.lesson-index p:last-child { margin: 0; color: var(--muted); }
.lesson-steps { margin: 0; border-top: 1px solid var(--line); }
.lesson-steps li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: clamp(14px, 2vw, 26px);
  margin: 0;
  padding: 21px clamp(7px, 1.5vw, 18px);
  background: #fff8e96b;
}
.step-number {
  display: grid;
  place-items: center;
  width: clamp(36px, 4vw, 50px);
  aspect-ratio: 1;
  align-self: start;
  border-bottom: 1px solid var(--red);
  color: var(--red);
  font: italic clamp(21px, 2.5vw, 34px) Georgia, serif;
  font-variant-numeric: tabular-nums;
}
.lesson-steps h3 { margin: 0 0 5px; color: var(--lesson-ink); font-size: clamp(21px, 2.6vw, 32px); }
.lesson-steps p { margin: 0; color: var(--muted); }
.lesson-action {
  position: relative;
  max-width: 340px;
  padding: clamp(13px, 2.4vw, 24px);
  border-top: 2px solid #bd946b;
  background:
    repeating-linear-gradient(116deg, transparent 0 6px, #e7d7a90b 6px 7px),
    #2b4137;
  color: #f9e4c4;
}
.action-label {
  display: flex;
  justify-content: space-between;
  padding-bottom: 4px;
  border-bottom: 1px solid #c39c7291;
  color: #e9bd92;
  font-size: 11px;
  letter-spacing: .15em;
}
.lesson-action p { margin: 8px 0 9px; font-size: 14px; }
.lesson-action .btn {
  justify-content: space-between;
  width: 100%;
  border-color: #eed5ad;
  background: #f7e4c6;
  color: #633122;
  text-align: left;
}
.lesson-action .btn:hover { background: #ffefd3; }
.lesson-action .btn:focus-visible { outline-color: #ffdbac; }

@media (max-width: 700px) {
  .lesson-heading, .lesson-layout { grid-template-columns: 1fr; }
  .lesson-steps li { padding: 16px 0; }
}
</style>
