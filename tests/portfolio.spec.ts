import { test, expect, chromium } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile } from 'node:fs/promises'

const projects = [
  { title: 'BrightLight', path: '#/projects/brightlight' },
  { title: 'PID Line-Following Car', path: '#/projects/line-follower' },
]
const boardParts = ['projects', 'experience', 'transcript', 'about', 'pickleball', 'resume']
const roleTitles = ['Student Teacher', 'Student Trainee (SSEP)', 'IT Specialist']
const pickleballProjects = ['Picklebot reservation bot', 'Reservation-sharing website', '3D-printed net base extension']
const additionalProjects = [
  { title: 'Dart-launching robot', path: '#/projects/dart-robot' },
  { title: 'USS Sunflower', path: '#/projects/sunflower' },
  { title: pickleballProjects[0], path: '#/projects/reservation-bot' },
  { title: pickleballProjects[1], path: '#/projects/reservation-sharing' },
  { title: pickleballProjects[2], path: '#/projects/net-tensioner' },
  { title: 'Wind turbine', path: '#/projects/wind-turbine' },
]
const allProjects = [...projects, ...additionalProjects]
const featuredProjects = [additionalProjects[0], additionalProjects[5]]
const supersededClaims = /\b(?:Underwater ROV|Raspberry Pi|Arduino Uno|UNO|Minim|Java)\b/i
const homeHeading = /Curiosity,\s*wired\s*into\s*practice\./

async function expectLoadedMedia(page: Page, expectedKinds: string[]) {
  const slots = page.locator('[data-photo-slot]')
  await expect(slots).toHaveCount(expectedKinds.length)
  const actualKinds = await slots.evaluateAll(elements => elements.map(element => element.getAttribute('data-placeholder-illustration') ?? element.getAttribute('data-photo-subject')).sort())
  expect(actualKinds).toEqual([...expectedKinds].sort())
  const descriptions: Record<string, RegExp> = {
    pilight: /ESP32|LED|audio|sound|frequency|BrightLight/i,
    'line-follower': /line.follow|car|robot|sensor/i,
    'dart-robot': /dart|launcher|launch angle|horizontal distance/i,
    teaching: /teaching|robot|biomimetic|students?|classroom/i,
    navy: /Navy|ships?|helicopter|hardware|analysis|data/i,
    admissions: /workstations?|computer|\bIT\b|admissions|UCLA.*portal/i,
    pickleball: /pickleball|paddles?|court/i,
    sunflower: /USS Sunflower|workshop|pool|camera/i,
    'wind-turbine': /wind turbine|blades|generator/i,
  }
  for (let index = 0; index < expectedKinds.length; index++) {
    const slot = slots.nth(index)
    const illustrationKind = await slot.getAttribute('data-placeholder-illustration')
    const kind = (illustrationKind ?? await slot.getAttribute('data-photo-subject'))!
    const image = slot.locator('img')
    await expect(image).toHaveCount(1)
    await image.scrollIntoViewIfNeeded()
    await expect(image).toBeVisible()
    const alt = await image.getAttribute('alt')
    expect(alt?.trim().length, `${kind} image needs a useful description`).toBeGreaterThanOrEqual(20)
    await expect(image).toHaveAccessibleName(descriptions[kind])
    if (illustrationKind) {
      expect(alt).toMatch(/(?:concept|placeholder) illustration/i)
      await expect(slot).toContainText('CONCEPT ILLUSTRATION')
    } else {
      expect(alt).not.toMatch(/concept|placeholder|to follow/i)
      await expect(slot.locator('.placeholder-art__caption')).toHaveCount(0)
      const isCroppedLead = kind === 'sunflower' && await slot.evaluate(element => !!element.closest('.project-page-photo-wide'))
      await expect(image).toHaveCSS('object-fit', isCroppedLead ? 'cover' : 'contain')
    }
    expect(alt).not.toMatch(/reserved space|photo space/i)
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0 && element.naturalHeight > 0), `${kind} image must finish loading`).toBe(true)
    const source = new URL(await image.evaluate((element: HTMLImageElement) => element.currentSrc))
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
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth), label).toBeLessThanOrEqual(width)
}

async function expectNetDimensions(page: Page) {
  const dimensions = page.locator('.pickleball-net__dimensions')
  await expect(dimensions).toBeVisible()
  for (const [id, label] of Object.entries({ width: 'NET WIDTH · 6.63 m', height: 'SIDE · 0.9144 m', 'center-height': 'CENTER · 0.8636 m', tension: 'TENSION · 230–270 N' })) {
    const dimension = dimensions.locator(`[data-net-dimension="${id}"]`)
    await expect(dimension).toBeVisible()
    await expect(dimension).toContainText(label)
  }
  const extensionArea = dimensions.locator('[data-net-extension-area] text')
  await expect(extensionArea).toBeVisible()
  await expect(extensionArea).toHaveText('proposed area of net extension')
  await expect(page.locator('[data-net-scene]')).not.toContainText(/\bTBD\b/)
  await expect.poll(async () => {
    const frame = await page.locator('.pickleball-net__viewport').boundingBox()
    const labels = await dimensions.locator('[data-net-dimension] text').evaluateAll(elements => elements.map(element => {
      const { x, y, right, bottom } = element.getBoundingClientRect()
      return { x, y, right, bottom }
    }))
    const area = await extensionArea.evaluate(element => {
      const { x, y, right, bottom } = element.getBoundingClientRect()
      return { x, y, right, bottom }
    })
    return frame !== null && labels.length === 4 && [...labels, area].every(label => label.x >= frame.x - 1 && label.y >= frame.y - 1 && label.right <= frame.x + frame.width + 1 && label.bottom <= frame.y + frame.height + 1)
  }, 'dimension and extension-area labels stay inside the net view').toBe(true)
  return dimensions
}

