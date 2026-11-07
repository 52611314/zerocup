<script setup lang="ts">
import { SECTOR_PATH, type PaperModel } from '../../../shared/model'

interface Exhibit {
  id: string
  title: string
  description: string
  category: string
  is_example: boolean
  model: PaperModel
}

const route = useRoute()
const galleryHref = useBrowseReturn('/gallery')
const { feedback } = useFeedback()
const busy = ref(false)
const saved = ref(false)
const showCreases = ref(false)
const creaseRaysPath = 'M -100 0 H 100 M 0 -100 V 100 M -70.71 -70.71 L 70.71 70.71 M -70.71 70.71 L 70.71 -70.71'
const creaseSurroundPath = `M 100 0 A 100 100 0 1 0 -100 0 A 100 100 0 1 0 100 0 Z ${SECTOR_PATH}`
const id = String(route.params.id)
const { data: work, pending, error, refresh } = await useFetch<Exhibit>(`/api/gallery/${encodeURIComponent(id)}`)
if (error.value?.statusCode === 404) throw createError({ statusCode: 404, message: '作品尚未公开，或已经撤展。' })
usePageMeta(() => work.value?.title || '作品', () => work.value?.description || '原创数字剪纸作品')

onMounted(async () => {
  try {
    const favorites = await $fetch<{ id: string }[]>('/api/me/favorites')
    saved.value = favorites.some(favorite => favorite.id === id)
  } catch {}
})

