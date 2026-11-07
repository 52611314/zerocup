<script setup lang="ts">
const scenes = [
  {
    key: 'window',
    title: '窗前月',
    caption: '近处的窗，远处的山。留出一角，月色便落进来。',
    sky: ['#f7e5be', '#d49c6e'],
    moon: { x: 650, y: 113, radius: 70, color: '#fff3d3' },
    far: ['#d7a67f', 'M0 278 0 213 98 180 170 194 279 123 348 160 395 142 480 208 559 184 653 142 712 173 774 148 860 186 960 126V440H0Z'],
    middle: ['#aa5e49', 'M0 310V274L84 245 168 254 255 224 335 252 435 210 486 224 553 202 648 251 732 212 795 217 866 176 960 215V440H0Z'],
    structure: '#813b30',
    front: ['#412723', 'M0 363C80 333 125 352 190 321C240 296 304 316 365 352C408 379 472 375 530 360C642 331 738 369 819 335C875 311 925 313 960 324V440H0Z'],
    cuts: ['#d2926e', 'M26 378Q100 357 168 364M46 390Q134 371 193 378M610 383Q701 364 775 379M785 362Q869 335 936 341'],
  },
  {
    key: 'ridge',
    title: '山外山',
    caption: '一层山影压着一层。纸边微微错开，便有了远近。',
    sky: ['#344749', '#81938b'],
    moon: { x: 431, y: 103, radius: 54, color: '#f3e0aa' },
    far: ['#7d9488', 'M0 281V246L80 181 109 187 170 137 205 151 271 84 305 98 344 146 399 155 472 199 532 160 595 125 655 174 723 160 794 209 852 186 960 239V440H0Z'],
    middle: ['#425e54', 'M0 337V243L88 271 148 246 232 248 299 191 329 202 373 180 457 237 511 231 568 267 650 234 703 250 757 221 819 242 884 215 960 255V440H0Z'],
    structure: '#ad5942',
    front: ['#243934', 'M0 307L86 291 131 305 196 288 257 312 298 300 363 336 434 326 491 307 543 322 603 288 660 300 710 281 776 313 830 298 895 334 960 323V440H0Z'],
    cuts: ['#90a296', 'M32 326 79 310 131 321 200 302M109 346 162 330 239 340 278 322M471 345 532 330 577 339 625 313M727 309 778 329 838 314 894 346'],
  },
  {
    key: 'water',
    title: '水边灯',
    caption: '剪去桥洞的那一块纸，河面就有了光。',
    sky: ['#552e3e', '#c07461'],
    moon: { x: 659, y: 122, radius: 60, color: '#ffcc92' },
    far: ['#9d5960', 'M0 306V237L88 220 176 155 230 185 319 135 404 164 471 155 565 208 667 180 715 194 778 153 856 164 960 124V440H0Z'],
    middle: ['#733b49', 'M0 316V270L88 238 147 260 232 224 305 232 386 208 478 250 547 216 648 255 737 234 812 251 892 208 960 229V440H0Z'],
    structure: '#5c2d38',
    front: ['#38242e', 'M0 365C88 333 143 345 233 357C311 368 365 378 425 375C517 371 592 355 657 368C739 386 813 370 870 351C903 340 936 341 960 348V440H0Z'],
    cuts: ['#d18a64', 'M126 380C205 367 260 386 351 384M245 403C332 390 409 407 503 391M415 382C485 367 540 379 618 374M591 402C694 388 770 400 852 377'],
  },
] as const

const active = ref(0)
const scene = computed(() => scenes[active.value]!)
const artworkId = useId()
const panelId = `paper-scenes-${artworkId}`
const scenePaintId = computed(() => `${artworkId}-${scene.value.key}`)
const sceneIndex = computed(() => String(active.value + 1).padStart(2, '0'))
const direction = ref<'forward' | 'backward'>('forward')

function showScene(index: number, nextDirection?: 'forward' | 'backward') {
  if (index === active.value) return
  direction.value = nextDirection ?? (index > active.value ? 'forward' : 'backward')
  active.value = index
}

function nextScene() {
  showScene((active.value + 1) % scenes.length, 'forward')
}
</script>

