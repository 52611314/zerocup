<script setup lang="ts">
import type { PaperModel } from '../../shared/model'

usePageMeta('我的纸笺', '在当前访客会话中继续草稿，查看投稿状态和学习进度。', true)

interface Draft {
  id: string
  title: string
  model: PaperModel
  status: 'draft' | 'pending' | 'published' | 'rejected'
  version: number
  review_note?: string
}

interface LessonProgress {
  tutorial_id: string
  title: string
  slug: string
  step: number
  total: number
  work_id?: string
  run_step?: number | null
}

interface Favorite {
  id: string
  title: string
  model: PaperModel
  category: string
  is_example: boolean
}

const sections = {
  works: {
    number: '01',
    label: '草稿与投稿',
    unit: '件作品',
    emptyTitle: '纸笺里还没有作品',
    description: '在工坊保存一张剪纸，它就会出现在这里。',
    action: '去剪一张窗花',
    to: '/studio',
  },
  progress: {
    number: '02',
    label: '学习足迹',
    unit: '段练习',
    emptyTitle: '还没有练习记录',
    description: '跟着教程剪一张纸，完成的步骤会记在这里。',
    action: '看看渐进教程',
    to: '/tutorials',
  },
  favorites: {
    number: '03',
    label: '收藏的灵感',
    unit: '件作品',
    emptyTitle: '还没有收藏的作品',
    description: '在展品详情收藏喜欢的纹样，回到这里慢慢看。',
    action: '逛逛纸上展览',
    to: '/gallery',
  },
} as const

const tab = ref<keyof typeof sections>('works')
const selectedIndex = computed(() => Object.keys(sections).indexOf(tab.value))
const worksRequest = await useFetch<Draft[]>('/api/me/works', { server: false })
const progressRequest = await useFetch<LessonProgress[]>('/api/me/progress', { server: false })
const favoritesRequest = await useFetch<Favorite[]>('/api/me/favorites', { server: false })
const { data: works } = worksRequest
const { data: progress } = progressRequest
const { data: favorites } = favoritesRequest
const { feedback } = useFeedback()
const deletingId = ref<string | null>(null)
const collectionTitle = ref<HTMLElement>()
function isEditableWork(work: Draft) {
  return work.status === 'draft' || work.status === 'rejected'
}

// The API orders the current visitor's works by the most recent update.
const resumeWork = computed(() => works.value?.find(isEditableWork))

async function removeDraft(work: Draft) {
  if (deletingId.value || !isEditableWork(work)) return
  if (!window.confirm(`确定删除「${work.title}」？删除后无法恢复。`)) return

  deletingId.value = work.id
  try {
    await writeApi(`/api/works/${encodeURIComponent(work.id)}`, { method: 'DELETE', body: { version: work.version } })
    const restoreFocus = document.activeElement === document.body
    works.value = works.value?.filter(item => item.id !== work.id)
    void progressRequest.refresh()
    feedback('草稿已删除。')
    if (restoreFocus && tab.value === 'works') {
      await nextTick()
      collectionTitle.value?.focus({ preventScroll: true })
    }
  } catch (error) {
    feedback(errorMessage(error), 'error')
    const status = (error as { statusCode?: number } | null)?.statusCode
    if (status === 404 || status === 409) void worksRequest.refresh()
  } finally {
    deletingId.value = null
  }
}
const requests = { works: worksRequest, progress: progressRequest, favorites: favoritesRequest }
const activeSection = computed(() => sections[tab.value])
const activeRequest = computed(() => requests[tab.value])
const loading = computed(() => ['idle', 'pending'].includes(activeRequest.value.status.value))
const error = computed(() => activeRequest.value.error.value)
const count = computed(() => activeRequest.value.data.value?.length ?? 0)
const labels: Record<Draft['status'], string> = {
  draft: '未完的心意',
  pending: '等待展馆审核',
  published: '已经在展览中',
  rejected: '请修改后再投稿',
}
</script>

