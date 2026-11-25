import { test, expect } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/table-sorting.ts', import.meta.url),
)

test('Element headers reserve caret space at minimum and content widths', async ({
  page,
}) => {
  await openFixture(page)
  const header = page.getByRole('columnheader').filter({ hasText: 'Amount' })
  await expect(header).toBeVisible()
  await page.waitForFunction(() => !!window.elementSortingFixture)
  await page.evaluate(() => {
    const fixture = window.elementSortingFixture
    fixture.amountLabel.value = 'Amount (USD)'
    fixture.amountWidth.value = 220
  })
  const width = () =>
    header.evaluate((node) => node.getBoundingClientRect().width)
  const preferWidth = (value: number | 'content') =>
    page.evaluate((value) => {
      window.elementSortingFixture.amountWidth.value = value
    }, value)
  await expect.poll(width).toBeCloseTo(220, 0)
  await preferWidth(96)
  await expect.poll(width).toBeLessThan(219)
  const minimum = await width()
  expect(minimum).toBeGreaterThan(96)
  // Lower preferences stop at the same usable header width.
  await preferWidth(64)
  await expect.poll(width).toBeCloseTo(minimum, 0)
  const geometry = () =>
    header.evaluate((node) => {
      const copy = node
        .querySelector('.element-table-header-copy')!
        .getBoundingClientRect()
      const caret = node
        .querySelector('.caret-wrapper')!
        .getBoundingClientRect()
      const cell = node.getBoundingClientRect()
      return {
        centered:
          Math.abs(copy.y + copy.height / 2 - caret.y - caret.height / 2) < 1,
        contained: caret.left >= cell.left && caret.right <= cell.right,
        separate: caret.left >= copy.right - 1 || caret.right <= copy.left + 1,
        caretWidth: caret.width,
        copyHeight: copy.height,
        lineHeight: parseFloat(
          getComputedStyle(node.querySelector('.element-table-header-copy')!)
            .lineHeight,
        ),
      }
    })
  for (const direction of ['ltr', 'rtl']) {
    await page.evaluate((dir) => {
      document.documentElement.dir = dir
    }, direction)
    for (const align of ['left', 'center', 'right'] as const) {
      await page.evaluate((value) => {
        window.elementSortingFixture.amountAlign.value = value
      }, align)
      await expect.poll(geometry).toMatchObject({
        centered: true,
        contained: true,
        separate: true,
        caretWidth: 24,
      })
      const narrow = await geometry()
      expect(narrow.copyHeight).toBeCloseTo(narrow.lineHeight, 0)
    }
  }
  await preferWidth('content')
  for (const state of [null, 'ascending', 'descending']) {
    if (state) {
      await header.locator(`.sort-caret.${state}`).click()
      await expect(header).toHaveAttribute('aria-sort', state)
    }
    await expect.poll(geometry).toMatchObject({
      centered: true,
      contained: true,
      separate: true,
      caretWidth: 24,
    })
    await expect
      .poll(async () => {
        const result = await geometry()
        return Math.abs(result.copyHeight - result.lineHeight)
      })
      .toBeLessThan(1)
  }
})
