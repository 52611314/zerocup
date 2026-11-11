<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { focusChapterMain, isPlainChapterActivation } from '../composables/useChapterWindow'

const props = defineProps<{ to: RouteLocationRaw }>()
const { openChapterWindow } = useChapterWindow()
const router = useRouter()

async function follow(event: MouseEvent, navigate: (event: MouseEvent) => unknown) {
  const source = event.currentTarget as HTMLAnchorElement
  if (openChapterWindow(event, props.to)) return

  const keyboard = event.detail === 0 && isPlainChapterActivation(event)
  const previous = router.currentRoute.value.fullPath
  await navigate(event)
  const current = router.currentRoute.value.fullPath
  if (keyboard && current !== previous && current === router.resolve(props.to).fullPath) {
    focusChapterMain(source)
  }
}
</script>

<template>
  <NuxtLink :to="to" custom v-slot="{ href, navigate }">
    <a :href="href" @click="follow($event, navigate)"><slot/></a>
  </NuxtLink>
</template>
