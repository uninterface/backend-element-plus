import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createUiDomTest } from '@uninterface/testing/dom'
import {
  withStrategies,
  settleUntil,
} from '../../../tests/strategy-dom-fixture.mjs'
import { build } from './fixture-build.mjs'
import { uiDomTestAdapter } from './dom.mjs'
test('strategies retain native sizing, labels, annotations and feedback', () =>
  withStrategies(build, async (example, window) => {
    const ui = createUiDomTest(uiDomTestAdapter)
    const target = example.host.querySelector('[data-strategy-target="text"]')
    const input = target.matches('input')
      ? target
      : target.querySelector('input')
    input.focus()
    const button = example.host.querySelector('[data-strategy-target="button"]')
    {
      assert.ok(input.closest('.el-input--small'))
      const field = input.closest('.el-form-item')
      assert.ok(field.classList.contains('el-form-item--label-right'))
      assert.equal(field.querySelector('label').style.width, '25%')
      assert.equal(field.querySelector('label').htmlFor, input.id)
      example.state.labels = 'above'
      await example.tick()
      assert.ok(field.classList.contains('el-form-item--label-top'))
      example.state.labels = 'beside'
      await example.tick()
      assert.ok(field.classList.contains('el-form-item--label-right'))
      assert.ok(button.classList.contains('el-button--small'))
    }
    {
      const formInput =
        example.host.querySelector(
          '[data-strategy-target="form-editor"] input',
        ) ??
        example.host.querySelector('input[data-strategy-target="form-editor"]')
      assert.ok(formInput.closest('.el-form-item--small'))
      assert.equal(
        formInput.closest('.el-form-item').classList.contains('asterisk-left'),
        true,
      )
      assert.equal(
        input.closest('.el-form-item').classList.contains('asterisk-right'),
        false,
      )
      assert.equal(
        input.closest('.el-form-item').querySelectorAll('.element-required')
          .length,
        1,
      )
    }
    const backendPrefix = 'element'
    const originalLabels = example.state.labels
    for (const labels of [originalLabels, undefined]) {
      example.state.labels = labels
      for (const mode of ['prefix', 'suffix', 'no', 'yes']) {
        example.state.requiredAnnotations = mode
        await example.tick()
        for (const controlName of [
          'text',
          'form-editor',
          'checkbox',
          'switch',
          'select',
        ]) {
          const control = example.host.querySelector(
            `[data-strategy-target="${controlName}"]`,
          )
          const field = control.closest(`.${backendPrefix}-field`)
          assert.ok(field, `${controlName} has a field`)
          const markers = field.querySelectorAll(`.${backendPrefix}-required`)
          const nativeMarker = field.classList.contains('is-required')
          if (mode === 'no') {
            assert.equal(
              markers.length,
              0,
              `${controlName}: no visible required annotation`,
            )
            assert.equal(nativeMarker, false)
          } else {
            assert.equal(
              markers.length + Number(nativeMarker),
              1,
              `${controlName}: one required annotation`,
            )
            if (markers.length) {
              const marker = markers[0]
              const visibleLabelText = [
                ...marker.parentElement.childNodes,
              ].filter((node) => node.nodeType === 3 && node.textContent.trim())
              assert.ok(visibleLabelText.length)
              const beforeText = Boolean(
                marker.compareDocumentPosition(visibleLabelText[0]) &
                  window.Node.DOCUMENT_POSITION_FOLLOWING,
              )
              assert.equal(
                beforeText,
                mode === 'prefix' || mode === 'yes',
                `${controlName}: annotation placement`,
              )
            }
          }
        }
        const group = example.host.querySelector('[data-strategy-group]')
        assert.equal(
          group.querySelector(`.${backendPrefix}-required`),
          null,
          'query barrier preserves local no annotation',
        )
      }
    }
    example.state.blockRequiredGroup = false
    const groupField = example.host.querySelector('[data-strategy-group]')
    assert.ok(
      ui.fieldGroup(groupField).label?.textContent.includes('Required group'),
    )
    assert.ok(ui.fieldGroup(groupField).controlArea)
    for (const mode of ['prefix', 'suffix', 'yes', 'no']) {
      example.state.requiredAnnotations = mode
      await example.tick()
      const marker = groupField.querySelector(`.${backendPrefix}-required`)
      assert.equal(
        Boolean(marker),
        mode !== 'no',
        'group annotation follows its own strategy query',
      )
      const requiredDescription = groupField.querySelector(
        `[id$="-required"], .plain-strategy-hidden`,
      )
      if (mode === 'no')
        assert.ok(
          requiredDescription,
          'group retains semantic required description',
        )
      const optionalField = example.host
        .querySelector('[data-strategy-target="blocked-editor"]')
        .closest(`.${backendPrefix}-field`)
      assert.equal(
        optionalField.querySelector(`.${backendPrefix}-required`),
        null,
        'optional field receives no annotation',
      )
    }
    example.state.blockRequiredGroup = true
    example.state.labels = originalLabels
    example.state.requiredAnnotations = 'yes'
    await example.tick()
    for (const level of [-2, -1, 0, 1, 2]) {
      example.state.size = level
      await example.tick()
      {
        assert.equal(Boolean(input.closest('.el-input--small')), level < 0)
        assert.equal(Boolean(input.closest('.el-input--large')), level > 0)
        assert.equal(button.classList.contains('el-button--small'), level < 0)
        assert.equal(button.classList.contains('el-button--large'), level > 0)
      }
      {
        const nativeSize = level < 0 ? 'small' : level > 0 ? 'large' : 'default'
        assert.ok(
          input.closest(`.el-form-item--${nativeSize}`),
          'native field size coordinates labels and spacing',
        )
        const blocked = example.host.querySelector(
          '[data-strategy-target="blocked-editor"]',
        )
        assert.ok(
          blocked.closest('.el-input--default'),
          'a barrier prevents native field size from leaking to the editor',
        )
      }
    }
    example.state.size = -1
    for (const limit of ['fieldOnly', 'sizeDepth']) {
      example.state[limit] = limit === 'fieldOnly' ? true : 1
      await example.tick()
      {
        assert.ok(input.closest('.el-form-item--small'))
        assert.ok(input.closest('.el-input--default'))
      }
      example.state[limit] = limit === 'fieldOnly' ? false : undefined
    }
    await example.tick()
    for (const [name, control] of [
      ['text', example.text],
      ['checkbox', example.checkbox],
      ['select', example.selected],
    ]) {
      const surface = example.host.querySelector(
        `[data-strategy-target="${name}"]`,
      )
      const editor = surface.matches(
        'input,select,[role=checkbox],[role=combobox]',
      )
        ? surface
        : surface.querySelector(
            'input:not([type=hidden]),select,[role=checkbox],[role=combobox]',
          )
      control.state.issue = `Failure for ${name}`
      for (const mode of ['none', 'show-tooltip']) {
        example.state.failure = mode
        await example.tick()
        await settleUntil(
          example.tick,
          () =>
            mode === 'none'
              ? !ui.fieldFeedback(editor).message
              : ui.fieldFeedback(editor).tooltip,
          `native validation for ${name}/${mode}`,
        )
        const { message } = ui.fieldFeedback(editor)
        if (mode === 'none') {
          assert.equal(
            editor.closest('.el-form-item').classList.contains('is-error'),
            true,
          )
        } else {
          {
            assert.ok(
              message.className.includes('tooltip-description'),
              'stable accessible error description survives portal lifecycle',
            )
          }
        }
      }
      control.state.issue = null
      await control.validate()
      await example.tick()
    }
    for (const position of ['above', 'beside', 'beside-far', 'beside-near']) {
      example.state.labels = position
      await example.tick()
      {
        const field = input.closest('.el-form-item')
        assert.equal(
          field.classList.contains(
            `el-form-item--label-${position === 'above' ? 'top' : position === 'beside-far' ? 'left' : 'right'}`,
          ),
          true,
        )
      }
    }
    const checkableFields = [
      ...example.host.querySelectorAll('.element-field'),
    ].filter((field) =>
      ['Strategy checkbox', 'Strategy switch'].some((label) =>
        field.textContent.includes(label),
      ),
    )
    for (const position of [
      undefined,
      'show',
      'above',
      'beside',
      'beside-far',
      'beside-near',
      'floating',
    ]) {
      example.state.labels = position
      await example.tick()
      for (const field of checkableFields) {
        {
          assert.ok(
            field.querySelector(
              '.el-checkbox__label,.element-switch-field > label',
            ),
          )
          assert.equal(
            field.querySelector(':scope > .el-form-item__label'),
            null,
          )
        }
      }
    }
    for (const position of ['show', 'floating', 'hidden', undefined]) {
      example.state.labels = position
      await example.tick()
      for (const name of ['text', 'select', 'checkbox', 'switch']) {
        const surface = example.host.querySelector(
          `[data-strategy-target="${name}"]`,
        )
        const editor = surface.matches(
          'input,select,[role=checkbox],[role=switch],[role=combobox]',
        )
          ? surface
          : surface.querySelector(
              'input:not([type=hidden]),select,[role=checkbox],[role=switch],[role=combobox]',
            )
        if (position === 'hidden' && !['checkbox', 'switch'].includes(name)) {
          const field = editor.closest('.element-field')
          assert.ok(
            field.matches('.element-labels-hidden'),
            `${name}: hidden retains the native visually hidden label`,
          )
        }
      }
    }
  }))