async function expectProjectFacts(page: Page, title: string) {
  const main = page.getByRole('main')
  await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible()
  if (title === 'Dart-launching robot') {
    await expect(main.getByRole('link', { name: /district showcase/i })).toHaveAttribute('href', 'https://sites.google.com/sandi.net/sdusdccte-innovation-showcase/home')
    return
  }
  if (title === 'Wind turbine') {
    await expect(main).toContainText('Savonius')
    await expect(main).toContainText('17 V')
    await expect(main).toContainText('82')
    return
  }
  await expect(main).toContainText('ESP32')
  await expect(main).not.toContainText(supersededClaims)
  if (title === 'BrightLight') {
    await expect(main).toContainText('Python')
    await expect(main).toContainText(/FFT/)
  } else {
    await expect(main).toContainText(/(?:eight|8) brightness sensors/i)
    await expect(main).toContainText('Arduino IDE')
    await expect(main).toContainText(/PID/)
    await expect(main).toContainText(/in progress/i)
  }
}

async function expectProjectSubmenu(page: Page, title: string) {
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: title, exact: true })).toBeVisible()
  if (title === 'Dart-launching robot') {
    await expect(dialog.getByRole('link', { name: /district showcase/i })).toBeVisible()
    return
  }
  if (title === 'Wind turbine') {
    await expect(dialog).toContainText('Savonius')
    await expect(dialog).toContainText('17 V')
    return
  }
  await expect(dialog).toContainText('ESP32')
  await expect(dialog).not.toContainText(supersededClaims)
  if (title === 'BrightLight') {
    await expect(dialog).toContainText('Python')
    await expect(dialog).toContainText(/FFT/)
  } else {
    await expect(dialog).toContainText(/(?:eight|8) brightness sensors/i)
    await expect(dialog).toContainText('Arduino IDE')
    await expect(dialog).toContainText(/in progress/i)
  }
}

async function expectPickleballProjectsAbsent(page: Page) {
  for (const title of pickleballProjects) await expect(page.locator('body')).not.toContainText(title)
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

test('project images and titles open submenus that lead to the full shareable stories', async ({ page }) => {
  await page.goto('./')
  for (const project of featuredProjects) {
    const card = page.locator('#work .project-card').filter({ hasText: project.title })
    const trigger = card.getByRole('button', { name: `Explore ${project.title}`, exact: true }).first()
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expectProjectSubmenu(page, project.title)
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('link', { name: 'Read full project story', exact: true })).toHaveAttribute('href', project.path)
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
    await card.getByRole('heading', { level: 3 }).getByRole('button').click()
    await expectProjectSubmenu(page, project.title)
    await dialog.getByRole('link', { name: 'Read full project story', exact: true }).click()
    await expect.poll(() => new URL(page.url()).hash).toBe(project.path)
    await expectProjectFacts(page, project.title)
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await page.goBack()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(homeHeading)
  }
})

test('deep project URLs survive reload and the dart robot is an independent project with its showcase link', async ({ page }) => {
  for (const project of projects) {
    await page.goto(`./${project.path}`)
    await expectProjectFacts(page, project.title)
    await page.reload()
    await expectProjectFacts(page, project.title)
    await page.getByRole('button', { name: 'Project menu', exact: true }).click()
    await expectProjectSubmenu(page, project.title)
    await closeBoardStory(page)
  }
  await page.goto('./#/projects/pilight')
  await expectProjectFacts(page, 'BrightLight')
  await page.goto('./#/projects/dart-robot')
  await expect(page.getByRole('heading', { level: 1, name: 'Dart-launching robot', exact: true })).toBeVisible()
  await expect(page.getByRole('main')).not.toContainText(/earlier|backstory|next chapter/i)
  await expect(page.getByRole('main').getByRole('link', { name: /district showcase/i })).toHaveAttribute('href', 'https://sites.google.com/sandi.net/sdusdccte-innovation-showcase/home')
  await expect(page.getByRole('main').locator('.project-link-pending')).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Dart-launching robot', exact: true })).toBeVisible()
})

