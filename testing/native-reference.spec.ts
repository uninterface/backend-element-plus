import { test, expect } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { testReferenceFixture } from '@uninterface/testing/fixtures/reference-playwright'
import {
  createUiTest,
  waitForPresentation,
} from '@uninterface/testing/playwright'
import { build } from './fixture-build.mjs'
import { uiTestAdapter } from './index'
import { browserControlParts } from './browser-control-parts'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/native-reference.ts', import.meta.url),
)

testReferenceFixture(openFixture, uiTestAdapter, {
  collapsibleTrigger: browserControlParts.collapsibleTrigger,
  nativeModal: true,
})

test('Element native status surfaces and navigation share the document baseline', async ({
  page,
}, testInfo) => {
  await openFixture(page)
  const adapter = page.getByRole('region', { name: 'Uninterface adapter' })
  const documentFont = await page
    .locator('body')
    .evaluate((body) => getComputedStyle(body).fontFamily)
  // The comparison loads the backend stylesheet with its system-font baseline.
  expect(documentFont).toBe('system-ui, sans-serif')
  const ui = createUiTest(page, uiTestAdapter)
  const picker = ui.within(adapter).select({ name: 'Location' })
  const source = page.getByRole('combobox', {
    name: 'Source state',
    exact: true,
  })
  for (const [state, message] of [
    ['loading', 'Loading'],
    ['error', 'Entries could not be loaded.'],
    ['empty', 'No entries available.'],
  ]) {
    await source.selectOption(state)
    await picker.open()
    const popup = await picker.popupSurface()
    await expect(popup).toContainText(message)
    await expect(popup.getByRole('option')).toHaveCount(0)
    expect(
      await popup.evaluate((node) => getComputedStyle(node).fontFamily),
    ).toBe(documentFont)
    await testInfo.attach(`select-${state}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    })
    await page.keyboard.press('Escape')
    await expect(popup).toBeHidden()
  }
  const navigation = adapter.getByRole('menubar', {
    name: 'Reference destinations',
  })
  const examples = navigation.getByRole('menuitem', {
    name: 'Examples',
    exact: true,
  })
  await expect(examples.locator('.el-sub-menu__icon-arrow')).toBeVisible()
  async function expectCaretAtEnd(trigger: typeof examples) {
    const caret = trigger.locator('.el-sub-menu__icon-arrow')
    const titleBox = await trigger.boundingBox()
    const caretBox = await caret.boundingBox()
    const textBox = await trigger.locator('.element-entry-copy').boundingBox()
    expect(caretBox!.width).toBeGreaterThan(0)
    expect(caretBox!.width).toBeLessThanOrEqual(caretBox!.height + 1)
    expect(caretBox!.x).toBeGreaterThanOrEqual(textBox!.x + textBox!.width - 1)
    expect(caretBox!.x + caretBox!.width).toBeLessThan(
      titleBox!.x + titleBox!.width,
    )
    expect(
      Math.abs(
        caretBox!.y +
          caretBox!.height / 2 -
          (titleBox!.y + titleBox!.height / 2),
      ),
    ).toBeLessThanOrEqual(2)
  }
  await expectCaretAtEnd(examples)
  await examples.click()
  const children = page.getByRole('menu', { name: 'Examples', exact: true })
  await expect(children).toBeVisible()
  const surface = children.locator(
    'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " el-popper ")][1]',
  )
  await expect(surface).not.toHaveClass(/el-popover/)
  const shadows = await children.evaluate((menu) => {
    const result: string[] = []
    for (let node: Element | null = menu; node; node = node.parentElement) {
      const shadow = getComputedStyle(node).boxShadow
      if (shadow && shadow !== 'none') result.push(shadow)
      if (node.classList.contains('el-popper')) break
    }
    return result
  })
  expect(shadows).toHaveLength(1)
  expect(
    await children.evaluate((node) => getComputedStyle(node).fontFamily),
  ).toBe(documentFont)
  await expect(
    children.getByRole('link', { name: 'Buttons', exact: true }),
  ).toHaveAttribute('href', '#buttons')
  const more = children.getByRole('menuitem', { name: 'More', exact: true })
  await expectCaretAtEnd(more)
  await more.click()
  await expect(
    page.getByRole('link', { name: 'Forms', exact: true }),
  ).toBeVisible()
  await testInfo.attach('nested-navigation', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  })
  const destination = ui.navigationEntry({
    name: 'Forms',
    kind: 'destination',
  })
  await destination.focus()
  await expect(destination).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(
    children.getByRole('menuitem', { name: 'More', exact: true }),
  ).toBeFocused()
})

test('Element command menus match native dropdown row density', async ({
  page,
}) => {
  await openFixture(page)
  const rowStyle = (element: HTMLElement) => {
    const style = getComputedStyle(element)
    return {
      height: element.getBoundingClientRect().height,
      lineHeight: style.lineHeight,
      paddingTop: style.paddingTop,
      paddingBottom: style.paddingBottom,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
      fontSize: style.fontSize,
      color: style.color,
      background: style.backgroundColor,
      opacity: style.opacity,
    }
  }
  const frameStyle = (element: HTMLElement) => {
    const style = getComputedStyle(element)
    return {
      border: style.border,
      radius: style.borderRadius,
      shadow: style.boxShadow,
      background: style.backgroundColor,
    }
  }
  const native = page.locator('[data-native-dropdown]')
  const nativeTrigger = native.getByRole('button', { name: 'Commands' })
  await nativeTrigger.click()
  const nativeMenu = page.locator('.el-dropdown-menu:visible')
  const nativeSurface = page.locator('.el-dropdown__popper:visible')
  const original = nativeMenu.getByRole('menuitem', {
    name: 'Refresh',
    exact: true,
  })
  await expect(original).toBeVisible()
  await waitForPresentation(nativeSurface)
  await original.focus()
  await expect(original).toBeFocused()
  await expect.poll(async () => (await original.boundingBox())!.height).toBe(32)
  const nativeRow = await original.evaluate(rowStyle)
  const nativeDisabled = await nativeMenu
    .getByRole('menuitem', { name: 'Delete' })
    .evaluate(rowStyle)
  const nativeFrame = await nativeSurface.evaluate(frameStyle)
  await nativeTrigger.click()
  await expect(nativeSurface).toBeHidden()

  const adapter = page.getByRole('region', { name: 'Uninterface adapter' })
  await adapter.getByRole('button', { name: 'Commands', exact: true }).click()
  const commandMenu = page.getByRole('menu', { name: 'Commands', exact: true })
  await expect(commandMenu).toHaveClass(/element-command-menu/)
  const commandSurface = commandMenu.locator(
    'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " el-popper ")][1]',
  )
  await expect(commandSurface).toHaveClass(/element-command-popup/)
  const adapted = commandMenu.locator('[data-entry-key="refresh"]')
  await expect(adapted).toBeFocused()
  await expect.poll(() => adapted.evaluate(rowStyle)).toEqual(nativeRow)
  expect(
    await commandMenu.locator('[data-entry-key="delete"]').evaluate(rowStyle),
  ).toEqual(nativeDisabled)
  expect(await commandSurface.evaluate(frameStyle)).toEqual(nativeFrame)
  await expect(commandMenu).toHaveCSS('box-shadow', 'none')
  await expect(commandMenu).toHaveCSS('border-width', '0px')
})
