<script setup lang="ts">
import { blankModel, cutPath } from '../../shared/model'
import { FIRST_CUT_IMPRINT, LEARN_WINDOW_MODEL } from '../../shared/patterns'

import { measureWindowArtwork, type WindowWork } from '../composables/useWindowFlight'
const props=defineProps<{featuredWork?:WindowWork}>()
const flight=useWindowFlight()
const firstSheet = blankModel()
const guideCut = { id: 'window-guide', type: 'drop' as const, ...FIRST_CUT_IMPRINT }
const lessonSheet = { ...firstSheet, cuts: [{ id: 'window-lesson', type: 'circle' as const, x: 62, y: 25, size: 9, aspect: 1, angle: 0 }] }
const windows = [
  { key: 'learn', to: '/learn', number: '01', title: '纸上学堂', description: '从一纸窗花，读懂剪纸里的生活。' },
  { key: 'tutorials', to: '/tutorials', number: '02', title: '入门教程', description: '跟着一道折痕，看一孔怎样变成八孔。' },
  { key: 'studio', to: '/studio', number: '03', title: '剪纸工坊', description: '沿一条折痕，剪出自己的纹样。' },
  { key: 'gallery', to: '/gallery', number: '04', title: '纸上展览', description: '看看同一张纸，能开出多少种花。' }
] as const

function prepareGalleryFlight(link: HTMLAnchorElement) {
  if (!props.featuredWork) return
  const art = link.querySelector<SVGSVGElement>('[data-window-work]')
  if (art) flight.value = { work: props.featuredWork, pose: measureWindowArtwork(art) }
}
</script>

<template>
  <section id="paper-windows" class="wrap paper-windows" aria-labelledby="paper-windows-title">
    <div class="windows-heading">
      <div>
        <p class="windows-kicker"><span aria-hidden="true">✦</span> 四扇纸窗</p>
        <h2 id="paper-windows-title">穿过一扇窗</h2>
      </div>
      <p>读一页，剪一刀，再去看一场展。</p>
    </div>

    <ul class="window-list">
      <li v-for="entry in windows" :key="entry.key" :class="`window-${entry.key}`">
        <ChapterLink class="window-link" :to="entry.to" :before-open="entry.key === 'gallery' ? prepareGalleryFlight : undefined">
            <span class="window-mat" aria-hidden="true">
              <span class="window-cut">
                <span class="window-scene">
                  <span v-if="entry.key === 'learn'" class="window-folio">
                    <span class="folio-kicker">图版 01</span>
                    <strong>水滴连珠</strong>
                    <span class="folio-lines"/>
                    <PaperArt :model="LEARN_WINDOW_MODEL" />
                  </span>
                  <span v-else-if="entry.key === 'tutorials'" class="window-lesson">
                    <PaperArt :model="lessonSheet" folded />
                    <PaperArt :model="lessonSheet" />
                  </span>
                  <template v-else-if="entry.key === 'studio'">
                    <span class="window-fold-line"/>
                    <span class="window-studio-sheet">
                      <PaperArt :model="firstSheet" folded />
                      <svg class="window-stencil" viewBox="-108 -108 216 216" aria-hidden="true">
                        <path :d="cutPath(guideCut)" :transform="`translate(${guideCut.x} ${guideCut.y}) rotate(${guideCut.angle})`" />
                      </svg>
                    </span>
                  </template>
                  <template v-else>
                    <span class="window-mount"/>
                    <PaperArt v-if="featuredWork" :model="featuredWork.model" :data-window-work="featuredWork.id" :class="{ 'window-work-in-flight': flight?.work.id === featuredWork.id }" />
                    <span v-else class="window-empty">等待下一朵花</span>
                  </template>
                </span>
              </span>
            </span>
            <span class="window-caption">
              <span class="caption-number" aria-hidden="true">{{ entry.number }}</span>
              <span class="caption-copy">
                <strong>{{ entry.title }}</strong>
                <span>{{ entry.description }}</span>
              </span>
              <span class="caption-arrow" aria-hidden="true">↗</span>
            </span>
        </ChapterLink>
      </li>
    </ul>

  </section>
</template>

<style scoped>
.paper-windows {
  --window-ink: #30221c;
  --window-red: #8d3629;
  --window-seam: #9e715048;
  padding-block: clamp(44px, 7vw, 102px) clamp(44px, 7vw, 100px);
}

.windows-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px 32px;
  margin-bottom: clamp(20px, 2.8vw, 38px);
  padding-bottom: 14px;
  border-bottom: 1px solid #b08a68;
}

.windows-kicker {
  margin: 0;
  color: var(--window-red);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .16em;
}

.windows-kicker span { margin-right: .35em; }

.windows-heading h2 {
  margin: .12em 0 0;
  color: var(--window-ink);
  font-size: clamp(36px, 5.2vw, 72px);
  letter-spacing: -.045em;
}

