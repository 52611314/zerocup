export default defineEventHandler(event=>{
 setResponseHeader(event,'X-Content-Type-Options','nosniff')
 setResponseHeader(event,'Referrer-Policy','strict-origin-when-cross-origin')
 setResponseHeader(event,'X-Frame-Options','DENY')
 if(!event.path.startsWith('/api/'))return
 setResponseHeader(event,'Cache-Control','private, no-store')
 if(['POST','PUT','PATCH','DELETE'].includes(event.method)) {
  const origin=getRequestHeader(event,'origin')
  const site=process.env.SITE_URL || 'http://127.0.0.1:3000'
  if(origin!==new URL(site).origin)throw createError({statusCode:403,message:'请求来源不匹配，请从本站页面重新操作。'})
  if(Number(getRequestHeader(event,'content-length')||0)>65536)throw createError({statusCode:413,message:'提交内容超过 64KB。'})
 }
})
