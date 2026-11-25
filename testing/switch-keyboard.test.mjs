import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'
test(`element-plus: switch keyboard activation keeps model, checked and ARIA synchronized`, async () => {
  const result = await build({
    logLevel: 'silent',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env': '{}',
    },
    build: {
      minify: false,
      write: false,
      lib: {
        entry: fileURLToPath(new URL('./switch-keyboard.ts', import.meta.url)),
        formats: ['iife'],
        name: 'ReviewedInputs',
      },
    },
  })
  const bundle = (Array.isArray(result) ? result : [result])
    .flatMap((entry) => entry.output)
    .find((item) => item.type === 'chunk').code
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  try {
    installDomEnvironment(dom.window)
    dom.window.eval(bundle)
    const checks = await dom.window.ReviewedInputs.exercise()
    for (const [name, passed] of Object.entries(checks))
      assert.equal(passed, true, name)
  } finally {
    dom.window.close()
  }
})
