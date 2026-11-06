<script setup lang="ts">
const props=defineProps<{current?:{title:string;text:string;require:string};step:number;total:number;area:string;target:string;ready:boolean;busy:boolean;error:string}>()
defineEmits<{next:[]}>()
const here=computed(()=>props.target==='#'+props.area+'-tools')
</script>
<template>
 <div class="lesson-prompt" :class="{'lesson-here':here}" aria-label="当前练习提示">
  <template v-if="current">
   <small>练习 {{step+1}} / {{total}}</small>
   <strong>{{current.title}}</strong>
   <p v-if="here">{{current.text}}</p>
   <button v-if="here&&ready" class="btn primary" :disabled="busy" @click="$emit('next')">{{busy?'正在记录…':'记下这一步 →'}}</button>
   <p v-else-if="here">完成上面的操作后，就可以记录这一步。</p>
   <NuxtLink v-else class="text-link" :to="{hash:target,query:$route.query}">先完成这一步 ↗</NuxtLink>
   <p v-if="here&&error" class="inline-error" role="alert">{{error}}<button @click="$emit('next')" :disabled="busy||!ready">重试记录</button></p>
  </template>
  <p v-else>本次练习已完成，可以继续创作并投稿。</p>
 </div>
</template>
<style scoped>
.lesson-prompt{margin:10px 0 18px;padding:12px 0;border-block:1px solid var(--line);font-size:14px}
.lesson-prompt strong{display:block;font-family:var(--serif);font-size:19px}
.lesson-prompt p{margin:7px 0}.lesson-here{border-color:var(--red)}
</style>
