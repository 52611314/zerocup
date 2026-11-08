<script setup lang="ts">
import { SECTOR_PATH } from '../../../shared/model'
import { LEARN_WINDOW_MODEL, patternNames, starterModels } from '../../../shared/patterns'

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
const hasFilters = computed(() => Boolean(search.value || category.value))
const specimens = [
  { name: patternNames[6]!, model: LEARN_WINDOW_MODEL, hint: '顺着斜排的水滴看，长短切口一圈圈连成花瓣。' },
  { name: patternNames[5]!, model: starterModels[5]!, hint: '三角尖随着折线镜像，围出朝向不同的星芒。' },
  { name: patternNames[3]!, model: starterModels[3]!, hint: '沿着大小圆孔看，留白在内外两圈错开。' }
]
const selectedSpecimen = ref(0)
const specimen = computed(() => specimens[selectedSpecimen.value]!)
const examiningCut = ref(false)

function find(nextCategory = category.value, text = query.value.trim()) {
  query.value = text
  return navigateTo({
    path: '/learn',
    query: { q: text || undefined, category: nextCategory || undefined },
  }, { replace: true })
}
</script>

<template>
  <div class="page learn-page">
    <header class="learn-room" aria-labelledby="learn-room-title">
      <PaperRoomLight />
      <div class="archive-relief" aria-hidden="true"><PaperArt :model="LEARN_WINDOW_MODEL" /></div>
      <div class="wrap learn-breadcrumbs"><Breadcrumbs :items="[{ label: '纸上学堂' }]" /></div>
      <div class="wrap learn-folio">
        <div class="folio-copy">
          <p class="folio-kicker"><span aria-hidden="true">01</span> 纸上学堂 · 纹样图谱</p>
          <h1 id="learn-room-title">花从<br/>一角来<span>。</span></h1>
          <p class="folio-lead">换一张纹样，取出它的纸角，看看一处刀口如何在八个方向留下同样的痕迹。</p>
          <div class="folio-actions">
            <NuxtLink class="folio-read" :to="{ path: route.path, query: route.query, hash: '#journal-title' }">
              翻开札记 <span aria-hidden="true">↓</span>
            </NuxtLink>
            <NuxtLink class="folio-try" to="/tutorials">从阅读到动手 <span aria-hidden="true">↗</span></NuxtLink>
          </div>
        </div>
        <figure class="folio-plate" aria-labelledby="specimen-title" :class="{ 'folio-examining': examiningCut }">
          <div class="atlas-register">
            <span class="folio-figure-no">纹样观察台</span>
            <span class="atlas-figure-number">原创图版 0{{ selectedSpecimen + 1 }} / 03</span>
          </div>
          <div id="learn-atlas-diagram" class="folio-diagram" aria-hidden="true">
            <div class="atlas-field"/>
            <span class="atlas-imprint"><i>45°</i> 原纸角</span>
            <div class="folio-folded"><PaperArt :model="specimen.model" folded viewBox="-8 -8 116 86.710678"/></div>
            <div class="folio-spread">
              <Transition name="atlas-lay">
                <div :key="selectedSpecimen" class="atlas-piece">
                  <PaperArt :model="specimen.model"/>
                  <PaperArt v-if="examiningCut" class="atlas-isolated" :model="specimen.model" folded/>
                  <svg class="atlas-sector" viewBox="-108 -108 216 216">
                    <path :d="SECTOR_PATH"/>
                  </svg>
                </div>
              </Transition>
            </div>
            <span class="atlas-coordinate"><i>08</i> 八向对称</span>
          </div>
          <figcaption class="atlas-caption">
            <div class="atlas-specimen" aria-live="polite" aria-atomic="true">
              <strong id="specimen-title">{{ specimen.name }}</strong>
              <p>{{ examiningCut ? '高亮部分与左边的纸角相同。其余七角由旋转和镜像展开。' : specimen.hint }}</p>
            </div>
            <button type="button" class="atlas-inspect" :aria-pressed="examiningCut" aria-controls="learn-atlas-diagram" @click="examiningCut = !examiningCut">
              取出纸角 <span aria-hidden="true">{{ examiningCut ? '−' : '＋' }}</span>
            </button>
          </figcaption>
          <div class="atlas-tabs" role="group" aria-label="选择原创纹样">
            <button v-for="(item, index) in specimens" :key="item.name" type="button" :aria-pressed="selectedSpecimen === index" @click="selectedSpecimen = index">
              <span aria-hidden="true">0{{ index + 1 }}</span>{{ item.name }}
            </button>
          </div>
        </figure>
      </div>
    </header>

    <section class="wrap" aria-labelledby="journal-title">
      <div class="journal-heading">
        <h2 id="journal-title" tabindex="-1">学堂札记</h2>
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
.learn-page { padding-top: 0; }

