<script setup lang="ts">
import { blankModel, cutPath, type CutType, type PaperModel } from '../../../shared/model'

interface TutorialSummary {
  id: string
  slug: string
  title: string
  summary: string
  steps: { title: string }[]
}

usePageMeta('渐进教程', '从认识折痕与切口，到展开并保存自己的第一张数字剪纸。')

const { data, pending, error, refresh } = await useFetch<TutorialSummary[]>('/api/tutorials')
const firstLesson = computed(() => data.value?.[0])
const shapes = [
  { type: 'circle', label: '圆形' },
  { type: 'drop', label: '水滴' },
  { type: 'triangle', label: '三角形' },
] as const
const shape = ref<CutType>('circle')
const shapeLabel = computed(() => shapes.find(option => option.type === shape.value)?.label)
const foldSteps = [
  { name: '折好纸角', sectors: 1, note: '整张纸折成 45°，先看手里这一角。' },
  { name: '剪下一刀', sectors: 1, note: '在叠好的纸上剪出一个孔。' },
  { name: '翻开一折', sectors: 2, note: '切口沿折线镜像，留白成双。' },
  { name: '再翻一折', sectors: 4, note: '两片再成四片，留白继续向外铺开。' },
  { name: '八瓣摊开', sectors: 8, note: '一刀留八处空白，合成完整窗花。' },
] as const
const level = ref(4)
const step = computed(() => foldSteps[level.value]!)
const playing = ref(false)
let frames: ReturnType<typeof setTimeout>[] = []
let motionPreference: MediaQueryList | undefined
const foldedPaper = blankModel()
const sampleCut = { id: 'example', x: 62, y: 25, size: 9, aspect: 1, angle: 0 }
const cutPaper = computed<PaperModel>(() => ({
  ...foldedPaper,
  cuts: [{ ...sampleCut, type: shape.value }],
}))

function stopDemo() {
  frames.forEach(clearTimeout)
  frames = []
  playing.value = false
}

function playDemo() {
  if (playing.value) {
    stopDemo()
    return
  }
  if (motionPreference?.matches) {
    level.value = level.value === 4 ? 0 : 4
    return
  }
  level.value = 0
  playing.value = true
  frames = [500, 1000, 1480, 1960].map((delay, index) => setTimeout(() => {
    level.value = index + 1
    if (level.value === 4) stopDemo()
  }, delay))
}

function chooseShape(type: CutType) {
  stopDemo()
  shape.value = type
  if (level.value === 0) level.value = 1
}

function motionChanged(event: MediaQueryListEvent) {
  if (!event.matches || !playing.value) return
  stopDemo()
  level.value = 4
}

onMounted(() => {
  motionPreference = matchMedia('(prefers-reduced-motion: reduce)')
  motionPreference.addEventListener('change', motionChanged)
})
onBeforeUnmount(() => {
  stopDemo()
  motionPreference?.removeEventListener('change', motionChanged)
})
</script>