test('keyboard skip link focuses the current project without navigating home', async ({ page }) => {
  for (const path of ['#/projects/brightlight', '#/projects/line-follower', '#/projects/dart-robot', '#/projects', '#/projects/reservation-bot', '#/projects/wind-turbine']) {
    await page.goto(`./${path}`)
    const title = await page.getByRole('heading', { level: 1 }).innerText()
    await page.getByRole('link', { name: 'Skip to content', exact: true }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
    expect(new URL(page.url()).hash).toBe(path)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  }
})

test('all six board hotspots open useful menus, with project and job submenus in the same dialog', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('.circuit-scene__canvas')).toBeVisible()
  const actualParts = await page.locator('[data-board-part]').evaluateAll(elements => elements.map(element => element.getAttribute('data-board-part')).sort())
  expect(actualParts).toEqual([...boardParts].sort())
  const destinations: Record<string, string> = {
    about: 'a[href="#about"]',
    transcript: 'a[href$="Jared-Ashman-Transcript.pdf"]',
    resume: 'a[href$="Jared-Ashman-Resume.pdf"]',
  }
  for (const part of boardParts) {
    const hotspot = page.locator(`[data-board-part="${part}"]`)
    await expect(hotspot).toHaveAccessibleName(/Explore /i)
    await hotspot.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading').first()).toBeVisible()
    if (part === 'projects' || part === 'experience' || part === 'pickleball') {
      const titles = part === 'projects' ? allProjects.map(project => project.title) : part === 'experience' ? roleTitles : pickleballProjects
      await expect(dialog.locator('button:not([aria-label="Close story"])')).toHaveCount(titles.length)
      for (const title of titles) {
        const choice = dialog.getByRole('button').filter({ hasText: title }).first()
        await choice.click()
        await expect(dialog.getByRole('heading', { name: title, exact: true })).toBeVisible()
        await expect(page.getByRole('dialog')).toHaveCount(1)
        if (part === 'projects' && projects.some(project => project.title === title)) await expectProjectSubmenu(page, title)
        if (title === 'Dart-launching robot') await expect(dialog.getByRole('link', { name: 'Read full project story', exact: true })).toHaveAttribute('href', '#/projects/dart-robot')
        await dialog.getByRole('button', { name: new RegExp(`Back to ${part}`, 'i') }).click()
        await expect(dialog.locator('button:not([aria-label="Close story"])')).toHaveCount(titles.length)
        await expect(choice).toBeFocused()
      }
    } else {
      await expect(dialog.locator(destinations[part]).first()).toBeVisible()
    }
    await closeBoardStory(page)
    await expect(hotspot).toBeFocused()
  }
})

