<script setup lang="ts">
const scenes = [
  {
    key: 'window',
    title: '窗前月',
    caption: '近处的窗，远处的山。留出一角，月色便落进来。',
    sky: ['#f7ebd2', '#d5a079'],
    moon: { x: 683, y: 108, radius: 63, color: '#fff4d4' },
    far: ['#d6a885', 'M0 278 0 213 98 180 170 194 279 123 348 160 395 142 480 208 559 184 653 142 712 173 774 148 860 186 960 126V440H0Z'],
    middle: ['#ab614a', 'M0 310V274L84 245 168 254 255 224 335 252 435 210 486 224 553 202 648 251 732 212 795 217 866 176 960 215V440H0Z'],
    structure: '#822f27',
    front: ['#402822', 'M0 363C80 333 125 352 190 321C240 296 304 316 365 352C408 379 472 375 530 360C642 331 738 369 819 335C875 311 925 313 960 324V440H0Z'],
    cuts: ['#bd8564', 'M26 378Q100 357 168 364M46 390Q134 371 193 378M610 383Q701 364 775 379M785 362Q869 335 936 341'],
  },
  {
    key: 'ridge',
    title: '山外山',
    caption: '一层山影压着一层。纸边微微错开，便有了远近。',
    sky: ['#241b1a', '#68453b'],
    moon: { x: 431, y: 103, radius: 54, color: '#f0d5a5' },
    far: ['#a97664', 'M0 281V246L80 181 109 187 170 137 205 151 271 84 305 98 344 146 399 155 472 199 532 160 595 125 655 174 723 160 794 209 852 186 960 239V440H0Z'],
    middle: ['#693a32', 'M0 337V243L88 271 148 246 232 248 299 191 329 202 373 180 457 237 511 231 568 267 650 234 703 250 757 221 819 242 884 215 960 255V440H0Z'],
    structure: '#a44937',
    front: ['#2d211d', 'M0 307L86 291 131 305 196 288 257 312 298 300 363 336 434 326 491 307 543 322 603 288 660 300 710 281 776 313 830 298 895 334 960 323V440H0Z'],
    cuts: ['#987061', 'M32 326 79 310 131 321 200 302M109 346 162 330 239 340 278 322M471 345 532 330 577 339 625 313M727 309 778 329 838 314 894 346'],
  },
  {
    key: 'water',
    title: '水边灯',
    caption: '剪去桥洞的那一块纸，河面就有了光。',
    sky: ['#9d392d', '#c87750'],
    moon: { x: 659, y: 122, radius: 57, color: '#f7cb8d' },
    far: ['#bd654a', 'M0 306V237L88 220 176 155 230 185 319 135 404 164 471 155 565 208 667 180 715 194 778 153 856 164 960 124V440H0Z'],
    middle: ['#74342e', 'M0 316V270L88 238 147 260 232 224 305 232 386 208 478 250 547 216 648 255 737 234 812 251 892 208 960 229V440H0Z'],
    structure: '#4d2624',
    front: ['#36201e', 'M0 365C88 333 143 345 233 357C311 368 365 378 425 375C517 371 592 355 657 368C739 386 813 370 870 351C903 340 936 341 960 348V440H0Z'],
    cuts: ['#d18a64', 'M126 380C205 367 260 386 351 384M245 403C332 390 409 407 503 391M415 382C485 367 540 379 618 374M591 402C694 388 770 400 852 377'],
  },
] as const

const active = ref(0)
const scene = computed(() => scenes[active.value]!)
const skyId = useId()
const sceneIndex = computed(() => String(active.value + 1).padStart(2, '0'))

