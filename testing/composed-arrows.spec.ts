import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'
import { test, expect, type Locator } from '@playwright/test'
import { waitForPresentation } from '@uninterface/testing/playwright'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/temporal-browser.ts', import.meta.url),
)

for (const direction of ['ltr', 'rtl']) {
  for (const dark of [false, true]) {
    test(`composed calendar and suggestion arrows ${direction} ${dark ? 'dark' : 'light'}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 600, height: 900 })
      const appearance = async () => {
        await page.evaluate(
          ({ direction, dark }) => {
            document.documentElement.dir = direction
            document.documentElement.classList.toggle('dark', dark)
          },
          { direction, dark },
        )
      }
      const arrow = async (content: Locator) => {
        const popup = content.locator(
          'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " el-popper ")][1]',
        )
        await waitForPresentation(popup)
        await expect(popup.locator(':scope > .el-popper__arrow')).toBeVisible()
        await expect(popup).toHaveAttribute(
          'data-popper-placement',
          /^(top|bottom|left|right)/,
        )
        expect(
          await popup
            .locator(':scope > .el-popper__arrow')
            .evaluate(
              (node) => getComputedStyle(node, '::before').backgroundColor,
            ),
        ).not.toBe('rgba(0, 0, 0, 0)')
      }
      await openFixture(page)
      await appearance()
      const range = page.locator('[data-range=date]')
      const rangeTrigger = range.locator('[data-temporal-range-trigger]')
      await rangeTrigger.click()
      const rangePopup = page.locator('[data-temporal-range-popup]:visible')
      await arrow(rangePopup)
      await rangePopup.press('Escape')
      await expect(rangeTrigger).toBeFocused()

      const scalarTrigger = page.locator('[data-temporal-trigger]').first()
      await scalarTrigger.click()
      const scalarPopup = page.locator('[data-temporal-popup]:visible')
      await arrow(scalarPopup)
      await scalarPopup.press('Escape')
      await expect(scalarTrigger).toBeFocused()

      const input = page.getByRole('combobox', {
        name: 'Suggested name',
        exact: true,
      })
      await input.fill('Al')
      await expect(
        page.getByRole('option', { name: 'Alpine', exact: true }),
      ).toBeVisible()
      await arrow(page.locator('.element-plus-suggestions:visible'))
      await input.press('ArrowDown')
      await input.press('Enter')
      await expect(input).toHaveValue('Alpine')
      await expect(input).toBeFocused()
    })
  }
}
