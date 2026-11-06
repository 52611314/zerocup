import assert from 'node:assert/strict'
import {chromium} from '@playwright/test'
const browser=await chromium.launch({channel:'chrome'})
try {
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850},baseURL:process.env.SITE_URL})
  await page.addInitScript(()=>{
   window.reveals=[]
   const animate=Element.prototype.animate
   Element.prototype.animate=function(frames,options){
    if(Array.isArray(frames)&&frames[0]?.maskSize)window.reveals.push({name:this.className,tag:this.tagName,time:performance.now(),mask:frames[0].maskSize})
    return animate.call(this,frames,options)
   }
  })
  await page.goto('/')
  await page.waitForFunction(()=>window.reveals.some(r=>r.name==='hero-description'))
  const records=await page.evaluate(()=>window.reveals)
  const title=records.find(r=>r.tag==='H1'),body=records.find(r=>r.name==='hero-description')
  assert.ok(title.mask.includes(',') && body.mask.includes(','))
  assert.ok(body.time-title.time>=440 && body.time-title.time<750)
  const offscreen=page.locator('#discover h2')
  assert.ok(await offscreen.evaluate(el=>el.getBoundingClientRect().top>=innerHeight)?await offscreen.getAttribute('data-paper-wait')==='':true)
  await offscreen.scrollIntoViewIfNeeded()
  await page.waitForFunction(()=>!document.querySelector('#discover h2').hasAttribute('data-paper-wait'))
  const lifetimes=await page.locator('.paper-weather').evaluate(el=>el.getAnimations({subtree:true}).map(a=>a.effect.getTiming().duration))
  assert.ok(lifetimes.length>=1 && lifetimes.length<=3 && lifetimes.every(ms=>ms>=3000&&ms<=5000))
  await page.goto('/gallery')
  await page.locator('.wind-petal').first().waitFor({state:'attached'})
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.locator('.works-grid .work-card').last().scrollIntoViewIfNeeded()
  await page.waitForFunction(()=>!document.querySelector('.wind-petal') &&
   [...document.querySelectorAll('[data-paper-wait]')].every(el=>getComputedStyle(el).opacity==='1'))
  console.log(width+'px pass, title→body '+Math.round(body.time-title.time)+' ms, '+lifetimes.length+' live petals')
  await page.close()
 }
} finally {await browser.close()}
