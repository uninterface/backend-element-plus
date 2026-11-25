import { test, expect } from '@playwright/test'
import { waitForPresentation } from '@uninterface/testing/playwright'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'
import { attachMenuDiagnostics } from './menu-diagnostics'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/travel-navigation-browser.ts', import.meta.url),
)

test.afterEach(async ({ page }, info) => {
  await attachMenuDiagnostics(page, info)
})

test('Element navigation aligns its header and keeps labelled/icon flyouts operable', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await openFixture(page)
  const header = page.getByRole('navigation', {
    name: 'Travel navbar',
    exact: true,
  })
  const headerMenu = header.locator('.element-navigation-menu')
  const headerBox = await header.boundingBox()
  const menuBox = await headerMenu.boundingBox()
  expect(headerBox).not.toBeNull()
  expect(menuBox).not.toBeNull()
  // The action area is taller than a menu row, so alignment is measurable.
  expect(
    Math.abs(
      menuBox!.y + menuBox!.height - (headerBox!.y + headerBox!.height - 1),
    ),
  ).toBeLessThanOrEqual(1)
  expect(
    await headerMenu.evaluate((el) => getComputedStyle(el).borderBottomWidth),
  ).toBe('0px')

  const preview = page.getByTestId('navigation-preview')
  const content = page.getByTestId('navigation-content')
  const root = preview.locator('[data-entry-key="destinations"]')
  const asia = page.locator('[data-entry-key="asia"]:visible')
  const singapore = page.locator('[data-entry-key="singapore"]:visible')
  let popupGeometry: unknown
  for (const mode of ['horizontal', 'vertical-popup', 'icon-popup']) {
    await openFixture(page, { mode })
    if (mode === 'icon-popup') {
      await expect(preview.locator('.el-menu--collapse')).toBeVisible()
      for (const key of [
        'overview',
        'destinations',
        'experiences',
        'essentials',
      ])
        await expect(
          preview.locator(`[data-entry-key="${key}"] [data-icon]`).first(),
        ).toBeVisible()
      await root.hover()
      await expect(asia).toBeVisible()
    }
    await root.locator(':scope > .el-sub-menu__title').click()
    await expect(asia).toBeVisible()
    if (mode === 'icon-popup') {
      await asia.hover()
      await expect(singapore).toBeVisible()
    }
    await asia.locator(':scope > .el-sub-menu__title').click()
    await expect(singapore).toBeVisible()
    const items = [
      page.locator('[data-entry-key="allDestinations"]:visible'),
      asia,
      singapore,
    ]
    for (const item of items) await waitForPresentation(item)
    const handles = await Promise.all(items.map((item) => item.elementHandle()))
    const rows = await page.evaluate(
      (elements) =>
        elements.map((el) => {
          const row = el!.querySelector(':scope > .el-sub-menu__title') ?? el!
          const style = getComputedStyle(row)
          return {
            height: row.getBoundingClientRect().height,
            lineHeight: style.lineHeight,
            start: style.paddingLeft,
            end: style.paddingRight,
          }
        }),
      handles,
    )
    if (popupGeometry) expect(rows).toEqual(popupGeometry)
    else popupGeometry = rows
    for (const item of [asia, singapore]) {
      const geometry = await item.evaluate((el) => {
        const icon = el.querySelector('[data-icon]')!.getBoundingClientRect()
        const column = el
          .querySelector('.element-entry-icon')!
          .getBoundingClientRect()
        const copy = el
          .querySelector('.element-entry-copy')!
          .getBoundingClientRect()
        const row = (
          el.querySelector(':scope > .el-sub-menu__title') ?? el
        ).getBoundingClientRect()
        return {
          square: Math.abs(icon.width - icon.height),
          contained:
            icon.width > 0 &&
            icon.width <= column.width &&
            icon.height <= row.height,
          separated: copy.left >= column.right,
          fits: copy.right <= row.right,
        }
      })
      expect(geometry.square).toBeLessThanOrEqual(1)
      expect(geometry.contained).toBe(true)
      expect(geometry.separated).toBe(true)
      expect(geometry.fits).toBe(true)
    }
    await singapore.hover()
    await page.waitForTimeout(450)
    await expect(root).toHaveAttribute('aria-expanded', 'true')
    await expect(singapore).toBeVisible()
    await singapore.click()
    await expect(content.getByRole('heading', { level: 3 })).toHaveText(
      'Singapore',
    )
  }
  expect(errors).toEqual([])
})
