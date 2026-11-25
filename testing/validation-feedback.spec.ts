import { test, expect, type Locator, type Page } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { waitForPresentation } from '@uninterface/testing/playwright'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./validation-feedback-fixture.ts', import.meta.url),
)

async function geometry(fields: Locator) {
  return fields.evaluateAll((elements) =>
    elements.map((field) => {
      const bounds = field.getBoundingClientRect()
      const error = field.querySelector('.el-form-item__error')
      const errorBounds = error?.getBoundingClientRect()
      const next =
        field
          .closest('.element-layout-item')
          ?.nextElementSibling?.querySelector('.element-field') ??
        field.nextElementSibling
      const nextBounds = next?.getBoundingClientRect()
      return {
        height: bounds.height,
        offset: nextBounds ? nextBounds.top - bounds.top : null,
        errorHeight: errorBounds?.height ?? 0,
        contained: !errorBounds || errorBounds.bottom <= bounds.bottom + 0.5,
        clear:
          !errorBounds ||
          !nextBounds ||
          errorBounds.bottom <= nextBounds.top + 0.5,
      }
    }),
  )
}

async function ready(page: Page) {
  await openFixture(page)
  await page.waitForFunction(() => Boolean(window.validationFeedback))
}

async function settledErrors(page: Page) {
  const errors = page.locator('[data-arrangement] .el-form-item__error')
  await expect(errors).toHaveCount(6)
  for (const error of await errors.all()) await waitForPresentation(error)
}

test('compact fields allocate only displayed errors across native sizes and responsive labels', async ({
  page,
}) => {
  test.setTimeout(120_000)
  await ready(page)
  const fields = page.locator('[data-arrangement] .element-field')
  const input = page
    .locator('[data-arrangement=layout]')
    .getByRole('textbox', { name: 'Name', exact: true })
  const original = await input.elementHandle()
  const long =
    'Choose at least one item. This validation message wraps across multiple lines and must remain clear of the next field and its label.'
  const localized =
    '請選擇至少一個項目。這段驗證訊息需要換行顯示，而且必須完整可讀，不可與下一個欄位或標籤重疊。'
  for (const width of [390, 1100]) {
    await page.setViewportSize({ width, height: 900 })
    for (const labels of ['above', 'beside'] as const) {
      for (const size of [-1, 0, 1] as const) {
        for (const inline of [false, true]) {
          await page.evaluate(
            (value) => window.validationFeedback.configure(value),
            {
              labels,
              size,
              inline,
              message: inline ? localized : long,
            },
          )
          const before = await geometry(fields)
          await input.focus()
          await page.evaluate(() => window.validationFeedback.validate())
          await settledErrors(page)
          const shown = await geometry(fields)
          expect(shown.every((field) => field.contained && field.clear)).toBe(
            true,
          )
          expect(
            shown.some((field, index) => field.height > before[index].height),
          ).toBe(true)
          expect(
            await input.evaluate(
              (node, previous) => node === previous,
              original,
            ),
          ).toBe(true)
          await expect(input).toBeFocused()
          await expect(input).toHaveAccessibleDescription(
            inline ? /請選擇至少一個項目/ : /Choose at least one item/,
          )
          const configured = page.locator(
            '[data-arrangement=native-context] .el-form-item__error',
          )
          for (const error of await configured.all()) {
            expect(
              await error.evaluate((node) =>
                node.classList.contains('el-form-item__error--inline'),
              ),
            ).toBe(inline)
          }
          await page.evaluate(() => window.validationFeedback.reset())
          await expect(page.locator('.el-form-item__error')).toHaveCount(0)
          expect(await geometry(fields)).toEqual(before)
        }
      }
    }
  }
})