function nextScene() {
  active.value = (active.value + 1) % scenes.length
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
        <p class="scenes-intro">窗月、山影和桥灯，<br class="scenes-break"/> 叠在一张纸上。翻一翻，换一处风景。</p>
      </header>

      <figure class="scenes-figure">
        <div class="scenes-stage">
          <Transition name="turn-scene">
            <svg
              :key="scene.key"
              class="scene-plate"
              :data-scene="scene.key"
              viewBox="0 0 960 440"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <defs>
                <linearGradient :id="`${skyId}-${scene.key}`" x2="0%" y2="100%">
                  <stop :stop-color="scene.sky[0]" />
                  <stop offset="100%" :stop-color="scene.sky[1]" />
                </linearGradient>
              </defs>
              <rect width="960" height="440" :fill="`url(#${skyId}-${scene.key})`" />
              <g class="scene-light">
                <circle :cx="scene.moon.x" :cy="scene.moon.y" :r="scene.moon.radius + 13" :fill="scene.moon.color" opacity=".15" />
                <circle :cx="scene.moon.x" :cy="scene.moon.y" :r="scene.moon.radius" :fill="scene.moon.color" />
                <path v-if="scene.key === 'window'" d="M469 116h63m-51 10h33M746 192h57m-44 8h31" fill="none" stroke="#fff1d3" stroke-width="2" opacity=".66" />
                <path v-else-if="scene.key === 'ridge'" d="M525 86h58m-37 10h55M291 128h44m-31 8h58" fill="none" stroke="#ddad8a" stroke-width="2" opacity=".65" />
                <path v-else d="M497 104h59m-38 10h61M725 143h65m-52 9h74" fill="none" stroke="#f7cb8d" stroke-width="2" opacity=".65" />
              </g>
              <path class="scene-distance" :d="scene.far[1]" :fill="scene.far[0]" />
              <path class="scene-middle" :d="scene.middle[1]" :fill="scene.middle[0]" />
              <g v-if="scene.key === 'water'" class="scene-river">
                <path d="M0 326C126 315 220 334 323 322S507 311 596 320S820 337 960 305V440H0Z" fill="#a85846" />
                <path d="M294 351q73-16 125-8m20-15q54-8 90 2m-48 19q61-5 110 5" fill="none" stroke="#f2ae7b" stroke-width="2" opacity=".78" />
              </g>
              <g class="scene-structure" :fill="scene.structure">
                <template v-if="scene.key === 'window'">
                  <path d="M110 142C148 137 175 106 187 90H338C348 110 376 132 417 141L402 153H125Z" />
                  <path d="M144 156H384V164H144Z" fill="#522621" />
                  <path fill-rule="evenodd" d="M164 350V196C164 177 179 165 197 165H331C349 165 364 177 364 196V350H164ZM183 338H345V197C345 188 338 183 330 183H198C190 183 183 188 183 197Z" />
                  <path d="M203 185h7v159h-7zm56 0h8v159h-8zm56 0h7v159h-7zM179 222h171v7H179zM179 280h171v7H179z" />
                  <path d="m210 227 26 25 24-25m8 0 25 25 22-25m-105 58 26 25 24-25m8 0 25 25 22-25" fill="none" stroke="#822f27" stroke-width="4" />
                  <path d="M134 147h261M170 173h185" fill="none" stroke="#d99570" stroke-width="2" opacity=".68" />
                </template>
                <template v-else-if="scene.key === 'ridge'">
                  <path d="M514 245C543 240 576 219 590 196H649C660 216 685 235 718 244L701 253H532Z" />
                  <path d="M564 226C581 220 596 204 603 190L619 174 636 190C644 207 658 219 675 226L664 232H575Z" />
                  <path d="M553 251H682V298H669V262H637V299H624V262H598V297H585V262H566V300H553Z" />
                  <path d="M541 290H696V300H541Z" />
                  <path d="M551 247h130M585 228h81" fill="none" stroke="#e1a17a" stroke-width="2" opacity=".82" />
                  <path d="M671 260v17m8-13v11m-17-11v11" fill="none" stroke="#eec591" stroke-width="2" />
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
                <path :d="scene.front[1]" :fill="scene.front[0]" />
                <path :d="scene.cuts[1]" fill="none" :stroke="scene.cuts[0]" stroke-width="2" opacity=".82" />
                <path v-if="scene.key === 'window'" d="M772 363Q791 326 803 292m-22 55q-12-31-33-47m29 47q35-17 47-40m-31 21q8-35 1-51M831 355q23-34 29-61m-17 47q-12-20-25-26m25 26q28-14 39-33" fill="none" stroke="#402822" stroke-width="5" />
                <path v-else-if="scene.key === 'ridge'" d="M218 325Q212 263 241 230Q239 270 250 318M229 284Q211 264 190 255M235 268Q247 251 267 242m-32 11Q217 238 201 241" fill="none" stroke="#2d211d" stroke-width="6" />
                <path v-else d="M764 372q23-27 27-62m-21 50q-7-35-25-46m28 47q27-13 42-39m-40 42q-19-13-44-17M181 366q-17-18-26-42m21 38q3-24 13-34m-14 35q-26-10-35-17" fill="none" stroke="#36201e" stroke-width="4" />
              </g>
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
          <button type="button" class="scene-next" @click="nextScene">翻一景 <span aria-hidden="true">↻</span></button>
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.paper-scenes {
  padding-block: clamp(36px, 6.7vw, 95px);
  background: #2b201c;
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
  border: 1px solid #896650;
  background: #e9d2b2;
}

.scenes-stage::after {
  position: absolute;
  z-index: 3;
  inset: clamp(8px, 1.45vw, 19px);
  border: 1px solid #ffdfad64;
  background: repeating-linear-gradient(110deg, transparent 0 6px, #fff2da0c 7px, transparent 8px);
  content: '';
  pointer-events: none;
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
  border: 1px solid #efbd8f;
  background: #862e25;
  color: #fff0d0;
  font: 700 clamp(15px, 2vw, 23px)/1 var(--serif);
}

.scenes-caption {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(12px, 2.5vw, 35px);
  padding-block: 13px;
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
  border-color: #aa8068;
  color: #fff2d8;
  white-space: nowrap;
}

.scene-next:hover { border-color: #ffd5ae; background: #573329; }
.scene-next:focus-visible { outline-color: #ffcc99; }
.scene-next span { color: #ffc79c; font-size: 1.12em; }

.scene-distance, .scene-middle, .scene-river, .scene-structure, .scene-front, .scene-light {
  transform-box: view-box;
  transition: transform .58s cubic-bezier(.23,.7,.24,1);
}

.scene-middle, .scene-structure { filter: drop-shadow(0 3px 1px #361b1640); }

.turn-scene-enter-active, .turn-scene-leave-active { transition: opacity .62s ease; }
.turn-scene-enter-active { z-index: 2; }
.turn-scene-enter-from, .turn-scene-leave-to { opacity: 0; }
.turn-scene-enter-from .scene-light { transform: translateX(1.5%); }
.turn-scene-enter-from .scene-distance { transform: translateX(3%); }
.turn-scene-enter-from :is(.scene-middle, .scene-river) { transform: translateX(5%); }
.turn-scene-enter-from .scene-structure { transform: translate(7%, 2%); }
.turn-scene-enter-from .scene-front { transform: translate(10%, 3.5%); }
.turn-scene-leave-to .scene-light { transform: translateX(-1%); }
.turn-scene-leave-to .scene-distance { transform: translateX(-2%); }
.turn-scene-leave-to :is(.scene-middle, .scene-river) { transform: translateX(-4%); }
.turn-scene-leave-to .scene-structure { transform: translateX(-5%); }
.turn-scene-leave-to .scene-front { transform: translateX(-8%); }

@media (max-width: 690px) {
  .scenes-heading { flex-direction: column; align-items: start; gap: 10px; }
  .scenes-break { display: none; }
  .scenes-stage { aspect-ratio: 1.48; }
  .scenes-caption { grid-template-columns: minmax(0, 1fr) auto; gap: 6px 10px; }
  .scenes-caption p { grid-column: 1 / -1; grid-row: 2; }
  .scene-next { grid-column: 2; grid-row: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .turn-scene-enter-active, .turn-scene-leave-active,
  .scene-distance, .scene-middle, .scene-river, .scene-structure, .scene-front, .scene-light {
    transition: none;
  }
  .scene-plate > g, .scene-plate > path { transform: none; }
}
</style>
