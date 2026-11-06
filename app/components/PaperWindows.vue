<script setup lang="ts">
import { isNavigationFailure } from 'vue-router'
import { starterModels } from '../../shared/patterns'

const windows = [
  { key: 'learn', to: '/learn', number: '01', title: '纸上学堂', description: '从一纸窗花，读懂剪纸里的生活。', model: starterModels[1]! },
  { key: 'studio', to: '/studio', number: '02', title: '剪纸工坊', description: '沿一条折痕，剪出自己的纹样。', model: starterModels[6]! },
  { key: 'gallery', to: '/gallery', number: '03', title: '纸上展览', description: '看看同一张纸，能开出多少种花。', model: starterModels[2]! }
] as const

type WindowEntry = typeof windows[number]
const passage = ref<{ entry: WindowEntry; x: number; y: number }>()
const paperWindowTarget = useState('paper-window-target', () => '')
let timer: ReturnType<typeof setTimeout> | undefined
let destination: WindowEntry['to'] | undefined

function cancelPassage() {
  clearTimeout(timer)
  timer = undefined
  destination = undefined
  passage.value = undefined
}

async function goTo(entry: WindowEntry) {
  if (passage.value) paperWindowTarget.value = entry.to
  try {
    const result = await navigateTo(entry.to)
    if (result === false || isNavigationFailure(result)) cancelPassage()
  } catch {
    cancelPassage()
  } finally {
    if (paperWindowTarget.value === entry.to) paperWindowTarget.value = ''
  }
}

function openWindow(event: MouseEvent, entry: WindowEntry) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  if (destination) return
  destination = entry.to
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    void goTo(entry)
    return
  }

  const link = event.currentTarget as HTMLAnchorElement
  const aperture = link.querySelector('.window-cut')!.getBoundingClientRect()
  passage.value = { entry, x: aperture.left + aperture.width / 2, y: aperture.top + aperture.height / 2 }
  timer = setTimeout(() => {
    timer = undefined
    void goTo(entry)
  }, 350)
}

onBeforeRouteLeave(to => {
  if (timer !== undefined || to.path !== destination) cancelPassage()
})
onBeforeUnmount(cancelPassage)
</script>

<template>
  <section id="paper-windows" class="wrap paper-windows" aria-labelledby="paper-windows-title">
    <div class="windows-heading">
      <div>
        <p class="windows-kicker"><span aria-hidden="true">✦</span> 三扇纸窗</p>
        <h2 id="paper-windows-title">穿过一扇窗</h2>
      </div>
      <p>读一页，剪一刀，再去看一场展。</p>
    </div>

    <ul class="window-list">
      <li v-for="entry in windows" :key="entry.key" :class="`window-${entry.key}`">
        <NuxtLink :to="entry.to" custom v-slot="{ href }">
          <a class="window-link" :href="href" :data-passing="passage?.entry.key === entry.key || undefined" @click="openWindow($event, entry)">
            <span class="window-mat" aria-hidden="true">
              <span class="window-mark">FIG. {{ entry.number }}</span>
              <span class="window-cut">
                <span class="window-scene">
                  <span v-if="entry.key === 'learn'" class="window-folio">
                    <span class="folio-kicker">纸上札记</span>
                    <strong>一纸窗花，<br>把日子剪成风景。</strong>
                    <span class="folio-lines"/>
                    <PaperArt :model="entry.model" />
                  </span>
                  <template v-else-if="entry.key === 'studio'">
                    <span class="window-fold-line"/>
                    <PaperArt :model="entry.model" folded />
                  </template>
                  <template v-else>
                    <span class="window-mount"/>
                    <PaperArt :model="entry.model" />
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
          </a>
        </NuxtLink>
      </li>
    </ul>

    <Teleport v-if="passage" to="body">
      <div class="window-passage" :class="`passage-${passage.entry.key}`"
        :style="{ '--origin-x': passage.x + 'px', '--origin-y': passage.y + 'px' }" aria-hidden="true"/>
    </Teleport>
  </section>
</template>

<style scoped>
.paper-windows {
  --window-ink: #2a1c18;
  --window-red: #85251e;
  --window-cream: #f8edd9;
  padding-block: clamp(44px, 6vw, 86px);
}

.windows-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px 32px;
  margin-bottom: clamp(20px, 2.7vw, 36px);
  padding-bottom: 18px;
  border-bottom: 1px solid #c6a88d;
}

.windows-kicker {
  margin: 0;
  color: var(--window-red);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .16em;
}

.windows-kicker span { margin-right: .35em; }

.windows-heading h2 {
  margin: .12em 0 0;
  color: var(--window-ink);
  font-size: clamp(32px, 4.6vw, 66px);
  letter-spacing: -.045em;
}

.windows-heading > p {
  margin: 0 0 .3em;
  color: #6a4a3a;
  font-size: clamp(13px, 1.1vw, 16px);
}

