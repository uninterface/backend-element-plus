import { expect, test } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { build } from './fixture-build.mjs'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/floating-feedback-browser.ts', import.meta.url),
)

for (const dir of ['ltr', 'rtl'] as const) {
  for (const side of ['start', 'end'] as const) {
    test(`notification entry keeps its keyboard outline inside the viewport (${dir}, ${side})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await openFixture(page)
      await page.waitForFunction(() => Boolean(window.elementFeedback))

      await page.evaluate(
        async ({ dir, side }) => {
          window.elementFeedback.current.dispose()
          document.documentElement.dir = dir
          window.elementFeedback.current = await window.elementFeedback.mount({
            duration: null,
            placement: `top-${side}`,
          })
        },
        { dir, side },
      )
      const origin = page.locator('[data-feedback-origin]')
      await origin.focus()
      await page.evaluate(async () => {
        const viewport = document.querySelector('[data-feedback-target]')!
        // Hold the real entry transition at its widest displacement so the
        // keyboard check is independent of the test runner's reaction time.
        const entry = new Promise<void>((resolve) => {
          function holdEntry(event: Event) {
            const item = event.target
            if (
              !(item instanceof HTMLElement) ||
              !item.matches('[data-ui-feedback-item]') ||
              (event as TransitionEvent).propertyName !== 'transform'
            )
              return
            const motion = item
              .getAnimations()
              .find(
                (animation) =>
                  animation instanceof CSSTransition &&
                  animation.transitionProperty === 'transform',
              )
            if (!motion) return
            viewport.removeEventListener('transitionrun', holdEntry)
            motion.pause()
            motion.currentTime = 0
            resolve()
          }
          viewport.addEventListener('transitionrun', holdEntry)
        })
        window.elementFeedback.current.send('Incoming notification', true)
        await entry
      })

      await expect(origin).toBeFocused()
      await page.keyboard.press('Tab')
      const notification = page.locator('[data-ui-feedback-item]')
      await expect(
        notification.getByRole('region', { name: 'Incoming notification' }),
      ).toBeFocused()
      await expect(notification).toHaveCSS('outline-style', 'solid')
      const { translation, clearance, ring } = await notification.evaluate(
        (node) => {
          const style = getComputedStyle(node)
          const viewport = node.closest('[data-feedback-target]')!
          const card = node.getBoundingClientRect()
          const bounds = viewport.getBoundingClientRect()
          return {
            translation: new DOMMatrixReadOnly(style.transform).m41,
            clearance: Math.min(
              card.left - bounds.left,
              bounds.right - card.right,
            ),
            ring:
              parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset),
          }
        },
      )
      expect(
        translation * ((dir === 'ltr') === (side === 'end') ? 1 : -1),
      ).toBeGreaterThan(0)
      expect(clearance).toBeGreaterThanOrEqual(ring - 0.5)
    })
  }
}
