<template>
  <div class="paper-room-light" aria-hidden="true" />
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

</style>
