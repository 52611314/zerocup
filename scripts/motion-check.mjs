import assert from 'node:assert/strict'
import {chromium} from '@playwright/test'

const browser=await chromium.launch({channel:'chrome',headless:true})
try {
  const page=await browser.newPage({baseURL:process.env.SITE_URL,viewport:{width:390,height:844},hasTouch:true})
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button',{name:'看留白'}).press('Enter')
  await page.locator('.opening-plate.plate-negative').waitFor()
  await page.getByRole('button',{name:'看团花'}).click()
  await page.locator('.opening-plate.plate-negative').waitFor({state:'detached'})
  await page.locator('.hero-art').tap()
  await page.locator('.paper-scrap').first().waitFor()
  await page.evaluate(()=>{
    const art=document.querySelector('.hero-art')
    window.paperStages=[8]
    new MutationObserver(()=>{
      const count=art.querySelectorAll('use').length
      if(window.paperStages.at(-1)!==count)window.paperStages.push(count)
    }).observe(art,{subtree:true,childList:true})
  })
  const demo=page.getByRole('button',{name:'演示折展'})
  await demo.press('Enter')
  assert.equal(await page.locator('.cut-light.light-visible').count(),0)
  await page.waitForFunction(()=>document.querySelector('.art-label')?.getAttribute('aria-disabled')==='false')
  assert.deepEqual(await page.evaluate(()=>window.paperStages),[8,4,2,1,2,4,8])
  await page.locator('.cut-light.light-visible').waitFor()
  await demo.click()
  await page.waitForFunction(()=>document.querySelector('.hero-art')?.querySelectorAll('use').length===1)
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.getByRole('button',{name:'查看纸角'}).press('Enter')
  assert.equal(await page.locator('.hero-art use').count(),1)
  await page.getByRole('button',{name:'查看完整窗花'}).press('Enter')
  assert.equal(await page.locator('.hero-art use').count(),8)
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.route('**/api/articles/a-window-of-paper',async route=>{
    await new Promise(resolve=>setTimeout(resolve,1600))
    await route.continue()
  })
  await page.locator('a[href="/learn/a-window-of-paper"]').first().click()
  const loader=page.locator('.paper-navigation')
  await loader.waitFor()
  const loaderBox=await loader.boundingBox()
  assert.ok(loaderBox && loaderBox.width<200 && loaderBox.height<80)
  assert.ok(await page.locator('.home-page').isVisible())
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
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.goto('/gallery')
  await page.waitForLoadState('networkidle')
  await page.getByRole('link',{name:'观看展品'}).click()
  await page.waitForFunction(()=>document.activeElement?.id==='gallery-collection' &&
    Math.abs(document.activeElement.getBoundingClientRect().top-24)<3)
  const collectionY=await page.evaluate(()=>scrollY)
  await page.getByRole('button',{name:'花叶之间'}).click()
  await page.waitForFunction(()=>new URLSearchParams(location.search).get('category')==='花叶之间' &&
    document.querySelector('.collection-results')?.getAttribute('aria-busy')==='false')
  assert.ok(Math.abs(await page.evaluate(()=>scrollY)-collectionY)<35)
  console.log('PASS: touch scraps, complete one-click fold demonstration, delayed navigation, eight sectors, reduced motion, and collection position after filtering')
} finally { await browser.close() }
