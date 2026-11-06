<script setup lang="ts">
import { starterModels } from '../../shared/patterns'
const { progress, isLoading } = useLoadingIndicator({ throttle: 200, duration: 1700, hideDelay: 90 })
const router = useRouter()
const motif = computed(() => {
  const path = router.currentRoute.value.path
  return starterModels[path.startsWith('/learn') ? 2 : path.startsWith('/gallery') ? 1 : 0]!
})
const count = computed(() => Math.floor(progress.value * motif.value.cuts.length / 100))
const paper = computed(() => ({ ...motif.value, cuts: motif.value.cuts.slice(0, count.value) }))
</script>
<template>
 <div v-if="isLoading" class="paper-navigation" role="status" aria-label="正在打开下一页">
  <div class="loading-sheet"><PaperArt :model="paper" label="正在剪成的窗花"/>
   <i v-if="count" :key="count" class="loading-chip" aria-hidden="true" :style="{left:(48 + paper.cuts[count-1]!.x * .46)+'%',top:(50 + paper.cuts[count-1]!.y * .46)+'%'}"/>
  </div>
  <div class="navigation-copy">
   <p>正在翻页</p>
   <div class="cut-track" aria-hidden="true"><i :style="{width:progress+'%'}"/></div>
  </div>
 </div>
</template>
