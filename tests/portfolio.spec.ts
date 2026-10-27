import { test, expect, chromium } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile } from 'node:fs/promises'

const projects = [
  { title: 'PiLight', path: '#/projects/pilight' },
  { title: 'PID Line-Following Car', path: '#/projects/line-follower' },
]
const boardParts = ['projects', 'experience', 'transcript', 'about', 'pickleball', 'resume']
const roleTitles = ['Student Teacher', 'Student Trainee (SSEP)', 'IT Specialist']
const pickleballProjects = ['Picklebot reservation bot', 'Reservation-sharing website', '3D-printed net base extension']
const supersededClaims = /\b(?:Underwater ROV|Raspberry Pi|Arduino Uno|UNO|Minim|Java)\b/i
const homeHeading = /Curiosity,\s*wired\s*into\s*practice\./

async function expectLoadedMedia(page: Page, expectedKinds: string[]) {
  const slots = page.locator('[data-photo-slot]')
  await expect(slots).toHaveCount(expectedKinds.length)
  const actualKinds = await slots.evaluateAll(elements => elements.map(element => element.getAttribute('data-placeholder-illustration') ?? element.getAttribute('data-photo-subject')).sort())
  expect(actualKinds).toEqual([...expectedKinds].sort())
  const descriptions: Record<string, RegExp> = {
    pilight: /ESP32|LED|audio|sound|frequency|PiLight/i,
    'line-follower': /line.follow|car|robot|sensor/i,
    'dart-robot': /dart|launcher/i,
    teaching: /teaching|robotics|students?|classroom/i,
    navy: /Navy|hardware|analysis|data/i,
    admissions: /workstations?|computer|\bIT\b|admissions/i,
    pickleball: /pickleball|paddles?|court/i,
    sunflower: /USS Sunflower|workshop|pool|camera/i,
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
      await expect(image).toHaveCSS('object-fit', 'contain')
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

async function expectProjectSubmenu(page: Page, title: string) {
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: title, exact: true })).toBeVisible()
  await expect(dialog).toContainText('ESP32')
  await expect(dialog).not.toContainText(supersededClaims)
  if (title === 'PiLight') {
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
  for (const project of projects) {
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

test('deep project URLs survive reload and the car links to its dart-robot backstory and back', async ({ page }) => {
  for (const project of projects) {
    await page.goto(`./${project.path}`)
    await expectProjectFacts(page, project.title)
    await page.reload()
    await expectProjectFacts(page, project.title)
    await page.getByRole('button', { name: 'Project menu', exact: true }).click()
    await expectProjectSubmenu(page, project.title)
    await closeBoardStory(page)
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
      const titles = part === 'projects' ? [...projects.map(project => project.title), 'Dart-launching robot', 'USS Sunflower'] : part === 'experience' ? roleTitles : pickleballProjects
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
    await expect(dialog.locator('[data-menu-item]').last()).toHaveText(/USS Sunflower/)
    await choice.click()
    await expect(dialog.getByRole('heading', { name: 'USS Sunflower', exact: true })).toBeVisible()
    await expect(dialog).toContainText(/underwater robotics/i)
    await expect(dialog.locator('[data-photo-subject="sunflower"]')).toHaveCount(1)
    await expect(dialog.locator('[data-photo="sunflower-workbench"] img')).toHaveAccessibleName(/USS Sunflower lying on a workshop table/i)
    await expect(dialog).not.toContainText(/project photos to come|photography to follow/i)
    await expect(dialog.locator('[data-project-link-slot="Full design snapshot"]')).toContainText('Coming soon')
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
  await expect(page.getByRole('main').locator('[data-metric-pending]')).toHaveCount(2)
  await expect(page.getByRole('main').locator('[data-project-link-slot="Full design snapshot"]')).toContainText('Coming soon')
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

test('every project offers link spaces and pending metrics make no numerical claims', async ({ page }) => {
  for (const id of ['pilight', 'line-follower', 'dart-robot', 'sunflower']) {
    await page.goto(`./#/projects/${id}`)
    await expect(page.getByRole('main').getByRole('list', { name: 'Project links' })).toBeVisible()
    const metrics = page.getByRole('main').locator('.project-metrics dd')
    for (const metric of await metrics.all()) await expect(metric).toHaveText('—Measurement to come')
  }
  await page.goto('./')
  await page.locator('[data-board-part="pickleball"]').click()
  for (const title of pickleballProjects) {
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button').filter({ hasText: title }).first().click()
    await expect(dialog.getByRole('list', { name: 'Project links' })).toBeVisible()
    if (title === 'Reservation-sharing website') {
      await expect(dialog.getByRole('link', { name: /View project repository/ })).toHaveAttribute('href', 'https://github.com/JaredAnimal/UCLAPickleball')
    }
    await dialog.getByRole('button', { name: 'Back to pickleball', exact: true }).click()
  }
})

test('home and each clickable job preserve current education, clearance, activities, and work history', async ({ page }) => {
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
  for (const title of roleTitles) {
    const role = page.locator('#experience .experience-row').filter({ hasText: title })
    const trigger = role.getByRole('button', { name: `Explore ${title}`, exact: true }).first()
    await trigger.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: title, exact: true })).toBeVisible()
    for (const fact of facts[title]) await expect(dialog).toContainText(fact)
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
    await role.getByRole('heading', { level: 3 }).getByRole('button').click()
    await expect(dialog.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await dialog.getByRole('button', { name: /Back to experience/i }).click()
    for (const roleTitle of roleTitles) await expect(dialog.getByRole('button').filter({ hasText: roleTitle }).first()).toBeVisible()
    await closeBoardStory(page)
  }
})

test('the three pickleball projects exist only inside the opened menu and support nested navigation', async ({ page }) => {
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

test('project, experience, and pickleball spaces render their accessible photos and concept illustrations', async ({ page }) => {
  await page.goto('./')
  await expectLoadedMedia(page, ['pilight', 'line-follower', 'teaching', 'navy', 'admissions', 'pickleball', 'pickleball', 'pickleball'])
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
    await expectLoadedMedia(page, [kind, kind, kind])
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

test('home, project pages, nested menus, and the transcript pass automated WCAG 2 A/AA checks', async ({ page }) => {
  test.setTimeout(60_000)
  for (const route of ['', '#/projects/pilight', '#/projects/line-follower', '#/projects/dart-robot', '#/projects/sunflower']) {
    await page.goto(`./${route}`)
    await page.evaluate(() => document.fonts.ready)
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    expect.soft(result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(node => ({ target: node.target, message: node.any[0]?.message })) })), `accessibility at ${route || 'home'}`).toEqual([])
  }
  await page.goto('./')
  for (const [part, child] of [['projects', 'PiLight'], ['experience', 'Student Teacher'], ['pickleball', 'Picklebot reservation bot'], ['transcript', '']]) {
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
  await page.getByRole('button', { name: 'Explore PiLight', exact: true }).first().click()
  await expectProjectSubmenu(page, 'PiLight')
  await page.getByRole('dialog').getByRole('link', { name: 'Read full project story', exact: true }).click()
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
    await page.getByRole('button', { name: 'Explore PID Line-Following Car', exact: true }).first().click()
    await expectProjectSubmenu(page, 'PID Line-Following Car')
    await page.getByRole('dialog').getByRole('link', { name: 'Read full project story', exact: true }).click()
    await expectProjectFacts(page, 'PID Line-Following Car')
  } finally { await browser.close() }
})
