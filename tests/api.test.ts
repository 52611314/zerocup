import test from 'node:test'
import assert from 'node:assert/strict'
import pg from 'pg'
import {starterModels} from '../shared/patterns'
const origin=process.env.SITE_URL!
function visitor(){
 let cookie=''
 return async(path:string,method='GET',body?:unknown,headers:Record<string,string>={})=>{
  const r=await fetch(origin+'/api/'+path,{method,headers:{origin,cookie,'content-type':'application/json',...headers},body:body?JSON.stringify(body):undefined})
  const next=r.headers.getSetCookie()[0];if(next)cookie=next.split(';')[0]!
  return {status:r.status,data:await r.json()}
 }
}
async function removeTestWork(id: string, ...titles: string[]) {
 const client = new pg.Client({connectionString: process.env.DATABASE_URL})
 await client.connect()
 try {
  await client.query('DELETE FROM works WHERE id=$1 AND title=ANY($2::text[])', [id, titles])
 } finally {
  await client.end()
 }
}

test('真实数据库草稿、访客隔离、冲突检测、投稿自动通过和公开详情',async()=>{
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
  assert.equal((await other('gallery/'+id)).status,404)
  const pending=await owner('works/'+id+'/submit','POST')
  assert.equal(pending.data.status,'published')
  const csrf = await owner('csrf')
  assert.equal(csrf.status, 200)
  assert.equal((await owner('works/'+id, 'DELETE', {version: pending.data.version}, {'x-paper-csrf': csrf.data.token})).status, 409)
  assert.equal((await other('gallery/'+id)).status,200)
  assert.equal((await curator('admin/login','POST',{username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD})).status,200)
  assert.equal((await curator('admin/works/'+id,'PATCH',{version:pending.data.version,status:'published',featured_order:100})).status,200)
  assert.equal((await other('gallery/'+id)).data.title,record.title)
 }finally{
  await removeTestWork(id, record.title)
 }
})

test('本人草稿可创建、读取、更新和删除，拒绝跨访客及过期版本删除', async () => {
 const owner = visitor()
 const other = visitor()
 const original = {title: '草稿增删改查验证', model: starterModels[0]}
 const revised = {title: '草稿增删改查验证·已修改', description: '验证保存后的纸样和说明。', model: starterModels[1]}
 const created = await owner('works', 'POST', original)
 assert.equal(created.status, 200)
 const id = created.data.id
 const workPath = 'works/' + id
 const ownWorkPath = 'me/' + workPath
 try {
  const saved = await owner(workPath, 'PATCH', {...revised, version: created.data.version})
  assert.equal(saved.status, 200)
  assert.equal(saved.data.version, created.data.version + 1)

  const loaded = await owner(ownWorkPath)
  assert.equal(loaded.status, 200)
  assert.equal(loaded.data.title, revised.title)
  assert.equal(loaded.data.description, revised.description)
  assert.deepEqual(loaded.data.model, revised.model)

  const ownerCsrf = await owner('csrf')
  const otherCsrf = await other('csrf')
  assert.equal(ownerCsrf.status, 200)
  assert.equal(otherCsrf.status, 200)
  const current = {version: saved.data.version}
  const ownerHeaders = {'x-paper-csrf': ownerCsrf.data.token}
  const otherHeaders = {'x-paper-csrf': otherCsrf.data.token}
  assert.equal((await owner(workPath, 'DELETE', current)).status, 403)
  assert.equal((await other(workPath, 'DELETE', current, otherHeaders)).status, 404)
  assert.equal((await owner(workPath, 'DELETE', {version: created.data.version}, ownerHeaders)).status, 409)
  assert.equal((await owner(ownWorkPath)).data.version, current.version)

  const removed = await owner(workPath, 'DELETE', current, ownerHeaders)
  assert.equal(removed.status, 200)
  assert.deepEqual(removed.data, {id})
  assert.equal((await owner(ownWorkPath)).status, 404)
  const list = await owner('me/works')
  assert.equal(list.status, 200)
  assert.equal(list.data.some((work: {id: string}) => work.id === id), false)
 } finally {
  await removeTestWork(id, original.title, revised.title)
 }
})