<template>
  <div class="wrap page paper-notebook">
    <Breadcrumbs :items="[{ label: '我的纸笺' }]" />

    <header class="page-heading notebook-heading" :class="{ 'notebook-has-draft': resumeWork }">
      <div>
        <p class="eyebrow">我的纸笺 <span aria-hidden="true">/</span> <span lang="en">PAPER NOTES</span></p>
        <h1>心意，妥帖<span>收好。</span></h1>
        <p class="notebook-intro">存下剪纸、练习和喜欢的纹样，随时翻回这一页。</p>
        <div class="notebook-actions">
          <NuxtLink v-if="resumeWork" class="btn primary notebook-resume" :to="{ path: '/studio', query: { draft: resumeWork.id } }">
            继续上次创作 <span aria-hidden="true">↗</span>
          </NuxtLink>
          <NuxtLink class="btn notebook-new" :class="{ primary: !resumeWork }" to="/studio">
            铺开一张新纸 <span aria-hidden="true">↗</span>
          </NuxtLink>
        </div>
        <p v-if="resumeWork" class="resume-title">上次编辑 · {{ resumeWork.title }}</p>
      </div>
      <div class="notebook-letter" aria-hidden="true">
        <div v-if="resumeWork" class="letter-draft"><PaperArt :model="resumeWork.model" /></div>
        <span class="letter-face"><span>笺</span></span>
      </div>
    </header>

    <div class="filter-tabs me-tabs" role="group" aria-label="纸笺分类" :style="{ '--tab-offset': selectedIndex * 100 + '%' }">
      <button
        v-for="(section, key) in sections"
        :key="key"
        type="button"
        :class="{ selected: tab === key }"
        :aria-pressed="tab === key"
        aria-controls="paper-collection"
        @click="tab = key"
      >
        <span class="tab-number" aria-hidden="true">{{ section.number }}</span>
        {{ section.label }}
      </button>
    </div>

    <section id="paper-collection" aria-labelledby="collection-title">
      <Transition name="notebook-sheet">
        <div :key="tab" class="notebook-sheet">
          <div class="notebook-collection-heading">
            <h2 id="collection-title" ref="collectionTitle" tabindex="-1">{{ activeSection.label }}</h2>
            <p v-if="!loading && !error">{{ count }} {{ activeSection.unit }}</p>
          </div>

          <AsyncState :pending="loading" :error="error" @retry="activeRequest.refresh()">
            <div v-if="!count" class="notebook-empty">
              <div>
                <h3>{{ activeSection.emptyTitle }}</h3>
                <p>{{ activeSection.description }}</p>
              </div>
              <NuxtLink class="btn" :to="activeSection.to">{{ activeSection.action }} <span aria-hidden="true">↗</span></NuxtLink>
            </div>

            <div v-else-if="tab === 'works'" class="draft-grid">
              <article v-for="(work, index) in works" :key="work.id" class="paper-draft">
                <WorkCard :work="{ ...work, category: '' }" private-work :exhibit-number="String(index + 1).padStart(2, '0')" />
                <div class="draft-state">
                  <span>{{ labels[work.status] }}</span>
                  <NuxtLink v-if="work.status === 'published'" :to="`/gallery/${work.id}`" class="text-link">看看展览 ↗</NuxtLink>
                  <div v-else class="draft-actions">
                    <small>第 {{ work.version }} 版</small>
                    <button
                      v-if="isEditableWork(work)"
                      type="button"
                      class="draft-delete"
                      :aria-label="`删除草稿「${work.title}」`"
                      :disabled="deletingId !== null"
                      @click="removeDraft(work)"
                    >{{ deletingId === work.id ? '正在删除…' : '删除草稿' }}</button>
                  </div>
                </div>
                <p v-if="work.review_note" class="review-note"><strong>展馆留言</strong>{{ work.review_note }}</p>
              </article>
            </div>

            <div v-else-if="tab === 'progress'" class="progress-list">
              <article v-for="lesson in progress" :key="lesson.tutorial_id">
                <div>
                  <p class="eyebrow">{{ (lesson.run_step ?? lesson.step) >= lesson.total ? '已经完成' : '正在练习' }}</p>
                  <h3>{{ lesson.title }}</h3><small v-if="lesson.step>=lesson.total && (lesson.run_step??lesson.step)<lesson.total">曾完成此教程 · 现在正在重新练习</small>
                  <div class="notebook-progress">
                    <progress :value="lesson.run_step ?? lesson.step" :max="lesson.total" :aria-label="lesson.title + '完成进度'" />
                    <span aria-hidden="true">{{ lesson.run_step ?? lesson.step }} / {{ lesson.total }}</span>
                  </div>
                </div>
                <NuxtLink class="text-link" :to="`/studio?tutorial=${lesson.slug}${(lesson.run_step??lesson.step)>=lesson.total?'&restart=1':''}`">
                  {{ (lesson.run_step ?? lesson.step) >= lesson.total ? '再练一次' : lesson.work_id ? '带着草稿继续' : '继续这段练习' }} <span aria-hidden="true">↗</span>
                </NuxtLink>
              </article>
            </div>

            <div v-else class="works-grid">
              <WorkCard v-for="(work, index) in favorites" :key="work.id" :work="work" :exhibit-number="String(index + 1).padStart(2, '0')" />
            </div>
          </AsyncState>
        </div>
      </Transition>
    </section>

    <p class="session-note">
      <strong>纸笺存放说明</strong>
      <span>私人纸笺随当前浏览器的访客会话保存。清除 Cookie、更换浏览器或会话在 90 天后到期，私人纸笺将无法读取。可下载图像留存。</span>
    </p>
  </div>
</template>

<style scoped src="../assets/css/me.css"></style>
