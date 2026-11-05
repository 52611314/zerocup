<script setup lang="ts">defineProps<{items:{label:string;to?:string}[]}>()</script>
<template><nav class="breadcrumbs" aria-label="面包屑"><NuxtLink to="/">首页</NuxtLink><template v-for="(item,i) in items" :key="i"><span aria-hidden="true">/</span><NuxtLink v-if="item.to" :to="item.to">{{item.label}}</NuxtLink><span v-else aria-current="page">{{item.label}}</span></template></nav></template>
