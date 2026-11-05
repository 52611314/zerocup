import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'
import { query, database } from '../utils/db'
import { admin,login,hashToken,jsonBody,textField,uuid } from '../utils/security'
import { validModel } from '../../shared/model'
function sources(v:unknown) {
 if(!Array.isArray(v)||v.length>12||!v.every(s=>s&&typeof s.title==='string'&&s.title.length<=200&&typeof s.url==='string'&&/^https:\/\//.test(s.url)&&s.url.length<1000))throw createError({statusCode:400,message:'来源须为包含 title 和 https URL 的数组。'});return v
}
export async function adminRoutes(event:H3Event,path:string):Promise<any> {
 if(path==='admin/login'&&event.method==='POST') {const b=await jsonBody(event);return login(event,textField(b.username,60,1),textField(b.password,200,1))}
 const a=await admin(event)
 if(path==='admin/session')return {username:a.username}
 if(path==='admin/logout'&&event.method==='POST') {await query('DELETE FROM admin_sessions WHERE token_hash=$1',[hashToken(getCookie(event,'paper_admin')||'')]);deleteCookie(event,'paper_admin',{path:'/'});return {ok:true}}
 if(path==='admin/works'&&event.method==='GET')return query('SELECT id,title,description,model,status,is_example,version,featured_order,review_note,updated_at FROM works WHERE status<>\'draft\' ORDER BY CASE WHEN status=\'pending\' THEN 0 ELSE 1 END,updated_at DESC LIMIT 200')
 if(path.startsWith('admin/works/')&&event.method==='PATCH') {
  const id=uuid(path.split('/')[2]),b=await jsonBody(event)
  if(!['published','rejected'].includes(b.status)||!Number.isInteger(b.version)||!Number.isInteger(b.featured_order)||Math.abs(b.featured_order)>9999)throw createError({statusCode:400,message:'审核状态、排序或版本无效。'})
  const note=textField(b.review_note||'',300)
  const client=await database().connect()
  try {
   await client.query('BEGIN')
   const {rows:[w]}=await client.query("UPDATE works SET status=$1,review_note=$2,featured_order=$3,version=version+1,updated_at=now(),published_at=CASE WHEN $1='published' THEN now() ELSE published_at END WHERE id=$4 AND version=$5 AND status IN ('pending','published','rejected') RETURNING id,status,version",[b.status,note,b.featured_order,id,b.version])
   if(!w)throw createError({statusCode:409,message:'作品已经更新，请刷新审核列表。'})
   await client.query('INSERT INTO admin_audit(admin_id,action,target_id) VALUES($1,$2,$3)',[a.id,`review:${b.status}`,id]);await client.query('COMMIT');return w
  }catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 }
 const kind=path.split('/')[1]
 if(!['articles','patterns','tutorials'].includes(kind||''))throw createError({statusCode:404,message:'未找到后台功能。'})
 // Table identifiers come solely from this allowlist; all record values are bound parameters.
 const table=kind as 'articles'|'patterns'|'tutorials'
 if(event.method==='GET')return query(`SELECT * FROM ${table} ORDER BY sort_order,id`)
 if(!['POST','PATCH'].includes(event.method))throw createError({statusCode:405,message:'不支持此操作。'})
 const b=await jsonBody(event),id=event.method==='POST'?randomUUID():uuid(path.split('/')[2])
 if(typeof b.published!=='boolean'||!Number.isInteger(b.sort_order)||Math.abs(b.sort_order)>9999)throw createError({statusCode:400,message:'发布状态或排序无效。'})
 let fields:string[],values:unknown[]
 if(table==='patterns') {
  if(!validModel(b.model))throw createError({statusCode:400,message:'纹样模型无效。'})
  fields=['name','description','sources','model','published','sort_order'];values=[textField(b.name,60,1),textField(b.description,1000,1),JSON.stringify(sources(b.sources)),JSON.stringify(b.model),b.published,b.sort_order]
 } else {
  const slug=textField(b.slug,80,1);if(!/^[a-z0-9-]+$/.test(slug))throw createError({statusCode:400,message:'网址标识只可使用英文小写、数字和连字符。'})
  const common=[slug,textField(b.title,100,1),textField(b.summary,500,1)]
  const pattern=b.pattern_id?uuid(b.pattern_id):null
  if(table==='articles') {
   if(!Array.isArray(b.body)||!b.body.length||b.body.length>16||!b.body.every((s:any)=>s&&typeof s.heading==='string'&&s.heading.length<=100&&typeof s.text==='string'&&s.text.length<=4000))throw createError({statusCode:400,message:'正文须为 heading、text 段落数组。'})
   fields=['slug','title','summary','category','body','sources','pattern_id','published','sort_order'];values=[...common,textField(b.category,30,1),JSON.stringify(b.body),JSON.stringify(sources(b.sources)),pattern,b.published,b.sort_order]
  } else {
   if(!Array.isArray(b.steps)||!b.steps.length||b.steps.length>20||!b.steps.every((s:any)=>s&&typeof s.title==='string'&&s.title.length<=100&&typeof s.text==='string'&&s.text.length<=1000&&['read','circle','triangle','drop','unfold','save'].includes(s.require)))throw createError({statusCode:400,message:'教程步骤无效。'})
   fields=['slug','title','summary','steps','pattern_id','published','sort_order'];values=[...common,JSON.stringify(b.steps),pattern,b.published,b.sort_order]
  }
 }
 const sql=event.method==='POST'?`INSERT INTO ${table}(id,${fields.join(',')}) VALUES($1,${fields.map((_,i)=>`$${i+2}`).join(',')}) RETURNING *`:`UPDATE ${table} SET ${fields.map((f,i)=>`${f}=$${i+2}`).join(',')},updated_at=now() WHERE id=$1 RETURNING *`
 const [record]=await query(sql,[id,...values]);if(!record)throw createError({statusCode:404,message:'记录不存在。'})
 await query('INSERT INTO admin_audit(admin_id,action,target_id) VALUES($1,$2,$3)',[a.id,`${table}:${event.method}`,id]);return record
}
