<script setup lang="ts">usePageMeta('剪纸工坊','放下切口，调整纹样，展开并保存一张属于你的剪纸。',true)</script>
<template><div class="wrap studio-page"><Breadcrumbs :items="[{label:'剪纸工坊'}]"/><ClientOnly><LazyStudioEditor/><template #fallback><div class="state"><span class="loading-mark">✳</span><h1>正在铺开你的纸面…</h1><p>圆、三角、水滴，一起开始。</p></div></template></ClientOnly></div></template>
