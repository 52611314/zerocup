<script setup lang="ts">
import type { PaperModel } from '../../shared/model'

const statusLabels = {
  draft: '草稿',
  pending: '审核中',
  published: '已展出',
  rejected: '待修改',
}

defineProps<{
  work: {
    id: string
    model: PaperModel
    title: string
    category: string
    is_example?: boolean
    status?: keyof typeof statusLabels
  }
  privateWork?: boolean
  exhibitNumber?: string
}>()
</script>

<template>
  <NuxtLink
    :to="privateWork ? `/studio?draft=${work.id}` : `/gallery/${work.id}`"
    class="work-card"
    :class="{ 'exhibit-card': exhibitNumber }"
  >
    <div class="work-mount">
      <span v-if="exhibitNumber" class="exhibit-number" aria-hidden="true">NO. {{ exhibitNumber }}</span>
      <PaperArt :model="work.model" :label="work.title" aria-hidden="true" />
      <span class="mount-corner">{{ work.is_example ? '原创示例' : '访客创作' }}</span>
    </div>
    <div class="work-caption">
      <div>
        <p>{{ privateWork && work.status ? statusLabels[work.status] : work.category }}</p>
        <h3>{{ work.title }}</h3>
      </div>
      <span class="exhibit-arrow" aria-hidden="true">↗</span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.work-card:not(.exhibit-card) .work-caption div {
  display: flex;
  flex-direction: column-reverse;
}

.exhibit-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 10px;
  border: 1px solid #cdbfa7;
  background: #fff8e9;
  color: #281b16;
}

.exhibit-card .work-mount {
  isolation: isolate;
  aspect-ratio: 1.23;
  background: radial-gradient(ellipse at 50% 42%, #f9eed8, #e3d1b6);
}

.exhibit-card:nth-child(3n + 2) .work-mount {
  background: radial-gradient(ellipse at 50% 42%, #f1e1d0, #dbc2ae);
}

.exhibit-card:nth-child(3n) .work-mount {
  background: radial-gradient(ellipse at 50% 42%, #f0e9d3, #d9ccb3);
}

.exhibit-card .work-mount::before {
  position: absolute;
  z-index: -1;
  inset: 8px;
  border: 1px solid #79513b35;
  content: '';
}

.exhibit-card .paper-art {
  width: min(74%, 230px);
  max-height: 86%;
  transform: rotate(-8deg);
  filter: drop-shadow(4px 5px 3px #52271330);
  transition: transform .4s cubic-bezier(.22, .7, .25, 1);
}

.exhibit-card:is(:hover, :focus-visible) .paper-art {
  transform: rotate(0) scale(1.06);
}

.exhibit-number {
  position: absolute;
  top: 16px;
  left: 17px;
  color: #704d37;
  font: 11px Georgia, serif;
  letter-spacing: .14em;
}

.exhibit-card .mount-corner {
  bottom: 15px;
  left: auto;
  right: 15px;
  background: #fff7e7;
  color: #663e2a;
  font-size: 11px;
}

.exhibit-card .work-caption {
  flex: 1;
  padding: 14px 6px 6px;
  gap: 10px;
}

.exhibit-card .work-caption p {
  margin: 0 0 5px;
  color: #8e261d;
  font-size: 12px;
  letter-spacing: .12em;
}

.exhibit-card .work-caption h3 {
  margin: 0;
  font-size: clamp(21px, 2.2vw, 29px);
}

.exhibit-card .exhibit-arrow {
  display: grid;
  place-items: center;
  flex: none;
  width: 38px;
  height: 38px;
  border: 1px solid #cbbda6;
  border-radius: 50%;
  color: #8e261d;
}

.exhibit-card:is(:hover, :focus-visible) .exhibit-arrow {
  border-color: #ad2920;
  background: #ad2920;
  color: #fff8e9;
}

@media (prefers-reduced-motion: reduce) {
  .exhibit-card:is(:hover, :focus-visible) .paper-art {
    transform: rotate(-8deg);
  }
}
</style>