<template>
  <section id="paper-scenes" class="paper-scenes" aria-labelledby="paper-scenes-title">
    <div class="wrap">
      <header class="scenes-heading">
        <div>
          <p class="scenes-kicker">纸上长卷 <span aria-hidden="true">/</span> <span lang="en">PAPER SCENES</span></p>
          <h2 id="paper-scenes-title">一纸三景。</h2>
        </div>
        <p class="scenes-intro">窗月、山影和桥灯，<br class="scenes-break"/> 随纸层一幅幅展开。</p>
      </header>

      <figure class="scenes-figure">
        <div :id="panelId" class="scenes-stage">
          <Transition :name="`turn-scene-${direction}`">
            <svg
              :key="scene.key"
              class="scene-plate"
              :data-scene="scene.key"
              viewBox="0 0 960 440"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <defs>
                <linearGradient :id="`${scenePaintId}-sky`" x2="12%" y2="100%">
                  <stop :stop-color="scene.sky[0]" />
                  <stop offset="100%" :stop-color="scene.sky[1]" />
                </linearGradient>
                <radialGradient :id="`${scenePaintId}-halo`">
                  <stop :stop-color="scene.moon.color" stop-opacity=".66" />
                  <stop offset="68%" :stop-color="scene.moon.color" stop-opacity=".23" />
                  <stop offset="100%" :stop-color="scene.moon.color" stop-opacity="0" />
                </radialGradient>
                <linearGradient :id="`${scenePaintId}-turn`">
                  <stop stop-color="#fff3d4" stop-opacity="0" />
                  <stop offset="68%" stop-color="#fff3d4" stop-opacity=".36" />
                  <stop offset="100%" stop-color="#fff3d4" stop-opacity="0" />
                </linearGradient>
              </defs>
              <rect width="960" height="440" :fill="`url(#${scenePaintId}-sky)`" />
              <g class="scene-light">
                <circle :cx="scene.moon.x" :cy="scene.moon.y" :r="scene.moon.radius * 2.3" :fill="`url(#${scenePaintId}-halo)`" />
                <circle class="scene-moon" :cx="scene.moon.x" :cy="scene.moon.y" :r="scene.moon.radius" :fill="scene.moon.color" />
                <path v-if="scene.key === 'window'" d="M469 116h63m-51 10h33M746 192h57m-44 8h31" fill="none" stroke="#fff1d3" stroke-width="2" opacity=".66" />
                <path v-else-if="scene.key === 'ridge'" d="M525 86h58m-37 10h55M291 128h44m-31 8h58" fill="none" stroke="#ddad8a" stroke-width="2" opacity=".65" />
                <path v-else d="M497 104h59m-38 10h61M725 143h65m-52 9h74" fill="none" stroke="#f7cb8d" stroke-width="2" opacity=".65" />
              </g>
              <path class="scene-distance paper-edge" :d="scene.far[1]" :fill="scene.far[0]" />
              <path class="scene-middle paper-edge" :d="scene.middle[1]" :fill="scene.middle[0]" />
              <g v-if="scene.key === 'water'" class="scene-river">
                <path class="paper-edge" d="M0 326C126 315 220 334 323 322S507 311 596 320S820 337 960 305V440H0Z" fill="#ad625e" />
                <path d="M124 343q65-10 123 1m47 7q73-16 125-8m20-15q54-8 90 2m-88 11q40-5 65 0m-82 10q58-7 102 0m112 14q76-16 134-9" fill="none" stroke="#f2ae7b" stroke-width="2" opacity=".78" />
              </g>
              <g class="scene-structure" :fill="scene.structure">
                <g v-if="scene.key === 'window'" transform="translate(42)">
                  <path d="M110 142C148 137 175 106 187 90H338C348 110 376 132 417 141L402 153H125Z" />
                  <path d="M144 156H384V164H144Z" fill="#522621" />
                  <path fill-rule="evenodd" d="M164 350V196C164 177 179 165 197 165H331C349 165 364 177 364 196V350H164ZM183 338H345V197C345 188 338 183 330 183H198C190 183 183 188 183 197Z" />
                  <path d="M203 185h7v159h-7zm56 0h8v159h-8zm56 0h7v159h-7zM179 222h171v7H179zM179 280h171v7H179z" />
                  <path d="m210 227 26 25 24-25m8 0 25 25 22-25m-105 58 26 25 24-25m8 0 25 25 22-25" fill="none" stroke="#822f27" stroke-width="4" />
                  <path d="M134 147h261M170 173h185" fill="none" stroke="#d99570" stroke-width="2" opacity=".68" />
                  <path d="M166 135q24-16 37-39m-8 40q19-18 25-40m5 40q10-16 14-40m15 40 3-40m24 40-2-40m26 40q-11-18-13-40m39 40q-18-16-24-40m49 39q-21-17-29-39" fill="none" stroke="#d99570" stroke-width="1.7" opacity=".65" />
                  <path d="M219 264l13-13 13 13-13 13Zm56 0 13-13 13 13-13 13Zm52 0 9-10 9 10-9 10Z" fill="#ae634b" />
                </g>
                <template v-else-if="scene.key === 'ridge'">
                  <path d="M514 245C543 240 576 219 590 196H649C660 216 685 235 718 244L701 253H532Z" />
                  <path d="M564 226C581 220 596 204 603 190L619 174 636 190C644 207 658 219 675 226L664 232H575Z" />
                  <path d="M553 251H682V298H669V262H637V299H624V262H598V297H585V262H566V300H553Z" />
                  <path d="M541 290H696V300H541Z" />
                  <path d="M551 247h130M585 228h81" fill="none" stroke="#e1a17a" stroke-width="2" opacity=".82" />
                  <path d="M671 260v17m8-13v11m-17-11v11" fill="none" stroke="#eec591" stroke-width="2" />
                  <path d="M553 284h129m-102-26v29m71-29v29" fill="none" stroke="#e1a17a" stroke-width="1.5" opacity=".64" />
                </template>
                <template v-else>
                  <path fill-rule="evenodd" d="M211 356C293 350 306 299 407 273C503 247 597 274 657 321C677 337 702 351 746 356V371H211V356ZM371 355H564C542 315 507 295 468 297C430 298 397 315 371 355ZM271 356H344C336 335 304 334 271 356ZM592 356H679C646 328 612 332 592 356Z" />
                  <path d="M233 352C303 341 317 297 409 274C505 249 593 275 656 321C683 344 708 351 736 354" fill="none" stroke="#df9a70" stroke-width="2.5" />
                  <path d="M349 294V261m13 26v-23m234 21v-23m12 32v-32" fill="none" stroke="#532722" stroke-width="3" />
                  <path d="M343 261h12v16h-12zm259 0h12v16h-12z" fill="#f5c082" />
                  <path d="M342 262h14m245 0h14" stroke="#542723" stroke-width="2" />
                </template>
              </g>
              <g class="scene-front">
                <path class="paper-edge" :d="scene.front[1]" :fill="scene.front[0]" />
                <path :d="scene.cuts[1]" fill="none" :stroke="scene.cuts[0]" stroke-width="2" opacity=".82" />
                <path v-if="scene.key === 'window'" d="M772 363Q791 326 803 292m-22 55q-12-31-33-47m29 47q35-17 47-40m-31 21q8-35 1-51M831 355q23-34 29-61m-17 47q-12-20-25-26m25 26q28-14 39-33" fill="none" stroke="#402822" stroke-width="5" />
                <path v-else-if="scene.key === 'ridge'" d="M218 325Q212 263 241 230Q239 270 250 318M229 284Q211 264 190 255M235 268Q247 251 267 242m-32 11Q217 238 201 241" fill="none" :stroke="scene.front[0]" stroke-width="6" />
                <path v-else d="M764 372q23-27 27-62m-21 50q-7-35-25-46m28 47q27-13 42-39m-40 42q-19-13-44-17M181 366q-17-18-26-42m21 38q3-24 13-34m-14 35q-26-10-35-17" fill="none" :stroke="scene.front[0]" stroke-width="4" />
              </g>
              <rect class="scene-fold-light" x="-140" width="140" height="440" :fill="`url(#${scenePaintId}-turn)`" />
            </svg>
          </Transition>
          <span class="scene-seal" aria-hidden="true">景</span>
        </div>

        <figcaption class="scenes-caption">
          <div class="scene-current" role="status">
            <span class="scene-number" aria-hidden="true">{{ sceneIndex }} / 03</span>
            <span class="sr-only">第 {{ active + 1 }} 景，共 3 景</span>
            <strong>{{ scene.title }}</strong>
          </div>
          <p>{{ scene.caption }}</p>
          <button type="button" class="scene-next" :aria-controls="panelId" @click="nextScene">翻一景 <span aria-hidden="true">→</span></button>
        </figcaption>
      </figure>

      <div class="scene-choices" role="group" aria-label="选择长卷画面">
        <button
          v-for="(choice, index) in scenes"
          :key="choice.key"
          type="button"
          class="scene-choice"
          :aria-pressed="active === index"
          :aria-controls="panelId"
          @click="showScene(index)"
        >
          <svg viewBox="0 0 960 440" aria-hidden="true">
            <rect width="960" height="440" :fill="choice.sky[0]" />
            <circle :cx="choice.moon.x" :cy="choice.moon.y" :r="choice.moon.radius" :fill="choice.moon.color" />
            <path :d="choice.far[1]" :fill="choice.far[0]" />
            <path :d="choice.middle[1]" :fill="choice.middle[0]" />
            <path :d="choice.front[1]" :fill="choice.front[0]" />
          </svg>
          <span class="scene-choice-label">
            <span aria-hidden="true">0{{ index + 1 }}</span>
            {{ choice.title }}
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.paper-scenes {
  padding-block: clamp(36px, 6.7vw, 95px);
  background:
    radial-gradient(ellipse at 45% 38%, #483127, transparent 70%),
    #261d19;
  color: #fff1d6;
}

.scenes-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px 35px;
  margin-bottom: clamp(18px, 3vw, 40px);
}

