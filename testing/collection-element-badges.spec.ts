import { test, expect } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/collection-badges-browser.ts', import.meta.url),
)

for (const direction of ['ltr', 'rtl']) {
  test(`Criterion badges preserve native heights and wrap (${direction})`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 680, height: 800 })
    await openFixture(page)
    await page.evaluate((dir) => {
      document.documentElement.dir = dir
    }, direction)
    for (const size of ['small', 'default', 'large']) {
      const row = page.locator(`[data-size="${size}"]`)
      const native = row.locator('[data-native]')
      await expect(native).toBeVisible()
      const nativeHeight = (await native.boundingBox())!.height
      for (const selector of [
        '[data-sort]',
        '[data-filter]',
        '[data-disabled]',
      ]) {
        const badge = row.locator(selector)
        expect((await badge.boundingBox())!.height).toBe(nativeHeight)
        expect(
          await badge.evaluate((el) => {
            const root = el.getBoundingClientRect()
            return [
              ...el.querySelectorAll(
                '.element-query-badge-content, .el-tag__close',
              ),
            ].every((child) => {
              const box = child.getBoundingClientRect()
              return box.top > root.top && box.bottom < root.bottom
            })
          }),
        ).toBe(true)
      }
      const long = row.locator('[data-long]')
      expect((await long.boundingBox())!.height).toBeGreaterThan(nativeHeight)
      expect(
        await long.evaluate((el) => el.scrollHeight - el.clientHeight),
      ).toBeLessThanOrEqual(1)
      await expect(
        row.getByRole('button', {
          name: 'Remove disabled filter',
          exact: true,
        }),
      ).toBeDisabled()
      await row
        .getByRole('button', { name: 'Remove filter', exact: true })
        .click()
    }
    await expect(page.locator('[data-removals]')).toHaveText('3')
    await page.screenshot({
      path: info.outputPath('native-and-criterion-badges.png'),
    })
  })
}
