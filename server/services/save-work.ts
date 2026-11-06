import {randomUUID} from 'node:crypto'
import {database} from '../utils/db'
import {uuid,textField} from '../utils/security'
import {validModel} from '../../shared/model'

export async function saveWork(owner:string,body:Record<string,any>,workId?:string){
 if(!validModel(body.model))throw createError({statusCode:400,message:'作品数据格式无效。'})
 const title=textField(body.title,60,1),description=textField(body.description||'',500)
 if(workId&&!Number.isInteger(body.version))throw createError({statusCode:400,message:'作品版本无效。'})
 const client=await database().connect()
 try{
  await client.query('BEGIN')
  if(body.runId){
   const {rows:[run]}=await client.query('SELECT id FROM tutorial_runs WHERE id=$1 AND visitor_id=$2 AND active FOR UPDATE',[uuid(body.runId),owner])
   if(!run)throw createError({statusCode:409,message:'本次练习已变更，请重新打开教程；当前作品可另存为普通草稿。'})
  }
  const result=workId
   ?await client.query("UPDATE works SET title=$1,description=$2,model=$3,version=version+1,updated_at=now() WHERE id=$4 AND owner_id=$5 AND version=$6 AND status IN ('draft','rejected') RETURNING id,title,status,version",[title,description,body.model,workId,owner,body.version])
   :await client.query('INSERT INTO works(id,owner_id,title,description,model) VALUES($1,$2,$3,$4,$5) RETURNING id,title,status,version',[randomUUID(),owner,title,description,body.model])
  const work=result.rows[0]
  if(!work)throw createError({statusCode:409,message:'作品版本或投稿状态已改变，请查看纸笺或另存草稿。'})
  if(body.runId)await client.query('UPDATE tutorial_runs SET work_id=$1,updated_at=now() WHERE id=$2',[work.id,body.runId])
  await client.query('COMMIT')
  return work
 }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
}
