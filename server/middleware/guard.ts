import { allowedWriteOrigin,csrfOriginEligible } from '../../shared/request-origin'
import {hasSessionCsrf} from '../utils/csrf'

export default defineEventHandler(async event=>{
 setResponseHeader(event,'X-Content-Type-Options','nosniff')
 setResponseHeader(event,'Referrer-Policy','strict-origin-when-cross-origin')
 setResponseHeader(event,'X-Frame-Options','DENY')
 if(!event.path.startsWith('/api/'))return
 setResponseHeader(event,'Cache-Control','private, no-store')
 if(['POST','PUT','PATCH','DELETE'].includes(event.method)) {
  const origin=getRequestHeader(event,'origin')
  const site=process.env.SITE_URL || 'http://127.0.0.1:3000'
  const requestOrigin=getRequestURL(event,{xForwardedHost:false,xForwardedProto:false}).origin
  const allowedOrigin=allowedWriteOrigin(origin,site,requestOrigin,import.meta.dev)
  // Require session proof for omitted headers, dev port changes, or a stripped
  // port in a local production preview whose URL matches the configured site.
  // A foreign hostname never receives the loopback exception.
  const tokenFallback=!allowedOrigin&&csrfOriginEligible(origin,requestOrigin,import.meta.dev,site)&&await hasSessionCsrf(event)
  if(!allowedOrigin&&!tokenFallback)throw createError({
   statusCode:403,
   message:'请求来源不匹配，请确认访问地址与服务配置一致后重试。',
   data:import.meta.dev?{
    origin:origin??null,
    requestOrigin,
    configuredOrigin:new URL(site).origin,
    fetchSite:getRequestHeader(event,'sec-fetch-site')??null,
   }:undefined,
  })
  if(Number(getRequestHeader(event,'content-length')||0)>65536)throw createError({statusCode:413,message:'提交内容超过 64KB。'})
 }
})
