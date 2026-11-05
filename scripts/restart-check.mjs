import {spawn} from 'node:child_process'
import assert from 'node:assert/strict'
import pg from 'pg'
const origin='http://127.0.0.1:3108'
let child, cookie='',id,articleId
async function start(){
 child=spawn(process.execPath,['.output/server/index.mjs'],{env:{...process.env,PORT:'3108',NITRO_PORT:'3108',SITE_URL:origin},stdio:'ignore'})
 for(let attempt=0;attempt<50;attempt++){await new Promise(ok=>setTimeout(ok,120));if(child.exitCode!==null)throw Error('临时端口无法启动');try{if((await fetch(origin+'/api/health')).ok)return}catch{}}
 throw Error('启动超时')
}
async function stop(){if(child&&child.exitCode===null){const ended=new Promise(ok=>child.once('exit',ok));child.kill();await ended}}
async function request(path,method='GET',body){const r=await fetch(origin+path,{method,headers:{origin,cookie,'content-type':'application/json'},body:body?JSON.stringify(body):undefined});assert.ok(r.ok,path);const c=r.headers.getSetCookie()[0];if(c)cookie=c.split(';')[0];return r.json()}
const db=new pg.Client({connectionString:process.env.DATABASE_URL})
await db.connect()
try{
 await start()
 const [pattern]=await request('/api/patterns')
 id=(await request('/api/works','POST',{title:'进程重启验证',model:pattern.model})).id
 await stop();await start()
 assert.deepEqual((await request('/api/me/works/'+id)).model,pattern.model)
 await request('/api/admin/login','POST',{username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD})
 const [original]=await request('/api/admin/articles')
 const article=await request('/api/admin/articles','POST',{...original,slug:'qa-'+Date.now(),title:'后台更新验证'})
 articleId=article.id
 const marker='后台修改后的正文验证标记'
 await request('/api/admin/articles/'+articleId,'PATCH',{...article,body:[{heading:'检验',text:marker}]})
 const html=await (await fetch(origin+'/learn/'+article.slug)).text()
 assert.ok(html.includes('<p>'+marker+'</p>'))
 console.log('Application restart restored private draft; edited body rendered in public HTML')
}finally{await stop();if(id)await db.query('DELETE FROM works WHERE id=$1',[id]);if(articleId)await db.query('DELETE FROM articles WHERE id=$1',[articleId]);await db.end()}