.window-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(14px, 2vw, 29px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.window-link { display: block; height: 100%; }

.window-mat {
  position: relative;
  display: grid;
  place-items: center;
  isolation: isolate;
  aspect-ratio: 1.34;
  overflow: hidden;
  color: var(--window-cream);
  background:
    repeating-linear-gradient(112deg, transparent 0 6px, #f9e4bf08 6px 7px),
    radial-gradient(ellipse at 50% 42%, #9d382c, #62211c);
}

.window-mat::before {
  position: absolute;
  inset: 10px;
  border: 1px solid #f6dcc054;
  content: '';
}

.window-studio .window-mat {
  background:
    repeating-linear-gradient(108deg, transparent 0 6px, #f9e4bf08 6px 7px),
    radial-gradient(ellipse at 50% 42%, #51362b, #291b17);
}

.window-gallery .window-mat {
  color: #713228;
  background:
    repeating-linear-gradient(108deg, transparent 0 6px, #8b58200a 6px 7px),
    radial-gradient(ellipse at 50% 42%, #f4e3c8, #d7bc95);
}

.window-gallery .window-mat::before { border-color: #875f466b; }

.window-mark {
  position: absolute;
  z-index: 1;
  top: 18px;
  left: 18px;
  font: 10px/1 Georgia, serif;
  letter-spacing: .14em;
}

.window-cut {
  position: relative;
  display: grid;
  width: 61%;
  aspect-ratio: 1.1;
  overflow: hidden;
  background: #f6e7ca;
  box-shadow: 0 0 0 1px #f5d6af71, inset 0 0 18px #51271d4f, 0 5px 17px #19070463;
}

.window-learn .window-cut { border-radius: 49% 49% 3px 3px / 49% 49% 3px 3px; }

.window-studio .window-cut {
  width: 67%;
  background: #e6c99e;
  clip-path: polygon(13% 0, 87% 0, 100% 15%, 100% 85%, 87% 100%, 13% 100%, 0 85%, 0 15%);
}

.window-gallery .window-cut {
  width: 62%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #a33a2f;
  box-shadow: 0 0 0 1px #7b473a66, inset 0 0 22px #4b1b1670, 0 5px 15px #5a392643;
}

.window-scene {
  position: absolute;
  inset: 5px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: inherit;
  box-shadow: inset 0 0 0 1px #48271832;
  transition: transform .4s cubic-bezier(.2,.72,.25,1);
}

.window-link:is(:hover, :focus-visible) .window-scene { transform: scale(1.09); }
.window-link[data-passing] .window-scene { transform: scale(1.32); }

.window-learn .window-scene {
  background:
    linear-gradient(140deg, #fdf3dc, transparent 58%),
    #dfbc8f;
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
  right: -12%;
  bottom: -24%;
  width: 66%;
  opacity: .21;
}

.window-studio .window-scene {
  background:
    repeating-linear-gradient(0deg, transparent 0 13px, #78533c26 13px 14px),
    repeating-linear-gradient(90deg, transparent 0 13px, #78533c26 13px 14px),
    #ead2a9;
}

.window-studio .window-scene :deep(.paper-art) {
  width: 126%;
  max-width: none;
  transform: translate(-24%, -13%) rotate(-20deg);
  filter: drop-shadow(4px 5px 2px #45231a53);
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

.window-gallery .window-scene :deep(.paper-art) {
  z-index: 1;
  width: 63%;
  transform: rotate(-10deg);
  filter: drop-shadow(3px 4px 2px #54271d41);
}

.window-caption {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: clamp(9px, 1.2vw, 18px);
  padding: 15px 1px 17px;
  border-bottom: 1px solid #c6a88d;
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
  font: 700 clamp(19px, 2.1vw, 30px)/1.18 var(--serif);
}

.caption-copy > span { display: block; color: #6a4a3a; font-size: 13px; }

.caption-arrow {
  color: var(--window-red);
  transition: transform .22s ease;
}

.window-link:is(:hover, :focus-visible) .caption-arrow { transform: translate(3px, -3px); }

.window-passage {
  position: fixed;
  inset: 0;
  z-index: 11;
  pointer-events: none;
  background:
    repeating-linear-gradient(112deg, transparent 0 6px, #f9e4bf10 6px 7px),
    radial-gradient(circle at var(--origin-x) var(--origin-y), #b45942, #85251e 49%, #2a1c18);
  animation: paper-window-passage .58s cubic-bezier(.28,.74,.34,1) both;
}

.passage-studio {
  background:
    repeating-linear-gradient(112deg, transparent 0 6px, #f9e4bf10 6px 7px),
    radial-gradient(circle at var(--origin-x) var(--origin-y), #8b6950, #473027 49%, #2a1c18);
}

.passage-gallery {
  background:
    repeating-linear-gradient(112deg, transparent 0 6px, #5128170c 6px 7px),
    radial-gradient(circle at var(--origin-x) var(--origin-y), #fff3d8, #dfbf90 60%, #8d5640);
}

@keyframes paper-window-passage {
  0% { clip-path: circle(3% at var(--origin-x) var(--origin-y)); opacity: .22; }
  59% { clip-path: circle(150% at var(--origin-x) var(--origin-y)); opacity: 1; }
  100% { clip-path: circle(150% at var(--origin-x) var(--origin-y)); opacity: 0; }
}

@media (max-width: 700px) {
  .windows-heading { display: block; }
  .windows-heading > p { margin: 9px 0 0; }
  .window-list { grid-template-columns: 1fr; gap: 23px; }
  .window-mat { aspect-ratio: 1.64; }
  .window-cut { width: min(60%, 230px); }
  .window-studio .window-cut { width: min(57%, 224px); }
  .window-gallery .window-cut { width: min(46%, 180px); }
  .folio-kicker { font-size: 10px; }
  .window-folio strong { font-size: clamp(10px, 3.5vw, 15px); }
}

@media (prefers-reduced-motion: reduce) {
  .window-link:is(:hover, :focus-visible, [data-passing]) .window-scene,
  .window-link:is(:hover, :focus-visible) .caption-arrow { transform: none; }
  .window-passage { display: none; }
}
</style>
