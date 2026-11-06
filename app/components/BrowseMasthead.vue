<script setup lang="ts">
import type { PaperModel } from '../../shared/model'

defineProps<{
  number: string
  section: string
  english: string
  title: string
  description: string
  stamp: string
  model: PaperModel
  theme?: 'ink' | 'red' | 'paper'
}>()
</script>

<template>
  <header class="browse-masthead" :class="`masthead-${theme ?? 'paper'}`">
    <div class="page-heading masthead-copy">
      <div class="masthead-index">
        <span aria-hidden="true">{{ number }} /</span>
        {{ section }}
      </div>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
      <div v-if="$slots.default" class="masthead-action"><slot /></div>
    </div>
    <div class="masthead-plate" aria-hidden="true">
      <span class="plate-number">FIG. {{ number }}</span>
      <span class="plate-english" lang="en">{{ english }}</span>
      <PaperArt :model="model" />
      <span class="plate-stamp">{{ stamp }}</span>
    </div>
  </header>
</template>

<style scoped>
.browse-masthead {
  --masthead-line: #cfbfa7;
  --plate-background: #ebddc6;
  --plate-ink: #743c2c;
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(230px, 1fr);
  min-height: 308px;
  margin: 22px 0 36px;
  border: 1px solid var(--masthead-line);
  background: #fbf3df;
  color: #281b16;
}

.masthead-red {
  --masthead-line: #aa392d;
  --plate-background: #8b261c;
  --plate-ink: #f7e4c6;
  background: #ad2920;
  color: #fff2d7;
}

.masthead-ink {
  --masthead-line: #604c3e;
  --plate-background: #1d1411;
  --plate-ink: #f3d7af;
  background: #33241c;
  color: #fff2d7;
}

.masthead-copy {
  margin: 0;
  padding: clamp(26px, 4.4vw, 66px);
  align-self: center;
}

.masthead-index {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .19em;
}

.masthead-index span {
  font: 15px Georgia, serif;
  letter-spacing: .08em;
}

.masthead-copy h1 {
  margin: .26em 0 .22em;
  font-size: clamp(38px, 5.2vw, 79px);
  font-weight: 900;
  line-height: 1.12;
  letter-spacing: -.035em;
  text-wrap: balance;
}

.masthead-copy p {
  margin: 0;
  color: inherit;
  font-size: clamp(14px, 1.45vw, 17px);
  line-height: 1.75;
}

.masthead-action {
  margin-top: 24px;
}

.masthead-action :deep(a) {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  min-height: 44px;
  padding: 7px 13px;
  color: inherit;
  border: 1px solid currentColor;
}

.masthead-red .masthead-action :deep(a:hover),
.masthead-ink .masthead-action :deep(a:hover) {
  background: #fff2d7;
  color: #281b16;
}

.masthead-plate {
  position: relative;
  display: grid;
  place-items: center;
  isolation: isolate;
  min-height: 260px;
  overflow: hidden;
  border-inline-start: 1px solid var(--masthead-line);
  background: radial-gradient(ellipse at 48% 46%, #fff4df16, transparent 72%), var(--plate-background);
  color: var(--plate-ink);
}

.masthead-plate::before {
  position: absolute;
  z-index: -1;
  inset: 14px;
  border: 1px solid currentColor;
  opacity: .36;
  content: '';
}

.masthead-plate::after {
  position: absolute;
  z-index: -1;
  width: min(58%, 250px);
  aspect-ratio: 1;
  border: 1px dashed currentColor;
  border-radius: 50%;
  opacity: .25;
  content: '';
}

.masthead-plate .paper-art {
  width: min(61%, 265px);
  filter: drop-shadow(5px 8px 5px #240f0c44);
  transform: rotate(-10deg);
}

.plate-number,
.plate-english {
  position: absolute;
  font: 11px/1.5 Georgia, serif;
  letter-spacing: .17em;
}

.plate-number {
  top: 24px;
  left: 24px;
}

.plate-english {
  bottom: 23px;
  left: 24px;
}

.plate-stamp {
  position: absolute;
  top: 25px;
  right: 25px;
  padding: 6px 4px;
  border: 1px solid currentColor;
  font: 700 15px/1 var(--serif);
  letter-spacing: .15em;
  writing-mode: vertical-rl;
}

@media (max-width: 640px) {
  .browse-masthead {
    grid-template-columns: 1fr;
    margin-block: 16px 26px;
  }

  .masthead-plate {
    min-height: 198px;
    border-inline-start: 0;
    border-top: 1px solid var(--masthead-line);
  }

  .masthead-plate .paper-art {
    width: min(48%, 154px);
  }

  .masthead-plate::after {
    width: min(48%, 154px);
  }
}
</style>
