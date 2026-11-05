export function usePageMeta(title:string|(()=>string),description:string|(()=>string),privatePage=false) {
 const route=useRoute(),config=useRuntimeConfig()
 const getTitle=()=>`${typeof title==='function'?title():title} · 纸上生花`
 useSeoMeta({title:getTitle,description,ogTitle:getTitle,ogDescription:description,ogType:'website',robots:privatePage?'noindex, nofollow':'index, follow'})
 useHead({link:[{rel:'canonical',href:()=>String(config.public.siteUrl).replace(/\/$/,'')+route.path}]})
}