test('transcript menu serves the clean three-page public PDF and restores keyboard focus', async ({ page, request }) => {
  await page.goto('./')
  const hotspot = page.locator('[data-board-part="transcript"]')
  await hotspot.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText(/transcript/i)
  await expect(dialog).toContainText(/unofficial/i)
  await expect(dialog).not.toContainText(/personal identifiers redacted/i)
  await expect(dialog).not.toContainText(/not uploaded|no transcript|transcript unavailable/i)
  await expect(dialog).toContainText(/3\.9/)
  await expect(dialog).toContainText(/Dean[’']s List/i)
  await expect(dialog).toContainText(/June 2029/i)
  await expect(dialog.locator('[data-placeholder-illustration]')).toHaveCount(0)
  const view = dialog.getByRole('link', { name: 'View transcript', exact: true })
  const downloadLink = dialog.getByRole('link', { name: 'Download transcript', exact: true })
  await expect(view).toHaveAttribute('target', '_blank')
  const expectedURL = new URL('./Jared-Ashman-Transcript.pdf', page.url())
  for (const link of [view, downloadLink]) {
    const href = await link.getAttribute('href')
    expect(new URL(href!, page.url()).href).toBe(expectedURL.href)
  }
  const downloadPromise = page.waitForEvent('download')
  await downloadLink.click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('Jared-Ashman-Transcript.pdf')
  expect(await download.failure()).toBeNull()
  const response = await request.get(expectedURL.href)
  expect(response.ok()).toBeTruthy()
  expect(response.headers()['content-type']).toContain('application/pdf')
  const pdf = await response.body()
  expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
  expect(pdf.equals(await readFile(new URL('../public/Jared-Ashman-Transcript.pdf', import.meta.url)))).toBe(true)
  expect(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)).toHaveLength(3)
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
  const heroLinkedIn = page.locator('.hero').getByRole('link', { name: /LinkedIn/ })
  await expect(heroLinkedIn).toHaveAttribute('href', 'https://www.linkedin.com/in/jareddashman/')
  await expect(heroLinkedIn.locator('svg')).toBeVisible()
  await expect(page.locator('#hero-heading em')).toHaveText('wired')
  await expect(page.getByRole('main')).not.toContainText(/a work in progress, just like me/i)
  await expect(page.getByRole('link', { name: 'jaredashman0209@gmail.com', exact: true })).toHaveAttribute('href', 'mailto:jaredashman0209@gmail.com')
})

test('USS Sunflower stays off the homepage while header and board project menus preserve its full story', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('#work .project-card')).toHaveCount(2)
  await expect(page.getByRole('main')).not.toContainText('USS Sunflower')
  await expect(page.getByRole('main').locator('[data-photo-subject="sunflower"]')).toHaveCount(0)
  const dialog = page.getByRole('dialog')
  const entryPoints = [
    page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Projects', exact: true }),
    page.locator('[data-board-part="projects"]'),
  ]
  for (const trigger of entryPoints) {
    await trigger.click()
    const choice = dialog.locator('[data-menu-item="sunflower"]')
    await expect(choice).toBeVisible()
    await choice.click()
    await expect(dialog.getByRole('heading', { name: 'USS Sunflower', exact: true })).toBeVisible()
    await expect(dialog).toContainText(/underwater robotics/i)
    await expect(dialog.locator('[data-photo-subject="sunflower"]')).toHaveCount(1)
    await expect(dialog.locator('[data-photo="sunflower-workbench"] img')).toHaveAccessibleName(/USS Sunflower lying on a workshop table/i)
    await expect(dialog).not.toContainText(/project photos to come|photography to follow/i)
    await expect(dialog).not.toContainText(/Full design snapshot/i)
    await expect(dialog.getByRole('link', { name: /Full design snapshot/ })).toHaveCount(0)
    await expect(dialog.getByRole('link', { name: 'Read full project story', exact: true })).toHaveAttribute('href', '#/projects/sunflower')
    await dialog.getByRole('button', { name: 'Back to projects', exact: true }).click()
    await expect(choice).toBeFocused()
    await closeBoardStory(page)
    await expect(trigger).toBeFocused()
  }
  await entryPoints[0].click()
  await dialog.locator('[data-menu-item="sunflower"]').click()
  await dialog.getByRole('link', { name: 'Read full project story', exact: true }).click()
  await expect(page).toHaveURL(/#\/projects\/sunflower$/)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'USS Sunflower', exact: true })).toBeVisible()
  await expect(page).toHaveTitle('USS Sunflower — Jared Ashman')
  await expect(page.getByRole('main')).toContainText(/six.motor/)
  await expect(page.getByRole('main')).toContainText('PS4')
  await expect(page.getByRole('main').locator('[data-metric-pending]')).toHaveCount(0)
  await expect(page.getByRole('main')).not.toContainText(/Full design snapshot/i)
  await expect(page.locator('.project-page-photo-wide [data-photo]')).toHaveAttribute('data-photo', 'sunflower-workbench')
  expect(await page.locator('main [data-photo]').evaluateAll(elements => elements.map(element => element.getAttribute('data-photo')))).toEqual([
    'sunflower-workbench', 'sunflower-hull', 'sunflower-electronics', 'sunflower-workshop-monitor', 'sunflower-poolside', 'sunflower-pool-monitor',
  ])
  await expect(page.getByRole('main')).not.toContainText(/project photos to come|photography to follow|concept illustration/i)
  await expectLoadedMedia(page, Array(6).fill('sunflower'))
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expectNoOverflow(page, `USS Sunflower overflow at ${width}px`)
  }
})

test('project measurements use the supplied values and unmeasured net results remain pending', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-29T19:00:00Z'))
  const expectedMetrics: Record<string, [RegExp, RegExp][]> = {
    brightlight: [[/Response latency/i, /<\s*50\s*ms/], [/Frequency resolution/i, /<\s*2\.5\s*Hz/i]],
    'line-follower': [[/Tracking error/i, /4\s*%/], [/loop (?:period|time|rate)/i, /17\s*ms/]],
    sunflower: [[/Dive depth/i, /33\s*(?:ft|feet)/i], [/Underwater runtime/i, /30\s*min/i]],
    'reservation-bot': [[/Booking turnaround/i, /<\s*0?\.3\s*s/]],
    'wind-turbine': [[/Output voltage/i, /^17\s*V$/], [/Max RPM/i, /^82$/]],
    'reservation-sharing': [[/Reservations shared/i, /^≈50$/]],
  }
  for (const [id, metrics] of Object.entries(expectedMetrics)) {
    await page.goto(`./#/projects/${id}`)
    const main = page.getByRole('main')
    await expect(main.locator('.project-metrics dt')).toHaveCount(metrics.length)
    for (const [caption, value] of metrics) {
      const metric = main.locator('.project-metrics > div').filter({ has: page.locator('dt').filter({ hasText: caption }) })
      await expect(metric.locator('dd')).toHaveText(value)
    }
    await expect(main.locator('[data-metric-pending]')).toHaveCount(0)
    if (id !== 'brightlight') await expect(main).not.toContainText(/(?:Demo|Build) video/i)
  }
  await expect(page.getByRole('main')).not.toContainText(/Response time|Players served/i)
  await expect(page.getByRole('main').getByRole('link', { name: /View project repository/ })).toHaveAttribute('href', 'https://github.com/JaredAnimal/UCLAPickleball')
  await expect(page.getByRole('main').getByRole('link', { name: /Visit project website/ })).toHaveAttribute('href', 'https://bit.ly/UCLAPB')
  await expect(page.getByRole('main')).not.toContainText(/Active monthly users/i)
  await page.goto('./#/projects/wind-turbine')
  await expect(page.getByRole('main')).toContainText(/Savonius/i)
  await expect(page.getByRole('main')).toContainText(/HAWT/)
  await expect(page.getByRole('main')).toContainText(/VAWT/)
  await expect(page.getByRole('main')).toContainText(/bladeless/i)
  await page.goto('./#/projects/net-tensioner')
  await expect(page.getByRole('main').locator('[data-metric-pending]')).toHaveCount(2)
})

