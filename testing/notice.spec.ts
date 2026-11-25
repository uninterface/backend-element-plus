import { test, expect } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/notice-actions-browser.ts', import.meta.url),
)

test('notice text actions have no horizontal inset and use link hover feedback', async ({
  page,
}) => {
  await openFixture(page)
  await page.waitForFunction(() => Boolean(window.elementNoticeActions))
  const notice = page.locator('#notice-action-alignment')
  const retry = notice.getByRole('button', { name: 'Retry', exact: true })
  for (const size of [-2, -1, 0, 1, 2]) {
    await page.evaluate(
      (size) => window.elementNoticeActions.update({ size }),
      size,
    )
    await expect
      .poll(() =>
        retry.evaluate((button) => {
          const style = getComputedStyle(button)
          const row = button.closest('.element-notice-actions')!
          return [
            style.paddingInlineStart,
            style.paddingInlineEnd,
            style.borderInlineStartWidth,
            style.borderInlineEndWidth,
            getComputedStyle(row).marginInlineStart,
          ]
        }),
      )
      .toEqual(['0px', '0px', '0px', '0px', '0px'])
    await retry.hover()
    await expect(retry).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await retry.focus()
    await expect(retry).toBeFocused()
  }
  await retry.press('Enter')
  await expect
    .poll(() => page.evaluate(() => window.elementNoticeActions.state.clicks))
    .toBe(1)
  await expect
    .poll(() =>
      page
        .getByRole('button', { name: 'Text reference', exact: true })
        .evaluate((button) =>
          parseFloat(getComputedStyle(button).paddingInlineStart),
        ),
    )
    .toBeGreaterThan(0)
  await page.evaluate(() =>
    window.elementNoticeActions.update({ variant: 'outline' }),
  )
  await expect
    .poll(() =>
      retry.evaluate((button) =>
        parseFloat(getComputedStyle(button).paddingInlineStart),
      ),
    )
    .toBeGreaterThan(0)
  await page.evaluate(() =>
    window.elementNoticeActions.update({ variant: undefined, loading: true }),
  )
  await expect(retry).toBeDisabled()
  await page.evaluate(() =>
    window.elementNoticeActions.update({ loading: false, disabled: true }),
  )
  await expect(retry).toBeDisabled()
})

test('notice action targets stay clear of the leading icon', async ({
  page,
}) => {
  await openFixture(page)
  await page.waitForFunction(() => Boolean(window.elementNoticeActions))
  const notice = page.locator('#notice-action-alignment')
  await page.evaluate(() =>
    window.elementNoticeActions.update({ title: '', bodyAction: false }),
  )
  for (const width of [240, 360, 1000]) {
    await page.setViewportSize({ width, height: 900 })
    for (const direction of ['ltr', 'rtl']) {
      await page.locator('html').evaluate((element, dir) => {
        element.setAttribute('dir', dir)
      }, direction)
      for (const size of [-2, -1, 0, 1, 2]) {
        await page.evaluate(
          (size) => window.elementNoticeActions.update({ size }),
          size,
        )
        await expect
          .poll(() =>
            notice.evaluate((element) => {
              const icon = element
                .querySelector('.element-notice-icon')!
                .getBoundingClientRect()
              const actions = Array.from(
                element.querySelectorAll('.element-notice-actions button'),
              )
              return (
                actions.length > 0 &&
                actions.every((button) => {
                  const target = button.getBoundingClientRect()
                  return (
                    target.top >= icon.bottom ||
                    target.bottom <= icon.top ||
                    target.left >= icon.right ||
                    target.right <= icon.left
                  )
                })
              )
            }),
          )
          .toBe(true)
      }
    }
  }
})

test('notice icon follows height and centers against the full notice', async ({
  page,
}) => {
  await openFixture(page)
  await page.waitForFunction(() => Boolean(window.elementNoticeActions))
  await page.evaluate(async () => {
    await window.elementNoticeActions.update({
      title: '',
      bodyAction: false,
      showActions: false,
    })
  })
  const notice = page.locator('#notice-action-alignment')
  const icon = notice.locator('.element-notice-icon')
  const alignment = () =>
    notice.evaluate((element) => {
      const icon = element
        .querySelector('.element-notice-icon')!
        .getBoundingClientRect()
      const bounds = element.getBoundingClientRect()
      return Math.abs(
        icon.top + icon.height / 2 - bounds.top - bounds.height / 2,
      )
    })
  for (const direction of ['ltr', 'rtl']) {
    await page
      .locator('html')
      .evaluate((element, dir) => element.setAttribute('dir', dir), direction)
    await page.setViewportSize({ width: 1000, height: 900 })
    await page.evaluate(() =>
      window.elementNoticeActions.update({
        showActions: false,
        body: 'Message content',
      }),
    )
    await expect
      .poll(() =>
        icon.evaluate((element) => element.getBoundingClientRect().width),
      )
      .toBe(16)
    await expect.poll(alignment).toBeLessThan(1)
    await page.evaluate(() =>
      window.elementNoticeActions.update({ showActions: true }),
    )
    await expect
      .poll(() =>
        icon.evaluate((element) => element.getBoundingClientRect().width),
      )
      .toBe(28)
    await expect.poll(alignment).toBeLessThan(1)
    await page.evaluate(() =>
      window.elementNoticeActions.update({
        showActions: false,
        body: 'This longer message wraps across several lines when the notice becomes narrow.',
      }),
    )
    await page.setViewportSize({ width: 240, height: 900 })
    await expect
      .poll(() =>
        icon.evaluate((element) => element.getBoundingClientRect().width),
      )
      .toBe(28)
    await expect.poll(alignment).toBeLessThan(1)
    await page.setViewportSize({ width: 1000, height: 900 })
    await expect
      .poll(() =>
        icon.evaluate((element) => element.getBoundingClientRect().width),
      )
      .toBe(16)
    await expect.poll(alignment).toBeLessThan(1)
  }
})