.learn-room {
  --folio-ink: #fff0d7;
  --folio-accent: #f3a484;
  --atlas-ink: #182b40;
  --atlas-ivory: #fff1d5;
  --room-glow: #a3794a73;
  --room-beam: #f5be7e38;
  --room-mullion: #130f15ab;
  --room-edge: #0d0e134e;
  position: relative;
  isolation: isolate;
  overflow: clip;
  margin-bottom: clamp(32px, 6vw, 78px);
  padding-block: clamp(15px, 2vw, 28px) clamp(24px, 4vw, 60px);
  background:
    repeating-linear-gradient(88deg, transparent 0 27px, #d7a06c07 28px, #0002 29px, transparent 31px 48px),
    linear-gradient(118deg, #362a26, #18181a 60%, #101215);
  color: var(--folio-ink);
}

.archive-relief {
  position: absolute;
  z-index: -1;
  top: -44%;
  right: -14%;
  width: min(79vw, 1040px);
  opacity: .27;
  filter: brightness(0) drop-shadow(1px 1px 0 #b89364) drop-shadow(-2px -3px 0 #0a0a0b);
  transform: rotate(12deg);
  pointer-events: none;
}

.learn-breadcrumbs { color: #ecd7bf; }
.learn-room :focus-visible { outline-color: #ffdea5; }
.learn-breadcrumbs :deep(a:hover) { color: #fff5df; }

.learn-folio {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.62fr) minmax(0, 1fr);
  grid-template-areas: "plate copy";
  margin-top: clamp(14px, 2.9vw, 42px);
}

.folio-copy {
  grid-area: copy;
  align-self: center;
  container-type: inline-size;
  min-width: 0;
  padding: clamp(16px, 4vw, 58px);
}

.folio-kicker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: #efc8aa;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .18em;
}

.folio-kicker span {
  padding-right: 10px;
  border-right: 1px solid #d8a17d;
  color: var(--folio-accent);
  font: italic 17px Georgia, serif;
  letter-spacing: .04em;
}

.folio-copy h1 {
  margin: .23em 0 .23em;
  color: var(--folio-ink);
  font-size: clamp(43px, 25cqi, 112px);
  line-height: 1.04;
  letter-spacing: -.075em;
  white-space: nowrap;
}

.folio-copy h1 span { color: var(--folio-accent); }
.folio-lead { max-width: 25em; margin: 0; color: #e9d8c6; }

.folio-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 18px;
  margin-top: clamp(12px, 2.4vw, 28px);
}

.folio-actions a { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; font-size: 14px; }
.folio-read { padding: 4px 12px; background: #f5dfbd; color: #492b22; }
.folio-read:hover { background: #fff0d4; color: #492b22; }
.folio-try { color: var(--folio-accent); }
.folio-try:hover { text-decoration: underline; text-underline-offset: .22em; }

.folio-plate {
  grid-area: plate;
  display: grid;
  gap: clamp(7px, 1.1vw, 15px);
  min-width: 0;
  margin: 0;
  padding: clamp(9px, 1.6vw, 22px);
  border: 1px solid #cfa47772;
  color: var(--atlas-ivory);
  background:
    repeating-linear-gradient(92deg, transparent 0 7px, #ffddae0a 7px 8px, transparent 9px 12px),
    linear-gradient(125deg, #483629, #231d1b 71%);
  box-shadow: inset 0 0 0 3px #0004, 0 16px 44px -8px #0d0a0ae0;
}

.atlas-register {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  color: #f2d4b0;
  font-size: 11px;
  letter-spacing: .09em;
}

.folio-diagram {
  position: relative;
  isolation: isolate;
  min-height: clamp(237px, 30vw, 425px);
  overflow: hidden;
  border: 1px solid #ad815f;
  background:
    radial-gradient(ellipse at 72% 30%, #d4a26d24, transparent 64%),
    repeating-linear-gradient(90deg, #dbb68415 0 1px, transparent 1px 16px),
    repeating-linear-gradient(0deg, #dbb68412 0 1px, transparent 1px 16px),
    linear-gradient(145deg, #4b3729, #251c1a 55%, #39251d);
  box-shadow: inset 0 0 35px #1209077d;
}

.atlas-field,
.atlas-field::before,
.atlas-field::after,
.folio-diagram::after {
  position: absolute;
  pointer-events: none;
}

.atlas-field {
  z-index: -1;
  inset: 5% 5% 5% 29%;
  border: 1px solid #fff2d9;
  background:
    repeating-linear-gradient(105deg, transparent 0 5px, #88603814 6px, transparent 7px 9px),
    radial-gradient(ellipse at 41% 40%, #fff9e6, #eed2a2 84%);
  box-shadow: 4px 5px 0 #b28d64, 7px 10px 0 #816548, 14px 21px 26px #0a0707b5, 0 0 35px #c3946550;
  transform: rotate(-2.5deg);
}

.atlas-field::before {
  inset: 4%;
  border: 1px solid #9f704b42;
  content: '';
}

.atlas-field::after {
  top: 50%;
  left: 50%;
  height: 88%;
  max-width: 88%;
  aspect-ratio: 1;
  border: 1px dashed #8a4e3975;
  border-radius: 50%;
  background: repeating-conic-gradient(transparent 0 44.45deg, #93573533 44.5deg 45deg);
  box-shadow: 0 0 0 7px #bb896d1a;
  transform: translate(-50%, -50%);
  content: '';
}

.folio-folded {
  inset: 29% 70% 25% 4%;
  display: grid;
  place-items: center;
  border: 1px solid #c29770;
  background: linear-gradient(145deg, #ccae84, #a17b54);
  box-shadow: 4px 8px 10px #120b08ad;
  transform: rotate(-7deg);
}

.folio-folded,
.folio-spread {
  position: absolute;
  filter: drop-shadow(2px 6px 3px #58392148);
}

.folio-folded :deep(.paper-art) { width: 90%; height: auto; }
.folio-spread { right: 9.5%; top: 50%; width: min(61%, 395px); transform: translateY(-50%) rotate(-8deg); }
.folio-examining .folio-folded :deep(.paper-art) { transform: scale(1.06); }
.atlas-piece { position: relative; }
.folio-examining .atlas-piece > .paper-art:not(.atlas-isolated) { opacity: .38; }
.atlas-isolated { position: absolute; inset: 0; width: 100%; height: 100%; }
.atlas-sector {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: none;
  stroke: #253749;
  stroke-width: 1.5;
  stroke-dasharray: 3 2;
  opacity: 0;
}
.folio-examining .atlas-sector { opacity: 1; }

.atlas-coordinate, .atlas-imprint {
  position: absolute;
  display: grid;
  gap: 3px;
  color: #744530;
  font-size: clamp(9px, .9vw, 12px);
  font-weight: 700;
  letter-spacing: .08em;
  line-height: 1;
}

.atlas-coordinate { right: 8%; top: 9%; text-align: right; }
.atlas-imprint { left: 5%; top: 8%; color: #eed1a5; }
.atlas-coordinate i, .atlas-imprint i { font: italic clamp(17px, 2.6vw, 38px)/1 Georgia, serif; }

.atlas-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px 12px;
}

.atlas-specimen strong { display: block; font: 700 clamp(19px, 2vw, 29px)/1.2 var(--serif); }
.atlas-specimen p { margin: 4px 0 0; color: #ecd6bc; font-size: 12px; line-height: 1.5; }
.folio-figure-no { color: #f4d3a0; font-weight: 700; letter-spacing: .15em; }
.atlas-figure-number { font-variant-numeric: tabular-nums; }
.atlas-inspect, .atlas-tabs button { color: var(--atlas-ivory); }
.atlas-inspect {
  flex: none;
  padding: 5px 8px;
  border-color: #d4bd91;
  font-size: 13px;
  white-space: nowrap;
}
.atlas-inspect:hover, .atlas-inspect[aria-pressed="true"] { background: var(--atlas-ivory); color: var(--atlas-ink); }
.atlas-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}
.atlas-tabs button {
  min-width: 0;
  padding: 4px;
  border-color: #d6ae816e;
  font-size: 12px;
}
.atlas-tabs button span { margin-inline-end: .45em; color: #e3c59c; font: italic 13px Georgia, serif; }
.atlas-tabs button:hover { background: #96714e6e; }
.atlas-tabs button[aria-pressed="true"] { border-color: #e9c592; background: #e9c592; color: var(--atlas-ink); font-weight: 700; }
.atlas-tabs button[aria-pressed="true"] span { color: #67503c; }
.folio-plate button:focus-visible { outline-color: #ffdea5; }

@media (prefers-reduced-motion: no-preference) {
  .atlas-lay-enter-active { animation: lay-paper .56s cubic-bezier(.18, .72, .24, 1) backwards; }
  .folio-folded { transition: transform .36s cubic-bezier(.23, .72, .26, 1); }
  .atlas-sector, .folio-spread .paper-art { transition: opacity .3s ease; }

  @keyframes lay-paper {
    from { transform: translate(-5%, 2%) rotate(8deg) scale(.88); }
    to { transform: none; }
  }
}

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
  scroll-margin-top: 14px;
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

@media (max-width: 700px) {
  .learn-folio {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "copy" "plate";
  }

  .folio-copy { padding: 16px 16px 15px; }
  .folio-copy h1 { font-size: clamp(41px, 10.4vw, 60px); }
  .folio-copy h1 br { display: none; }
  .folio-lead { font-size: 14px; line-height: 1.55; }
  .folio-actions { gap: 5px 14px; margin-top: 8px; }
  .folio-diagram { min-height: clamp(152px, 46vw, 254px); }
  .folio-spread { width: min(54%, 300px); right: 12%; }
  .archive-relief { top: -7%; right: -22%; width: 108vw; opacity: .16; }
  .atlas-inspect { font-size: 12px; }
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

@media (max-width: 360px) {
  .learn-folio { margin-top: 10px; }
  .folio-copy { padding-block: 13px; }
  .folio-diagram { min-height: 144px; }
}

</style>
