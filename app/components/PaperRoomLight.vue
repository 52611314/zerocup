<script setup lang="ts">
defineProps<{ animated?: boolean }>()
</script>
<template>
  <div class="paper-room-light" :class="{ 'room-light-animated': animated }" aria-hidden="true" />
</template>

<style scoped>
.paper-room-light {
  position: absolute;
  z-index: -1;
  inset: -5px;
  overflow: hidden;
  pointer-events: none;
  background:
    linear-gradient(90deg, var(--room-edge), transparent 13% 88%, var(--room-edge)),
    radial-gradient(ellipse at 21% 0%, var(--room-glow), transparent 70%);
  filter: blur(4px);
}

.paper-room-light::before {
  position: absolute;
  inset: -6% -6% -12%;
  background:
    repeating-linear-gradient(66deg, transparent 0 16%, var(--room-mullion) 16.2% 17%, transparent 17.3% 28%),
    linear-gradient(122deg, var(--room-beam), transparent 77%);
  clip-path: polygon(4% 0, 46% 0, 86% 100%, 37% 100%);
  content: '';
}

@media (prefers-reduced-motion: no-preference) {
  .room-light-animated::before {
    animation: room-window-drift 8s -2s ease-in-out infinite;
    animation-play-state: var(--room-play, paused);
  }
  .room-light-animated::after {
    position: absolute;
    inset: -12%;
    background: linear-gradient(112deg, transparent 20%, #f4ce9530 36%, #f4ce9508 47%, transparent 61%);
    content: '';
    animation: room-light-sweep 10s -2.5s ease-in-out infinite;
    animation-play-state: var(--room-play, paused);
  }
  @keyframes room-window-drift {
    0%, 100% { transform: translate(-36px, -8px); opacity: .64; }
    50% { transform: translate(40px, 10px); opacity: 1; }
  }
  @keyframes room-light-sweep {
    0%, 100% { transform: translateX(-8%); opacity: .35; }
    50% { transform: translateX(8%); opacity: .8; }
  }
}
</style>
