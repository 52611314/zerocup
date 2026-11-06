import assert from 'node:assert/strict'
import {chromium} from '@playwright/test'

const browser=await chromium.launch({channel:'chrome',headless:true})
try {
  const page=await browser.newPage({baseURL:process.env.SITE_URL,viewport:{width:390,height:844},hasTouch:true})
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.locator('.hero-art').tap()
  await page.locator('.paper-scrap').first().waitFor()
  await page.getByRole('button',{name:'折回一角'}).press('Enter')
  assert.equal(await page.locator('.hero-art use').count(),1)
  await page.getByRole('button',{name:'展开窗花'}).press('Enter')
  await page.waitForFunction(()=>document.querySelector('.hero-art')?.querySelectorAll('use').length===8)
  await page.getByRole('button',{name:'折回一角'}).click()
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.getByRole('button',{name:'展开窗花'}).press('Enter')
  assert.equal(await page.locator('.hero-art use').count(),8)
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.route('**/api/articles/a-window-of-paper',async route=>{
    await new Promise(resolve=>setTimeout(resolve,1600))
    await route.continue()
  })
  await page.locator('a[href="/learn/a-window-of-paper"]').first().click()
  await page.locator('.paper-navigation').waitFor()
  await page.locator('.loading-chip').first().waitFor({state:'attached'})
  await page.locator('.article-main').waitFor()
  await page.locator('.paper-navigation').waitFor({state:'detached'})
  await page.evaluate(()=>{
    window.loaderShown=false
    new MutationObserver(records=>{
      for(const record of records)for(const node of record.addedNodes)
        if(node.nodeType===1 && node.matches('.paper-navigation'))window.loaderShown=true
    }).observe(document.body,{subtree:true,childList:true})
  })
  await page.locator('a[href="/about"]').last().click()
  await page.locator('.about-content').waitFor()
  assert.equal(await page.evaluate(()=>window.loaderShown),false)
  await page.goto('/studio')
  await page.getByRole('button',{name:'添加到纸面'}).click()
  await page.locator('.cut-off').waitFor({state:'attached'})
  await page.getByRole('button',{name:'展开作品'}).click()
  await page.waitForFunction(()=>document.querySelector('.unfold-stage .paper-art')?.querySelectorAll('use').length===8)
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.getByRole('button',{name:'回到折叠纸面'}).click()
  await page.getByRole('button',{name:'添加到纸面'}).click()
  assert.equal(await page.locator('.cut-off').count(),0)
  await page.getByRole('button',{name:'展开作品'}).click()
  assert.equal(await page.locator('.unfold-stage use').count(),8)
  console.log('PASS: touch scraps, keyboard exhibit folding, delayed navigation cuts, loader exit, matching cut fragment, eight sectors, reduced motion')
} finally { await browser.close() }
