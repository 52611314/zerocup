<script setup lang="ts">
const route=useRoute(),{data:t,pending,error,refresh}=await useFetch<any>(`/api/tutorials/${route.params.slug}`)
if(error.value?.statusCode===404)throw createError({statusCode:404,message:'教程尚未公开。'})
usePageMeta(()=>t.value?.title||'渐进教程',()=>t.value?.summary||'剪纸入门练习')
</script>
<template><div class="wrap page narrow"><Breadcrumbs :items="[{label:'渐进教程',to:'/tutorials'},{label:t?.title||'教程'}]"/><AsyncState :pending="pending" :error="error" @retry="refresh"><article v-if="t"><header class="page-heading"><p class="eyebrow">一点一点，纸上生花</p><h1>{{t.title}}</h1><p>{{t.summary}}</p></header><ol class="lesson-steps"><li v-for="(s,i) in t.steps" :key="i"><span>0{{i+1}}</span><div><h2>{{s.title}}</h2><p>{{s.text}}</p></div></li></ol><div class="article-cta"><NuxtLink class="btn primary" :to="`/studio?tutorial=${t.slug}`">带着教程进入工坊 ↗</NuxtLink><p>步骤会在完成操作后逐一解锁，学习进度保存在当前访客的纸笺中。</p></div><NuxtLink class="text-link" to="/tutorials">← 看看其他练习</NuxtLink></article></AsyncState></div></template>
