import type { H3Event } from 'h3'
import { query } from '../utils/db'
import { uuid } from '../utils/security'
export async function publicRoutes(event:H3Event,path:string):Promise<any> {
 const q=getQuery(event)
 if(path==='health') {await query('SELECT 1');return {ok:true,database:'postgresql'}}
 if(path==='articles') return query('SELECT id,slug,title,summary,category,pattern_id FROM articles WHERE published AND ($1=\'\' OR title ILIKE $2 OR summary ILIKE $2) AND ($3=\'\' OR category=$3) ORDER BY sort_order,slug',[String(q.q||'').slice(0,80),`%${String(q.q||'').slice(0,80)}%`,String(q.category||'')])
 if(path.startsWith('articles/')) {
  const [a]=await query('SELECT * FROM articles WHERE slug=$1 AND published',[path.split('/')[1]])
  if(!a)throw createError({statusCode:404,message:'这篇纸上札记尚未公开。'})
  const all=await query('SELECT slug,title FROM articles WHERE published ORDER BY sort_order,slug')
  const index=all.findIndex(x=>x.slug===a.slug)
  return {...a,previous:all[index-1]||null,next:all[index+1]||null}
 }
 if(path==='patterns') return query('SELECT * FROM patterns WHERE published ORDER BY sort_order,id')
 if(path==='tutorials') return query('SELECT * FROM tutorials WHERE published ORDER BY sort_order,id')
 if(path.startsWith('tutorials/')) {
  const [t]=await query('SELECT * FROM tutorials WHERE published AND slug=$1',[path.split('/')[1]])
  if(!t)throw createError({statusCode:404,message:'教程尚未公开。'});return t
 }
 if(path==='gallery') {
  const page=Math.max(1,Math.min(10000,Math.floor(Number(q.page)||1)))
  const args=[String(q.q||'').slice(0,80),`%${String(q.q||'').slice(0,80)}%`,String(q.category||'')]
  const [count]=await query("SELECT count(*)::int AS total FROM works WHERE status='published' AND ($1='' OR title ILIKE $2 OR description ILIKE $2) AND ($3='' OR category=$3)",args)
  const items=await query("SELECT id,title,description,model,is_example,category,published_at FROM works WHERE status='published' AND ($1='' OR title ILIKE $2 OR description ILIKE $2) AND ($3='' OR category=$3) ORDER BY featured_order,published_at DESC,id LIMIT 6 OFFSET $4",[...args,(page-1)*6])
  return {items,total:count.total,page,pages:Math.ceil(count.total/6)}
 }
 if(path.startsWith('gallery/')) {
  const id=uuid(path.split('/')[1]);const [w]=await query("SELECT id,title,description,model,is_example,category,published_at FROM works WHERE id=$1 AND status='published'",[id])
  if(!w)throw createError({statusCode:404,message:'作品尚未公开，或已经撤展。'});return w
 }
 throw createError({statusCode:404,message:'未找到此接口。'})
}
