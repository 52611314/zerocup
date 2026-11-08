import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'

const baseURL = process.env.SITE_URL || 'http://127.0.0.1:3117'
const browser = await chromium.launch({ channel: 'chrome' })
await mkdir('test-results', { recursive: true })
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ baseURL, viewport: { width, height: 900 } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    await page.addStyleTag({ content: '.paper-weather { visibility: hidden; }' })
    const stage = page.locator('.scenes-stage')
    await expect(stage).toHaveAttribute('data-ambient', 'paused')
    for (const [name, key] of [['窗前月', 'window'], ['山外山', 'ridge'], ['水边灯', 'water']]) {
      await page.getByRole('button', { name: new RegExp(name) }).click()
      await stage.scrollIntoViewIfNeeded()
      await expect(stage).toHaveAttribute('data-ambient', 'running')
      await page.waitForTimeout(1600)
      const cloud = page.locator(`[data-scene="${key}"] .cloud-trace`).first()
      const moon = page.locator(`[data-scene="${key}"] .scene-moonlight`)
      const x = await cloud.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).e)
      const glow = await moon.evaluate(el => getComputedStyle(el).transform)
      await page.waitForTimeout(500)
      assert.ok(await cloud.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).e) > x + 3)
      assert.notEqual(await moon.evaluate(el => getComputedStyle(el).transform), glow)
      await stage.screenshot({ path: `test-results/ambient-${key}-${width}.png` })
      console.log(`${width}px: ${key} clouds move one way; moonlight moves`)
    }
    await page.getByRole('button', { name: /水边灯/ }).click()
    await stage.scrollIntoViewIfNeeded()
    await expect(stage).toHaveAttribute('data-ambient', 'running')
    await page.waitForTimeout(1600) // Clip reveal and its paper-layer transitions settle first.
    const ripples = page.locator('.scene-plate[data-scene="water"] .water-ripples').first()
    const first = await ripples.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).e)
    const bridge = await page.locator('.scene-structure').evaluate(el => getComputedStyle(el).transform)
    await page.waitForTimeout(2000)
    const waterShift = Math.abs(await ripples.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).e) - first)
    assert.ok(waterShift > 1, 'Water must visibly move, not merely change a tiny floating-point value')
    assert.equal(await page.locator('.scene-structure').evaluate(el => getComputedStyle(el).transform), bridge)
    await stage.screenshot({ path: `test-results/ambient-water-${width}.png` })
    await page.evaluate(() => scrollTo(0, 0))
    await expect(stage).toHaveAttribute('data-ambient', 'paused')
    const paused = await ripples.evaluate(el => el.getAnimations()[0].currentTime)
    await page.waitForTimeout(250)
    assert.equal(await ripples.evaluate(el => el.getAnimations()[0].currentTime), paused)
    await stage.scrollIntoViewIfNeeded()
    await expect(stage).toHaveAttribute('data-ambient', 'running')
    // Simulate the browser visibility signal; this does not claim real OS tab testing.
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await expect(stage).toHaveAttribute('data-ambient', 'paused')
    await page.evaluate(() => {
      delete document.hidden
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await expect(stage).toHaveAttribute('data-ambient', 'running')
    await page.getByRole('button', { name: /窗前月/ }).click()
    await page.waitForTimeout(800)
    assert.equal(await page.locator('.water-ripples').count(), 0)
    await page.getByRole('button', { name: /水边灯/ }).click()
    await page.waitForTimeout(800)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(stage).toHaveAttribute('data-ambient', 'paused')
    assert.equal(await ripples.evaluate(el => el.getAnimations().length), 0)

    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/learn')
    await page.addStyleTag({ content: '.paper-weather { visibility: hidden; }' })
    const room = page.locator('.learn-room')
    await expect(room).toHaveAttribute('data-ambient', 'running')
    const title = await page.locator('#learn-room-title').boundingBox()
    const beam = await page.locator('.paper-room-light').evaluate(el => new DOMMatrix(getComputedStyle(el, '::before').transform).e)
    const relief = await page.locator('.archive-relief').evaluate(el => getComputedStyle(el).transform)
    const before = await room.screenshot()
    await page.waitForTimeout(3000)
    const after = await room.screenshot()
    assert.ok(Math.abs(await page.locator('.paper-room-light').evaluate(el => new DOMMatrix(getComputedStyle(el, '::before').transform).e) - beam) > 3)
    const changed = await page.evaluate(async ({ before, after }) => {
      const read = async value => {
        const img = new Image()
        img.src = 'data:image/png;base64,' + value
        await img.decode()
        const canvas = document.createElement('canvas')
        canvas.width = img.width; canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        return ctx.getImageData(0, 0, img.width, img.height).data
      }
      const [a, b] = await Promise.all([read(before), read(after)])
      let count = 0
      for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 18) count++
      return count / (a.length / 4)
    }, { before: before.toString('base64'), after: after.toString('base64') })
    assert.ok(changed > .005, 'Background needs a visible rendered change, excluding falling particles')
    console.log(`${width}px: water moves ${waterShift.toFixed(1)} SVG px / 2s; ${(changed * 100).toFixed(2)}% of learning-room pixels visibly change / 3s`)
    assert.notEqual(await page.locator('.archive-relief').evaluate(el => getComputedStyle(el).transform), relief)
    assert.deepEqual(await page.locator('#learn-room-title').boundingBox(), title)
    await room.screenshot({ path: `test-results/ambient-learn-${width}.png` })
    await page.getByRole('button', { name: /八方星芒/ }).click()
    await page.getByRole('button', { name: /取出纸角/ }).click()
    await expect(page.getByRole('button', { name: /取出纸角/ })).toHaveAttribute('aria-pressed', 'true')
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight))
    await expect(room).toHaveAttribute('data-ambient', 'paused')
    await page.evaluate(() => scrollTo(0, 0))
    await expect(room).toHaveAttribute('data-ambient', 'running')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(room).toHaveAttribute('data-ambient', 'paused')
    assert.equal(await page.locator('.archive-relief').evaluate(el => el.getAnimations().length), 0)
    await page.goto('/tutorials')
    assert.equal(await page.locator('.room-light-animated').count(), 1)
    for (const path of ['/tutorials', '/gallery']) {
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.goto(path)
      const header = page.locator(path === '/tutorials' ? '.tutorial-room' : '.catalog-hero')
      await expect(header).toHaveAttribute('data-ambient', 'running')
      await page.waitForTimeout(1300)
      const beamX = await header.locator('.paper-room-light').evaluate(el => new DOMMatrix(getComputedStyle(el, '::before').transform).e)
      const art = path === '/gallery' ? page.locator('[data-gallery-cover]') : null
      const artTransform = art ? await art.evaluate(el => getComputedStyle(el).transform) : null
      const ring = path === '/gallery' ? page.locator('.catalog-orbit-ambient') : null
      const ringTransform = ring ? await ring.evaluate(el => getComputedStyle(el).transform) : null
      const beamSamples = [beamX]
      for (let sample = 0; sample < 3; sample++) {
        await page.waitForTimeout(500)
        beamSamples.push(await header.locator('.paper-room-light').evaluate(el => new DOMMatrix(getComputedStyle(el, '::before').transform).e))
      }
      assert.ok(Math.max(...beamSamples) - Math.min(...beamSamples) > 3)
      if (art) {
        assert.equal(await art.evaluate(el => getComputedStyle(el).opacity), '1')
        assert.equal(await art.evaluate(el => getComputedStyle(el).transform), artTransform)
        assert.notEqual(await ring.evaluate(el => getComputedStyle(el).transform), ringTransform)
      }
      await header.screenshot({ path: `test-results/ambient-${path.slice(1)}-${width}.png` })
      // On short pages a tall viewport can still see the header at the bottom.
      // Use a shorter viewport to put the entire header outside the view.
      await page.setViewportSize({ width, height: 400 })
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight))
      await expect(header).toHaveAttribute('data-ambient', 'paused')
      await page.evaluate(() => scrollTo(0, 0))
      await page.setViewportSize({ width, height: 900 })
      await expect(header).toHaveAttribute('data-ambient', 'running')
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await expect(header).toHaveAttribute('data-ambient', 'paused')
      assert.equal(await header.evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.effect?.getTiming().iterations === Infinity).length), 0)
      console.log(`${width}px: ${path} ambient movement, stable art and pause/reduced-motion passed`)
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
    assert.deepEqual(errors, [])
    console.log(`${width}px: water movement, stable bridge/text, pause/resume, simulated hidden tab, reduced motion, scene switching and atlas controls passed`)
    await page.close()
  }
} finally {
  await browser.close()
}
