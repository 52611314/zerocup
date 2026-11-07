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
  galleryMount?: boolean
}>()
</script>

<template>
  <NuxtLink
    :to="privateWork ? `/studio?draft=${work.id}` : `/gallery/${work.id}`"
    class="work-card"
    :class="{ 'exhibit-card': exhibitNumber && !galleryMount, 'gallery-mount-card': galleryMount }"
  >
    <div class="work-mount">
      <span v-if="exhibitNumber && !galleryMount" class="exhibit-number" aria-hidden="true">NO. {{ exhibitNumber }}</span>
      <PaperArt :model="work.model" :label="work.title" aria-hidden="true" />
      <span v-if="!galleryMount" class="mount-corner">{{ work.is_example ? '原创示例' : '访客创作' }}</span>
    </div>
    <div class="work-caption">
      <span v-if="galleryMount && exhibitNumber" class="gallery-label-number" aria-hidden="true">{{ exhibitNumber }}</span>
      <div>
        <p>
          {{ privateWork && work.status ? statusLabels[work.status] : work.category }}
          <span v-if="galleryMount" class="gallery-label-origin">{{ work.is_example ? '原创示例' : '访客创作' }}</span>
        </p>
        <h3>{{ work.title }}</h3>
      </div>
      <span class="exhibit-arrow" aria-hidden="true">↗</span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.work-card:not(.exhibit-card, .gallery-mount-card) .work-caption div {
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

.gallery-mount-card {
  --mount-center: #fff8e9;
  --mount-edge: #ddc6a7;
  --mount-turn: -6deg;
  display: flex;
  min-width: 0;
  flex-direction: column;
  border-bottom: 1px solid #b9a083;
  color: #2a1c18;
}

.gallery-mount-card:nth-child(3n + 2) {
  --mount-center: #fcf4df;
  --mount-edge: #d1ceb3;
  --mount-turn: 5deg;
}

.gallery-mount-card:nth-child(3n) {
  --mount-center: #fff0df;
  --mount-edge: #dfbca4;
  --mount-turn: -3deg;
}

.work-card.gallery-mount-card .work-mount {
  isolation: isolate;
  aspect-ratio: var(--gallery-mount-ratio, 1.28);
  border: 1px solid var(--mount-border, #ad8d6c);
  background:
    repeating-linear-gradient(119deg, transparent 0 5px, #9c795019 6px, transparent 7px),
    radial-gradient(ellipse at 42% 32%, var(--mount-center), var(--mount-edge));
}

.gallery-mount-card .work-mount::before {
  position: absolute;
  z-index: -1;
  inset: clamp(8px, 1.5vw, 18px);
  border: 1px solid var(--mount-frame, #90684757);
  content: '';
}

.gallery-mount-card .work-mount::after {
  position: absolute;
  z-index: -1;
  width: min(58%, 406px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--mount-aperture, transparent);
  box-shadow: var(--mount-aperture-shadow, none);
  content: '';
}

.gallery-mount-card .paper-art {
  width: min(var(--gallery-art-width, 71%), var(--gallery-art-max, 300px));
  max-height: 88%;
  transform: rotate(var(--mount-turn));
  filter: drop-shadow(3px 6px 4px #50251730);
  transition: transform .38s cubic-bezier(.22, .7, .25, 1);
}

.gallery-mount-card:is(:hover, :focus-visible) .paper-art {
  transform: rotate(0) scale(1.045);
}

.gallery-mount-card .work-caption {
  flex: 1;
  align-items: baseline;
  gap: clamp(9px, 1.5vw, 18px);
  padding: clamp(12px, 2vw, 20px) 0 13px;
}

.gallery-label-number {
  flex: none;
  min-width: 2ch;
  color: #87271f;
  font: 400 clamp(26px, 3.6vw, 51px)/.9 Georgia, serif;
  font-variant-numeric: tabular-nums;
  letter-spacing: -.07em;
}

.gallery-mount-card .work-caption div {
  flex: 1;
  min-width: 0;
}

.gallery-mount-card .work-caption p {
  margin: 0 0 5px;
  color: #674538;
  font-size: 11px;
  letter-spacing: .07em;
}

.gallery-label-origin {
  display: inline-block;
  margin-inline-start: .45em;
  border-inline-start: 1px solid #a48169;
  padding-inline-start: .55em;
}

.gallery-mount-card .work-caption h3 {
  margin: 0;
  font-size: clamp(21px, 2.5vw, 35px);
  overflow-wrap: anywhere;
}

.gallery-mount-card .exhibit-arrow {
  align-self: center;
  flex: none;
  padding-inline: 2px;
  border-block-end: 1px solid #b39477;
  color: #87271f;
  font-size: 1.24rem;
}

.gallery-mount-card:is(:hover, :focus-visible) .exhibit-arrow {
  border-color: #87271f;
}

@media (min-width: 380px) and (max-width: 540px) {
  .gallery-label-origin {
    display: block;
    margin-inline-start: 0;
    border-inline-start: 0;
    padding-inline-start: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .exhibit-card:is(:hover, :focus-visible) .paper-art {
    transform: rotate(-8deg);
  }

  .gallery-mount-card:is(:hover, :focus-visible) .paper-art {
    transform: rotate(var(--mount-turn));
  }
}
</style>
