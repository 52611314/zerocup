<script setup lang="ts">
import {starterModels} from '../../../shared/patterns'
usePageMeta('渐进教程','从一个圆孔开始，经过三段练习，展开并保存你的第一张数字剪纸。')
const {data,pending,error,refresh}=await useFetch<any[]>('/api/tutorials')
</script>
<template><div class="wrap page"><Breadcrumbs :items="[{label:'渐进教程'}]"/><header class="page-heading"><p class="eyebrow">SMALL CUTS, SLOW LEARNING</p><h1>先剪一小步。</h1><p>三段小练习，从认识留白，到完成自己的花。</p></header><AsyncState :pending="pending" :error="error" :empty="!data?.length" @retry="refresh"><div class="tutorial-list"><NuxtLink v-for="(t,i) in data" :key="t.id" :to="`/tutorials/${t.slug}`" class="tutorial-row"><span class="tutorial-number">0{{i+1}}</span><PaperArt :model="starterModels[i%8]!" :label="t.title+'原创示意'"/><div><span class="eyebrow">{{t.steps.length}} 个小步骤</span><h2>{{t.title}}</h2><p>{{t.summary}}</p></div><span class="round-link">↗</span></NuxtLink></div></AsyncState></div></template>
