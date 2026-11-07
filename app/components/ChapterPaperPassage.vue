<script setup lang="ts">
import { LEARN_WINDOW_MODEL } from '../../shared/patterns'

defineProps<{
  kind: 'folio' | 'fold'
  phase: 'cover' | 'waiting' | 'opening'
}>()
</script>

<template>
  <div class="paper-passage" :data-kind="kind" :data-phase="phase" aria-hidden="true">
    <div v-if="kind === 'folio'" class="folio-leaf">
      <div class="folio-plate">
        <span class="folio-register">纹样图谱 <b>01</b></span>
        <PaperArt class="folio-art" :model="LEARN_WINDOW_MODEL"/>
        <span class="folio-caption">水滴连珠 <i>45° → 360°</i></span>
      </div>
      <div class="folio-curl"/>
    </div>
    <div v-else class="fold-stock">
      <div class="fold-half fold-bottom">
        <span class="fold-ruling"/>
      </div>
      <div class="fold-half fold-top">
        <div class="fold-diagram">
          <svg viewBox="0 0 104 104" fill="none" focusable="false">
            <path d="M8 8h88v88H8zM8 8l88 88M96 8 8 96M52 8v88M8 52h88" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4"/>
            <path d="M52 52 96 8v44Z" fill="currentColor" fill-opacity=".24" stroke="currentColor" stroke-width="1.2"/>
            <path d="M69 52a17 17 0 0 0-5-12" stroke="currentColor" stroke-width="1.2"/>
          </svg>
          <span>一角八面 <i>45°</i></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.paper-passage {
  position: absolute;
  inset: 0;
  isolation: isolate;
}

.paper-passage[data-kind="folio"] {
  perspective: max(920px, 285vw);
  perspective-origin: 40% 50%;
}

.folio-leaf {
  position: absolute;
  inset: -1px;
  display: grid;
  place-items: center;
  overflow: hidden;
  transform-origin: left center;
  backface-visibility: hidden;
  background:
    linear-gradient(90deg, #4c291b 0, #291810 1.1%, #78503b 2.3%, #3b241c 4.5%, transparent 9%),
    repeating-linear-gradient(3deg, transparent 0 5px, #94705a16 6px 7px, transparent 8px 11px),
    radial-gradient(ellipse at 45% 38%, #513c30, #211814 70%);
}

.folio-plate {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(78vw, 82vh, 610px);
  aspect-ratio: 1;
  transform: rotate(-4deg);
  padding: clamp(12px, 4vmin, 36px);
  border: 1px solid #a66a43;
  box-shadow: 4px 7px 0 -2px #ad8862, 8px 11px 0 -3px #8e674b, 12px 19px 30px #1209038c;
  background:
    repeating-linear-gradient(101deg, transparent 0 4px, #96633c16 5px 6px, transparent 7px 9px),
    radial-gradient(ellipse at 55% 35%, #fff4cf, #dbc299 83%);
  color: #6c3b23;
}

.folio-register,
.folio-caption {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 4px;
  font: 600 clamp(12px, 2.6vmin, 22px) var(--serif);
  letter-spacing: .13em;
}

.folio-register {
  border-bottom: 1px solid #9b644e85;
  padding-bottom: .3em;
}

.folio-caption {
  border-top: 1px solid #9b644e85;
  padding-top: .3em;
}

.folio-register b,
.folio-caption i {
  color: #8b3727;
  font: 500 .75em Georgia, serif;
  letter-spacing: .08em;
}

.folio-art {
  align-self: center;
  justify-self: center;
  width: min(90%, 62vh);
  max-height: 100%;
  filter: drop-shadow(3px 5px 3px #6d2a1f4f);
}

.folio-curl {
  position: absolute;
  inset: 0 0 0 auto;
  width: 27%;
  opacity: .45;
  background: linear-gradient(90deg, transparent, #1b0c09 77%, #b17d4b 98%, #f3d8a7);
}

.paper-passage[data-phase="opening"] .folio-leaf {
  animation: folio-page-turn .63s cubic-bezier(.43,.08,.27,1) both;
}

.paper-passage[data-phase="opening"] .folio-curl {
  animation: folio-page-curl .63s ease-out both;
}

@keyframes folio-page-turn {
  0% { transform: rotateY(0); }
  31% { transform: rotateY(-23deg); }
  100% { transform: translateX(-8%) rotateY(-102deg); }
}

@keyframes folio-page-curl {
  0% { opacity: .45; transform: scaleX(1); }
  52% { opacity: .8; transform: scaleX(1.55); }
  100% { opacity: 1; transform: scaleX(2.3); }
}

.fold-stock {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 142vmax;
  height: 142vmax;
  margin: -71vmax 0 0 -71vmax;
  transform: rotate(-33deg);
  perspective: 105vmax;
}

.fold-half {
  position: absolute;
  inset: 0 0 calc(50% - 1px);
  background:
    repeating-linear-gradient(108deg, transparent 0 5px, #97684913 6px 7px, transparent 8px 11px),
    linear-gradient(150deg, #fff4d9 0%, #fae6be 49%, #d4a677 100%);
}

.fold-bottom {
  inset: 50% 0 0;
  background:
    repeating-linear-gradient(72deg, transparent 0 5px, #97684913 6px 7px, transparent 8px 11px),
    linear-gradient(0deg, #f5dbab 20%, #ffeaca 78%, #e6bd8e 99.5%, #b67951 100%);
}

.fold-ruling {
  position: absolute;
  inset: 1.5vmin 0 auto;
  border-top: 1px dashed #8d59328f;
}

.fold-top {
  transform-origin: center bottom;
  backface-visibility: hidden;
  border-bottom: 1px solid #fff7d9;
}

.fold-diagram {
  position: absolute;
  bottom: clamp(31px, 9vmin, 96px);
  left: 48%;
  display: flex;
  align-items: center;
  gap: clamp(8px, 3.4vmin, 32px);
  transform: translateX(-50%) rotate(33deg);
  color: #8d3a29;
  font: 700 clamp(19px, 5vmin, 46px) var(--serif);
  white-space: nowrap;
  letter-spacing: .08em;
}

.fold-diagram svg { width: clamp(44px, 11vmin, 105px); }
.fold-diagram i {
  display: block;
  margin-top: .13em;
  color: #9c5536;
  font: italic .62em Georgia, serif;
}

.paper-passage[data-phase="opening"] .fold-top {
  animation: paper-crease .53s cubic-bezier(.32,.15,.3,1) both;
}

.paper-passage[data-phase="opening"] .fold-stock {
  animation: folded-paper-lift .64s cubic-bezier(.52,.08,.41,1) both;
}

@keyframes paper-crease {
  0% { transform: rotateX(0); }
  26% { transform: rotateX(17deg); }
  72% { transform: rotateX(78deg); }
  100% { transform: rotateX(97deg); }
}

@keyframes folded-paper-lift {
  0%, 30% { transform: rotate(-33deg); }
  100% { transform: translate(165vmax, 58vmax) rotate(-35deg); }
}
</style>
