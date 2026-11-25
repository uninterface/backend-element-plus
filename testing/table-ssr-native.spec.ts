import { test, expect, type Page } from '@playwright/test'
import type { hydrateTable } from '../../../tests/fixtures/table-ssr-baseline'
import { runTableSsrBaseline } from '../../../tests/table-ssr-baseline.mjs'

type TablePage = Window & {
  baseline: Awaited<ReturnType<typeof hydrateTable>>
  heightEditors: HTMLElement[]
}

test('native table height transitions preserve drafts and bounded scrolling', async ({
  browser,
}) => {
  test.setTimeout(300_000)
  const { cases } = await runTableSsrBaseline({
    browser,
    async inspectHydration(page: Page, record) {
      await page.evaluate(() => {
        ;(window as unknown as TablePage).heightEditors = [
          ...document.querySelectorAll<HTMLElement>('[data-ssr-draft]'),
        ]
      })
      record.heightTransitions = []
      const initial = record.request.height
      if (!initial)
        throw new Error('The native table fixture needs an explicit height.')
      for (const height of [
        initial,
        initial === 'full' ? 'content' : 'full',
        initial,
      ] as const) {
        await page.evaluate(
          (height) => (window as unknown as TablePage).baseline.resize(height),
          height,
        )
        await page.waitForTimeout(80)
        const geometry = await page.evaluate(() => {
          const host = document.querySelector<HTMLElement>('#table-host')!
          const native = host.querySelector<HTMLElement>('.el-table')!
          const viewport = native.querySelector('.el-scrollbar__wrap')!
          return {
            height: native.style.height,
            pixels: native.getBoundingClientRect().height,
            offered: host.clientHeight,
            boundedRegion: viewport.getAttribute('role') === 'region',
            editorIdentity: (
              window as unknown as TablePage
            ).heightEditors.every(
              (el) =>
                document.querySelector(
                  `[data-ssr-draft="${el.dataset.ssrDraft}"]`,
                ) === el,
            ),
          }
        })
        record.heightTransitions.push({ mode: height, ...geometry })
        record.checks[`height-${height}`] =
          (record.checks[`height-${height}`] ?? true) &&
          (height === 'full'
            ? geometry.height === '100%' &&
              Math.abs(geometry.pixels - geometry.offered) <= 2 &&
              geometry.boundedRegion
            : geometry.height === '' &&
              geometry.pixels < geometry.offered - 2 &&
              !geometry.boundedRegion) &&
          geometry.editorIdentity
      }
      if (!record.request.empty)
        record.checks.heightTransitionDraft =
          (await page.locator('[data-ssr-draft="one"]').inputValue()) ===
          'Unfinished amount 12.'
      record.checks.heightTransitionNoReads =
        (
          await page.evaluate(() =>
            (window as unknown as TablePage).baseline.snapshot(),
          )
        ).reads === (record.request.empty ? 1 : 2)
    },
  })
  expect(cases).toHaveLength(8)
  // KI-065 keeps native server-content failures visible in the shared baseline.
  // This test exercises the independent native client height transition.
  for (const { checks, request } of cases) {
    expect(checks['height-content']).toBe(true)
    expect(checks['height-full']).toBe(true)
    expect(checks.heightTransitionNoReads).toBe(true)
    if (!request.empty) expect(checks.heightTransitionDraft).toBe(true)
  }
})
