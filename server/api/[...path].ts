import { publicRoutes } from '../services/public'
import { workRoutes } from '../services/works'
import { adminRoutes } from '../services/admin'
export default defineEventHandler(async(event):Promise<any>=>{
 const path=(getRouterParam(event,'path')||'').replace(/\/$/,'')
 if(path.startsWith('admin/'))return adminRoutes(event,path)
 if(path.startsWith('me/')||path==='works'||path.startsWith('works/'))return workRoutes(event,path)
 if(event.method==='GET')return publicRoutes(event,path)
 throw createError({statusCode:405,message:'不支持此操作。'})
})