.windows-heading > p {
  margin: 0 0 .3em;
  color: #6a4a3a;
  font-size: clamp(13px, 1.1vw, 16px);
}

.window-list {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: clamp(10px, 1.65vw, 24px);
  border: 1px solid #b18a688c;
  background:
    linear-gradient(118deg, transparent 35%, #9e715015 35.2%, transparent 50%, #9e71501d 50.3%, transparent 69%),
    repeating-linear-gradient(111deg, transparent 0 7px, #9d74540c 7px 8px),
    radial-gradient(ellipse at 17% 0%, #fff7e6 0, #f7e7cb 56%, #ecd6b5 100%);
  box-shadow: 0 14px 24px #764d2c15, inset 0 1px #fff7e3;
  list-style: none;
}

.window-list::after {
  position: absolute;
  inset: 6px;
  border: 1px solid #a77d5750;
  content: '';
  pointer-events: none;
}

.window-list > li {
  min-width: 0;
  padding-inline: clamp(10px, 1.65vw, 24px);
}

.window-list > li + li { border-inline-start: 1px solid var(--window-seam); }

.window-link {
  display: block;
  height: 100%;
}

.window-link:focus-visible { outline: 2px solid var(--window-red); outline-offset: 5px; }

.window-mat {
  position: relative;
  display: grid;
  place-items: center;
  isolation: isolate;
  aspect-ratio: 1.37;
}

.window-cut {
  position: relative;
  display: grid;
  width: 68%;
  aspect-ratio: 1.1;
  overflow: hidden;
  background: linear-gradient(145deg, #946442, #e5c395 59%, #fff1d2);
  box-shadow: 0 0 0 1px #9363449c, inset 2px 5px 9px #4c241d6b, 4px 7px 13px #6c4b2b40;
}

.window-learn .window-cut { border-radius: 49% 49% 3px 3px / 49% 49% 3px 3px; }
.window-tutorials .window-cut { transform: rotate(-8deg); }

.window-studio .window-mat::before {
  position: absolute;
  z-index: -1;
  inset: 15% 3% 12%;
  background:
    linear-gradient(117deg, #79523818, transparent 36% 68%, #7952381f),
    radial-gradient(ellipse at 38% 19%, #fff1d9, #e6cbab 79%);
  box-shadow: inset 0 1px #fff9e9, 0 1px #cba98a8c;
  content: '';
}

.window-studio .window-cut {
  width: 81%;
  aspect-ratio: 1.84;
  margin-top: -3%;
  overflow: visible;
  border: 1px solid #674026;
  background:
    repeating-linear-gradient(0deg, transparent 0 4px, #4d2d182b 4px 5px, transparent 6px 9px),
    linear-gradient(145deg, #b98051, #704023 82%);
  box-shadow: 0 5px 12px #5635204d, inset 0 0 0 2px #d8a97573;
}

.window-studio .window-cut::after {
  position: absolute;
  inset: auto -5% -6px;
  height: clamp(6px, .72vw, 10px);
  border-block: 1px solid #6b3f27;
  background: linear-gradient(#d7aa79 0 25%, #a8734c 28% 52%, #7d4c31 55%);
  box-shadow: 0 4px 6px #67412665;
  content: '';
}

.window-gallery .window-cut {
  width: 65%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: linear-gradient(145deg, #7b4e35, #d5a879 65%, #ffe1b0);
}

.window-scene {
  position: absolute;
  inset: 5px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px #48271852, inset 3px 6px 11px #48271826;
  transition: transform .4s cubic-bezier(.2,.72,.25,1);
}

.window-link:is(:hover, :focus-visible) .window-scene { transform: scale(1.09); }

.window-learn .window-scene {
  background:
    linear-gradient(136deg, #5a362842 0 22%, transparent 23%),
    radial-gradient(ellipse at 15% 12%, #f9dfab, #bc8563);
}

.window-folio {
  position: relative;
  display: block;
  width: 73%;
  min-height: 69%;
  margin-top: 11%;
  padding: 10% 8% 8%;
  overflow: hidden;
  transform: rotate(-7deg);
  background: #fff3dc;
  box-shadow: 3px 5px 11px #603b3050;
  color: #51261c;
}

.folio-kicker {
  display: block;
  color: #8e2b22;
  font-size: clamp(7px, .78vw, 11px);
  font-weight: 700;
  letter-spacing: .14em;
}

.window-folio strong {
  position: relative;
  z-index: 1;
  display: block;
  margin-top: 7%;
  font: 700 clamp(9px, 1.11vw, 16px)/1.22 var(--serif);
}

.folio-lines {
  display: block;
  width: 62%;
  height: 12px;
  margin-top: 9%;
  opacity: .55;
  background: repeating-linear-gradient(#aa8068 0 1px, transparent 1px 5px);
}

.window-folio :deep(.paper-art) {
  position: absolute;
  right: -9%;
  bottom: -12%;
  width: 66%;
  opacity: .72;
}

.window-tutorials .window-scene {
  background: radial-gradient(ellipse at 60% 45%, #fff4ce, #d19a64);
}

.window-lesson {
  position: relative;
  display: block;
  width: 85%;
  aspect-ratio: 1;
}

.window-lesson :deep(.paper-art) {
  position: absolute;
  width: 73%;
  filter: drop-shadow(2px 3px 1px #62372353);
}

.window-lesson :deep(.paper-art:first-child) {
  inset: auto auto 6% -15%;
  transform: rotate(-20deg);
}

.window-lesson :deep(.paper-art:last-child) { inset: 9% 1% auto auto; }

.window-studio .window-scene {
  background:
    repeating-linear-gradient(0deg, transparent 0 13px, #78533c26 13px 14px),
    repeating-linear-gradient(90deg, transparent 0 13px, #78533c26 13px 14px),
    linear-gradient(140deg, #b68b68 1%, #f5dfba 50%, #e9c89d);
}

.window-studio .window-link:is(:hover, :focus-visible) .window-scene { transform: none; }

.window-studio .window-scene::after {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, transparent calc(50% - 2px), #b17b53 calc(50% - 1px), #76462d calc(50% + 1px), transparent calc(50% + 2px)),
    linear-gradient(transparent calc(27% - 1px), #946443 27%, #6e422a calc(27% + 1px), transparent calc(27% + 2px));
  content: '';
}

.window-studio-sheet {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 124%;
  max-width: none;
  transform: translate(-68%, -60%) rotate(-15deg);
  filter: drop-shadow(4px 5px 2px #45231a53);
}

.window-stencil {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: none;
  stroke: #ffe8bc;
  stroke-width: 1.3;
  stroke-dasharray: 2 1.5;
}

.window-fold-line {
  position: absolute;
  left: 22%;
  width: 63%;
  transform: rotate(-20deg);
  border-top: 1px dashed #865f44b3;
}

.window-mount {
  position: absolute;
  width: 66%;
  aspect-ratio: 1;
  transform: rotate(13deg);
  border: 1px solid #b68e61;
  background: #f2dfbb;
  box-shadow: 0 3px 12px #4318105c;
}

.window-gallery .window-scene {
  background:
    linear-gradient(135deg, #4b1b1b54 15%, transparent 42%),
    radial-gradient(ellipse at 33% 38%, #b7513b, #65271f);
}

.window-gallery .window-scene :deep(.paper-art) {
  z-index: 1;
  width: 63%;
  transform: rotate(-10deg);
  filter: drop-shadow(3px 4px 2px #54271d41);
}
.window-work-in-flight { opacity: 0; }

.window-caption {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: clamp(9px, 1.1vw, 16px);
  padding: 14px 1px clamp(6px, 1vw, 16px);
  border-top: 1px solid var(--window-seam);
  color: var(--window-ink);
}

.caption-number {
  padding-top: 2px;
  color: var(--window-red);
  font: italic clamp(17px, 1.8vw, 27px)/1.1 Georgia, serif;
}

.caption-copy strong {
  display: block;
  margin-bottom: 5px;
  font: 700 clamp(20px, 2.1vw, 32px)/1.18 var(--serif);
}

.caption-copy > span { display: block; color: #6a4a3a; font-size: 13px; }

.caption-arrow {
  color: var(--window-red);
  transition: transform .22s ease;
}

.window-link:is(:hover, :focus-visible) .caption-arrow { transform: translate(3px, -3px); }

@media (701px <= width <= 1000px) {
  .window-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .window-list > li:nth-child(odd) { border-inline-start: 0; }
  .window-list > li:nth-child(n+3) { border-top: 1px solid var(--window-seam); }
  .window-mat { aspect-ratio: 1.65; }
}
@media (max-width: 700px) {
  .windows-heading { display: block; }
  .windows-heading > p { margin: 9px 0 0; }
  .window-list { grid-template-columns: 1fr; padding: 7px 12px; }
  .window-list > li { padding-inline: 2px; }
  .window-list > li + li { border-inline-start: 0; border-top: 1px solid var(--window-seam); }
  .window-link {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.12fr);
    align-items: center;
    gap: clamp(7px, 2.6vw, 20px);
    padding-block: 7px;
  }
  .window-mat { aspect-ratio: 1.12; }
  .window-cut { width: min(84%, 180px); }
  .window-studio .window-cut { width: min(86%, 184px); }
  .window-gallery .window-cut { width: min(76%, 164px); }
  .window-caption { gap: 5px 6px; grid-template-columns: auto minmax(0, 1fr) auto; border-top: 0; padding: 8px 2px; }
  .caption-number { font-size: 14px; }
  .caption-copy strong { font-size: clamp(18px, 4.7vw, 24px); }
  .caption-copy > span { font-size: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .window-link:is(:hover, :focus-visible) .window-scene,
  .window-link:is(:hover, :focus-visible) .caption-arrow { transform: none; }
}
</style>
