import { test, expect, chromium } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile } from 'node:fs/promises'

const projects = [
  { title: 'PiLight', path: '#/projects/pilight' },
  { title: 'PID Line-Following Car', path: '#/projects/line-follower' },
]
const boardParts = ['projects', 'experience', 'transcript', 'about', 'pickleball', 'resume']
const supersededClaims = /\b(?:Underwater ROV|Raspberry Pi|Arduino Uno|UNO|Minim|Java)\b/i
const homeHeading = /The parts\s*that make\s*me\./

async function expectLoadedIllustrations(page: Page, expectedKinds: string[]) {
  const slots = page.locator('[data-photo-slot]')
  await expect(slots).toHaveCount(expectedKinds.length)
  const actualKinds = await slots.evaluateAll(elements => elements.map(element => element.getAttribute('data-placeholder-illustration')).sort())
  expect(actualKinds).toEqual([...expectedKinds].sort())
  const descriptions: Record<string, RegExp> = {
    pilight: /ESP32|LED|audio|sound|frequency|PiLight/i,
    'line-follower': /line.follow|car|robot|sensor/i,
    'dart-robot': /dart|launcher/i,
    teaching: /teaching|robotics|students?|classroom/i,
    navy: /Navy|hardware|analysis|data/i,
    admissions: /workstations?|computer|\bIT\b|admissions/i,
    pickleball: /pickleball|paddles?|court/i,
  }
  for (let index = 0; index < expectedKinds.length; index++) {
    const slot = slots.nth(index)
    const kind = (await slot.getAttribute('data-placeholder-illustration'))!
    const illustration = slot.locator('img')
    await expect(illustration).toHaveCount(1)
    await illustration.scrollIntoViewIfNeeded()
    await expect(illustration).toBeVisible()
    const alt = await illustration.getAttribute('alt')
    expect(alt?.trim().length, `${kind} illustration needs a useful description`).toBeGreaterThanOrEqual(20)
    await expect(illustration).toHaveAccessibleName(descriptions[kind])
    expect(alt).toMatch(/(?:concept|placeholder) illustration/i)
    expect(alt).not.toMatch(/reserved space|photo space/i)
    await expect.poll(() => illustration.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0 && element.naturalHeight > 0), `${kind} illustration must finish loading`).toBe(true)
    const source = new URL(await illustration.evaluate((element: HTMLImageElement) => element.currentSrc))
    const location = new URL(page.url())
    expect(source.origin).toBe(location.origin)
    const productionAssetPrefix = new URL('./assets/', location).pathname
    const usesAssetBase = source.pathname.startsWith(productionAssetPrefix)
    const usesDevAsset = location.pathname === '/' && source.pathname.startsWith('/src/assets/')
    expect(usesAssetBase || usesDevAsset, `${kind} source must respect the site asset base: ${source.pathname}`).toBe(true)
  }
}

async function expectNoOverflow(page: Page, label: string) {
  await page.evaluate(() => document.fonts.ready)
  const width = page.viewportSize()!.width
  expect(await page.evaluate(() => document.documentElement.scrollWidth), label).toBeLessThanOrEqual(width)
}

async function expectProjectFacts(page: Page, title: string) {
  const main = page.getByRole('main')
  await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible()
  await expect(main).toContainText('ESP32')
  await expect(main).not.toContainText(supersededClaims)
  if (title === 'PiLight') {
    await expect(main).toContainText('Python')
    await expect(main).toContainText(/FFT/)
  } else {
    await expect(main).toContainText(/(?:eight|8) brightness sensors/i)
    await expect(main).toContainText('Arduino IDE')
    await expect(main).toContainText(/PID/)
    await expect(main).toContainText(/in progress/i)
  }
}

async function closeBoardStory(page: Page, touch = false) {
  const close = page.getByRole('dialog').getByRole('button', { name: /close/i })
  if (touch) await close.tap()
  else await close.click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
}