test('shared reservations update after Los Angeles midnight and stay consistent in the project menu', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-30T06:59:30Z') })
  await page.goto('./#/projects/reservation-sharing')
  const count = page.getByRole('main').locator('.project-metrics dd')
  await expect(count).toHaveText('≈50')
  await page.clock.fastForward(60_000)
  await expect(count).toHaveText('≈52')
  await page.clock.fastForward(60_000)
  await expect(count).toHaveText('≈52')
  await page.getByRole('button', { name: 'Project menu', exact: true }).click()
  const menu = page.getByRole('dialog')
  await expect(menu.locator('.project-metrics dd')).toHaveText('≈52')
  await expect(menu.getByRole('link', { name: /Visit project website/ })).toHaveAttribute('href', 'https://bit.ly/UCLAPB')
})

test('home and each clickable job preserve current education, clearance, activities, and work history', async ({ page }) => {
  await page.goto('./')
  const projectCards = page.locator('#work .project-card')
  await expect(projectCards).toHaveCount(2)
  expect(await projectCards.getByRole('heading', { level: 3 }).allTextContents()).toEqual(featuredProjects.map(project => project.title))
  const main = page.getByRole('main')
  await expect(main).toContainText(/Expected June 2029/i)
  await expect(main).toContainText(/3\.9/)
  await expect(main).toContainText(/Dean[’']s List/i)
  await expect(main).toContainText(/Active Secret Clearance/i)
  await expect(main).toContainText(/Department of the Navy/i)
  await expect(main).toContainText(/Computer Vision Simulation Manager/i)
  await expect(main).toContainText(/Bruin Underwater Racing/)
  const about = page.locator('#about')
  await expect(about).toContainText(/2025\s*[–—-]\s*2026.*served as Computer Vision Simulation Manager/i)
  await expect(about).not.toContainText(/I[’']m (?:also )?the Computer Vision Simulation Manager/i)
  await expect(main).toContainText(/UCLA Club Pickleball/)
  await expect(main).not.toContainText(supersededClaims)
  const teacher = page.locator('#experience .experience-row').filter({ hasText: 'Student Teacher' })
  await expect(teacher).toContainText(/UCLA Henry Samueli School of Engineering and Applied Science/)
  await expect(teacher).toContainText(/Sep(?:tember)?\.? 2026\s*[—–-]\s*Present/i)
  await expect(teacher).toContainText(/underwater robotics/i)
  const navy = page.locator('#experience .experience-row').filter({ hasText: 'Student Trainee (SSEP)' })
  await expect(navy).toContainText(/U\.S\. Navy/)
  await expect(navy).toContainText(/Jun(?:e)?\.? 2026\s*[—–-]\s*Sep(?:tember)?\.? 2026/i)
  await expect(navy).toContainText(/hardware.failure data/i)
  const admissions = page.locator('#experience .experience-row').filter({ hasText: 'IT Specialist' })
  await expect(admissions).toContainText(/UCLA Undergraduate Admissions/)
  await expect(admissions).toContainText(/Sep(?:tember)?\.? 2025\s*[—–-]\s*Jun(?:e)?\.? 2026/i)
  const facts: Record<string, RegExp[]> = {
    'Student Teacher': [/Sep(?:tember)?\.? 2026\s*[—–-]\s*Present/i, /underwater robotics/i, /soldering/i],
    'Student Trainee (SSEP)': [/Jun(?:e)?\.? 2026\s*[—–-]\s*Sep(?:tember)?\.? 2026/i, /hardware.failure data/i, /U\.S\. Navy/],
    'IT Specialist': [/Sep(?:tember)?\.? 2025\s*[—–-]\s*Jun(?:e)?\.? 2026/i, /100.*workstations/i, /Undergraduate Admissions/],
  }
  const roleSubjects: Record<string, string> = { 'Student Teacher': 'teaching', 'Student Trainee (SSEP)': 'navy', 'IT Specialist': 'admissions' }
  for (const title of roleTitles) {
    const role = page.locator('#experience .experience-row').filter({ hasText: title })
    const trigger = role.getByRole('button', { name: `Explore ${title}`, exact: true }).first()
    await trigger.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: title, exact: true })).toBeVisible()
    for (const fact of facts[title]) await expect(dialog).toContainText(fact)
    const photo = dialog.locator(`[data-photo-subject="${roleSubjects[title]}"] img`)
    await expect(photo).toBeVisible()
    await expect.poll(() => photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true)
    await expect(dialog.locator('[data-placeholder-illustration]')).toHaveCount(0)
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
    await role.getByRole('heading', { level: 3 }).getByRole('button').click()
    await expect(dialog.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await dialog.getByRole('button', { name: /Back to experience/i }).click()
    for (const roleTitle of roleTitles) await expect(dialog.getByRole('button').filter({ hasText: roleTitle }).first()).toBeVisible()
    await closeBoardStory(page)
  }
  await page.locator('[data-board-part="about"]').click()
  const aboutMenu = page.getByRole('dialog')
  await expect(aboutMenu).toContainText(/2025\s*[–—-]\s*2026.*served as Computer Vision Simulation Manager/i)
  await expect(aboutMenu).not.toContainText(/I[’']m (?:also )?the Computer Vision Simulation Manager/i)
  await closeBoardStory(page)
})

test('the pickleball section keeps its three nested projects and restores focus', async ({ page }) => {
  await page.goto('./')
  await expectPickleballProjectsAbsent(page)
  await page.locator('[data-board-part="pickleball"]').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('[data-photo="pickleball-team"] img')).toHaveAccessibleName(/UCLA Club Pickleball team/i)
  await expect(dialog.locator('button:not([aria-label="Close story"])')).toHaveCount(3)
  for (const title of pickleballProjects) {
    await expect(page.getByRole('main')).not.toContainText(title)
    const choice = dialog.getByRole('button').filter({ hasText: title }).first()
    await choice.click()
    await expect(dialog.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await dialog.getByRole('button', { name: /Back to pickleball/i }).click()
    await expect(dialog.locator('button:not([aria-label="Close story"])')).toHaveCount(3)
    await expect(choice).toBeFocused()
  }
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expectPickleballProjectsAbsent(page)
  const section = page.locator('#pickleball')
  const image = section.locator('button').filter({ has: page.locator('img') }).first()
  await image.click()
  await expect(dialog.locator('button:not([aria-label="Close story"])')).toHaveCount(3)
  await closeBoardStory(page)
  await expectPickleballProjectsAbsent(page)
  const headingButton = section.getByRole('heading', { level: 2 }).getByRole('button')
  await headingButton.click()
  await expect(dialog.locator('button:not([aria-label="Close story"])')).toHaveCount(3)
  await closeBoardStory(page)
})

test('project, experience, and pickleball spaces render their accessible photos', async ({ page }) => {
  await page.goto('./')
  await expectLoadedMedia(page, ['dart-robot', 'wind-turbine', 'teaching', 'navy', 'admissions', 'pickleball', 'pickleball', 'pickleball'])
  for (const subject of ['dart-robot', 'wind-turbine', 'teaching', 'navy', 'admissions']) {
    await expect(page.locator(`[data-photo-subject="${subject}"]`)).toHaveCount(1)
    await expect(page.locator(`[data-placeholder-illustration="${subject}"]`)).toHaveCount(0)
  }
  await expect(page.locator('[data-photo^="brightlight-esp32"]')).toHaveCount(0)
  await expect(page.locator('#work [data-photo-subject="pilight"], #work [data-photo-subject="line-follower"]')).toHaveCount(0)
  const pickleball = page.locator('#pickleball')
  await expect(pickleball.getByRole('heading', { level: 2 })).toBeVisible()
  await expect(pickleball).toContainText(/UCLA Club Pickleball/)
  await expect(pickleball.locator('.pickleball-main-photo [data-photo]')).toHaveAttribute('data-photo', 'pickleball-team')
  expect(await pickleball.locator('[data-photo]').evaluateAll(elements => elements.map(element => element.getAttribute('data-photo')))).toEqual([
    'pickleball-team', 'pickleball-on-court', 'pickleball-doubles',
  ])
  await expect(pickleball).not.toContainText(/concept illustration|photography to follow/i)
  for (const kind of ['pilight', 'line-follower', 'dart-robot']) {
    await page.goto(`./#/projects/${kind}`)
    await expectLoadedMedia(page, Array(kind === 'line-follower' ? 2 : kind === 'dart-robot' ? 5 : 3).fill(kind))
    if (kind === 'pilight') {
      await expect(page.locator('.project-page-photo-wide [data-photo]')).toHaveAttribute('data-photo', 'brightlight-led-matrix')
      await expect(page.locator('.project-page-photo-grid [data-photo^="brightlight-esp32"]')).toHaveCount(2)
    }
    if (kind === 'line-follower') {
      await expect(page.locator('[data-photo="line-follower-sum-error"] img')).toHaveAttribute('src', /imageofPID/)
    }
    await expect(page.locator('[data-placeholder-illustration]')).toHaveCount(0)
    await expect(page.getByRole('main')).not.toContainText(/concept illustration|photography to follow/i)
    if (kind === 'dart-robot') {
      await expect(page.locator('.project-page-photo-wide img')).toHaveAccessibleName(/showcase.*Jared|Jared.*showcase/i)
      const galleryImages = page.locator('.project-page-photo-grid img')
      await expect(galleryImages).toHaveCount(4)
      expect(await galleryImages.evaluateAll(images => images.map(image => image.getAttribute('alt')).join(' '))).toMatch(/flow|simulation/i)
      expect(await galleryImages.evaluateAll(images => images.map(image => image.getAttribute('alt')).join(' '))).toMatch(/launch angle.*horizontal distance/i)
    }
  }
  await page.goto('./#/projects/wind-turbine')
  await expectLoadedMedia(page, ['wind-turbine'])
  await expect(page.locator('.project-page-photo-wide [data-photo]')).toHaveAttribute('data-photo', 'wind-turbine-main')
  const videos = page.getByRole('group', { name: 'Wind turbine video gallery' }).locator('video')
  await expect(videos).toHaveCount(4)
  for (const video of await videos.all()) {
    await expect(video).toHaveAttribute('controls', '')
    await expect(video).toHaveAttribute('preload', 'metadata')
    await expect(video).toHaveAccessibleName(/wind turbine|h-rotor/i)
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState >= 1 && element.videoWidth > 0 && element.videoHeight > 0 && element.error === null), 'Wind turbine video metadata must load').toBe(true)
  }
})

test('mobile navigation opens category menus, restores visible focus, and reaches anchor sections', async ({ page }) => {
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
  for (const category of ['Projects', 'Experience', 'Pickleball']) {
    await menu.click()
    await navigation.getByRole('button', { name: category, exact: true }).click()
    await expect(navigation).toBeHidden()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(menu).toBeFocused()
  }
  for (const [link, id] of [['About', 'about'], ['Let’s connect', 'contact']]) {
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
    for (const project of [...featuredProjects, ...projects]) {
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

test('home, project pages, nested menus, and the transcript pass automated WCAG 2 A/AA checks', async ({ page }) => {
  test.setTimeout(90_000)
  for (const route of ['', '#/projects', ...allProjects.map(project => project.path)]) {
    await page.goto(`./${route}`)
    await page.evaluate(() => document.fonts.ready)
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    expect.soft(result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(node => ({ target: node.target, message: node.any[0]?.message })) })), `accessibility at ${route || 'home'}`).toEqual([])
  }
  await page.goto('./')
  for (const [part, child] of [['projects', 'BrightLight'], ['experience', 'Student Teacher'], ['pickleball', 'Picklebot reservation bot'], ['transcript', '']]) {
    await page.locator(`[data-board-part="${part}"]`).click()
    if (child) await page.getByRole('dialog').getByRole('button').filter({ hasText: child }).first().click()
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    expect.soft(result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(node => ({ target: node.target, message: node.any[0]?.message })) })), `accessibility in ${part} menu`).toEqual([])
    await closeBoardStory(page)
  }
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
  await page.getByRole('button', { name: 'Explore Dart-launching robot', exact: true }).first().click()
  await expectProjectSubmenu(page, 'Dart-launching robot')
  await page.getByRole('dialog').getByRole('link', { name: 'Read full project story', exact: true }).click()
  await expectProjectFacts(page, 'Dart-launching robot')
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
    await page.getByRole('button', { name: 'Explore PID Line-Following Car', exact: true }).first().click()
    await expectProjectSubmenu(page, 'PID Line-Following Car')
    await page.getByRole('dialog').getByRole('link', { name: 'Read full project story', exact: true }).click()
    await expectProjectFacts(page, 'PID Line-Following Car')
    await page.goto(new URL('./#/projects/net-tensioner', baseURL).href)
    await expect(page.locator('.pickleball-net__fallback')).toBeVisible()
    await expect(page.locator('.pickleball-net__canvas')).toHaveCount(0)
    await expect(page.getByRole('main')).toContainText(/Static view/i)
    await expectNetDimensions(page)
  } finally { await browser.close() }
})

