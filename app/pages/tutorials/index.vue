<script setup lang="ts">
import { starterModels } from '../../../shared/patterns'

interface TutorialSummary {
  id: string
  slug: string
  title: string
  summary: string
  steps: { title: string }[]
}

usePageMeta('渐进教程', '从一个圆孔开始，经过渐进练习，展开并保存你的第一张数字剪纸。')

const { data, pending, error, refresh } = await useFetch<TutorialSummary[]>('/api/tutorials')
const cover = { ...starterModels[2]!, color: '#e6aa73' }
</script>

<template>
  <div class="wrap page">
    <Breadcrumbs :items="[{ label: '渐进教程' }]" />
    <BrowseMasthead
      number="02"
      section="渐进教程"
      english="THE CUTTING LESSONS"
      title="先剪一小步。"
      description="从认识第一个切口，到展开一张属于自己的窗花。"
      stamp="折剪课"
      :model="cover"
      theme="ink"
    />

    <section aria-labelledby="lesson-collection">
      <div class="lesson-heading">
        <div>
          <span lang="en" aria-hidden="true">PRACTICE ROUTE</span>
          <h2 id="lesson-collection">剪纸练习路线</h2>
        </div>
        <NuxtLink class="text-link" to="/studio">直接进入工坊 <span aria-hidden="true">↗</span></NuxtLink>
      </div>

      <AsyncState :pending="pending" :error="error" :empty="!data?.length" @retry="refresh">
        <ol class="lesson-grid">
          <li v-for="(tutorial, index) in data" :key="tutorial.id" class="lesson-item">
            <NuxtLink :to="`/tutorials/${tutorial.slug}`" class="lesson-card">
              <div class="lesson-card-index">
                <span class="lesson-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="lesson-step-count">{{ tutorial.steps.length }} 个小步骤</span>
              </div>
              <div class="lesson-plate" aria-hidden="true">
                <PaperArt
                  :model="starterModels[index % starterModels.length]!"
                  :folded="index === 0"
                  :sectors="index === 1 ? 4 : 8"
                />
              </div>
              <div class="lesson-copy">
                <h3>{{ tutorial.title }}</h3>
                <p>{{ tutorial.summary }}</p>
                <span class="lesson-link">开始练习 <span aria-hidden="true">↗</span></span>
              </div>
            </NuxtLink>
          </li>
        </ol>
      </AsyncState>
    </section>
  </div>
</template>

<style scoped>
.lesson-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 8px 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #cbbda6;
}

.lesson-heading h2 {
  margin: 5px 0 0;
  font-size: clamp(26px, 3vw, 42px);
}

.lesson-heading > div > span {
  color: #765c4b;
  font: 13px Georgia, serif;
  letter-spacing: .12em;
}

.lesson-heading .text-link {
  gap: 9px;
  font-size: 14px;
}

.lesson-heading .text-link:is(:hover, :focus-visible) {
  text-decoration: underline;
  text-underline-offset: .2em;
}

.lesson-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, 2.4vw, 34px);
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.lesson-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #cbbda6;
  background: #fff8e9;
  color: #281b16;
}

.lesson-card:is(:hover, :focus-visible) {
  border-color: #ad2920;
  color: #281b16;
}

.lesson-card-index {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 18px;
  border-bottom: 1px solid #cbbda6;
}

.lesson-number {
  color: #91291f;
  font: 32px/1 Georgia, serif;
  letter-spacing: -.04em;
}

.lesson-step-count {
  color: #704d37;
  font-size: 13px;
  letter-spacing: .08em;
}

.lesson-plate {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 150px;
  aspect-ratio: 1.65;
  overflow: hidden;
  isolation: isolate;
  border-bottom: 1px solid #cbbda6;
  background: repeating-linear-gradient(0deg, #8b624319 0 1px, transparent 1px 20px),
    repeating-linear-gradient(90deg, #8b624319 0 1px, transparent 1px 20px),
    #eadbc2;
}

.lesson-plate::before {
  position: absolute;
  z-index: -1;
  width: min(53%, 180px);
  aspect-ratio: 1;
  border: 1px dashed #8b624366;
  border-radius: 50%;
  content: '';
}

.lesson-plate .paper-art {
  width: min(55%, 182px);
  filter: drop-shadow(3px 5px 2px #5b31192e);
  rotate: -10deg;
  transition: rotate .4s cubic-bezier(.22, .7, .25, 1);
}

.lesson-item:first-child .paper-art {
  translate: -16% -4%;
}

.lesson-card:is(:hover, :focus-visible) .paper-art {
  rotate: 0deg;
}

.lesson-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: clamp(16px, 2.3vw, 30px);
}

.lesson-copy h3 {
  margin: 0;
  font-size: clamp(23px, 2.7vw, 35px);
}

.lesson-copy p {
  margin: 0;
  color: #6b5647;
  font-size: 14px;
}

.lesson-link {
  display: inline-flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 8px;
  color: #91291f;
  font-size: 14px;
  font-weight: 700;
}

.lesson-card:is(:hover, :focus-visible) .lesson-link {
  text-decoration: underline;
  text-underline-offset: .2em;
}

@media (max-width: 760px) {
  .lesson-grid {
    grid-template-columns: 1fr;
  }

  .lesson-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  }

  .lesson-card-index {
    grid-column: 1 / -1;
  }

  .lesson-plate {
    aspect-ratio: auto;
    border-inline-end: 1px solid #cbbda6;
    border-bottom: 0;
  }

  .lesson-plate .paper-art,
  .lesson-plate::before {
    width: min(77%, 160px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lesson-card:is(:hover, :focus-visible) .paper-art {
    rotate: -10deg;
  }
}
</style>
