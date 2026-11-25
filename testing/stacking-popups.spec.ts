import { expect, test } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { createUiTest } from '@uninterface/testing/playwright'
import { build } from './fixture-build.mjs'
import { uiTestAdapter } from './index'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/stacking-flyouts.ts', import.meta.url),
)

for (const { surface, rtl } of [
  { surface: 'popover', rtl: false },
  { surface: 'popover', rtl: true },
  { surface: 'modal', rtl: false },
  { surface: 'drawer', rtl: false },
] as const) {
  test(`Element Plus registers the native flyouts inside a ${surface} (${rtl ? 'RTL' : 'LTR'})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1000, height: 650 })
    await openFixture(page, { surface, dir: rtl ? 'rtl' : 'ltr' })
    if (surface !== 'drawer')
      await page.getByRole('button', { name: 'Open panel' }).click()

    const ui = createUiTest(page, uiTestAdapter)
    await ui.navigationEntry({ name: 'Destinations', kind: 'submenu' }).click()
    await ui
      .navigationEntry({ name: 'First destination', kind: 'destination' })
      .click({ trial: true })
    await ui
      .navigationEntry({ name: 'More destinations', kind: 'submenu' })
      .click()
    const last = ui.navigationEntry({
      name: 'Last destination',
      kind: 'destination',
    })

    const dialog = page.getByRole('dialog', { name: 'Test panel', exact: true })
    const popups = dialog.locator('.el-popper.element-navigation-popup')
    const parent = popups.filter({ has: page.locator('[data-parent=root]') })
    const child = popups.filter({ has: page.locator('[data-parent=nested]') })
    const inspect = (element: Element) => window.inspectElementFlyout(element)
    const parentOrder = await parent.evaluate(inspect)
    const childOrder = await child.evaluate(inspect)
    expect(parentOrder.exact).toBe(true)
    expect(childOrder.exact).toBe(true)
    expect(childOrder.rank).toBeGreaterThan(parentOrder.rank!)
    await last.click()
    await expect(child).toHaveCount(0)
    expect(await page.evaluate(() => window.elementFlyoutErrors)).toEqual([])
  })
}
