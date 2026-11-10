<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{ to: RouteLocationRaw }>()
const { openChapterWindow } = useChapterWindow()

function follow(event: MouseEvent, navigate: (event: MouseEvent) => unknown) {
  if (!openChapterWindow(event, props.to)) void navigate(event)
}
</script>

<template>
  <NuxtLink :to="to" custom v-slot="{ href, navigate }">
    <a :href="href" @click="follow($event, navigate)"><slot/></a>
  </NuxtLink>
</template>
