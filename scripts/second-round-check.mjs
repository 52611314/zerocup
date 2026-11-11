import {chromium,expect} from '@playwright/test'
import assert from 'node:assert/strict'
import pg from 'pg'
import {createHash} from 'node:crypto'
const browser=await chromium.launch({channel:'chrome'})
const db=new pg.Client({connectionString:process.env.DATABASE_URL})
await db.connect()
async function closePage(page){
 const session=(await page.context().cookies()).find(cookie=>cookie.name==='paper_visitor')
 if(session)await db.query('DELETE FROM visitor_sessions s WHERE token_hash=$1 AND NOT EXISTS(SELECT 1 FROM works w WHERE w.owner_id=s.id)',[createHash('sha256').update(session.value).digest('hex')])
 await page.close()
}
try{
 for(const width of [390,1440]){
  const page=await browser.newPage({baseURL:process.env.SITE_URL,viewport:{width,height:850}})
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto('/')
  const id=await page.locator('[data-window-work]').getAttribute('data-window-work')
  await page.route('**/api/gallery*',async route=>{await new Promise(r=>setTimeout(r,900));await route.continue()})
  await page.locator('.window-gallery a').click()
  await page.locator('.chapter-window[data-phase="opening"]').waitFor()
  await page.locator('[data-gallery-cover]').waitFor()
  assert.equal(await page.locator('[data-gallery-cover]').getAttribute('data-gallery-cover'),id)
  assert.equal(await page.locator('[data-gallery-cover]').evaluate(el=>getComputedStyle(el).opacity),'1')
  await page.locator('.chapter-window').waitFor({state:'detached'})
  await page.goBack()
  await page.locator('.window-gallery a').waitFor()
  await page.unroute('**/api/gallery*')
  await page.goto('/studio')
  await page.getByRole('button',{name:'添加到纸面'}).click()
  await page.getByRole('button',{name:'展开作品',exact:false}).last().click()
  await page.waitForFunction(()=>document.querySelector('.unfold-stage .paper-art')?.querySelectorAll('use').length===8)
  assert.equal(await page.locator('.unfold-stage .cut-light').count(),0)
  assert.equal(await page.getByRole('button',{name:'看透光'}).count(),0)
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
  await page.emulateMedia({reducedMotion:'reduce'})
  page.on('dialog',d=>d.accept())
  await page.goto('/studio?tutorial=first-flower')
  await page.getByRole('button',{name:'圆形',exact:true}).click()
  await page.getByRole('button',{name:'添加到纸面'}).click()
  await page.locator('#cut-tools .lesson-prompt').getByRole('button',{name:'记下这一步'}).click()
  await page.waitForFunction(()=>document.activeElement?.id==='unfold-tools')
  await page.getByRole('button',{name:'展开作品',exact:false}).last().click()
  await page.waitForFunction(()=>document.querySelector('.unfold-stage .paper-art')?.querySelectorAll('use').length===8)
  assert.deepEqual(errors,[])
  console.log(width+'px: public-work handoff, delayed navigation, back, restored studio preview, next-tool focus and reduced motion passed')
  await closePage(page)
 }
 for(const failed of [false,true]){
  const page=await browser.newPage({baseURL:process.env.SITE_URL,viewport:{width:390,height:850}})
  await page.goto('/')
  await page.route('**/api/gallery*',route=>route.fulfill({
   status:failed?503:200,contentType:'application/json',
   body:JSON.stringify(failed?{message:'模拟展览暂时离线'}:{items:[],total:0,pages:0,page:1})
  }))
  await page.locator('.window-gallery a').click()
  await page.waitForURL('**/gallery')
  await page.locator('.chapter-window').waitFor({state:'detached'})
  if(failed){
   await page.getByRole('button',{name:'重新读取',exact:false}).waitFor()
   await page.unroute('**/api/gallery*')
   await page.getByRole('button',{name:'重新读取',exact:false}).click()
   await page.locator('.exhibit-grid .work-card').first().waitFor()
  }else await expect(page.locator('.empty-cover')).toBeVisible()
  await closePage(page)
 }
 console.log('Gallery empty/error: no stuck overlay; failed request can retry')
 for (const mode of ['escape', 'reduce', 'timeout']) {
  const page = await browser.newPage({
   baseURL: process.env.SITE_URL,
   viewport: {width: 390, height: 844},
   reducedMotion: mode === 'reduce' ? 'reduce' : 'no-preference',
  })
  try {
   await page.goto('/', {waitUntil: 'networkidle'})
   if (mode === 'timeout') {
    await page.route('**/api/gallery*', async route => {
     await new Promise(resolve => setTimeout(resolve, 3200))
     await route.continue()
    })
    await page.locator('.window-gallery a').press('Enter')
    await page.locator('.chapter-window').waitFor()
    await page.locator('.chapter-window').waitFor({state: 'detached'})
    await page.locator('[data-gallery-cover]').waitFor()
   } else {
    const workshop = page.locator('.opening-door')
    if (mode === 'escape') {
     // Skip in the same task, before the route timer fires.
     await workshop.evaluate(link => {
      link.focus()
      link.click()
      window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))
     })
    } else {
     await workshop.press('Enter')
    }
    await page.locator('.canvas-surface').waitFor()
   }
   assert.equal(await page.locator('.chapter-window').count(), 0, mode)
   await expect(page.locator('#main')).toBeFocused()
  } finally {
   await closePage(page)
  }
 }
 console.log('Chapter keyboard focus: Escape, reduced motion and slow loading passed')
}finally{await browser.close();await db.end()}
