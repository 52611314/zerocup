import test from 'node:test'
import assert from 'node:assert/strict'
import pg from 'pg'
import {starterModels} from '../shared/patterns'
const origin=process.env.SITE_URL!
function visitor(){
 let cookie=''
 return async(path:string,method='GET',body?:unknown)=>{
  const r=await fetch(origin+'/api/'+path,{method,headers:{origin,cookie,'content-type':'application/json'},body:body?JSON.stringify(body):undefined})
  const next=r.headers.getSetCookie()[0];if(next)cookie=next.split(';')[0]!
  return {status:r.status,data:await r.json()}
 }
}
test('真实数据库草稿、访客隔离、冲突检测、审核和公开详情',async()=>{
 const owner=visitor(),other=visitor(),curator=visitor()
 const record={title:'流程验证',model:starterModels[0]}
 const made=await owner('works','POST',record)
 assert.equal(made.status,200)
 const id=made.data.id
 try{
  assert.deepEqual((await owner('me/works/'+id)).data.model,record.model)
  assert.equal((await other('me/works/'+id)).status,404)
  assert.equal((await other('admin/works')).status,401)
  assert.equal((await owner('works/'+id,'PATCH',{...record,version:0})).status,409)
  const pending=await owner('works/'+id+'/submit','POST')
  assert.equal(pending.data.status,'pending')
  assert.equal((await other('gallery/'+id)).status,404)
  assert.equal((await curator('admin/login','POST',{username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD})).status,200)
  assert.equal((await curator('admin/works/'+id,'PATCH',{version:pending.data.version,status:'published',featured_order:100})).status,200)
  assert.equal((await other('gallery/'+id)).data.title,record.title)
 }finally{
  const client=new pg.Client({connectionString:process.env.DATABASE_URL});await client.connect()
  try{await client.query('DELETE FROM works WHERE id=$1 AND title=$2',[id,record.title])}finally{await client.end()}
 }
})
