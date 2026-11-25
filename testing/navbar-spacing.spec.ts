import { test, expect } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/navbar-spacing-browser.ts', import.meta.url),
)

test('Element navbar gives plain links native row space and grows without clipping', async ({
  page,
}) => {
  await openFixture(page)
  const nav = page.getByRole('navigation', {
    name: 'Example navigation',
    exact: true,
  })
  const measure = () =>
    nav.evaluate((node) => {
      const css = getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      const link = node.querySelector('a')!.getBoundingClientRect()
      return {
        minimum: parseFloat(css.minBlockSize),
        token: parseFloat(css.getPropertyValue('--el-menu-horizontal-height')),
        height: rect.height,
        above: link.top - rect.top,
        below: rect.bottom - link.bottom,
      }
    })
  const normal = await measure()
  expect(normal.minimum).toBe(normal.token)
  expect(normal.height).toBeGreaterThanOrEqual(normal.token)
  expect(normal.above).toBeGreaterThan(0)
  expect(normal.below).toBeGreaterThan(0)
  await nav.evaluate((node) =>
    (node as HTMLElement).style.setProperty(
      '--el-menu-horizontal-height',
      '84px',
    ),
  )
  expect((await measure()).height).toBeGreaterThanOrEqual(84)
  // Both a narrow multiline brand and larger application content must grow
  // beyond the minimum. No fixed menu height may clip arbitrary slot content.
  await nav.evaluate((node) => {
    const element = node as HTMLElement
    element.style.width = '180px'
    const brand = node.querySelector('.element-navbar-brand')!
    brand.textContent =
      'A longer application identity which wraps over several lines'
    ;(brand as HTMLElement).style.fontSize = '32px'
  })
  const expanded = await measure()
  expect(expanded.height).toBeGreaterThan(84)
  expect(
    await nav.evaluate((node) => node.scrollHeight <= node.clientHeight + 1),
  ).toBe(true)
  // Existing native-menu integration still reaches the navbar's content edge;
  // the minimum must not add a second row's padding around the native menu.
  const main = page.getByRole('navigation', {
    name: 'Main navigation',
    exact: true,
  })
  const menu = main.locator('.element-navigation-menu').first()
  const barBox = (await main.boundingBox())!
  const menuBox = (await menu.boundingBox())!
  expect(
    Math.abs(menuBox.y + menuBox.height - (barBox.y + barBox.height - 1)),
  ).toBeLessThanOrEqual(1)
})
