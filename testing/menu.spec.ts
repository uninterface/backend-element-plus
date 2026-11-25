import { test, expect } from '@playwright/test'
import { waitForPresentation } from '@uninterface/testing/playwright'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/command-menu-browser.ts', import.meta.url),
)

test('Element command menus use compact dropdown density at every depth', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await openFixture(page)
  const examples = page.getByRole('region', { name: 'Menus', exact: true })
  await examples
    .getByRole('button', { name: 'Click to open menu', exact: true })
    .click()

  const root = page.getByRole('menu', {
    name: 'Record commands',
    exact: true,
  })
  await expect(root).toBeVisible()
  await expect(root).toHaveClass(/element-command-menu/)
  const rootSurface = root.locator(
    'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " el-popper ")][1]',
  )
  await expect(rootSurface).toHaveClass(/element-command-popup/)

  const commandRowStyle = (element: HTMLElement) => {
    const style = getComputedStyle(element)
    return {
      height: element.getBoundingClientRect().height,
      lineHeight: style.lineHeight,
      paddingTop: style.paddingTop,
      paddingBottom: style.paddingBottom,
      paddingInlineStart: style.paddingInlineStart,
    }
  }
  const compactRow = {
    height: 32,
    lineHeight: '22px',
    paddingTop: '5px',
    paddingBottom: '5px',
    paddingInlineStart: '16px',
  }
  await expect(
    root.locator('[data-entry-key="name"]'),
    'ordinary command rows use the native dropdown rhythm',
  ).toHaveCSS('min-height', '32px')
  expect(
    await root.locator('[data-entry-key="name"]').evaluate(commandRowStyle),
  ).toEqual(compactRow)

  const more = root.locator('[data-entry-key="more"]')
  const refresh = root.locator('[data-entry-key="refresh"]')
  await expect(refresh).toBeFocused()
  await refresh.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map((animation) => animation.finished),
    )
  })
  const focusedColors = await refresh.evaluate((element) => {
    const style = getComputedStyle(element)
    return { color: style.color, background: style.backgroundColor }
  })
  // Reach the last row by keyboard, where the outer LI's browser outline used
  // to be clipped at the popup edges while its title already had a highlight.
  for (let step = 0; step < 5; step++) await page.keyboard.press('ArrowDown')
  await expect(more).toBeFocused()
  await expect(more).toHaveCSS('outline-style', 'none')
  await expect
    .poll(() =>
      more.locator(':scope > .el-sub-menu__title').evaluate((element) => {
        const style = getComputedStyle(element)
        return { color: style.color, background: style.backgroundColor }
      }),
    )
    .toEqual(focusedColors)
  await page.emulateMedia({ forcedColors: 'active' })
  await expect(more.locator(':scope > .el-sub-menu__title')).toHaveCSS(
    'outline-style',
    'solid',
  )
  await expect(more.locator(':scope > .el-sub-menu__title')).toHaveCSS(
    'outline-offset',
    '-2px',
  )
  await page.emulateMedia({ forcedColors: 'none' })
  await page.keyboard.press('ArrowRight')
  const keyboardBranch = page.getByRole('menu', {
    name: 'More actions',
    exact: true,
  })
  await expect(keyboardBranch).toBeVisible()
  await expect(
    keyboardBranch.locator('[data-entry-key="archive"]'),
  ).toBeVisible()
  await page.keyboard.press('Home')
  await expect(
    keyboardBranch.locator('[data-entry-key="archive"]'),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(more).toBeFocused()
  await expect(keyboardBranch).toBeHidden()
  await more.click()
  const second = page.getByRole('menu', {
    name: 'More actions',
    exact: true,
  })
  await expect(second).toBeVisible()
  await expect(second).toHaveClass(/element-command-menu/)

  const organize = second.locator('[data-entry-key="organize"]')
  await organize.click()
  const third = page.getByRole('menu', { name: 'Organize', exact: true })
  await expect(third).toBeVisible()
  await expect(third).toHaveClass(/element-command-menu/)
  const thirdSurface = third.locator(
    'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " el-popper ")][1]',
  )
  await expect(thirdSurface).toHaveClass(/element-command-popup/)
  await expect
    .poll(() =>
      second.locator('[data-entry-key="archive"]').evaluate(commandRowStyle),
    )
    .toEqual(compactRow)
  await expect
    .poll(() =>
      third.locator('[data-entry-key="addTag"]').evaluate(commandRowStyle),
    )
    .toEqual(compactRow)

  await page.keyboard.press('Escape')
  await expect(organize).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(more).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(root).toBeHidden()
  expect(errors).toEqual([])
})

test('a command submenu stays open after Escape and immediate pointer reopen', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await openFixture(page)
  await page
    .getByRole('button', { name: 'Click to open menu', exact: true })
    .click()
  const root = page.getByRole('menu', { name: 'Record commands', exact: true })
  const more = root.getByRole('menuitem', { name: 'More actions', exact: true })
  await waitForPresentation(root)
  await page.keyboard.press('End')
  await expect(more).toBeFocused()
  await page.keyboard.press('ArrowRight')
  const submenu = page.getByRole('menu', { name: 'More actions', exact: true })
  await waitForPresentation(submenu)
  const archive = submenu.getByRole('menuitem', {
    name: 'Archive',
    exact: true,
  })
  await archive.focus()
  await expect(archive).toBeFocused()

  const button = (await more.boundingBox())!
  await page.keyboard.press('Escape')
  await expect(more).toBeFocused()
  await page.mouse.click(
    button.x + button.width / 2,
    button.y + button.height / 2,
  )
  await expect(more).toHaveAttribute('aria-expanded', 'true')
  await expect(submenu).toBeVisible()

  // Let the former 200 ms delayed hide and 300 ms leave transition elapse.
  await page.waitForTimeout(650)
  await expect(submenu).toBeVisible()
  await submenu.getByRole('menuitem', { name: 'Organize', exact: true }).click()
  const nested = page.getByRole('menu', { name: 'Organize', exact: true })
  await expect(
    nested.getByRole('menuitem', { name: 'Add tag', exact: true }),
  ).toBeVisible()
})
