import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import {
  installDomEnvironment,
  withBuiltDomFixture,
} from '@uninterface/testing/jsdom'

test('upload region preserves native acquisition presentation and independent controls', async () => {
  await withBuiltDomFixture(
    build,
    new URL('./fixtures/upload-presentation.ts', import.meta.url),
    async ({ mountUpload }) => {
      const example = await mountUpload()
      try {
        const { root } = example
        assert.ok(root)
        assert.ok(root.matches('.el-upload-dragger'), 'native dragger surface')
        assert.ok(
          root.querySelector('.el-icon--upload svg'),
          'native upload artwork',
        )
        assert.ok(
          root.querySelector('[data-upload-choose] .el-upload__text'),
          'native upload label',
        )
        assert.equal(root.getAttribute('role'), 'group')
        assert.equal(root.querySelectorAll('input[type=file]').length, 1)
        assert.deepEqual(Array.from(example.errors), [])
      } finally {
        example.dispose()
      }
    },
  )
})

test('upload percentage text is rounded and localized without changing progress precision', async () => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/upload-progress.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'UploadProgress',
      },
    },
  })
  const code = (Array.isArray(result) ? result : [result])
    .flatMap((item) => item.output)
    .find((item) => item.type === 'chunk').code
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  let demo
  try {
    installDomEnvironment(dom.window)
    dom.window.eval(code)
    demo = await dom.window.UploadProgress.mount()
    const label = () =>
      demo.host.querySelector('.el-progress__text')?.textContent.trim()
    const indicator = () => demo.host.querySelector('[role=progressbar]')
    for (const [loaded, total, expected] of [
      [1, 3, '33%'],
      [2, 3, '67%'],
      [0.1 + 0.2, 1, '30%'],
      [3, 3, '100%'],
    ]) {
      demo.progress.value = { loaded, total }
      await demo.tick()
      assert.equal(label(), expected)
      assert.equal(Number(indicator().getAttribute('aria-valuenow')), loaded)
      assert.equal(demo.progress.value.loaded, loaded)
      assert.equal(demo.progress.value.total, total)
    }
    demo.progress.value = { loaded: 1, total: 3 }
    demo.locale('de-DE')
    await demo.tick()
    assert.equal(
      label(),
      new Intl.NumberFormat('de-DE', {
        style: 'percent',
        maximumFractionDigits: 0,
      }).format(1 / 3),
    )
    demo.progress.value = { loaded: 0, total: 0 }
    await demo.tick()
    assert.equal(label(), undefined)
    assert.equal(indicator().hasAttribute('aria-valuenow'), false)
    demo.progress.value = { loaded: 1, total: null }
    await demo.tick()
    assert.equal(label(), undefined)
    assert.equal(indicator().hasAttribute('aria-valuenow'), false)
  } finally {
    demo?.dispose()
    dom.window.close()
  }
})
