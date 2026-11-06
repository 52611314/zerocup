<script setup lang="ts">
import type { NuxtError } from '#app'
import { starterModels } from '../shared/patterns'

const props = defineProps<{ error: NuxtError }>()
const status = computed(() => props.error.statusCode || 500)
const missing = computed(() => status.value === 404)
</script>

<template>
  <NuxtLayout>
    <main class="wrap error-page paper-error">
      <div class="brand error-brand"><img src="/favicon.svg" alt="" width="38" height="38"> 纸上生花</div>
      <div class="error-layout">
        <div class="error-copy">
          <p class="eyebrow error-status">{{ status }} / {{ missing ? '页面未找到' : '暂时无法打开' }}</p>
          <h1>{{ missing ? '这张纸还留着空白。' : '纸笺在路上打了个结。' }}</h1>
          <p>{{ missing ? '这页可能已经移走，可以回到首页，或去展览里看看。' : '这页暂时无法打开，请稍后重试。' }}</p>
          <div class="button-row error-actions">
            <a href="/" class="btn primary">回到首页 <span aria-hidden="true">↗</span></a>
            <a v-if="missing" href="/gallery" class="btn">浏览纸上展览 <span aria-hidden="true">→</span></a>
            <button v-else type="button" class="btn" @click="clearError()">重新尝试 <span aria-hidden="true">↻</span></button>
          </div>
        </div>
        <div class="error-art" aria-hidden="true">
          <PaperArt :model="starterModels[0]!" folded />
        </div>
      </div>
    </main>
  </NuxtLayout>
</template>

<style scoped>
.paper-error { max-width: 1050px; padding: clamp(20px, 5vw, 65px) 0; text-align: left; }
.error-brand { margin: 0; padding-bottom: 16px; border-bottom: 1px solid var(--line); }
.error-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(180px, 1fr);
  align-items: center;
  gap: clamp(22px, 5vw, 75px);
  padding-top: clamp(28px, 8vw, 110px);
}

.error-status { margin: 0; font-weight: 700; }
.error-copy h1 { margin: .3em 0; font-size: clamp(34px, 5vw, 65px); }
.error-copy > p:not(.error-status) { margin: 0; color: var(--muted); }
.error-actions { margin-top: 20px; gap: 8px; }

.error-art {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border: 1px solid var(--line);
  background: radial-gradient(ellipse at center, #f8edd7 8%, #e9d8bb 80%);
  overflow: hidden;
}

.error-art :deep(.paper-art) {
  width: 105%;
  transform: translate(-24%, -16%) rotate(-10deg);
  filter: drop-shadow(0 9px 7px #42271d2e);
}

@media (max-width: 670px) {
  .error-layout { grid-template-columns: 1fr; }
  .error-art { width: min(100%, 260px); }
}
</style>
