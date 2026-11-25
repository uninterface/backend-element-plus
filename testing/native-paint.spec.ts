import { test, expect } from '@playwright/test'
import { createUiTest } from '@uninterface/testing/playwright'
import type { Locator, Page } from '@playwright/test'
import { uiTestAdapter } from './index'
import type { mount as mountProgress } from '../../../tests/fixtures/progress-bar'
import type { mount as mountSurfaces } from '../../../tests/fixtures/disabled-surfaces'
import { build } from './fixture-build.mjs'
import {
  openPresentationFixture,
  measureSurfacePaint,
} from '../../../tests/presentation-browser-fixture.mjs'

type ProgressPage = Window & {
  fixture: Awaited<ReturnType<typeof mountProgress>>
}
type SurfacesPage = Window & {
  fixture: Awaited<ReturnType<typeof mountSurfaces>>
}

test('progress colors use the native semantic palette', async ({ page }) => {
  await openPresentationFixture(
    page,
    build,
    new URL('../../../tests/fixtures/progress-bar.ts', import.meta.url),
    'ProgressBars',
  )
  const ui = createUiTest(page, uiTestAdapter)
  const bar = page.locator('#standalone')
  for (const color of [
    'primary',
    'success',
    'danger',
    'warning',
    'info',
    'secondary',
  ] as const) {
    await page.evaluate(async (color) => {
      const { fixture } = window as unknown as ProgressPage
      fixture.color.value = color
      await fixture.tick()
    }, color)
    const token =
      color === 'secondary'
        ? '--el-text-color-secondary'
        : '--el-color-' + color
    const expected = await bar.evaluate(
      (root, cssColor) => {
        const sample = document.createElement('span')
        sample.style.backgroundColor = cssColor
        root.append(sample)
        const paint = getComputedStyle(sample).backgroundColor
        sample.remove()
        return paint
      },
      'var(' + token + ')',
    )
    expect(
      await ui
        .progressBar(bar)
        .fill.evaluate((node) => getComputedStyle(node).backgroundColor),
    ).toBe(expected)
  }
})

async function focusedPaint(
  page: Page,
  name: 'frame' | 'upload',
  surface: Locator,
) {
  expect(
    await page.evaluate(
      (name) => (window as unknown as SurfacesPage).fixture.focus(name),
      name,
    ),
  ).toBe(true)
  await page.evaluate(async () => {
    await (window as unknown as SurfacesPage).fixture.flush()
    for (const animation of document.getAnimations())
      if (Number.isFinite(animation.effect?.getComputedTiming().endTime))
        animation.finish()
  })
  return measureSurfacePaint(surface)
}

test('upload and input frame use coordinated native focus paint', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openPresentationFixture(
    page,
    build,
    new URL('../../../tests/fixtures/disabled-surfaces.ts', import.meta.url),
    'Surfaces',
  )
  const ui = createUiTest(page, uiTestAdapter)
  const frameRoot = page.locator('[data-surface=frame] [data-ui-input-frame]')
  const uploadRoot = page.locator(
    '[data-surface=upload] [data-ui-upload-region]',
  )
  const frameSurface = ui.inputFrame(frameRoot).surface
  for (const mode of ['light', 'dark'] as const)
    for (const retained of [false, true]) {
      await page.evaluate(
        async ({ mode, retained }) => {
          const { fixture } = window as unknown as SurfacesPage
          fixture.mode(mode)
          await fixture.retained(retained)
        },
        { mode, retained },
      )
      const frame = await focusedPaint(page, 'frame', frameSurface)
      const upload = await focusedPaint(
        page,
        'upload',
        (await ui.uploadRegion(uploadRoot)).surface,
      )
      expect(frame.boxShadow).toContain(upload.borderColor)
    }
})

test('native upload chooser switches its focus treatment during recovery', async ({
  page,
}) => {
  await openPresentationFixture(
    page,
    build,
    new URL('../../../tests/fixtures/disabled-surfaces.ts', import.meta.url),
    'Surfaces',
  )
  const host = page.locator('[data-surface=upload]')
  const region = host.locator('[data-ui-upload-region]')
  const ui = createUiTest(page, uiTestAdapter)
  for (const mode of ['light', 'dark'] as const)
    for (const recovery of [false, true]) {
      await page.evaluate(
        async ({ mode, recovery }) => {
          const { fixture } = window as unknown as SurfacesPage
          fixture.mode(mode)
          await fixture.retained(false)
          if (recovery) await fixture.reject()
        },
        { mode, recovery },
      )
      const { chooser } = await ui.uploadRegion(region)
      await host.locator('[data-before]').focus()
      await page.keyboard.press('Tab')
      await expect(chooser).toBeFocused()
      if (recovery) {
        await expect(chooser).toHaveCSS('outline-style', 'solid')
        await expect(chooser).toHaveClass(/el-button/)
      } else {
        await expect(chooser).toHaveCSS('outline-style', 'none')
        await expect(region).toHaveAttribute('data-upload-phase', 'ready')
        expect(
          await region.evaluate((node) => node.matches(':focus-within')),
        ).toBe(true)
      }
      await page.emulateMedia({ forcedColors: 'active' })
      await expect(recovery ? chooser : region).toHaveCSS(
        'outline-style',
        'solid',
      )
      await page.emulateMedia({ forcedColors: 'none' })
    }
})

test('feedback footer uses its native action direction', async ({ page }) => {
  await page.goto('/tests/fixtures/floating-feedback.html')
  for (const kind of ['toast', 'notification'] as const) {
    await page.evaluate(async (kind) => {
      window.floating.dispose()
      window.floating = await window.mountFloatingFeedback(
        { duration: null },
        kind,
      )
      window.floating.route.send({
        message: 'Action check',
        actions: [
          { key: 'first', label: 'First' },
          { key: 'next', label: 'Next' },
        ],
      })
    }, kind)
    await expect(page.locator('[data-ui-footer-actions]')).toHaveCSS(
      'flex-direction',
      'row-reverse',
    )
  }
})