test('the projects directory includes pickleball and wind projects with shareable detail pages', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('./')
  const allProjectsLink = page.getByRole('main').locator('a[href="#/projects"]').first()
  await expect(allProjectsLink).toBeVisible()
  await allProjectsLink.click()
  await expect(page).toHaveURL(/#\/projects$/)
  await expect(page.getByRole('heading', { level: 1, name: /Projects/i })).toBeVisible()
  const directory = page.getByRole('main')
  for (const project of allProjects) {
    const entry = directory.locator(`a[href="${project.path}"]`).first()
    await expect(entry).toBeVisible()
    await expect(directory).toContainText(project.title)
  }
  for (const project of additionalProjects) {
    await page.goto('./#/projects')
    await page.getByRole('main').locator(`a[href="${project.path}"]`).first().click()
    await expect(page).toHaveURL(new RegExp(`${project.path}$`))
    await expect(page.getByRole('heading', { level: 1, name: project.title, exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { level: 1, name: project.title, exact: true })).toBeVisible()
    await expect(page.getByRole('main')).not.toContainText(/(?:Demo|Build) video/i)
    await page.getByRole('main').locator('a[href="#/projects"]').first().click()
    await expect(page).toHaveURL(/#\/projects$/)
  }
})

test('Picklebot source opens as exact text in the same page and nested dialogs restore focus', async ({ page, context }) => {
  test.setTimeout(60_000)
  const source = await readFile(new URL('../src/assets/source/picklebot.js', import.meta.url), 'utf8')
  const externalRequests: string[] = []
  page.on('request', request => {
    if (/recreation\.ucla\.edu/.test(request.url())) externalRequests.push(request.url())
  })
  await page.goto('./#/projects/reservation-bot')
  const main = page.getByRole('main')
  const exe = main.locator('a[href*="/releases/download/"][href$=".exe"]')
  await expect(exe).toBeVisible()
  expect(new URL((await exe.getAttribute('href'))!).host).toBe('github.com')
  const sourceButton = main.getByRole('button', { name: 'Source code', exact: true })
  await sourceButton.click()
  const viewer = page.getByRole('dialog', { name: 'picklebot.js', exact: true })
  await expect(viewer).toBeVisible()
  expect(await viewer.locator('pre code').textContent()).toBe(source)
  await expect(viewer.getByRole('button', { name: 'Copy code', exact: true })).toBeVisible()
  await expect(viewer.getByRole('button', { name: 'Close source code', exact: true })).toBeVisible()
  expect(context.pages()).toHaveLength(1)
  expect(externalRequests).toEqual([])
  await page.setViewportSize({ width: 320, height: 812 })
  await expectNoOverflow(page, 'source viewer at 320px')
  expect(await viewer.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(node => node.target) }))).toEqual([])
  await page.keyboard.press('Escape')
  await expect(viewer).not.toBeVisible()
  await expect(sourceButton).toBeFocused()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('./')
  const projectsTrigger = page.locator('[data-board-part="projects"]')
  await projectsTrigger.click()
  const menu = page.locator('#portfolio-menu')
  await menu.locator('[data-menu-item="reservation-bot"]').click()
  const nestedSourceButton = menu.getByRole('button', { name: 'Source code', exact: true })
  await nestedSourceButton.click()
  await expect(viewer).toBeVisible()
  expect(await viewer.locator('pre code').textContent()).toBe(source)
  await page.keyboard.press('Escape')
  await expect(viewer).not.toBeVisible()
  await expect(menu).toBeVisible()
  await expect(nestedSourceButton).toBeFocused()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
  await page.keyboard.press('Escape')
  await expect(menu).not.toBeVisible()
  await expect(projectsTrigger).toBeFocused()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')

  await projectsTrigger.click()
  await menu.locator('[data-menu-item="reservation-bot"]').click()
  await menu.getByRole('button', { name: 'Source code', exact: true }).click()
  await expect(viewer).toBeVisible()
  await page.evaluate(() => { window.location.hash = '#/projects' })
  await expect(page.getByRole('heading', { level: 1, name: 'Projects', exact: true })).toBeVisible()
  await expect(viewer).not.toBeVisible()
  await expect(menu).not.toBeVisible()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
})