<template>
  <div class="page tutorial-page">
    <header class="tutorial-room" aria-labelledby="tutorial-title">
      <PaperRoomLight />
      <div class="wrap tutorial-breadcrumbs"><Breadcrumbs :items="[{ label: '渐进教程' }]" /></div>
      <div class="wrap tutorial-opening">
        <div class="tutorial-intro">
          <p class="tutorial-kicker"><span aria-hidden="true">02</span> 渐进教程</p>
          <h1 id="tutorial-title">从一刀<br class="title-break" />到一朵<span>。</span></h1>
          <p class="tutorial-lead">折住一角，剪出一点留白。<br />打开纸面，看看它如何长成一朵花。</p>
          <div class="tutorial-actions">
            <NuxtLink
              v-if="firstLesson"
              class="btn primary"
              :to="'/tutorials/' + firstLesson.slug"
            >
              读第一课 <span aria-hidden="true">↗</span>
            </NuxtLink>
            <NuxtLink v-else class="btn primary" :to="{ path: '/tutorials', hash: '#lesson-collection' }">
              查看练习 <span aria-hidden="true">↓</span>
            </NuxtLink>
            <NuxtLink class="text-link" to="/studio">直接进入工坊 <span aria-hidden="true">↗</span></NuxtLink>
          </div>
        </div>

        <figure class="fold-sheet" aria-labelledby="fold-diagram">
          <figcaption class="sheet-heading">
            <div>
              <p>数字剪纸示意 · 01</p>
              <h2 id="fold-diagram">把一刀摊开。</h2>
            </div>
            <button type="button" class="fold-play" aria-controls="fold-stage" @click="playDemo">
              <span aria-hidden="true">{{ playing ? 'Ⅱ' : '▷' }}</span>
              {{ playing ? '停在这一折' : '演示一刀' }}
            </button>
          </figcaption>

          <div
            id="fold-stage"
            class="fold-stage"
            :class="{ 'single-sector': step.sectors === 1, unfolding: level > 1 }"
            :data-fold-level="level"
          >
            <span class="fold-paper-layers" aria-hidden="true" />
            <span class="fold-sector-count" aria-hidden="true"><strong>{{ step.sectors }}</strong><span> / 8 纸面</span></span>
            <span class="fold-stage-angle" aria-hidden="true">45°</span>
            <div class="fold-diagram-paper" aria-hidden="true">
              <PaperArt :model="level === 0 ? foldedPaper : cutPaper" :sectors="step.sectors" />
            </div>
          </div>

          <div class="fold-readout">
            <strong>{{ step.name }}</strong>
            <span>{{ step.note }}</span>
          </div>

          <div class="fold-controls">
            <label class="fold-scrub">
              <span>拖动看折展</span>
              <input
                v-model.number="level"
                type="range"
                min="0"
                max="4"
                step="1"
                :aria-valuetext="step.name + '，' + step.sectors + ' 个扇区'"
                aria-controls="fold-stage"
                @input="stopDemo"
              />
              <span class="fold-scale" aria-hidden="true"><span>折纸</span><span>展开</span></span>
            </label>

            <fieldset class="shape-samples">
              <legend>换一个切口</legend>
              <div class="shape-buttons">
                <button
                  v-for="option in shapes"
                  :key="option.type"
                  type="button"
                  :aria-pressed="shape === option.type"
                  @click="chooseShape(option.type)"
                >
                  <svg viewBox="-10 -10 20 20" aria-hidden="true">
                    <path :d="cutPath({ ...sampleCut, type: option.type })" />
                  </svg>
                  {{ option.label }}
                </button>
              </div>
            </fieldset>
          </div>
          <span class="sr-only" role="status">{{ playing ? '正在演示折剪' : step.name + '，当前切口为' + shapeLabel }}</span>
        </figure>
      </div>
    </header>

    <section class="wrap" aria-labelledby="lesson-collection">
      <div class="lesson-heading">
        <span aria-hidden="true">折剪笔记</span>
        <h2 id="lesson-collection" tabindex="-1">剪纸练习路线</h2>
      </div>

      <AsyncState :pending="pending" :error="error" :empty="!data?.length" @retry="refresh">
        <ol class="lesson-list">
          <li v-for="(tutorial, index) in data" :key="tutorial.id">
            <NuxtLink :to="'/tutorials/' + tutorial.slug" class="lesson-row">
              <span class="lesson-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
              <div class="lesson-copy">
                <h3>{{ tutorial.title }}</h3>
                <p>{{ tutorial.summary }}</p>
              </div>
              <span class="lesson-step-count">{{ tutorial.steps.length }} 步</span>
              <span class="lesson-link">开始练习 <span aria-hidden="true">↗</span></span>
            </NuxtLink>
          </li>
        </ol>
      </AsyncState>
    </section>
  </div>
</template>

<style scoped>
.tutorial-page {
  --mat-ink: #37261e;
  --mat-rule: #a6987a;
  --mat-red: #a13125;
  padding-top: 0;
}