.scenes-kicker {
  margin: 0 0 8px;
  color: #edb390;
  font-size: 12px;
  letter-spacing: .14em;
}

.scenes-kicker span:first-child { margin-inline: .32em; }
.scenes-heading h2 { margin: 0; font-size: clamp(39px, 6vw, 90px); letter-spacing: -.05em; }
.scenes-intro { margin: 0 0 4px; color: #e7cdb1; line-height: 1.7; }
.scenes-figure { margin: 0; }

.scenes-stage {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  aspect-ratio: 960 / 440;
  border: clamp(5px, 1vw, 14px) solid #c6a37a;
  border-block-start-color: #e0bd91;
  border-block-end-color: #a37a55;
  background: #e9d2b2;
  box-shadow: 0 0 0 1px #271a13, 0 14px 30px #130e0a72;
}

.scenes-stage::before,
.scenes-stage::after {
  position: absolute;
  z-index: 3;
  content: '';
  pointer-events: none;
}

.scenes-stage::before {
  inset: 0;
  box-shadow: inset 0 0 24px #2b1c1273, inset 0 2px 5px #2b1c1266;
  background: repeating-linear-gradient(106deg, transparent 0 2px, #5c322d08 3px, transparent 4px);
}

.scenes-stage::after {
  inset: clamp(6px, 1.1vw, 15px);
  border: 1px solid #ffdfad60;
}

.scene-plate { position: absolute; inset: 0; width: 100%; height: 100%; }
.scene-seal {
  position: absolute;
  z-index: 4;
  inset: clamp(15px, 2.4vw, 32px) clamp(15px, 2.4vw, 32px) auto auto;
  display: grid;
  width: clamp(23px, 3vw, 40px);
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid #f6cea4;
  outline: 1px solid #7b322c;
  background: #8e362e;
  color: #fff0d0;
  font: 700 clamp(15px, 2vw, 23px)/1 var(--serif);
  box-shadow: 1px 3px 5px #381b1a47;
}

.scenes-caption {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(12px, 2.5vw, 35px);
  padding-block: clamp(14px, 1.8vw, 24px);
  border-bottom: 1px solid #74594a;
}

.scene-current { display: flex; align-items: baseline; gap: 13px; white-space: nowrap; }
.scene-number { color: #edb390; font: 12px/1.2 Georgia, serif; letter-spacing: .09em; }
.scene-current strong { font: 700 clamp(22px, 2.3vw, 32px)/1.1 var(--serif); }
.scenes-caption p { margin: 0; color: #e7cdb1; font-size: 14px; }
.scene-next {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 13px;
  border-color: #ba9576;
  color: #fff2d8;
  white-space: nowrap;
}

.scene-next:hover { border-color: #ffd5ae; background: #573329; }
.scene-next:focus-visible, .scene-choice:focus-visible { outline-color: #ffcc99; }
.scene-next span { color: #ffc79c; font-size: 1.12em; }

.scene-choices {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(6px, 1.5vw, 22px);
  margin-top: clamp(12px, 2.3vw, 30px);
}

.scene-choice {
  display: grid;
  grid-template-columns: minmax(0, .85fr) 1fr;
  align-items: center;
  gap: clamp(8px, 1.5vw, 19px);
  min-width: 0;
  padding: 5px;
  border: 1px solid #836451;
  background: #352720;
  color: #f8dec1;
  text-align: start;
}

.scene-choice:hover { border-color: #e7ae82; background: #503226; }
.scene-choice[aria-pressed="true"] { border-color: #e7ae82; background: #503226; box-shadow: inset 0 -2px #e7ae82; }
.scene-choice svg { display: block; width: 100%; }
.scene-choice-label { display: flex; align-items: baseline; gap: .55em; font: 700 clamp(14px, 2vw, 25px) / 1.3 var(--serif); }
.scene-choice-label span { color: #edb390; font: italic .55em Georgia, serif; }

.scene-distance, .scene-middle, .scene-river, .scene-structure, .scene-front, .scene-light {
  transform-box: view-box;
  transition: transform .66s cubic-bezier(.23,.7,.24,1);
}

.paper-edge { stroke: #ffe7b8; stroke-opacity: .16; stroke-width: 1.15; }
.scene-moon { stroke: #fff8df; stroke-opacity: .54; stroke-width: 1.4; }
.scene-distance { filter: drop-shadow(0 1px 2px #33231e40); }
.scene-middle, .scene-structure, .scene-river { filter: drop-shadow(0 4px 2px #2a171755); }
.scene-front { filter: drop-shadow(0 -3px 3px #2a17174f); }
.scene-fold-light { opacity: 0; }

@media (prefers-reduced-motion: no-preference) {
  .turn-scene-forward-enter-active, .turn-scene-backward-enter-active {
    z-index: 2;
    transition: clip-path .66s cubic-bezier(.32,.72,.25,1);
  }
  .turn-scene-forward-leave-active, .turn-scene-backward-leave-active {
    transition: opacity .15s .55s ease;
  }
  .turn-scene-forward-leave-to, .turn-scene-backward-leave-to { opacity: 0; }
  .turn-scene-forward-enter-from { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%, 94% 50%); --layer-direction: 1; }
  .turn-scene-forward-enter-to { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 50%); }
  .turn-scene-backward-enter-from { clip-path: polygon(0 0, 0 0, 6% 50%, 0 100%, 0 100%); --layer-direction: -1; }
  .turn-scene-backward-enter-to { clip-path: polygon(0 0, 100% 0, 100% 50%, 100% 100%, 0 100%); }
  .turn-scene-forward-enter-active .scene-fold-light { animation: crease-sheen .66s cubic-bezier(.32,.72,.25,1) both; }
  .turn-scene-backward-enter-active .scene-fold-light { animation: crease-sheen .66s cubic-bezier(.32,.72,.25,1) both reverse; }
  @keyframes crease-sheen {
    0% { transform: translateX(1100px); opacity: 0; }
    17% { opacity: 1; }
    78% { opacity: .75; }
    100% { transform: translateX(0); opacity: 0; }
  }
  :is(.turn-scene-forward-enter-from, .turn-scene-backward-enter-from) .scene-light { transform: translateX(calc(1.5% * var(--layer-direction))); }
  :is(.turn-scene-forward-enter-from, .turn-scene-backward-enter-from) .scene-distance { transform: translateX(calc(3% * var(--layer-direction))); }
  :is(.turn-scene-forward-enter-from, .turn-scene-backward-enter-from) :is(.scene-middle, .scene-river) { transform: translateX(calc(5% * var(--layer-direction))); }
  :is(.turn-scene-forward-enter-from, .turn-scene-backward-enter-from) .scene-structure { transform: translateX(calc(7% * var(--layer-direction))); }
  :is(.turn-scene-forward-enter-from, .turn-scene-backward-enter-from) .scene-front { transform: translateX(calc(10% * var(--layer-direction))); }
}

@media (max-width: 690px) {
  .scenes-heading { flex-direction: column; align-items: start; gap: 10px; }
  .scenes-break { display: none; }
  .scenes-stage { aspect-ratio: 1.48; }
  .scenes-caption { grid-template-columns: minmax(0, 1fr) auto; gap: 6px 10px; }
  .scenes-caption p { grid-column: 1 / -1; grid-row: 2; }
  .scene-next { grid-column: 2; grid-row: 1; }
  .scene-choice { grid-template-columns: minmax(0, 1fr); gap: 5px; }
  .scene-choice-label { justify-content: center; }
}
</style>
