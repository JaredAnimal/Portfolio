import { test, expect, chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile } from 'node:fs/promises'

const projectTitles = ['PiLight', 'PID Line-Following Car']
const supersededClaims = /\b(?:Underwater ROV|Dart.launching robot|Raspberry Pi|Arduino Uno|UNO|Minim|Java)\b/i

test('loads the portfolio and renders the interactive circuit without runtime failures', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Curiosity,')
  const canvas = page.locator('.circuit-scene__canvas')
  await expect(canvas).toBeVisible()
  await expect.poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.width)).toBeGreaterThan(100)
  await page.locator('.hero-visual').hover()
  await page.mouse.move(1100, 450)
  await expect(page.locator('.circuit-scene__fallback')).toBeHidden()
  expect(errors).toEqual([])
})

test('project details retain keyboard focus and close with Escape and the close button', async ({ page }) => {
  await page.goto('./')
  for (const title of projectTitles) {
    const trigger = page.getByRole('button', { name: `Explore ${title}`, exact: true })
    await trigger.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Inside the build' })).toBeVisible()
    await expect(dialog).not.toContainText(supersededClaims)
    await expect(dialog).toContainText('ESP32')
    if (title === 'PiLight') {
      await expect(dialog).toContainText('Python')
      await expect(dialog).toContainText(/FFT/)
    } else {
      await expect(dialog).toContainText(/(?:eight|8) brightness sensors/i)
      await expect(dialog).toContainText('Arduino IDE')
      await expect(dialog).toContainText(/PID/)
      await expect(dialog.locator('.dialog-eyebrow')).toContainText(/in progress/i)
    }
    const close = dialog.getByRole('button', { name: 'Close project' })
    await expect(close).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(dialog.getByRole('link', { name: 'Ask me about this project' })).toBeFocused()
    // Native modal dialogs may include a browser-chrome/body focus stop when
    // wrapping; background page controls must stay inert throughout traversal.
    for (let index = 0; index < 5; index++) {
      await page.keyboard.press('Tab')
      expect(await dialog.evaluate(el => document.activeElement === document.body || el.contains(document.activeElement))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
  }
  await page.getByRole('button', { name: 'Explore PiLight', exact: true }).click()
  await page.getByRole('button', { name: 'Close project' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
})

test('resume is a downloadable PDF and contact links point to the supplied sources', async ({ page, request }) => {
  await page.goto('./')
  const resumeLink = page.getByRole('link', { name: 'My résumé', exact: true })
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

test('portfolio reflects the authoritative resume and removes superseded project and experience claims', async ({ page }) => {
  await page.goto('./')
  const projectCards = page.locator('#work .project-card')
  await expect(projectCards).toHaveCount(2)
  expect(await projectCards.getByRole('heading', { level: 3 }).allTextContents()).toEqual(expect.arrayContaining(projectTitles))

  const main = page.getByRole('main')
  await expect(main).toContainText(/Expected June 2029/i)
  await expect(main).toContainText(/3\.9/)
  await expect(main).toContainText(/Dean[’']s List/i)
  await expect(main).toContainText(/Active Secret Clearance/i)
  await expect(main).toContainText(/(?:Department of the Navy|U\.S\. Navy)/i)
  await expect(main).toContainText(/Computer Vision Simulation Manager/i)
  await expect(main).toContainText(/Bruin Underwater Racing/)
  await expect(main).toContainText(/UCLA Club Pickleball/)

  const teacher = page.locator('.experience-row').filter({ has: page.getByRole('heading', { name: 'Student Teacher', exact: true }) })
  await expect(teacher).toContainText(/UCLA Henry Samueli School of Engineering and Applied Science/)
  await expect(teacher).toContainText(/Sep(?:tember)?\.? 2026\s*[—–-]\s*Present/i)
  await expect(teacher).toContainText(/underwater robotics/i)

  const navy = page.locator('.experience-row').filter({ has: page.getByRole('heading', { name: /Student Trainee.*SSEP/i }) })
  await expect(navy).toContainText(/U\.S\. Navy/)
  await expect(navy).toContainText(/Jun(?:e)?\.? 2026\s*[—–-]\s*Sep(?:tember)?\.? 2026/i)
  await expect(navy).toContainText(/hardware.failure data/i)

  const admissions = page.locator('.experience-row').filter({ has: page.getByRole('heading', { name: 'IT Specialist', exact: true }) })
  await expect(admissions).toContainText(/UCLA Undergraduate Admissions/)
  await expect(admissions).toContainText(/Sep(?:tember)?\.? 2025\s*[—–-]\s*Jun(?:e)?\.? 2026/i)
  await expect(main).not.toContainText(supersededClaims)
})

test('mobile navigation opens, closes, and reaches each selected section', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('./')
  const menu = page.getByRole('button', { name: 'Open navigation' })
  await expect(page.getByRole('navigation')).toBeHidden()
  await menu.click()
  await expect(page.getByRole('navigation')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Close navigation' })).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
  await expect(page.getByRole('navigation')).toBeHidden()
  for (const [link, id] of [['Projects', 'work'], ['About', 'about'], ['Experience', 'experience'], ['Let’s connect', 'contact']]) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await menu.click()
    await page.getByRole('navigation').getByRole('link', { name: link }).click()
    await expect(page).toHaveURL(new RegExp(`#${id}$`))
    await expect(page.getByRole('navigation')).toBeHidden()
    await expect(page.locator(`#${id}`).getByRole('heading', { level: 2 })).toBeInViewport()
  }
})

test('small phones, tablets and desktop layouts do not overflow horizontally', async ({ page }) => {
  for (const width of [320, 375, 680, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.documentElement.scrollWidth), `page overflow at ${width}px`).toBeLessThanOrEqual(width)
    await page.getByRole('button', { name: 'Explore PiLight', exact: true }).click()
    const dialog = page.getByRole('dialog')
    const { width: dialogWidth } = (await dialog.boundingBox())!
    expect(dialogWidth).toBeLessThan(width)
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
    await page.keyboard.press('Escape')
  }
})

test('homepage and project dialog pass WCAG 2 A/AA automated accessibility checks', async ({ page }) => {
  await page.goto('./')
  await page.evaluate(() => document.fonts.ready)
  const homepage = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(homepage.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(node => ({ target: node.target, message: node.any[0]?.message })) }))).toEqual([])
  await page.getByRole('button', { name: 'Explore PiLight', exact: true }).click()
  const dialog = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(dialog.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(node => ({ target: node.target, message: node.any[0]?.message })) }))).toEqual([])
})

test('reduced-motion users can read and explore projects', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await expect(page.locator('.circuit-scene__canvas')).toBeVisible()
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto')
  await page.getByRole('button', { name: 'Explore PiLight', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('ESP32')
  await expect(page.getByRole('dialog')).toContainText('Python')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

test('browsers without WebGL receive the circuit illustration and usable project links', async ({ baseURL }) => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-webgl'] })
  try {
    const page = await browser.newPage()
    await page.goto(baseURL!)
    await expect(page.locator('.circuit-scene__fallback')).toBeVisible()
    await expect(page.locator('.circuit-scene__canvas')).toHaveCount(0)
    await page.getByRole('button', { name: 'Explore PID Line-Following Car', exact: true }).click()
    await expect(page.getByRole('dialog')).toContainText(/(?:eight|8) brightness sensors/i)
  } finally {
    await browser.close()
  }
})
