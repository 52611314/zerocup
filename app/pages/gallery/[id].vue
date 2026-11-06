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
    await $fetch(`/api/me/favorites/${encodeURIComponent(id)}`, { method: saved.value ? 'DELETE' : 'PUT' })
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
  <div class="wrap page">
    <Breadcrumbs :items="[{ label: '纸上展览', to: '/gallery' }, { label: work?.title || '作品' }]" />
    <AsyncState :pending="pending" :error="error" @retry="refresh">
      <article v-if="work" class="work-detail exhibit-detail" aria-labelledby="exhibit-title">
        <figure class="exhibit-figure">
          <div class="detail-mount exhibit-mount">
            <PaperArt :model="work.model" :label="work.title" />
          </div>
          <figcaption class="exhibit-caption">
            <span>{{ work.is_example ? '项目原创示例' : '经审核公开的访客作品' }}</span>
            <span lang="en" aria-hidden="true">PAPER EXHIBITION</span>
          </figcaption>
        </figure>
        <div class="detail-label exhibit-label">
          <header>
            <p class="eyebrow">03 / 纸上展览 <span>· {{ work.category }}</span></p>
            <h1 id="exhibit-title">{{ work.title }}</h1>
            <p v-if="work.description" class="article-lead">{{ work.description }}</p>
          </header>
          <dl>
            <div><dt>构图</dt><dd>四组旋转 · 八重对称</dd></div>
            <div><dt>切口</dt><dd>{{ work.model.cuts.length }} 个基础切口</dd></div>
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
          <NuxtLink class="text-link back-link" to="/gallery">← 回到纸上展览</NuxtLink>
        </div>
      </article>
    </AsyncState>
  </div>
</template>

<style scoped>
.exhibit-detail {
  grid-template-columns: minmax(0, 1.24fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(32px, 6vw, 96px);
  max-width: 1220px;
  margin: clamp(22px, 3.5vw, 48px) auto 0;
}

.exhibit-figure { margin: 0; }

.exhibit-mount {
  isolation: isolate;
  border: 1px solid var(--line);
  background: radial-gradient(ellipse at 48% 38%, #f8edd7 8%, #e9d8bb 80%);
}

.exhibit-mount::before {
  position: absolute;
  z-index: -1;
  inset: clamp(10px, 1.6vw, 22px);
  border: 1px solid #a67d5740;
  content: '';
}

.exhibit-mount :deep(.paper-art) {
  width: 83%;
  filter: drop-shadow(0 11px 10px #42271d24);
}

.exhibit-caption {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 18px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
  font-size: 12px;
}

.exhibit-caption [lang="en"] {
  font-family: Georgia, serif;
  letter-spacing: .13em;
}

.exhibit-label header { padding-top: 18px; border-top: 1px solid var(--red); }
.exhibit-label .eyebrow { margin: 0; font-weight: 700; }
.exhibit-label .eyebrow span { color: var(--muted); }
.exhibit-label h1 { font-size: clamp(35px, 5vw, 70px); overflow-wrap: anywhere; }
.exhibit-label .article-lead { max-width: 34em; overflow-wrap: anywhere; }
.exhibit-label dl { margin: 26px 0 20px; border-top: 1px solid var(--line); }
.exhibit-label dl div { padding: 9px 0; }
.exhibit-label dt { flex: 0 0 3em; color: var(--muted); }
.exhibit-label dd { min-width: 0; }
.exhibit-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.exhibit-favorite:hover { border-color: var(--red); color: var(--red); }
.exhibit-label .fine-print { margin: 12px 0 2px; letter-spacing: 0; }
.exhibit-label .back-link { display: inline-flex; margin: 0; }

@media (max-width: 760px) {
  .exhibit-detail { grid-template-columns: 1fr; gap: 22px; }
  .exhibit-figure { width: min(100%, 490px); margin-inline: auto; }
  .exhibit-label header { padding-top: 0; border: 0; }
  .exhibit-label dl { margin-top: 16px; }
}
</style>