test('native error transitions remain contained and hidden feedback releases its space', async ({
  page,
}) => {
  await ready(page)
  const fields = page.locator('[data-arrangement] .element-field')
  const input = page
    .locator('[data-arrangement=layout]')
    .getByRole('textbox', { name: 'Name', exact: true })
  const before = await geometry(fields)
  // Sample painted frames during real native enter/leave transitions as well as
  // their settled state; no animation-disabling stylesheet is installed.
  await page.evaluate(() => {
    const samples: {
      contained: boolean
      fieldHeight: number
      errorHeight: number
      offset: number
      classes: string
      transform: string
      position: string
    }[] = []
    Object.assign(window, { feedbackSamples: samples, sampleFeedback: true })
    const sample = () => {
      for (const error of document.querySelectorAll(
        '[data-arrangement] .el-form-item__error',
      )) {
        // When the error prop clears before native debounce settles, FormItem
        // briefly renders its empty fallback slot. It has no displayed message.
        if (!error.textContent?.trim()) continue
        const field = error.closest('.element-field')!
        const bounds = field.getBoundingClientRect(),
          errorBounds = error.getBoundingClientRect(),
          style = getComputedStyle(error)
        samples.push({
          contained: errorBounds.bottom <= bounds.bottom + 0.5,
          fieldHeight: bounds.height,
          errorHeight: errorBounds.height,
          offset: errorBounds.bottom - bounds.bottom,
          classes: error.className,
          transform: style.transform,
          position: style.position,
        })
      }
      if ((window as unknown as { sampleFeedback: boolean }).sampleFeedback)
        requestAnimationFrame(sample)
    }
    requestAnimationFrame(sample)
  })
  await page.evaluate(() => window.validationFeedback.validate())
  await settledErrors(page)
  await expect(input).toHaveAccessibleDescription(/Enter a value/)
  await page.evaluate(() => window.validationFeedback.reset())
  await expect(page.locator('.el-form-item__error')).toHaveCount(0)
  expect(await geometry(fields)).toEqual(before)
  const samples = await page.evaluate(() => {
    const state = window as unknown as {
      sampleFeedback: boolean
      feedbackSamples: { contained: boolean }[]
    }
    state.sampleFeedback = false
    return state.feedbackSamples
  })
  expect(samples.length).toBeGreaterThan(5)
  expect(samples.filter((sample) => !sample.contained)).toEqual([])
  for (const failure of ['none', 'show-tooltip'] as const) {
    await page.evaluate(async (failure) => {
      await window.validationFeedback.configure({ failure })
      await window.validationFeedback.validate()
    }, failure)
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(page.locator('.el-form-item__error')).toHaveCount(0)
    expect(await geometry(fields)).toEqual(before)
    if (failure === 'show-tooltip')
      await expect(input).toHaveAccessibleDescription(/Enter a value/)
  }
  await page.evaluate(() =>
    window.validationFeedback.configure({
      failure: 'show-below',
      help: 'replace-help',
    }),
  )
  await settledErrors(page)
  await expect(page.locator('[data-arrangement] .element-help')).toHaveCount(0)
  expect(
    (await geometry(fields)).every((field) => field.contained && field.clear),
  ).toBe(true)
  // Correct the text through its real editor; reset covers the remaining group.
  await input.fill('ok')
  await expect(input).not.toHaveAttribute('aria-invalid', 'true')
  await expect(input).toHaveAccessibleDescription('Enter a name.')
  await page.evaluate(() => window.validationFeedback.reset())
  await expect(page.locator('.el-form-item__error')).toHaveCount(0)
  expect(await geometry(fields)).toEqual(before)
})

test('Mixed editor errors fit their allocations clear of following fields and actions', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await openFixture(page, { scenario: 'placement' })
  const preview = page.getByRole('region', {
    name: 'Validation preview',
    exact: true,
  })
  await preview
    .getByRole('button', { name: 'Check fields', exact: true })
    .click()
  const errors = preview.locator('.el-form-item__error')
  const invalidFields = [
    'Name',
    'Shared input frame',
    'Password',
    'Notes',
    'Radio group',
    'Segmented selection',
    'Checkbox group',
    'Multiple selection',
    'Calendar date',
    'Time',
    'Local date and time',
  ]
  await expect(errors).toHaveCount(invalidFields.length)
  for (const label of invalidFields) {
    const field = preview.locator('.element-field').filter({
      has: page
        .locator('label, [id$="-label"]')
        .filter({ hasText: new RegExp(`^\\s*\\*?\\s*${label}\\s*$`) }),
    })
    await expect(field.locator('.el-form-item__error')).toHaveCount(1)
  }
  for (const error of await errors.all()) await waitForPresentation(error)
  const measured = await geometry(preview.locator('.element-field'))
  expect(measured.every((field) => field.contained && field.clear)).toBe(true)
  const last = await preview.locator('.element-field').last().boundingBox()
  const action = await preview
    .getByRole('button', { name: 'Check fields', exact: true })
    .boundingBox()
  expect(action!.y).toBeGreaterThanOrEqual(last!.y + last!.height)
  await test.info().attach('validation-placement', {
    body: await preview.screenshot(),
    contentType: 'image/png',
  })
})
