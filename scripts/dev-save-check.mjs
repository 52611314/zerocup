import assert from 'node:assert/strict'
import {chromium,expect} from '@playwright/test'
import pg from 'pg'

const origin=process.env.CHECK_URL || 'http://127.0.0.1:3000'
const browser=await chromium.launch({channel:'msedge'})
const context=await browser.newContext({baseURL:origin})
const page=await context.newPage()
const title='开发模式来源回归'
let workId
try {
  if(process.env.CHECK_ORIGIN||process.env.CHECK_NULL_ORIGIN==='1')await page.route('**/api/**',async route=>{
    if(['POST','PUT','PATCH','DELETE'].includes(route.request().method())){
      await route.continue({headers:{...route.request().headers(),origin:process.env.CHECK_ORIGIN||'null'}})
    }else await route.continue()
  })
  await page.goto('/studio')
  await page.getByRole('button',{name:'添加到纸面'}).click()
  await page.locator('#work-title').fill(title)
  await page.getByRole('button',{name:'保存草稿',exact:false}).click()
  await page.waitForURL('**/*draft=*')
  workId=new URL(page.url()).searchParams.get('draft')
  await page.reload()
  await expect(page.locator('#work-title')).toHaveValue(title)
  const work=await (await context.request.get('/api/me/works/'+workId)).json()
  assert.equal(work.model.cuts.length,1)
  const headers={origin:'https://outside.example'}
  const denied=await context.request.post('/api/works',{headers,data:{title,model:work.model}})
  assert.equal(denied.status(),403)
  const absent=await context.request.post('/api/works',{data:{title,model:work.model}})
  assert.equal(absent.status(),403)
  const {token}=await (await context.request.get('/api/csrf')).json()
  const noOrigin=await context.request.patch('/api/works/'+workId,{headers:{'x-paper-csrf':token},data:{title,model:work.model,version:work.version}})
  assert.equal(noOrigin.status(),200)
  const foreignWithToken=await context.request.post('/api/works',{headers:{origin:'https://outside.example','x-paper-csrf':token},data:{title,model:work.model}})
  assert.equal(foreignWithToken.status(),403)
  const fakeToken=await context.request.post('/api/works',{headers:{'x-paper-csrf':'a'.repeat(64)},data:{title,model:work.model}})
  assert.equal(fakeToken.status(),403)
  const second=await browser.newContext({baseURL:origin})
  const wrongSession=await second.request.post('/api/works',{headers:{'x-paper-csrf':token},data:{title,model:work.model}})
  assert.equal(wrongSession.status(),403)
  await second.close()
  console.log('PASS: Edge save/reload (Origin override='+(process.env.CHECK_ORIGIN||(process.env.CHECK_NULL_ORIGIN==='1'?'null':'browser default'))+'); foreign, absent, forged and other-session credentials rejected')
} finally {
  await browser.close()
  if(workId){
    const client=new pg.Client({connectionString:process.env.DATABASE_URL})
    await client.connect()
    try{await client.query('DELETE FROM works WHERE id=$1 AND title=$2',[workId,title])}finally{await client.end()}
  }
}