test('loads the portfolio and renders the interactive board without runtime failures', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(homeHeading)
  const canvas = page.locator('.circuit-scene__canvas')
  await expect(canvas).toBeVisible()
  await expect.poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.width)).toBeGreaterThan(100)
  await page.locator('.hero-visual').hover()
  await page.mouse.move(1100, 450)
  await expect(page.locator('.circuit-scene__fallback')).toBeHidden()
  await expect(page.locator('[data-board-part]')).toHaveCount(6)
  expect(errors).toEqual([])
})

test('project cards navigate to shareable pages with accurate build stories', async ({ page }) => {
  await page.goto('./')
  for (const project of projects) {
    const trigger = page.getByRole('link', { name: `Explore ${project.title}`, exact: true })
    await expect(trigger).toHaveAttribute('href', project.path)
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect.poll(() => new URL(page.url()).hash).toBe(project.path)
    await expectProjectFacts(page, project.title)
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await page.goBack()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(homeHeading)
  }
})

test('deep project URLs survive reload and the car links to its dart-robot backstory and back', async ({ page }) => {
  for (const project of projects) {
    await page.goto(`./${project.path}`)
    await expectProjectFacts(page, project.title)
    await page.reload()
    await expectProjectFacts(page, project.title)
  }
  await expect(page.getByRole('main')).toContainText(/Inspired by my dart.launching robot/i)
  await page.locator('main a[href="#/projects/dart-robot"]').first().click()
  await expect(page).toHaveURL(/#\/projects\/dart-robot$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/dart/i)
  await expect(page.getByRole('main')).toContainText(/earlier|inspired/i)
  await expect(page.getByRole('main')).toContainText(/line.following car/i)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/dart/i)
  const backToCar = page.locator('main a[href="#/projects/line-follower"]').first()
  await expect(backToCar).toBeVisible()
  await backToCar.click()
  await expectProjectFacts(page, 'PID Line-Following Car')
  await page.goBack()
  await expect(page).toHaveURL(/#\/projects\/dart-robot$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/dart/i)
})

test('keyboard skip link focuses the current project without navigating home', async ({ page }) => {
  for (const path of ['#/projects/pilight', '#/projects/line-follower', '#/projects/dart-robot']) {
    await page.goto(`./${path}`)
    const title = await page.getByRole('heading', { level: 1 }).innerText()
    await page.getByRole('link', { name: 'Skip to content', exact: true }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
    expect(new URL(page.url()).hash).toBe(path)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  }
})

test('all six physical board hotspots open their stories and useful destinations', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('.circuit-scene__canvas')).toBeVisible()
  const actualParts = await page.locator('[data-board-part]').evaluateAll(elements => elements.map(element => element.getAttribute('data-board-part')).sort())
  expect(actualParts).toEqual([...boardParts].sort())
  const destinations: Record<string, string> = {
    projects: 'a[href="#work"], a[href^="#/projects/"]',
    experience: 'a[href="#experience"]',
    about: 'a[href="#about"]',
    pickleball: 'a[href="#pickleball"]',
    resume: 'a[href$="Jared-Ashman-Resume.pdf"]',
  }
  for (const part of boardParts) {
    const hotspot = page.locator(`[data-board-part="${part}"]`)
    await expect(hotspot).toHaveAccessibleName(/Explore /i)
    await hotspot.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading').first()).toBeVisible()
    if (part !== 'transcript') {
      await expect(dialog.locator(destinations[part]).first()).toBeVisible()
    }
    await closeBoardStory(page)
    await expect(hotspot).toBeFocused()
  }
})

