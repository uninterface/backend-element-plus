import { test, expect } from '@playwright/test'
import type { hydrateTable } from './fixtures/table-ssr'
import { buildNativeTableFixture } from './table-ssr-fixture'

type NativeTablePage = Window & {
  nativeTable: Awaited<ReturnType<typeof hydrateTable>>
  heightEditors: HTMLElement[]
}

test('native table height transitions preserve drafts and bounded scrolling', async ({
  browser,
}) => {
  test.setTimeout(300_000)
  const fixture = await buildNativeTableFixture()
  try {
    const { open } = fixture
    for (const entry of ['table', 'collection'] as const)
      for (const empty of [false, true])
        for (const initial of ['content', 'full'] as const) {
          await test.step(`${entry}, ${empty ? 'empty' : 'populated'}, ${initial}`, async () => {
            const page = await browser.newPage({
              viewport: { width: 1200, height: 800 },
            })
            try {
              await open(page, {
                entry,
                empty,
                height: initial,
                idPrefix: 'native-height',
              })
              const draft = page.locator('[data-ssr-draft="one"]')
              if (!empty) await draft.fill('Unfinished amount 12.')
              await page.evaluate(() => {
                const fixture = window as unknown as NativeTablePage
                fixture.heightEditors = [
                  ...document.querySelectorAll<HTMLElement>('[data-ssr-draft]'),
                ]
              })
              for (const height of [
                initial,
                initial === 'full' ? 'content' : 'full',
                initial,
              ] as const) {
                await page.evaluate(
                  (height) =>
                    (window as unknown as NativeTablePage).nativeTable.resize(
                      height,
                    ),
                  height,
                )
                await expect
                  .poll(() =>
                    page.evaluate((height) => {
                      const host =
                        document.querySelector<HTMLElement>('#table-host')!
                      const native =
                        host.querySelector<HTMLElement>('.el-table')
                      const viewport = native?.querySelector(
                        '.el-scrollbar__wrap',
                      )
                      if (!native || !viewport) return false
                      const pixels = native.getBoundingClientRect().height
                      const bounded = viewport.getAttribute('role') === 'region'
                      return height === 'full'
                        ? native.style.height === '100%' &&
                            Math.abs(pixels - host.clientHeight) <= 2 &&
                            bounded
                        : native.style.height === '' &&
                            pixels < host.clientHeight &&
                            !bounded
                    }, height),
                  )
                  .toBe(true)
                expect(
                  await page.evaluate(() =>
                    (window as unknown as NativeTablePage).heightEditors.every(
                      (editor) =>
                        document.querySelector(
                          `[data-ssr-draft="${editor.dataset.ssrDraft}"]`,
                        ) === editor,
                    ),
                  ),
                ).toBe(true)
              }
              if (!empty)
                await expect(draft).toHaveValue('Unfinished amount 12.')
              expect(
                await page.evaluate(
                  () =>
                    (
                      window as unknown as NativeTablePage
                    ).nativeTable.snapshot().reads,
                ),
              ).toBe(1)
            } finally {
              await page.close()
            }
          })
        }
  } finally {
    await fixture.dispose()
  }
})
