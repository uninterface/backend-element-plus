import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

const entry = new URL('./fixtures/presentation.ts', import.meta.url)

test('element-plus: neutral button retains native treatment and semantic interaction color', async () => {
  await withBuiltDomFixture(build, entry, async (fixture) => {
    const example = await fixture.mountNeutralButton()
    try {
      const button = example.host.querySelector('button')
      assert.ok(button)
      for (const color of example.colors) {
        await example.update({ color })
        assert.equal(button.classList.contains('is-plain'), false)
        assert.equal(button.classList.contains('el-button--primary'), false)
        assert.equal(button.classList.contains('el-button--info'), false)
        if (color !== 'primary') {
          const native = color === 'secondary' ? 'info' : color
          assert.equal(
            button.style.getPropertyValue('--el-button-hover-text-color'),
            'var(--el-color-' + native + ')',
          )
        } else {
          assert.equal(
            button.style.getPropertyValue('--el-button-hover-text-color'),
            '',
          )
        }
      }
      await example.update({ variant: 'filled' })
      assert.equal(
        button.style.getPropertyValue('--el-button-hover-text-color'),
        '',
      )
      assert.deepEqual(Array.from(example.errors), [])
    } finally {
      example.dispose()
    }
  })
})
