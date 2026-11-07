<script setup lang="ts">
usePageMeta('剪纸工坊', '放下切口，调整纹样，展开并保存一张属于你的剪纸。', true)
</script>

<template>
  <div class="studio-room">
    <div class="wrap studio-page">
      <Breadcrumbs :items="[{ label: '剪纸工坊' }]" />
      <ClientOnly>
        <StudioEditor />
        <template #fallback>
          <div class="state">
            <span class="loading-mark">✳</span>
            <h1>正在铺开你的纸面…</h1>
            <p>圆、三角、水滴，一起开始。</p>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped>
.studio-room {
  position: relative;
  isolation: isolate;
  min-height: 85svh;
  background:
    linear-gradient(90deg, #18211dc7, transparent 17% 84%, #151d1bb3),
    radial-gradient(ellipse at 36% 10%, #70462d, transparent 53rem),
    repeating-linear-gradient(2deg, transparent 0 5px, #edd5af09 6px 7px),
    #271a17;
}

.studio-room::before {
  position: absolute;
  z-index: -1;
  inset: 0;
  height: clamp(36rem, 69vw, 64rem);
  background:
    repeating-linear-gradient(109deg, transparent 0 12%, #27140f5c 12.1% 13.2%, transparent 13.5% 24%),
    linear-gradient(117deg, #ffca7c65, #f4b97225 45%, transparent 78%);
  clip-path: polygon(0 0, 40% 0, 92% 100%, 21% 100%);
  filter: blur(6px);
  mask-image: linear-gradient(#000, transparent 89%);
  content: '';
  pointer-events: none;
}

.studio-page { padding-top: clamp(14px, 1.75vw, 25px); }
.studio-page :deep(.breadcrumbs) { color: #ecd0af; }
.studio-page :deep(.breadcrumbs a:hover) { color: #fff6e4; }
.studio-page :deep(.breadcrumbs a:focus-visible) { outline-color: #f4c28a; }
.studio-page :deep(> .state) { margin-top: 20px; color: #fff0d3; border-color: #996f4d; }
.studio-page :deep(> .state .loading-mark) { color: #eab378; }

@media (prefers-reduced-motion: no-preference) {
  .studio-room::before { animation: workroom-light 1.05s ease-out both; }
  @keyframes workroom-light {
    from { opacity: .35; transform: translateX(-3%); }
    to { opacity: 1; transform: none; }
  }
}
</style>