async function favorite() {
  busy.value = true
  try {
    await writeApi(`/api/me/favorites/${encodeURIComponent(id)}`, { method: saved.value ? 'DELETE' : 'PUT' })
    saved.value = !saved.value
    feedback(saved.value ? '已收进我的收藏。' : '已取消收藏。')
  } catch (error) {
    feedback(errorMessage(error), 'error')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="wrap page exhibit-page">
    <Breadcrumbs :items="[{ label: '纸上展览', to: galleryHref }, { label: work?.title || '作品' }]" />
    <AsyncState :pending="pending" :error="error" @retry="refresh">
      <article v-if="work" class="work-detail exhibit-detail" aria-labelledby="exhibit-title">
        <header class="exhibit-heading">
          <div class="exhibit-register">
            <p class="eyebrow">纸上展览 <span aria-hidden="true">/</span> {{ work.category }}</p>
            <span class="exhibit-origin">{{ work.is_example ? '项目原创示例' : '访客创作' }}</span>
          </div>
          <h1 id="exhibit-title">{{ work.title }}</h1>
        </header>
        <figure class="exhibit-figure">
          <div id="exhibit-mount" class="detail-mount exhibit-mount" :data-show-creases="showCreases">
            <span class="mount-index" aria-hidden="true">纸间万象</span>
            <svg class="exhibit-orbit" viewBox="-120 -120 240 240" aria-hidden="true">
              <circle r="111" />
              <circle class="exhibit-orbit-ticks" r="105" />
              <path
                v-for="step in 8"
                :key="step"
                :transform="`rotate(${(step - 1) * 45})`"
                d="M 112 -3 L 117 0 L 112 3 L 109 0 Z"
              />
            </svg>
            <div class="exhibit-sheet">
              <div class="exhibit-art">
                <PaperArt :model="work.model" :label="work.title" :data-exhibit-work="work.id" />
                <svg class="crease-diagram" viewBox="-108 -108 216 216" aria-hidden="true">
                  <path class="crease-surround" :d="creaseSurroundPath" />
                  <path class="crease-sector" :d="SECTOR_PATH" />
                  <g class="crease-rays">
                    <path class="crease-edge" :d="creaseRaysPath" />
                    <path class="crease-dash" :d="creaseRaysPath" />
                  </g>
                  <path class="crease-outline" :d="SECTOR_PATH" pathLength="1" />
                </svg>
              </div>
            </div>
          </div>
          <figcaption class="exhibit-caption">
            <span class="exhibit-caption-copy">
              <strong>一角成纹</strong>
              <span id="crease-caption" aria-live="polite">{{ showCreases ? '高亮处是一片 45° 基础纸角' : '由一片 45° 纸角展开成八份' }}</span>
            </span>
            <button
              class="crease-toggle"
              type="button"
              :aria-pressed="showCreases"
              aria-controls="exhibit-mount"
              aria-describedby="crease-caption"
              @click="showCreases = !showCreases"
            >
              <svg class="crease-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M 3 6 H 21 A 18 18 0 0 1 16 19 Z M 3 6 L 19.6 13" />
              </svg>
              显示折痕
            </button>
          </figcaption>
        </figure>
        <div class="detail-label exhibit-label">
          <p v-if="work.description" class="article-lead">{{ work.description }}</p>
          <div class="exhibit-actions">
            <NuxtLink class="btn primary" :to="{ path: '/studio', query: { remix: work.id } }">
              用这个纹样再创作 <span aria-hidden="true">↗</span>
            </NuxtLink>
            <button type="button" class="btn exhibit-favorite" :disabled="busy" @click="favorite">
              {{ busy ? '正在整理…' : saved ? '已收藏 · 取消收藏' : '＋ 收藏这份灵感' }}
            </button>
          </div>
          <dl class="exhibit-facts">
            <div><dt>对称</dt><dd><strong>8</strong> 重</dd></div>
            <div><dt>基础切口</dt><dd><strong>{{ work.model.cuts.length }}</strong> 个</dd></div>
          </dl>
          <p class="fine-print">再创作会新建一份草稿。用于实物制作时，请先检查纸面连接与强度。</p>
          <NuxtLink class="text-link back-link" :to="galleryHref">← 回到纸上展览</NuxtLink>
        </div>
      </article>
    </AsyncState>
  </div>
</template>

<style scoped>
.exhibit-page {
  --exhibit-cream: #fff7e7;
  --exhibit-ink: #2a1c18;
  --exhibit-red: #87271f;
  --exhibit-line: #cbb398;
  color: var(--exhibit-ink);
}

.exhibit-detail {
  grid-template-columns: minmax(0, 1.28fr) minmax(0, 1fr);
  grid-template-rows: auto 1fr;
  grid-template-areas: "plate heading" "plate label";
  gap: clamp(16px, 2vw, 26px) clamp(28px, 5.8vw, 84px);
  max-width: 1280px;
  margin: clamp(20px, 3.2vw, 44px) auto 0;
}

.exhibit-figure {
  grid-area: plate;
  min-width: 0;
  margin: 0;
  border: 1px solid #713729;
  background: #51251f;
  box-shadow: 0 14px 34px #582c2422;
  color: #f9e4c7;
}

.exhibit-mount {
  isolation: isolate;
  aspect-ratio: 1.16;
  background:
    repeating-linear-gradient(106deg, #fff7e708 0 1px, transparent 1px 8px),
    radial-gradient(ellipse at 46% 37%, #a3523d, #7c3428 57%, #4a231e);
}

.exhibit-mount::before {
  position: absolute;
  inset: clamp(7px, 1.1vw, 17px);
  border: 1px solid #e4ab7d52;
  content: '';
  pointer-events: none;
}

.exhibit-orbit {
  position: absolute;
  width: 83%;
  color: #efbf92bb;
  pointer-events: none;
}

.exhibit-orbit circle { fill: none; stroke: currentColor; stroke-width: .5; }
.exhibit-orbit .exhibit-orbit-ticks { stroke-dasharray: .5 2.5; stroke-width: 1; opacity: .7; }
.exhibit-orbit path { fill: currentColor; }

.mount-index {
  position: absolute;
  z-index: 1;
  top: clamp(14px, 2.1vw, 30px);
  left: clamp(15px, 2.4vw, 34px);
  font: clamp(10px, 1vw, 13px)/1.6 var(--serif);
  letter-spacing: .16em;
}

.exhibit-sheet {
  --rim: clamp(2px, .4vw, 6px);
  position: relative;
  display: grid;
  place-items: center;
  width: 69%;
  aspect-ratio: 1;
  border: 1px solid #ffe1aeb0;
  border-radius: 50%;
  background: radial-gradient(ellipse at 43% 32%, var(--exhibit-cream), #f2e1c4 76%, #e4bd91);
  box-shadow:
    inset 0 5px 12px #8348183b,
    0 0 0 var(--rim) #553126,
    0 0 0 calc(var(--rim) * 1.35) #d8a472,
    0 0 0 calc(var(--rim) * 2.25) #8d5038,
    0 12px 30px calc(var(--rim) * 1.4) #2b0c0688;
}

.exhibit-sheet::before {
  position: absolute;
  inset: 3%;
  border: 1px solid #b4815338;
  border-radius: inherit;
  content: '';
}

.exhibit-art {
  position: relative;
  width: 86%;
}

.exhibit-art :deep(.paper-art) {
  width: 100%;
  max-height: none;
  filter: drop-shadow(0 8px 7px #5225152b);
}

.crease-diagram {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
}

.exhibit-mount[data-show-creases="true"] .crease-diagram { opacity: 1; }
.crease-surround { fill: #432a21; fill-rule: evenodd; opacity: .28; }
.crease-sector { fill: #ffedbd; fill-opacity: .22; }
.crease-rays path, .crease-outline { fill: none; vector-effect: non-scaling-stroke; }
.crease-edge { stroke: #2a170fa0; stroke-width: 2; }
.crease-dash { stroke: #fff8e6; stroke-width: 1; stroke-dasharray: 3 4; }
.crease-outline { stroke: #fff6d4; stroke-width: 2; filter: drop-shadow(0 0 1px #382213); }

@media (prefers-reduced-motion: no-preference) {
  .crease-diagram { transition: opacity .22s ease; }
  .crease-rays { transform: scale(.18); transition: transform .45s cubic-bezier(.21, .73, .29, 1); }
  .crease-outline { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .42s ease; }
  .exhibit-mount[data-show-creases="true"] .crease-rays { transform: scale(1); }
  .exhibit-mount[data-show-creases="true"] .crease-outline { stroke-dashoffset: 0; }
}

.exhibit-caption {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 8px clamp(12px, 2vw, 26px);
  border-top: 1px solid #f0ba8640;
  font-size: 12px;
}

.exhibit-caption-copy { display: grid; gap: 2px; }
.exhibit-caption-copy strong { color: #fff0d6; font: 700 16px/1.25 var(--serif); }
.exhibit-caption-copy span { color: #f1c89d; font-size: 12px; }

.crease-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-color: #e4ba91;
  padding: 0 11px;
  background: #f7e5c7;
  color: #5d2b20;
  font-size: 13px;
  white-space: nowrap;
}

.crease-toggle-icon { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.2; stroke-linejoin: round; }
.crease-toggle:hover { background: #fff3dc; }
.crease-toggle[aria-pressed="true"] { border-color: #f9ddbc; background: #fff6e51c; color: #fff7e7; }
.crease-toggle:focus-visible { outline-color: #ffd6a6; }

.exhibit-heading {
  grid-area: heading;
  min-width: 0;
  margin-top: clamp(12px, 4.6vw, 66px);
  padding-top: 13px;
  border-top: 1px solid var(--exhibit-red);
}
.exhibit-register { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; }
.exhibit-register .eyebrow { margin: 0; color: var(--exhibit-red); font-weight: 700; }
.exhibit-register .eyebrow span { margin-inline: .25em; color: var(--muted); }
.exhibit-origin {
  padding: 1px 7px;
  border: 1px solid #d9bda0;
  color: #774734;
  font-size: 11px;
  white-space: nowrap;
}
.exhibit-heading h1 {
  margin: .24em 0 0;
  font-size: clamp(38px, 6vw, 86px);
  line-height: 1.05;
  letter-spacing: -.04em;
  overflow-wrap: anywhere;
  text-wrap: balance;
}
.exhibit-label { grid-area: label; min-width: 0; }
.exhibit-label .article-lead { max-width: 32em; margin: 0; line-height: 1.8; overflow-wrap: anywhere; }
.exhibit-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: clamp(22px, 3vw, 36px) 0 20px;
  border-block: 1px solid var(--exhibit-line);
}
.exhibit-facts div { display: block; padding: 10px 0; border: 0; }
.exhibit-facts div + div { padding-left: 18px; border-left: 1px solid var(--exhibit-line); }
.exhibit-facts dt { color: var(--muted); font-size: 12px; letter-spacing: .1em; }
.exhibit-facts dd strong { color: var(--exhibit-red); font: 33px/1.2 Georgia, serif; }
.exhibit-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.article-lead + .exhibit-actions { margin-top: clamp(14px, 2vw, 25px); }
.exhibit-actions .primary { border-color: var(--exhibit-red); background: var(--exhibit-red); }
.exhibit-actions .primary:hover { background: #692019; }
.exhibit-favorite { background: #fff7e7a8; }
.exhibit-favorite:hover { border-color: var(--exhibit-red); color: var(--exhibit-red); }
.exhibit-label .fine-print { margin: 12px 0 0; letter-spacing: 0; }
.exhibit-label .back-link { display: inline-flex; margin: 0; }

@media (max-width: 820px) {
  .exhibit-detail {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto;
    grid-template-areas: "heading" "plate" "label";
    gap: 18px;
    max-width: 640px;
  }
  .exhibit-heading { margin-top: 0; padding-top: 10px; }
  .exhibit-heading h1 { font-size: clamp(34px, 9vw, 60px); }
  .exhibit-mount { aspect-ratio: 1.19; }
  .exhibit-facts { margin-block: 17px 12px; }
}

@media (max-width: 430px) {
  .exhibit-actions { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .9fr); }
  .exhibit-actions .btn { gap: 4px; padding-inline: 5px; font-size: 13px; }
}
</style>
