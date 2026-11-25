import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'

test('native theme defaults survive field sizing and editor barriers', async () => {
  await withBuiltDomFixture(
    build,
    new URL('./fixtures/strategy-native-defaults.ts', import.meta.url),
    async ({ mount }, { document }) => {
      const example = await mount()
      try {
        const input = (attribute) => {
          const surface = example.host.querySelector(`[${attribute}]`)
          return surface.matches('input')
            ? surface
            : surface.querySelector('input')
        }
        const ordinary = input('data-native-default')
        const blocked = input('data-native-blocked')

        const retained = example.host.querySelector(
          '[data-annotation-mode=yes] input',
        )
        retained.focus()
        for (const position of ['left', 'right', 'left']) {
          await example.setPlacement(position)
          for (const mode of ['ordinary', 'yes', 'prefix', 'suffix', 'no']) {
            const field = example.host.querySelector(
              `[data-annotation-mode=${mode}]`,
            )
            assert.ok(
              field.classList.contains(`el-form-item--label-${position}`),
              'ordinary beside follows native form alignment',
            )
            const native = field.classList.contains('is-required')
            const markers = field.querySelectorAll('.element-required')
            assert.equal(
              Number(native) + markers.length,
              mode === 'no' ? 0 : 1,
              'one marker, including scoped overrides',
            )
            if (mode !== 'no') {
              const expected =
                mode === 'prefix'
                  ? 'left'
                  : mode === 'suffix'
                    ? 'right'
                    : position
              if (native)
                assert.ok(field.classList.contains(`asterisk-${expected}`))
              else
                assert.equal(
                  markers[0].classList.contains('element-required-prefix'),
                  expected === 'left',
                )
            }
          }
          const checkbox = example.host.querySelector(
            '[data-annotation-checkbox] .element-required',
          )
          assert.equal(
            checkbox.classList.contains('element-required-prefix'),
            position === 'left',
          )
          const group = example.host.querySelector('[data-annotation-group]')
          assert.equal(group.classList.contains('is-required'), true)
          assert.ok(group.classList.contains(`asterisk-${position}`))
          assert.equal(
            example.host.querySelector('[data-annotation-mode=yes] input'),
            retained,
          )
          assert.equal(document.activeElement, retained)
        }
        const unspecified = example.host.querySelector(
          '[data-unspecified-presentation]',
        )
        const retainedDefault = unspecified.querySelector('input')
        const nativeCheckables = [
          ...example.host.querySelectorAll('[data-native-checkable]'),
        ]
        const retainedCheckables = nativeCheckables.map((owner) =>
          owner.querySelector('input'),
        )
        for (const labelPosition of ['left', 'right', 'top']) {
          await example.setDefaults({ labelPosition })
          assert.ok(
            unspecified.classList.contains(
              `el-form-item--label-${labelPosition}`,
            ),
            'omitted label strategy follows native form configuration',
          )
          assert.equal(unspecified.querySelector('input'), retainedDefault)
          for (const [index, owner] of nativeCheckables.entries()) {
            assert.equal(
              owner.dataset.uiCheckable,
              labelPosition === 'top' ? 'flushed' : 'control-aligned',
              'omission, show and unsupported floating resolve reactive native placement before adapt',
            )
            assert.equal(
              owner.querySelector('input'),
              retainedCheckables[index],
            )
          }
          assert.ok(
            input('data-native-show').closest(
              `.el-form-item--label-${labelPosition}`,
            ),
            'show enables labels without specifying native placement',
          )
        }
        await example.setDefaults({ hidden: true })
        assert.equal(unspecified.classList.contains('is-required'), false)
        assert.equal(
          unspecified.querySelector('.element-required'),
          null,
          'omission preserves native hidden required annotations',
        )
        assert.ok(
          example.host.querySelector(
            '[data-annotation-mode=yes] .element-required',
          ),
          'explicit yes still enables annotations',
        )
        example.field.state.issue = 'Configured native failure'
        for (const inline of [true, false]) {
          await example.setDefaults({ inline, messages: true })
          const error = unspecified.querySelector('.el-form-item__error')
          assert.ok(error)
          assert.equal(
            error.classList.contains('el-form-item__error--inline'),
            inline,
            'omitted failure strategy preserves native inline message configuration',
          )
          for (const mode of ['show', 'show-below', 'show-embedded']) {
            const resolved = example.host.querySelector(
              `[data-native-failure=${mode}] .el-form-item__error`,
            )
            assert.ok(resolved)
            assert.equal(
              resolved.classList.contains('el-form-item__error--inline'),
              inline,
              'equivalent failure modes share native configured message metrics',
            )
          }
        }
        await example.setDefaults({ messages: false })
        assert.equal(
          unspecified.querySelector('.el-form-item__error'),
          null,
          'omission preserves native message visibility',
        )
        for (const mode of ['show', 'show-below', 'show-embedded'])
          assert.ok(
            example.host.querySelector(
              `[data-native-failure=${mode}] .el-form-item__error`,
            ),
            'explicit affirmative/fallback restores visible messages',
          )
        assert.equal(
          example.host.querySelector(
            '[data-native-blocked-failure] .el-form-item__error',
          ),
          null,
          'resolved parent visibility cannot leak through a strategy barrier into native defaults',
        )
        assert.ok(ordinary.closest('.el-form-item--large'))
        assert.ok(ordinary.closest('.el-input--large'))
        assert.ok(blocked.closest('.el-form-item--small'))
        assert.ok(
          blocked.closest('.el-input--large'),
          'barrier restores configured native ordinary size',
        )
      } finally {
        example.dispose()
      }
    },
  )
})
