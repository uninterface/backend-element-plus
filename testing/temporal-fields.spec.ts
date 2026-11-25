import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'
import { test, expect } from '@playwright/test'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/temporal-browser.ts', import.meta.url),
)

test('standalone temporal fields keep labels above their editors', async ({
  page,
}) => {
  await openFixture(page)
  for (const name of ['Calendar date', 'Time', 'Local date and time']) {
    const editor = page.getByRole('textbox', { name, exact: true })
    const field = page.locator('.el-form-item').filter({ has: editor })
    const label = field.locator('.el-form-item__label')
    await expect(label).toBeVisible()
    const a = await label.boundingBox()
    const b = await editor.boundingBox()
    expect(a).not.toBeNull()
    expect(b).not.toBeNull()
    expect(b!.y).toBeGreaterThanOrEqual(a!.y + a!.height)
  }
})

test('shared temporal frames suppress native field-error and focus borders on endpoints', async ({
  page,
}) => {
  await openFixture(page)
  for (const kind of ['date', 'time', 'datetime']) {
    const range = page.locator(`[data-range=${kind}]`)
    const input = range.locator('input').first()
    await input.fill('unfinished')
    await page.getByLabel('Password', { exact: true }).focus()
    const frame = range.locator('[data-ui-input-frame]')
    await expect(frame).toHaveAttribute('aria-invalid', 'true')
    await expect(range.locator('.el-form-item')).toHaveClass(/is-error/)
    const wrappers = range.locator(
      '.element-control-frame-part > .el-input__wrapper',
    )
    await expect(wrappers).toHaveCount(2)
    for (const wrapper of await wrappers.all()) {
      expect(
        await wrapper.evaluate((el) => getComputedStyle(el).boxShadow),
      ).toBe('none')
      await wrapper.hover()
      expect(
        await wrapper.evaluate((el) => getComputedStyle(el).boxShadow),
      ).toBe('none')
    }
    await input.focus()
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(frame).toHaveAttribute('data-focused', '')
    expect(
      await wrappers.first().evaluate((el) => getComputedStyle(el).boxShadow),
    ).toBe('none')
    expect(
      await frame.evaluate((el) => getComputedStyle(el).boxShadow),
    ).not.toBe('none')
  }
})

test('range modes keep compact infinity endpoints and a stable next-day indicator', async ({
  page,
}) => {
  await openFixture(page)
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: 844 })
    for (const kind of ['date', 'datetime', 'time']) {
      const range = page.locator(`[data-range=${kind}]`)
      const frame = range.locator('[data-ui-input-frame]')
      for (const [mode, count] of [
        ['start', 1],
        ['end', 1],
        ['unrestricted', 2],
        ['bounded', 0],
      ] as const) {
        const trigger = range.locator('[data-temporal-mode]')
        await trigger.click()
        const popupId = await trigger.getAttribute('aria-controls')
        expect(popupId).toBeTruthy()
        const item = page
          .locator(`[id="${popupId}"]`)
          .locator(`[data-temporal-mode-value=${mode}]`)
        await expect(item.locator('[data-temporal-mode-icon]')).toBeVisible()
        await item.click()
        await expect(range.locator('[data-temporal-infinity]')).toHaveCount(
          count,
        )
        await expect(range.locator('[data-temporal-separator]')).toBeVisible()
        const bounds = await frame.boundingBox()
        expect(bounds).not.toBeNull()
        if (width === 1024) {
          const start = await range
            .locator('[data-temporal-side=start]')
            .boundingBox()
          const separator = await range
            .locator('[data-temporal-separator]')
            .boundingBox()
          const end = await range
            .locator('[data-temporal-side=end]')
            .boundingBox()
          const spacer = await range
            .locator('.element-plus-temporal-spacer')
            .boundingBox()
          expect(separator!.x - (start!.x + start!.width)).toBeLessThan(16)
          expect(end!.x - (separator!.x + separator!.width)).toBeLessThan(16)
          expect(spacer!.width).toBeGreaterThan(100)
          expect(spacer!.x).toBeGreaterThanOrEqual(end!.x + end!.width)
        }
        for (const badge of await range
          .locator('[data-temporal-infinity]')
          .all()) {
          const box = await badge.boundingBox()
          expect(box).not.toBeNull()
          expect(box!.width).toBeLessThan(48)
          expect(box!.x).toBeGreaterThanOrEqual(bounds!.x)
          expect(box!.x + box!.width).toBeLessThanOrEqual(
            bounds!.x + bounds!.width,
          )
        }
      }
    }
  }
  const time = page.locator('[data-range=time]')
  const marker = time.locator('[data-temporal-next-day]')
  await expect(marker).toBeVisible()
  await expect(marker.locator('svg')).toBeVisible()
  await marker.hover()
  await expect(
    page.getByRole('tooltip').filter({ hasText: 'Next day' }),
  ).toBeVisible()
  const before = await time.locator('[data-ui-input-frame]').boundingBox()
  await time.locator('input').last().fill('23:00')
  await page.getByLabel('Password', { exact: true }).focus()
  await expect(marker).toBeHidden()
  const after = await time.locator('[data-ui-input-frame]').boundingBox()
  expect(after!.height).toBeCloseTo(before!.height, 1)
})

test('bounded dates use one native range calendar on desktop and mobile', async ({
  page,
}) => {
  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: 844 })
    await openFixture(page)
    const range = page.locator('[data-range=date]')
    await expect(range.locator('[data-temporal-trigger]')).toHaveCount(1)
    await range.locator('input').last().focus()
    await page.keyboard.press('Alt+ArrowDown')
    const popup = page.locator('[data-temporal-range-popup]')
    await expect(popup.locator('.el-date-range-picker')).toBeVisible()
    await expect(popup.locator('.el-date-table')).toHaveCount(
      width === 390 ? 1 : 2,
    )
    const day = (value: string) =>
      popup
        .locator('.el-date-table')
        .first()
        .locator('td.available:not(.prev-month):not(.next-month)')
        .filter({ hasText: new RegExp(`^${value}$`) })
    await day('22').click()
    await expect(range.locator('input').first()).toHaveValue('2026-10-21')
    await day('24').click()
    await expect(popup).toBeHidden()
    await expect(range.locator('input').first()).toHaveValue('2026-10-22')
    await expect(range.locator('input').last()).toHaveValue('2026-10-24')
    await expect(range.locator('[data-temporal-range-trigger]')).toBeFocused()
  }
})
