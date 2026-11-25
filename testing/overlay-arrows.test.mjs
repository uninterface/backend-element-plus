import { test } from 'node:test'
import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('element-plus: native popover arrow renders as decoration outside the scrolling region', async () => {
  await withBuiltDomFixture(
    build,
    new URL('./fixtures/popover-presentation.ts', import.meta.url),
    async ({ mountPopover }, window) => {
      window.HTMLDialogElement.prototype.showModal = function () {
        this.open = true
      }
      window.HTMLDialogElement.prototype.close = function () {
        this.open = false
      }
      const example = await mountPopover()
      try {
        for (const modal of [false, true]) {
          example.popoverModal.value = modal
          await delay(60)
          const anchor = window.document.querySelector('#separate-anchor')
          anchor.getBoundingClientRect = () =>
            new window.DOMRect(400, 300, 100, 20)
          const run = example.popover.run()
          await delay(60)
          const surface = window.document.querySelector(
            '[data-ui-overlay="popover"]',
          )
          assert.ok(surface)
          const arrow = surface.querySelector('.el-popper__arrow')
          assert.ok(arrow)
          assert.equal(arrow.getAttribute('aria-hidden'), 'true')
          assert.equal(arrow.closest('[role="region"]'), null)
          assert.equal(
            arrow.parentElement.getAttribute('data-popper-placement'),
            'bottom',
          )
          await example.popover.state.session.cancel()
          await run
        }
        assert.deepEqual(Array.from(example.errors), [])
      } finally {
        await example.dispose()
      }
    },
  )
})
