import {chromium,expect} from '@playwright/test'
import assert from 'node:assert/strict'
import pg from 'pg'
const origin=process.env.SITE_URL
const browser=await chromium.launch({channel:'chrome'})
const context=await browser.newContext({baseURL:origin,viewport:{width:390,height:844},reducedMotion:'reduce',hasTouch:true})
const page=await context.newPage()
const db=new pg.Client({connectionString:process.env.DATABASE_URL})
await db.connect()
let visitorId
try{
 await page.goto('/studio?tutorial=first-flower#save-tools')
 await page.locator('#work-title').waitFor()
 await expect(page.locator('#save-tools .lesson-prompt')).toContainText('留一个圆孔')
 await expect(page.locator('#save-tools .lesson-prompt a')).toHaveAttribute('href',/cut-tools/)
 await page.getByRole('button',{name:'圆形',exact:true}).click()
 await page.getByRole('button',{name:'添加到纸面'}).click()
 await page.locator('#cut-tools .lesson-prompt').getByRole('button',{name:'记下这一步'}).click()
 await expect(page.locator('.tutorial-guide')).toContainText('看见对称')
 await page.getByRole('button',{name:'展开作品',exact:false}).last().click()
 const downloaded=page.waitForEvent('download')
 await page.getByRole('button',{name:'下载 PNG',exact:false}).click()
 const file=await downloaded
 const {readFile}=await import('node:fs/promises')
 const bytes=await readFile(await file.path())
 const pixels=await page.evaluate(async base64=>{
  const image=new Image();image.src='data:image/png;base64,'+base64;await image.decode()
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height
  const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0)
  const data=ctx.getImageData(0,0,image.width,image.height).data
  let clear=0,solid=0,wrongColor=0
  for(let i=0;i<data.length;i+=4){
   if(data[i+3]===0)clear++
   if(data[i+3]===255){solid++;if(Math.abs(data[i]-184)>1||Math.abs(data[i+1]-50)>1||Math.abs(data[i+2]-40)>1)wrongColor++}
  }
  return {clear,solid,wrongColor,width:image.width}
 },bytes.toString('base64'))
 assert.equal(pixels.width,1200);assert.ok(pixels.clear>10000&&pixels.solid>10000);assert.equal(pixels.wrongColor,0)
 await page.locator('#unfold-tools .lesson-prompt').getByRole('button',{name:'记下这一步'}).click()
 await expect(page.locator('#save-tools .lesson-prompt')).toContainText('留住这朵花')
 await page.route('**/api/works',r=>r.fulfill({status:503,contentType:'application/json',body:'{"message":"模拟保存失败"}'}))
 await page.getByRole('button',{name:'保存草稿',exact:false}).click()
 await expect(page.locator('#save-tools')).toContainText('模拟保存失败')
 await expect(page.locator('#save-tools .lesson-prompt').getByRole('button',{name:'记下这一步'})).toHaveCount(0)
 await page.unroute('**/api/works')
 await page.getByRole('button',{name:'重试保存',exact:false}).click()
 await page.waitForURL('**/*draft=*')
 const workId=new URL(page.url()).searchParams.get('draft')
 await page.reload()
 await expect(page.locator('#work-title')).toHaveValue('我的第一朵窗花')
 await page.locator('#save-tools .lesson-prompt').getByRole('button',{name:'记下这一步'}).click()
 await expect(page.locator('.tutorial-guide')).toContainText('练习完成')
 const runs=await context.request.get('/api/me/progress')
 const [progress]=await runs.json()
 assert.equal(progress.step,3);assert.equal(progress.work_id,workId)
 const patterns=await (await context.request.get('/api/patterns')).json()
 const other=await browser.newContext({baseURL:origin})
 assert.equal((await other.request.get('/api/me/works/'+workId)).status(),404)
 assert.equal((await other.request.patch('/api/works/'+workId,{headers:{origin},data:{model:{},version:1}})).status(),400)
 assert.equal((await other.request.post('/api/works',{headers:{origin},data:{title:'forbidden',model:patterns[0].model,runId:progress.run_id}})).status(),409)
 await other.close()
 visitorId=(await db.query('SELECT visitor_id FROM tutorial_runs WHERE id=$1',[progress.run_id])).rows[0].visitor_id
 await page.goto('/studio?tutorial=first-flower&restart=1')
 await page.getByRole('button',{name:'开始新的练习'}).click()
 await expect(page.locator('.tutorial-guide')).toContainText('留一个圆孔')
 await expect(page.locator('.cut-count')).toContainText('0 / 80')
 const history=await (await context.request.get('/api/me/progress')).json()
 assert.equal(history[0].step,3)
 assert.notEqual(history[0].run_id,progress.run_id)
 assert.equal(history[0].run_step,0)
 await page.goto('/me')
 await page.getByRole('button',{name:'学习足迹',exact:false}).click()
 await expect(page.locator('.progress-list')).toContainText('曾完成此教程')
 await expect(page.locator('.progress-list a')).toHaveAttribute('href','/studio?tutorial=first-flower')
 // Old attempt cannot update or attach a new work after a restart.
 const stale=await context.request.post('/api/works',{headers:{origin},data:{title:'stale',model:(await (await context.request.get('/api/me/works/'+workId)).json()).model,runId:progress.run_id}})
 assert.equal(stale.status(),409)
 await page.goto('/')
 await expect(page.locator('#opening-title')).toBeVisible()
 await page.getByRole('button',{name:'看留白',exact:false}).click()
 await expect(page.locator('.swallow-reveal')).toHaveClass(/is-reversed/)
 await page.screenshot({path:'test-results/first-round-home.png'})
 console.log('PASS: localized guidance, failure/retry, resume, completion history, restart, stale-run rejection, home flip')
}finally{
 if(visitorId){await db.query('DELETE FROM works WHERE owner_id=$1',[visitorId]);await db.query('DELETE FROM visitor_sessions WHERE id=$1',[visitorId])}
 await db.end();await browser.close()
}
