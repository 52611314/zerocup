import {randomUUID} from 'node:crypto'
import type {H3Event} from 'h3'
import {database,query} from '../utils/db'
import {jsonBody,uuid} from '../utils/security'

export async function practiceRoute(event:H3Event,owner:string,path:string) {
 const tutorialId=uuid(path.split('/')[2])
 const [tutorial]=await query('SELECT id FROM tutorials WHERE id=$1 AND published',[tutorialId])
 if(!tutorial)throw createError({statusCode:404,message:'教程尚未公开。'})
 if(event.method==='GET'){
  const [run]=await query('SELECT id,step,work_id FROM tutorial_runs WHERE visitor_id=$1 AND tutorial_id=$2 AND active',[owner,tutorialId])
  return run||null
 }
 if(event.method!=='POST')throw createError({statusCode:405})
 const body=await jsonBody(event)
 if(body.restart!==undefined && typeof body.restart!=='boolean')throw createError({statusCode:400})
 const client=await database().connect()
 try{
  await client.query('BEGIN')
  // Serialize new attempts for this visitor, including concurrent tabs.
  await client.query('SELECT id FROM visitor_sessions WHERE id=$1 FOR UPDATE',[owner])
  if(body.restart)await client.query('UPDATE tutorial_runs SET active=false WHERE visitor_id=$1 AND tutorial_id=$2 AND active',[owner,tutorialId])
  await client.query('INSERT INTO tutorial_runs(id,visitor_id,tutorial_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[randomUUID(),owner,tutorialId])
  const {rows:[run]}=await client.query('SELECT id,step,work_id FROM tutorial_runs WHERE visitor_id=$1 AND tutorial_id=$2 AND active',[owner,tutorialId])
  await client.query('COMMIT')
  return run
 }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
}