test('transcript story is honest about availability and restores keyboard focus', async ({ page }) => {
  await page.goto('./')
  const hotspot = page.locator('[data-board-part="transcript"]')
  await hotspot.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText(/transcript/i)
  await expect(dialog).toContainText(/not (?:yet )?(?:available|uploaded|attached|provided)|hasn.t been uploaded|no transcript/i)
  await expect(dialog).toContainText(/3\.9/)
  await expect(dialog).toContainText(/Dean[’']s List/i)
  await expect(dialog).toContainText(/June 2029/i)
  await expect(dialog.locator('[data-document-slot]')).toBeVisible()
  await expect(dialog.locator('[data-document-slot] img')).toHaveCount(0)
  await expect(dialog.locator('[data-placeholder-illustration]')).toHaveCount(0)
  await expect(dialog.locator('a[href*="transcript" i]:not([href^="mailto:"])')).toHaveCount(0)
  await expect(dialog.locator('a[download]')).toHaveCount(0)
  for (let index = 0; index < 6; index++) {
    await page.keyboard.press('Tab')
    // Native modal dialogs can include a browser-chrome/body stop while wrapping.
    expect(await dialog.evaluate(element => document.activeElement === document.body || element.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(hotspot).toBeFocused()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
})

test('resume downloads the supplied PDF and contact links keep their supplied destinations', async ({ page, request }) => {
  await page.goto('./')
  const resumeLink = page.locator('.hero').getByRole('link', { name: 'My résumé', exact: true })
  await expect(resumeLink).toHaveAttribute('download', '')
  const downloadPromise = page.waitForEvent('download')
  await resumeLink.click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('Jared-Ashman-Resume.pdf')
  expect(await download.failure()).toBeNull()
  const resumeURL = await resumeLink.getAttribute('href')
  expect(resumeURL).toBeTruthy()
  const response = await request.get(new URL(resumeURL!, page.url()).href)
  expect(response.ok()).toBeTruthy()
  expect(response.headers()['content-type']).toContain('application/pdf')
  const pdf = await response.body()
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
  const authoritativePDF = await readFile(new URL('../public/Jared-Ashman-Resume.pdf', import.meta.url))
  expect(pdf.equals(authoritativePDF)).toBe(true)
  await expect(page.getByRole('link', { name: /Find me on LinkedIn/ })).toHaveAttribute('href', 'https://www.linkedin.com/in/jareddashman/')
  await expect(page.getByRole('link', { name: 'jaredashman0209@gmail.com', exact: true })).toHaveAttribute('href', 'mailto:jaredashman0209@gmail.com')
})

test('home preserves current education, clearance, activities, and all three experience histories', async ({ page }) => {
  await page.goto('./')
  const projectCards = page.locator('#work .project-card')
  await expect(projectCards).toHaveCount(2)
  expect(await projectCards.getByRole('heading', { level: 3 }).allTextContents()).toEqual(expect.arrayContaining(projects.map(project => project.title)))
  const main = page.getByRole('main')
  await expect(main).toContainText(/Expected June 2029/i)
  await expect(main).toContainText(/3\.9/)
  await expect(main).toContainText(/Dean[’']s List/i)
  await expect(main).toContainText(/Active Secret Clearance/i)
  await expect(main).toContainText(/Department of the Navy/i)
  await expect(main).toContainText(/Computer Vision Simulation Manager/i)
  await expect(main).toContainText(/Bruin Underwater Racing/)
  await expect(main).toContainText(/UCLA Club Pickleball/)
  await expect(main).not.toContainText(supersededClaims)
  const teacher = page.locator('#experience article').filter({ has: page.getByRole('heading', { name: 'Student Teacher', exact: true }) })
  await expect(teacher).toContainText(/UCLA Henry Samueli School of Engineering and Applied Science/)
  await expect(teacher).toContainText(/Sep(?:tember)?\.? 2026\s*[—–-]\s*Present/i)
  await expect(teacher).toContainText(/underwater robotics/i)
  const navy = page.locator('#experience article').filter({ has: page.getByRole('heading', { name: /Student Trainee.*SSEP/i }) })
  await expect(navy).toContainText(/U\.S\. Navy/)
  await expect(navy).toContainText(/Jun(?:e)?\.? 2026\s*[—–-]\s*Sep(?:tember)?\.? 2026/i)
  await expect(navy).toContainText(/hardware.failure data/i)
  const admissions = page.locator('#experience article').filter({ has: page.getByRole('heading', { name: 'IT Specialist', exact: true }) })
  await expect(admissions).toContainText(/UCLA Undergraduate Admissions/)
  await expect(admissions).toContainText(/Sep(?:tember)?\.? 2025\s*[—–-]\s*Jun(?:e)?\.? 2026/i)
})

test('project, experience, and pickleball spaces render the matching accessible placeholder illustrations', async ({ page }) => {
  await page.goto('./')
  await expectLoadedIllustrations(page, ['pilight', 'line-follower', 'teaching', 'navy', 'admissions', 'pickleball', 'pickleball', 'pickleball'])
  const pickleball = page.locator('#pickleball')
  await expect(pickleball.getByRole('heading', { level: 2 })).toBeVisible()
  await expect(pickleball).toContainText(/UCLA Club Pickleball/)
  for (const kind of ['pilight', 'line-follower', 'dart-robot']) {
    await page.goto(`./#/projects/${kind}`)
    await expectLoadedIllustrations(page, [kind, kind, kind])
  }
})

test('mobile navigation opens, closes, and reaches selected sections', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('./')
  const menu = page.getByRole('button', { name: 'Open navigation' })
  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(navigation).toBeHidden()
  await menu.click()
  await expect(navigation).toBeVisible()
  await expect(page.getByRole('button', { name: 'Close navigation' })).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
  await expect(navigation).toBeHidden()
  for (const [link, id] of [['Projects', 'work'], ['About', 'about'], ['Experience', 'experience'], ['Pickleball', 'pickleball'], ['Let’s connect', 'contact']]) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await menu.click()
    await navigation.getByRole('link', { name: link, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`#${id}$`))
    await expect(navigation).toBeHidden()
    await expect(page.locator(`#${id}`).getByRole('heading', { level: 2 })).toBeInViewport()
  }
})

test('home, project pages, and transcript story fit small phones through desktop', async ({ page }) => {
  test.setTimeout(60_000)
  for (const width of [320, 375, 680, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    await expectNoOverflow(page, `home overflow at ${width}px`)
    await page.locator('[data-board-part="transcript"]').click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
    await page.keyboard.press('Escape')
    for (const project of projects) {
      await page.goto(`./${project.path}`)
      await expectProjectFacts(page, project.title)
      await expectNoOverflow(page, `${project.title} overflow at ${width}px`)
    }
  }
})

test('all six projected hotspots remain actionable on a touch screen', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, baseURL })
  try {
    const page = await context.newPage()
    await page.goto('./')
    await expect(page.locator('.circuit-scene__canvas')).toBeVisible()
    for (const part of boardParts) {
      await page.locator(`[data-board-part="${part}"]`).tap()
      await expect(page.getByRole('dialog')).toBeVisible()
      await closeBoardStory(page, true)
    }
  } finally { await context.close() }
})

test('home, all project pages, and the transcript story pass automated WCAG 2 A/AA checks', async ({ page }) => {
  test.setTimeout(60_000)
  for (const route of ['', '#/projects/pilight', '#/projects/line-follower', '#/projects/dart-robot']) {
    await page.goto(`./${route}`)
    await page.evaluate(() => document.fonts.ready)
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    expect.soft(result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(node => ({ target: node.target, message: node.any[0]?.message })) })), `accessibility at ${route || 'home'}`).toEqual([])
  }
  await page.goto('./')
  await page.locator('[data-board-part="transcript"]').click()
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect.soft(result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(node => ({ target: node.target, message: node.any[0]?.message })) })), 'accessibility in transcript story').toEqual([])
})

test('reduced-motion users can use every board hotspot and open project stories', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await expect(page.locator('.circuit-scene__canvas')).toBeVisible()
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto')
  for (const part of boardParts) {
    await page.locator(`[data-board-part="${part}"]`).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await closeBoardStory(page)
  }
  await page.getByRole('link', { name: 'Explore PiLight', exact: true }).click()
  await expectProjectFacts(page, 'PiLight')
})

test('without WebGL the circuit and all six navigation stories still work', async ({ baseURL }) => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-webgl'] })
  try {
    const page = await browser.newPage()
    await page.goto(baseURL!)
    await expect(page.locator('.circuit-scene__fallback')).toBeVisible()
    await expect(page.locator('.circuit-scene__canvas')).toHaveCount(0)
    await expect(page.locator('[data-board-part]')).toHaveCount(6)
    for (const part of boardParts) {
      await page.locator(`[data-board-part="${part}"]`).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await closeBoardStory(page)
    }
    await page.getByRole('link', { name: 'Explore PID Line-Following Car', exact: true }).click()
    await expectProjectFacts(page, 'PID Line-Following Car')
  } finally { await browser.close() }
})