test('the net project renders a controllable three.js net without mobile overflow', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./#/projects/net-tensioner')
  const scene = page.locator('[data-net-scene]')
  await scene.scrollIntoViewIfNeeded()
  await expect(scene).toHaveClass(/is-rendered/)
  const canvas = scene.locator('.pickleball-net__canvas')
  await expect(canvas).toBeVisible()
  await expect.poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.width)).toBeGreaterThan(100)
  await expect(scene.locator('.pickleball-net__fallback')).toBeHidden()
  await expect(scene.locator('figcaption strong')).toHaveText('Pickleball net')
  await expect(scene.locator('a[href*="usapickleball.org"]')).toHaveCount(0)
  await expect(scene).not.toContainText(/regulation|USA Pickleball|tension force/i)
  const dimensions = await expectNetDimensions(page)
  const projectedPaths = () => dimensions.locator('path').evaluateAll(elements => elements.map(element => element.getAttribute('d')))
  const initialPaths = await projectedPaths()
  expect(initialPaths.length).toBeGreaterThan(0)
  await scene.getByRole('button', { name: 'Rotate net left', exact: true }).click()
  await expect.poll(projectedPaths).not.toEqual(initialPaths)
  await scene.getByRole('button', { name: 'Reset view', exact: true }).click()
  await expect.poll(projectedPaths).toEqual(initialPaths)
  for (const name of ['Rotate net left', 'Rotate net right', 'Reset view']) {
    const button = scene.getByRole('button', { name, exact: true })
    await button.focus()
    await page.keyboard.press('Enter')
    await expect(button).toBeFocused()
  }
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await expectNoOverflow(page, `net page overflow at ${width}px`)
    await expect(canvas).toBeVisible()
    await expectNetDimensions(page)
  }
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(accessibility.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(node => node.target) }))).toEqual([])
  expect(errors).toEqual([])
})
