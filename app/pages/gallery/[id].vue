<script setup lang="ts">
import type { PaperModel } from '../../../shared/model'

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
        <figure class="exhibit-figure">
          <div class="detail-mount exhibit-mount">
            <span class="mount-index" aria-hidden="true">紙上 / 03</span>
            <div class="exhibit-sheet">
              <PaperArt :model="work.model" :label="work.title" />
            </div>
          </div>
          <figcaption class="exhibit-caption">
            <span>{{ work.is_example ? '项目原创示例' : '经审核公开的访客作品' }}</span>
            <span lang="en" aria-hidden="true">PAPER CUT · FULL VIEW</span>
          </figcaption>
        </figure>
        <div class="detail-label exhibit-label">
          <header>
            <p class="eyebrow">03 / 纸上展览 <span>· {{ work.category }}</span></p>
            <h1 id="exhibit-title">{{ work.title }}</h1>
            <p v-if="work.description" class="article-lead">{{ work.description }}</p>
          </header>
          <dl class="exhibit-facts">
            <div><dt>对称</dt><dd><strong>8</strong> 重</dd></div>
            <div><dt>基础切口</dt><dd><strong>{{ work.model.cuts.length }}</strong> 个</dd></div>
          </dl>
          <div class="exhibit-actions">
            <NuxtLink class="btn primary" :to="{ path: '/studio', query: { remix: work.id } }">
              用这个纹样再创作 <span aria-hidden="true">↗</span>
            </NuxtLink>
            <button type="button" class="btn exhibit-favorite" :disabled="busy" @click="favorite">
              {{ busy ? '正在整理…' : saved ? '已收藏 · 取消收藏' : '＋ 收藏这份灵感' }}
            </button>
          </div>
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
  grid-template-columns: minmax(0, 1.32fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(30px, 6vw, 90px);
  max-width: 1280px;
  margin: clamp(20px, 3.2vw, 44px) auto 0;
}

.exhibit-figure {
  min-width: 0;
  margin: 0;
  background: #64231d;
  color: #f9e4c7;
}

.exhibit-mount {
  aspect-ratio: 1.13;
  background:
    repeating-linear-gradient(106deg, #fff7e708 0 1px, transparent 1px 8px),
    radial-gradient(ellipse at 43% 28%, #a84d3d, #87271f 56%, #64231d);
}

.exhibit-mount::before {
  position: absolute;
  inset: clamp(10px, 1.5vw, 22px);
  border: 1px solid #f0ba865c;
  content: '';
}

.mount-index {
  position: absolute;
  top: clamp(15px, 2.1vw, 30px);
  left: clamp(18px, 2.4vw, 34px);
  font: 12px/1.6 var(--serif);
  letter-spacing: .18em;
}

.exhibit-sheet {
  position: relative;
  display: grid;
  place-items: center;
  width: 68%;
  aspect-ratio: 1;
  border: 1px solid #e9d3b0;
  background: radial-gradient(ellipse at 43% 32%, var(--exhibit-cream), #f2e1c4);
  box-shadow: 0 26px 38px #2b0c0666, 0 2px 4px #2b0c0650;
}

.exhibit-sheet::before {
  position: absolute;
  inset: clamp(5px, 1vw, 14px);
  border: 1px solid #b4815338;
  content: '';
}

.exhibit-sheet :deep(.paper-art) {
  width: 86%;
  max-height: 90%;
  filter: drop-shadow(0 8px 7px #5225152b);
}

.exhibit-caption {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 18px;
  padding: 13px clamp(14px, 2vw, 26px);
  border-top: 1px solid #f0ba8640;
  font-size: 12px;
}

.exhibit-caption [lang="en"] {
  font-family: Georgia, serif;
  letter-spacing: .13em;
}

.exhibit-label header { padding-top: 18px; border-top: 1px solid var(--exhibit-red); }
.exhibit-label .eyebrow { margin: 0; color: var(--exhibit-red); font-weight: 700; }
.exhibit-label .eyebrow span { color: var(--muted); }
.exhibit-label h1 {
  margin: .24em 0 .25em;
  font-size: clamp(38px, 6vw, 86px);
  line-height: 1.05;
  letter-spacing: -.04em;
  overflow-wrap: anywhere;
  text-wrap: balance;
}
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
.exhibit-actions .primary { border-color: var(--exhibit-red); background: var(--exhibit-red); }
.exhibit-actions .primary:hover { background: #692019; }
.exhibit-favorite:hover { border-color: var(--exhibit-red); color: var(--exhibit-red); }
.exhibit-label .fine-print { margin: 12px 0 0; letter-spacing: 0; }
.exhibit-label .back-link { display: inline-flex; margin: 0; }

@media (max-width: 760px) {
  .exhibit-detail { grid-template-columns: 1fr; gap: 24px; }
  .exhibit-mount { aspect-ratio: 1.1; }
  .exhibit-sheet { width: 65%; }
  .exhibit-label header { padding: 0; border: 0; }
  .exhibit-facts { margin-top: 17px; }
}
</style>
