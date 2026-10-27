import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function settledHotspots(page: Page) {
  return page.evaluate(async () => {
    const buttons = [...document.querySelectorAll<HTMLElement>('[data-board-part]')]
    const positions = () => buttons.map(button => ({
      part: button.dataset.boardPart!,
      x: parseFloat(button.style.left),
      y: parseFloat(button.style.top),
    }))
    let previous = positions()
    let stableFrames = 0
    return new Promise<ReturnType<typeof positions>>(resolve => {
      const sample = () => {
        const current = positions()
        const settled = current.every((point, index) =>
          Math.abs(point.x - previous[index].x) + Math.abs(point.y - previous[index].y) < 0.01)
        stableFrames = settled ? stableFrames + 1 : 0
        previous = current
        if (stableFrames >= 3) resolve(current)
        else requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
    })
  })
}

test('both halves of the circuit follow the pointer in each screen direction', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('./')
  const scene = page.locator('.circuit-scene.is-rendered')
  await expect(scene).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const bounds = (await scene.boundingBox())!
  const move = async (x: number, y: number) => {
    await page.mouse.move(bounds.x + bounds.width * x, bounds.y + bounds.height * y)
    return settledHotspots(page)
  }
  const rest = await settledHotspots(page)
  expect(rest).toHaveLength(6)

  // Every marker is projected from its physical component, including components
  // on the far and near edges. World-Y yaw fails these horizontal checks.
  const topLeft = await move(0.1, 0.1)
  const topRight = await move(0.9, 0.1)
  const bottomRight = await move(0.9, 0.9)
  const bottomLeft = await move(0.1, 0.9)
  const topLeftAgain = await move(0.1, 0.1)
  for (let index = 0; index < rest.length; index++) {
    const part = rest[index].part
    expect(topRight[index].x - topLeft[index].x, `${part} follows right in the upper half`).toBeGreaterThan(3)
    expect(bottomRight[index].y - topRight[index].y, `${part} follows down in the right half`).toBeGreaterThan(3)
    expect(bottomRight[index].x - bottomLeft[index].x, `${part} follows left in the lower half`).toBeGreaterThan(3)
    expect(bottomLeft[index].y - topLeftAgain[index].y, `${part} follows up in the left half`).toBeGreaterThan(3)
  }

  await page.mouse.move(0, 0)
  const reset = await settledHotspots(page)
  for (let index = 0; index < rest.length; index++) {
    expect(Math.abs(reset[index].x - rest[index].x)).toBeLessThan(0.1)
    expect(Math.abs(reset[index].y - rest[index].y)).toBeLessThan(0.1)
  }
})

test('reduced motion keeps the projected circuit stationary under the pointer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  const scene = page.locator('.circuit-scene.is-rendered')
  await expect(scene).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const bounds = (await scene.boundingBox())!
  const rest = await settledHotspots(page)
  for (const [x, y] of [[0.1, 0.1], [0.9, 0.1], [0.9, 0.9], [0.1, 0.9]]) {
    await page.mouse.move(bounds.x + bounds.width * x, bounds.y + bounds.height * y)
    expect(await settledHotspots(page)).toEqual(rest)
  }
})
