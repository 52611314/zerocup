import { randomUUID } from 'node:crypto'
import type { H3Event } from 'h3'
import { query } from '../utils/db'
import { visitor, jsonBody, textField, uuid, rateLimit } from '../utils/security'
import { validModel } from '../../shared/model'
export async function workRoutes(event:H3Event,path:string):Promise<any> {
 const owner=await visitor(event)
 if(event.method!=='GET')await rateLimit(event,`write:${owner}`,90)
 if(path==='me/works'&&event.method==='GET')return query('SELECT id,title,description,model,status,version,review_note,updated_at FROM works WHERE owner_id=$1 ORDER BY updated_at DESC',[owner])
 if(path==='me/progress'&&event.method==='GET')return query('SELECT p.tutorial_id,p.step,t.title,t.slug,jsonb_array_length(t.steps) AS total FROM tutorial_progress p JOIN tutorials t ON t.id=p.tutorial_id WHERE p.visitor_id=$1 AND t.published',[owner])
 if(path==='me/favorites'&&event.method==='GET')return query("SELECT w.id,w.title,w.model,w.is_example,w.category FROM favorites f JOIN works w ON w.id=f.work_id WHERE f.visitor_id=$1 AND w.status='published'",[owner])
 if(path.startsWith('me/favorites/')) {
  const id=uuid(path.split('/')[2])
  if(event.method==='PUT') { const [w]=await query("SELECT id FROM works WHERE id=$1 AND status='published'",[id]);if(!w)throw createError({statusCode:404,message:'作品尚未公开。'});await query('INSERT INTO favorites(visitor_id,work_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[owner,id]);return {saved:true} }
  if(event.method==='DELETE'){await query('DELETE FROM favorites WHERE visitor_id=$1 AND work_id=$2',[owner,id]);return {saved:false}}
 }
 if(path.startsWith('me/progress/')&&event.method==='PUT') {
  const id=uuid(path.split('/')[2]),b=await jsonBody(event)
  const [t]=await query('SELECT jsonb_array_length(steps) AS total FROM tutorials WHERE id=$1 AND published',[id])
  if(!t||!Number.isInteger(b.step)||b.step<0||b.step>t.total)throw createError({statusCode:400,message:'无效的教程步骤。'})
  const [p]=await query('INSERT INTO tutorial_progress(visitor_id,tutorial_id,step) VALUES($1,$2,$3) ON CONFLICT(visitor_id,tutorial_id) DO UPDATE SET step=GREATEST(tutorial_progress.step,EXCLUDED.step),updated_at=now() RETURNING *',[owner,id,b.step]);return p
 }
 if(path.startsWith('me/works/')&&event.method==='GET') {
  const [w]=await query('SELECT id,title,description,model,status,version,review_note FROM works WHERE id=$1 AND owner_id=$2',[uuid(path.split('/')[2]),owner]);if(!w)throw createError({statusCode:404,message:'找不到本访客的这张纸笺。'});return w
 }
 if(path==='works'&&event.method==='POST') {
  const b=await jsonBody(event)
  if(!validModel(b.model))throw createError({statusCode:400,message:'作品数据格式无效。'})
  const [w]=await query('INSERT INTO works(id,owner_id,title,description,model) VALUES($1,$2,$3,$4,$5) RETURNING id,title,status,version',[randomUUID(),owner,textField(b.title,60,1),textField(b.description||'',500),b.model]);return w
 }
 if(path.startsWith('works/')) {
  const id=uuid(path.split('/')[1])
  if(path.endsWith('/submit')&&event.method==='POST') {
   const [w]=await query("UPDATE works SET status='pending',review_note='',version=version+1,updated_at=now() WHERE id=$1 AND owner_id=$2 AND status IN ('draft','rejected') RETURNING id,status,version",[id,owner])
   if(!w)throw createError({statusCode:409,message:'作品不存在或当前状态无法投稿。'});return w
  }
  if(event.method==='PATCH') {
   const b=await jsonBody(event)
   if(!validModel(b.model)||!Number.isInteger(b.version))throw createError({statusCode:400,message:'作品数据或版本号无效。'})
   const [w]=await query("UPDATE works SET title=$1,description=$2,model=$3,version=version+1,updated_at=now() WHERE id=$4 AND owner_id=$5 AND version=$6 AND status IN ('draft','rejected') RETURNING id,title,status,version",[textField(b.title,60,1),textField(b.description||'',500),b.model,id,owner,b.version])
   if(!w)throw createError({statusCode:409,message:'服务器版本或投稿状态已改变。当前编辑仍在，请先查看我的纸笺，也可另存一份。'});return w
  }
 }
 throw createError({statusCode:405,message:'不支持此操作。'})
}