.tutorial-room {
  --room-glow: #fff6debe;
  --room-beam: #fff5deab;
  --room-mullion: #9573502a;
  --room-edge: #a5794f33;
  position: relative;
  isolation: isolate;
  overflow: clip;
  margin-bottom: clamp(30px, 5.4vw, 76px);
  padding-block: clamp(15px, 2vw, 28px) clamp(28px, 4vw, 60px);
  border-bottom: 1px solid #ae906b;
  background:
    repeating-linear-gradient(110deg, transparent 0 4px, #a2734411 5px, transparent 6px 9px),
    linear-gradient(142deg, #fff6df, #f3e2bd 50%, #d4ae7d);
}

.tutorial-room::after {
  position: absolute;
  z-index: -1;
  inset: -28% -16% -19% 49%;
  border: 1px solid #fff5d9;
  background: linear-gradient(112deg, #fff8e2c4 44%, #f8e7c179 44.2%, #fff4d890 72%);
  box-shadow: 14px 23px 55px #83523341;
  transform: rotate(-10deg) skewX(-12deg);
  pointer-events: none;
  content: '';
}

.tutorial-breadcrumbs { color: #614833; }

.tutorial-opening {
  display: grid;
  grid-template-columns: minmax(0, .77fr) minmax(0, 1.43fr);
  gap: clamp(22px, 4.8vw, 70px);
  align-items: center;
  margin-top: clamp(17px, 3.7vw, 52px);
}

.tutorial-intro {
  padding-block: clamp(16px, 3vw, 36px);
}

.tutorial-kicker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  color: var(--mat-red);
  font-size: 13px;
  letter-spacing: .14em;
}

.tutorial-kicker span {
  padding-right: 12px;
  border-right: 1px solid currentColor;
  font: italic 19px Georgia, serif;
}

.tutorial-intro h1 {
  margin: .2em 0;
  color: var(--mat-ink);
  font-size: clamp(51px, 7.75vw, 114px);
  line-height: .97;
  letter-spacing: -.075em;
}

.tutorial-intro h1 span { color: var(--mat-red); }
.tutorial-lead { margin: 1.2em 0 1em; color: #634a37; }
.tutorial-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 17px; }
.tutorial-actions .text-link { gap: 4px; font-size: 14px; }
.tutorial-actions .text-link:is(:hover, :focus-visible) { text-decoration: underline; }

.fold-sheet {
  position: relative;
  min-width: 0;
  margin: 0;
  padding: clamp(11px, 1.6vw, 23px);
  border: 1px solid #ad845c;
  background:
    repeating-linear-gradient(113deg, transparent 0 5px, #8469400b 6px, transparent 7px 10px),
    linear-gradient(141deg, #fff9e8f7, #f8e7cbe8);
  box-shadow: inset 0 0 0 3px #fff8e7c9, 4px 5px 0 -1px #eccea6, 4px 5px 0 #b98e63, 8px 9px 0 -1px #d9b788, 8px 9px 0 #ad825b, 19px 24px 32px -18px #7e523096;
  color: var(--mat-ink);
}

.sheet-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 9px;
  padding-bottom: 12px;
}

.sheet-heading p { margin: 0; color: #905434; font-size: 11px; letter-spacing: .13em; }
.sheet-heading h2 { margin: .18em 0 0; font-size: clamp(23px, 3vw, 40px); }
.fold-play {
  padding-inline: clamp(6px, 1.3vw, 14px);
  border-color: #b47b55;
  background: #fff6e3;
  color: #8a3527;
  font-size: clamp(12px, 1.1vw, 14px);
  font-weight: 700;
  white-space: nowrap;
}
.fold-play:hover { background: #a13125; color: #fff8eb; }
.fold-play span { margin-inline-end: .18em; }
.fold-sheet :focus-visible { outline-color: #873b26; }

.fold-stage {
  position: relative;
  display: grid;
  place-items: center;
  height: clamp(200px, 28vw, 401px);
  overflow: hidden;
  isolation: isolate;
  border: 1px solid #bd9771;
  background:
    repeating-linear-gradient(90deg, #99654112 0 1px, transparent 1px 15px),
    repeating-linear-gradient(0deg, #99654112 0 1px, transparent 1px 15px),
    radial-gradient(ellipse at 52% 36%, #ffedc2, #e1bf91 68%, #cfa476);
  color: #674737;
}

.fold-stage::before {
  position: absolute;
  z-index: -1;
  height: 82%;
  aspect-ratio: 1;
  border: 1px dashed #a1744ba0;
  border-radius: 50%;
  box-shadow: 0 0 0 8px #bc926425;
  background: repeating-conic-gradient(from -9deg, transparent 0 44.6deg, #9c6e483d 44.7deg 45deg);
  content: '';
}

.fold-paper-layers {
  position: absolute;
  z-index: -2;
  inset: 5% 17% 5% 17%;
  border: 1px solid #fffbec;
  background: radial-gradient(ellipse at 33% 30%, #fffae8, #f7dfb7cc 81%);
  box-shadow: 8px 7px 0 -1px #f2d4a6a8, 8px 7px 0 #e1b889, 17px 18px 21px #8b5d3857;
  transform: rotate(-6deg);
}

.fold-paper-layers::after {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(45deg, transparent 49.65%, #bc93674a 49.8%, #fffbe9b0 50.05%, transparent 50.25%),
    linear-gradient(-45deg, transparent 49.65%, #bc93674a 49.8%, #fffbe9b0 50.05%, transparent 50.25%),
    linear-gradient(90deg, transparent 49.65%, #bc93674a 49.8%, #fffbe9b0 50.05%, transparent 50.25%);
  content: '';
}

.fold-stage-angle {
  position: absolute;
  right: 4%;
  bottom: 4%;
  color: #805038;
  font: italic clamp(14px, 2vw, 28px)/1 Georgia, serif;
}

.fold-sector-count {
  position: absolute;
  z-index: 1;
  inset: 9px auto auto clamp(10px, 1.8vw, 22px);
  display: grid;
  line-height: 1;
}
.fold-sector-count strong { color: #96362b; font: 400 clamp(31px, 5vw, 65px)/1 Georgia, serif; }
.fold-sector-count span { margin-top: 3px; font-size: 10px; letter-spacing: .07em; }
.fold-diagram-paper { position: absolute; inset: 0; }
.fold-diagram-paper .paper-art {
  position: absolute;
  top: 50%;
  left: 50%;
  width: auto;
  height: 92%;
  max-width: 90%;
  transform: translate(-50%, -50%) rotate(-8deg);
  filter: drop-shadow(3px 10px 5px #6a3b2959);
}
.single-sector .fold-diagram-paper .paper-art {
  height: 127%;
  max-width: 115%;
  transform: translate(-72%, -50%) rotate(-22.5deg);
}

.fold-readout {
  display: flex;
  align-items: baseline;
  gap: 6px 13px;
  min-height: 40px;
  padding-block: 8px;
  border-bottom: 1px solid #c4a783;
  color: #664733;
  font-size: 13px;
  line-height: 1.35;
}
.fold-readout strong { flex: none; color: #883825; font: 700 17px/1.3 var(--serif); }

.fold-controls {
  display: grid;
  grid-template-columns: minmax(0, .8fr) minmax(0, 1fr);
  gap: 10px clamp(9px, 2vw, 26px);
  padding-top: 9px;
}

.fold-scrub { display: grid; font-size: 12px; font-weight: 700; }
.fold-scrub input { width: 100%; height: 40px; min-height: 40px; margin: 0; padding: 0; accent-color: #a13125; background: transparent; }
.fold-scale { display: flex; justify-content: space-between; color: #714a31; font-size: 10px; font-weight: 400; }

.shape-samples { min-inline-size: 0; margin: 0; padding: 0; border: 0; }
.shape-samples legend { padding: 0; font-size: 12px; font-weight: 700; }
.shape-buttons { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; margin-top: 4px; }
.shape-buttons button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 2px;
  border-color: #b99a75;
  background: #fff6e3;
  color: #342d26;
  font-size: 13px;
  white-space: nowrap;
}

.shape-buttons svg { width: 11px; height: 11px; fill: var(--mat-red); }
.shape-buttons button:hover { background: #fff0d3; }
.shape-buttons button[aria-pressed="true"] { border-color: #f5bf97; background: #9d382e; color: #fff6e7; }
.shape-buttons button[aria-pressed="true"] svg { fill: #fff3d8; }

.lesson-heading { display: grid; gap: 4px; padding-bottom: 14px; border-bottom: 1px solid var(--mat-rule); }
.lesson-heading span { color: var(--mat-red); font-size: 12px; letter-spacing: .16em; }
.lesson-heading h2 { margin: 0; color: var(--mat-ink); }
.lesson-list { margin: 0; padding: 0; list-style: none; }
.lesson-list li { border-bottom: 1px solid #b7ac95; }

.lesson-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: clamp(12px, 3.3vw, 50px);
  padding: clamp(14px, 1.9vw, 27px) clamp(5px, 1.5vw, 20px);
}

.lesson-number { color: var(--mat-red); font: italic clamp(24px, 3.9vw, 55px)/1 Georgia, serif; }
.lesson-copy h3 { margin: 0 0 5px; color: var(--mat-ink); font-size: clamp(20px, 2.8vw, 37px); }
.lesson-copy p { margin: 0; color: #5f594d; font-size: 14px; }
.lesson-step-count { color: #514a3c; font-size: 13px; white-space: nowrap; }
.lesson-link { color: var(--mat-red); font-size: 14px; white-space: nowrap; }
.lesson-row:is(:hover, :focus-visible) { background: #f1e1c4; }
.lesson-row:is(:hover, :focus-visible) .lesson-link { text-decoration: underline; text-underline-offset: .2em; }

@media (prefers-reduced-motion: no-preference) {
  .fold-diagram-paper .paper-art { transition: transform .3s ease-out, height .3s ease-out; }
  .fold-paper-layers { transition: transform .5s cubic-bezier(.23,.63,.2,1); }
  .single-sector .fold-paper-layers { transform: rotate(-9deg) scale(.94); }
  .fold-stage::after {
    position: absolute;
    z-index: 2;
    inset: 0 -40%;
    pointer-events: none;
    background: linear-gradient(121deg, transparent 43%, #fff7df6b 49%, transparent 57%);
    animation: sheet-light 1.45s .16s ease-out both;
    content: '';
  }

  @keyframes sheet-light {
    0% { opacity: 0; transform: translateX(-26%); }
    28% { opacity: .75; }
    100% { opacity: 0; transform: translateX(30%); }
  }
}

@media (max-width: 700px) {
  .tutorial-opening { grid-template-columns: 1fr; }
  .title-break { display: none; }
  .tutorial-intro { border-bottom: 0; padding-bottom: 0; }
  .tutorial-intro h1 { font-size: clamp(46px, 10vw, 83px); }
}

@media (max-width: 540px) {
  .tutorial-opening { gap: 13px; margin-top: 16px; }
  .tutorial-intro { padding-top: 10px; }
  .tutorial-intro h1 { font-size: clamp(37px, 10vw, 52px); }
  .fold-stage { height: clamp(158px, 49vw, 220px); }
  .tutorial-lead { margin: 10px 0; }
  .tutorial-lead br { display: none; }
  .tutorial-actions .btn { font-size: 14px; padding-inline: 10px; gap: 9px; }
  .tutorial-actions { gap: 4px 10px; }
  .sheet-heading { padding-bottom: 8px; }
  .fold-readout { gap: 6px; font-size: 12px; }
  .fold-readout strong { font-size: 14px; }
  .shape-buttons svg { display: none; }
  .shape-buttons button { font-size: 12px; }
  .lesson-row { grid-template-columns: auto minmax(0, 1fr) auto; gap: 5px 10px; }
  .lesson-step-count { grid-column: 2; grid-row: 2; }
  .lesson-link { grid-column: 3; grid-row: 2; }
  .lesson-copy { grid-column: 2 / -1; }
}
</style>
