import { expect, test, type Page } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import {
  createUiTest,
  expectContainedFocusPaint,
} from '@uninterface/testing/playwright'
import { build } from './fixture-build.mjs'
import { uiTestAdapter } from './index'
import { attachMenuDiagnostics } from './menu-diagnostics'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/native-conformance.ts', import.meta.url),
)
const uiTest = (page: Page) => createUiTest(page, uiTestAdapter)

test('Element Plus paints inset focus on selected and unselected segments', async ({
  page,
}) => {
  await openFixture(page, { scenario: 'segmented-focus' })
  const group = uiTest(page).radioGroup({ name: 'Choices' })
  await expect(group.option('one')).toBeChecked()
  await page.keyboard.press('Tab')
  for (const key of ['one', 'two', 'three']) {
    const option = group.option(key)
    // Programmatic focus exercises unselected paint without changing the selection.
    await option.focus()
    await expect(option).toBeFocused()
    const selected = await option.isChecked()
    await expectContainedFocusPaint({
      target: selected
        ? option.locator(
            'xpath=ancestor::label[1]/../div[contains(concat(" ", normalize-space(@class), " "), " el-segmented__item-selected ")]',
          )
        : option.locator('xpath=ancestor::label[1]'),
      kind: 'outline',
      pseudo: selected ? '::before' : undefined,
      inset: true,
    })
  }
})

test('Element Plus required editors reference label text and retain native required state', async ({
  page,
}) => {
  await openFixture(page, { scenario: 'fields' })
  for (const name of ['Name', 'Category']) {
    const editor = page.getByRole(
      name === 'Category' ? 'combobox' : 'textbox',
      { name, exact: true },
    )
    await expect(editor).toHaveAttribute('aria-required', 'true')
    const field = page.locator('.el-form-item').filter({ has: editor })
    await expect(field).toHaveClass(/\bis-required\b/)
    const id = await editor.getAttribute('aria-labelledby')
    expect(id).toBeTruthy()
    await expect(field.locator(`label [id=${JSON.stringify(id)}]`)).toHaveText(
      name,
    )
    await expect(editor).toHaveAccessibleName(name)
  }
  const reference = page.getByRole('textbox', {
    name: 'Reference',
    exact: true,
  })
  await expect(
    page.locator('.el-form-item').filter({ has: reference }),
  ).not.toHaveClass(/\bis-required\b/)
})

test.describe('Element Plus native menubar', () => {
  test.afterEach(async ({ page }, info) => {
    await attachMenuDiagnostics(page, info)
  })
  test('renders a pending branch in its native menu with toolkit feedback', async ({
    page,
  }) => {
    await openFixture(page, { scenario: 'pending-navigation' })
    const navigation = page.getByRole('menubar', {
      name: 'Sections',
      exact: true,
    })
    await expect(navigation).toContainClass('el-menu--horizontal')
    const reports = navigation.getByRole('menuitem', {
      name: 'Reports',
      exact: true,
    })
    const title = reports.locator(':scope > .el-sub-menu__title')
    await expect(title).toHaveJSProperty('tagName', 'DIV')
    await title.click()
    const submenu = page.getByRole('menu', { name: 'Reports', exact: true })
    await expect(submenu).toHaveAttribute('aria-busy', 'true')
    const status = submenu.getByRole('status')
    await expect(status).toContainClass('el-select-dropdown__empty')
    await expect(status).toHaveText('Loading')
  })
})
