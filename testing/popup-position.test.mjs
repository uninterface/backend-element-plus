import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('native popup positioning follows initial content growth and entrance completion', async (t) => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/popup-position.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'PopupPosition',
      },
    },
  })
  const code = (Array.isArray(result) ? result : [result])
    .flatMap((entry) => entry.output)
    .find((entry) => entry.type === 'chunk').code

  for (const scenario of ['content growth', 'entrance completion']) {
    await t.test(scenario, async () => {
      const dom = new JSDOM('<!doctype html><body></body>', {
        url: 'http://localhost/',
        runScripts: 'outside-only',
        pretendToBeVisual: true,
      })
      const { window } = dom
      let example
      try {
        installDomEnvironment(window)
        let popupHeight = 30
        let referenceX = 100
        // Synthetic dimensions test that native Popper remeasures, not that
        // browser placement/animation geometry meets viewport acceptance.
        window.HTMLElement.prototype.getBoundingClientRect = function () {
          if (this.matches('[data-reference]'))
            return new window.DOMRect(referenceX, 100, 100, 30)
          if (this.matches('.el-popper'))
            return new window.DOMRect(0, 0, 200, popupHeight)
          return new window.DOMRect(0, 0, 1000, 800)
        }
        for (const [property, dimension] of [
          ['offsetWidth', 'width'],
          ['offsetHeight', 'height'],
          ['clientWidth', 'width'],
          ['clientHeight', 'height'],
        ])
          Object.defineProperty(window.HTMLElement.prototype, property, {
            configurable: true,
            get() {
              return this.getBoundingClientRect()[dimension]
            },
          })
        const observers = []
        window.ResizeObserver = class {
          targets = new Set()
          constructor(callback) {
            this.callback = callback
            observers.push(this)
          }
          observe(target) {
            this.targets.add(target)
          }
          unobserve(target) {
            this.targets.delete(target)
          }
          disconnect() {
            this.targets.clear()
          }
        }
        window.eval(code)
        example = await window.PopupPosition.mount()
        await example.tick()
        const surface = window.document.querySelector('.el-popper')
        assert.ok(surface)
        const before = example.rects()
        assert.ok(before)
        if (scenario === 'content growth') {
          const observing = observers.filter((observer) =>
            observer.targets.has(surface),
          )
          assert.equal(
            observing.length,
            1,
            'An initially open popup must observe its first mounted content',
          )
          assert.equal(before.popper.height, 30)
          popupHeight = 160
          observing[0].callback([{ target: surface }], observing[0])
          await example.tick()
          assert.equal(example.rects().popper.height, 160)
          await example.close()
          assert.equal(
            observing[0].targets.size,
            0,
            'Closing releases resize observation',
          )
        } else {
          referenceX = 250
          example.shown()
          await example.tick()
          assert.equal(
            example.rects().reference.x - before.reference.x,
            150,
            'Entrance completion must remeasure the settled reference',
          )
        }
      } finally {
        example?.dispose()
        dom.window.close()
      }
    })
  }
})
