import assert from 'node:assert/strict'
import {chromium} from '@playwright/test'
const browser=await chromium.launch({channel:'chrome'})
try {
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:850},baseURL:process.env.SITE_URL})
  await page.goto('/')
  assert.equal(await page.locator('#opening-title').evaluate(el=>getComputedStyle(el).opacity),'1')
  assert.equal(await page.locator('#opening-title').getAttribute('data-paper-wait'),null)
  const offscreen=page.locator('.home-stories h2')
  assert.ok(await offscreen.evaluate(el=>el.getBoundingClientRect().top>=innerHeight)?await offscreen.getAttribute('data-paper-wait')==='':true)
  await offscreen.scrollIntoViewIfNeeded()
  await page.waitForFunction(()=>!document.querySelector('.home-stories h2').hasAttribute('data-paper-wait'))
  const lifetimes=await page.locator('.paper-weather').evaluate(el=>el.getAnimations({subtree:true}).map(a=>a.effect.getTiming().duration))
  assert.ok(lifetimes.length>=1 && lifetimes.length<=3 && lifetimes.every(ms=>ms>=3000&&ms<=5000))
  await page.goto('/gallery')
  await page.locator('.wind-petal').first().waitFor({state:'attached'})
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.locator('.works-grid .work-card').last().scrollIntoViewIfNeeded()
  await page.waitForFunction(()=>!document.querySelector('.wind-petal') &&
   [...document.querySelectorAll('[data-paper-wait]')].every(el=>getComputedStyle(el).opacity==='1'))
  console.log(width+'px pass, opening visible immediately, '+lifetimes.length+' live petals')
  await page.close()
 }
} finally {await browser.close()}
