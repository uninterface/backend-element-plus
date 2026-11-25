import { fileURLToPath } from 'node:url'
import { test, expect, type Locator, type Page } from '@playwright/test'
import { build } from './fixture-build.mjs'
import { waitForPresentation } from '@uninterface/testing/playwright'

let code: string, css: string
test.beforeAll(async () => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/navigation-scroll.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'NavigationScroll',
      },
    },
  })
  const output = (Array.isArray(result) ? result : [result]).flatMap((entry) =>
    'output' in entry ? entry.output : [],
  )
  code = output.find((entry) => entry.type === 'chunk')!.code
  css = output
    .flatMap((entry) =>
      entry.type === 'asset' && entry.fileName.endsWith('.css')
        ? [entry.source]
        : [],
    )
    .join('\n')
})

async function mount(page: Page, mode: string, count = 40, rtl = false) {
  await page.setViewportSize({ width: 1100, height: 700 })
  await page.route('http://navigation-scroll.test/', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><html lang="en" dir="${rtl ? 'rtl' : 'ltr'}"><head><style>${css}</style></head><body style="margin:0"></body></html>`,
    }),
  )
  await page.goto('http://navigation-scroll.test/')
  await page.addScriptTag({ content: code })
  await page.evaluate(
    async ({ mode, count }) => {
      ;(window as any).fixture = await (
        window as any
      ).NavigationScroll.mountNavigationScroll(mode, count)
    },
    { mode, count },
  )
  await page.locator('[data-entry-key="root"] > .el-sub-menu__title').click()
}

const popupFor = (page: Page, parent: string) =>
  page.locator('.element-navigation-popup.el-popper').filter({
    has: page.locator(`[role=menu][data-parent="${parent}"]`),
  })

async function geometry(popup: Locator) {
  return popup.evaluate((element) => {
    const b = element.getBoundingClientRect()
    return {
      top: b.top,
      bottom: b.bottom,
      height: b.height,
      client: element.clientHeight,
      scroll: element.scrollHeight,
      offset: element.scrollTop,
    }
  })
}

async function bounded(page: Page, popup: Locator) {
  await waitForPresentation(popup)
  await expect
    .poll(async () => {
      const b = await geometry(popup)
      return b.top >= -1 && b.bottom <= page.viewportSize()!.height + 1
    })
    .toBe(true)
}

async function belowHeader(page: Page, popup: Locator) {
  await expect(popup).toHaveAttribute('data-popper-placement', /^bottom/)
  const header = await page.locator('header').boundingBox()
  expect((await geometry(popup)).top).toBeGreaterThanOrEqual(
    header!.y + header!.height,
  )
}

async function wheel(page: Page, popup: Locator, delta: number) {
  const b = await popup.boundingBox()
  await page.mouse.move(b!.x + b!.width / 2, b!.y + b!.height / 2)
  await page.mouse.wheel(0, delta)
  // Native wheel scrolling is asynchronous, including at a scroll boundary.
  await page.waitForTimeout(200)
}

for (const mode of ['horizontal', 'vertical-popup', 'icon-popup']) {
  for (const rtl of [false, true]) {
    test(`${mode} ${rtl ? 'RTL' : 'LTR'} popup scrolls, contains its boundaries and keeps nested destinations reachable`, async ({
      page,
    }, info) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(String(error)))
      await mount(page, mode, 40, rtl)
      const root = popupFor(page, 'root')
      await bounded(page, root)
      if (mode === 'horizontal') await belowHeader(page, root)
      const initial = await geometry(root)
      expect(initial.scroll).toBeGreaterThan(initial.client)
      await wheel(page, root, 300)
      await expect
        .poll(async () => (await geometry(root)).offset)
        .toBeGreaterThan(0)
      expect(await page.evaluate(() => window.scrollY)).toBe(0)

      for (const edge of ['end', 'start']) {
        await root.evaluate((el, edge) => {
          el.scrollTop = edge === 'end' ? el.scrollHeight : 0
        }, edge)
        await wheel(page, root, edge === 'end' ? 400 : -400)
        expect(await page.evaluate(() => window.scrollY)).toBe(0)
      }

      const first = root.locator('[data-entry-key="Root-0"]')
      await first.focus()
      await page.keyboard.press('End')
      await expect(root.locator('[data-entry-key="Root-39"]')).toBeFocused()
      const revealed = await page.locator(':focus').evaluate((el) => {
        const b = el.getBoundingClientRect()
        const host = el.closest('.el-popper')!.getBoundingClientRect()
        return b.top >= host.top && b.bottom <= host.bottom
      })
      expect(revealed).toBe(true)
      expect(await page.evaluate(() => window.scrollY)).toBe(0)

      const nestedTrigger = root.locator('[data-entry-key="nested"]')
      await nestedTrigger.locator(':scope > .el-sub-menu__title').click()
      const nested = popupFor(page, 'nested')
      await bounded(page, nested)
      const parentOffset = (await geometry(root)).offset
      await wheel(page, nested, 250)
      expect((await geometry(nested)).offset).toBeGreaterThan(0)
      expect((await geometry(root)).offset).toBe(parentOffset)
      expect(await page.evaluate(() => window.scrollY)).toBe(0)
      const thirdTrigger = nested.locator('[data-entry-key="third"]')
      await thirdTrigger.locator(':scope > .el-sub-menu__title').click()
      const third = popupFor(page, 'third')
      await bounded(page, third)
      const final = third.locator('[data-entry-key="last"]')
      await final.click()
      await expect(page.locator('[data-current]')).toHaveText('last')
      await page.getByRole('button', { name: 'Outside navigation' }).click()
      await expect(root).toHaveCount(0)

      // Reopening and viewport resizing retain usable native popup positioning.
      await page
        .locator('[data-entry-key="root"] > .el-sub-menu__title')
        .click()
      await bounded(page, root)
      await page.setViewportSize({ width: 800, height: 420 })
      await bounded(page, root)
      if (mode === 'horizontal') await belowHeader(page, root)
      const resized = await geometry(root)
      expect(resized.height).toBeLessThan(initial.height)
      await page.keyboard.press('Escape')
      await expect(root).toHaveCount(0)
      await page.getByRole('button', { name: 'Outside navigation' }).click()
      await page.mouse.wheel(0, 300)
      await expect
        .poll(() => page.evaluate(() => window.scrollY))
        .toBeGreaterThan(0)
      expect(errors).toEqual([])
      expect(await page.evaluate(() => (window as any).fixture.errors)).toEqual(
        [],
      )
      await info.attach('scroll-geometry', {
        body: JSON.stringify({ initial, resized }),
        contentType: 'application/json',
      })
    })
  }
}

test('short navigation popup retains content height and dismisses on outside interaction', async ({
  page,
}) => {
  await mount(page, 'horizontal', 3)
  const popup = popupFor(page, 'root')
  await bounded(page, popup)
  const b = await geometry(popup)
  expect(b.height).toBeLessThan(200)
  expect(b.scroll).toBe(b.client)
  await page.getByRole('button', { name: 'Outside navigation' }).click()
  await expect(popup).toHaveCount(0)
})

test('switching to horizontal sizes below the header and retains an upward fallback near the bottom', async ({
  page,
}) => {
  await mount(page, 'vertical-popup')
  await page.getByRole('button', { name: 'Outside navigation' }).click()
  await page.evaluate(() => (window as any).fixture.mode('horizontal'))
  await page.locator('[data-entry-key="root"] > .el-sub-menu__title').click()
  const popup = popupFor(page, 'root')
  await bounded(page, popup)
  await belowHeader(page, popup)
  await page.getByRole('button', { name: 'Outside navigation' }).click()
  await page.evaluate(() => (window as any).fixture.headerTop(350))
  await page.locator('[data-entry-key="root"] > .el-sub-menu__title').click()
  await bounded(page, popup)
  await expect(popup).toHaveAttribute('data-popper-placement', /^top/)
  const header = await page.locator('header').boundingBox()
  expect((await geometry(popup)).bottom).toBeLessThanOrEqual(header!.y)
})

test('touch gestures scroll the navigation popup and stay contained at both ends', async ({
  browser,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Chromium CDP touch-input verification')
  const context = await browser.newContext({ hasTouch: true })
  try {
    const page = await context.newPage()
    await mount(page, 'horizontal')
    const popup = popupFor(page, 'root')
    await bounded(page, popup)
    const client = await context.newCDPSession(page)
    const swipe = async (up: boolean) => {
      const box = await popup.boundingBox()
      const x = box!.x + box!.width / 2
      const y = box!.y + (up ? box!.height - 80 : 80)
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x, y }],
      })
      for (let i = 1; i <= 6; i++) {
        await client.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x, y: y + (up ? -1 : 1) * i * 35 }],
        })
        await page.waitForTimeout(30)
      }
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: [],
      })
      await page.waitForTimeout(300)
    }
    await swipe(true)
    expect((await geometry(popup)).offset).toBeGreaterThan(0)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    for (const end of [true, false]) {
      await popup.evaluate((el, end) => {
        el.scrollTop = end ? el.scrollHeight : 0
      }, end)
      await swipe(end)
      expect(await page.evaluate(() => window.scrollY)).toBe(0)
    }
  } finally {
    await context.close()
  }
})
