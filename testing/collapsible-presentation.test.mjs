import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

const entry = new URL('./fixtures/presentation.ts', import.meta.url)

test('collapsible uses native presentation and indicator', async () => {
  await withBuiltDomFixture(build, entry, async (fixture) => {
    const example = await fixture.mountExpandedCollapsible()
    try {
      const root = example.host.querySelector('[data-fixture="collapsible"]')
      assert.ok(root)
      assert.ok(root.classList.contains('el-collapse'))
      assert.ok(root.querySelector('.el-collapse-item.is-active'))
      assert.ok(root.querySelector('.el-collapse-item__arrow svg'))
      assert.ok(
        root.querySelector(
          '.el-collapse-item__wrap > .el-collapse-item__content',
        ),
      )
      assert.deepEqual(Array.from(example.errors), [])
    } finally {
      example.dispose()
    }
  })
})
