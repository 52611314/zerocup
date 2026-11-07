<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{ to: RouteLocationRaw; beforeOpen?: (source: HTMLAnchorElement) => void }>()
const { openChapterWindow } = useChapterWindow()

function follow(event: MouseEvent, navigate: (event: MouseEvent) => unknown) {
  const source = event.currentTarget as HTMLAnchorElement
  if (!openChapterWindow(event, props.to, () => props.beforeOpen?.(source))) void navigate(event)
}
</script>

<template>
  <NuxtLink :to="to" custom v-slot="{ href, navigate }">
    <a :href="href" @click="follow($event, navigate)"><slot/></a>
  </NuxtLink>
</template>
