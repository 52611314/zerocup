<script setup lang="ts">
defineProps<{pending?:boolean;error?:unknown;empty?:boolean}>()
defineEmits<{retry:[]}>()
</script>
<template><div v-if="pending" class="state" role="status"><span class="loading-mark">✳</span><p>正在展开纸上的故事…</p></div><div v-else-if="error" class="state error-state" role="alert"><span class="state-symbol">折</span><h2>纸笺暂时没有送达</h2><p>资料库连接遇到了问题，请稍后重试。</p><button class="btn" @click="$emit('retry')">重新读取 ↻</button></div><div v-else-if="empty" class="state"><span class="state-symbol">空</span><h2>这里还留着一片空白</h2><p>试试其他关键词，或从自己的第一张剪纸开始。</p><NuxtLink class="text-link" to="/studio">去剪一张窗花 ↗</NuxtLink></div><slot v-else/></template>
