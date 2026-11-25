import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Element Plus native bounded range panels preserve text drafts and atomic endpoint selection', async () => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./temporal-range-fixture.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'Ranges',
      },
    },
  })
  const code = (Array.isArray(result) ? result : [result])
    .flatMap((r) => r.output)
    .find((r) => r.type === 'chunk').code
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  let demo
  try {
    installDomEnvironment(dom.window)
    dom.window.eval(code)
    demo = await dom.window.Ranges.mount()
    const doc = dom.window.document
    const section = (name) => demo.host.querySelector(`[data-case=${name}]`)
    const popup = () => doc.querySelector('[data-temporal-range-popup]')
    const open = async (name) => {
      const trigger = section(name).querySelector(
        '[data-temporal-range-trigger]',
      )
      assert.ok(trigger)
      assert.equal(
        section(name).querySelectorAll('[data-temporal-trigger]').length,
        1,
      )
      trigger.click()
      await demo.tick()
      assert.ok(
        popup()?.querySelector('.el-date-range-picker'),
        'native range panel is used',
      )
      assert.ok(section(name).querySelector('[data-engaged]'))
      assert.ok(
        popup()
          .closest('.el-popper')
          .querySelector(':scope > .el-popper__arrow'),
        'range picker retains the native arrow',
      )
      return trigger
    }
    const close = async () => {
      popup().dispatchEvent(
        new dom.window.KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
        }),
      )
      await demo.tick()
    }
    const cell = (day) =>
      [
        ...popup().querySelectorAll(
          '.el-date-range-picker__content.is-left td',
        ),
      ].find(
        (el) =>
          el.textContent.trim() === String(day) &&
          !el.matches('.prev-month, .next-month'),
      )
    const chooseDates = async (name, start, end) => {
      const before = JSON.stringify(demo.controls[name].field.state.input)
      cell(start).click()
      await demo.tick()
      assert.equal(
        JSON.stringify(demo.controls[name].field.state.input),
        before,
        'first click is a native selection draft',
      )
      if (name === 'date') await demo.format('DMY')
      cell(end).click()
      await demo.tick()
    }
    assert.deepEqual(Array.from(demo.errors), [])
    const trigger = await open('date')
    assert.equal(popup().querySelectorAll('.el-date-table').length, 2)
    assert.ok(cell(16).classList.contains('disabled'))
    await chooseDates('date', 5, 7)
    assert.equal(
      JSON.stringify(demo.controls.date.field.state.input),
      JSON.stringify({ start: '2026-03-05', end: '2026-03-07' }),
    )
    assert.equal(popup(), null)
    assert.equal(doc.activeElement, trigger)
    await open('date')
    await chooseDates('date', 5, 7)
    assert.equal(popup(), null, 'unchanged date selection also closes')

    await open('datetime')
    assert.ok(popup().querySelector('.el-date-range-picker__time-header'))
    await chooseDates('datetime', 6, 8)
    assert.equal(
      JSON.stringify(demo.controls.datetime.field.state.input),
      JSON.stringify({ start: '2026-03-06T09:05', end: '2026-03-08T17:10' }),
    )
    assert.ok(popup(), 'datetime panel remains open for clock edits')
    const clock = popup().querySelector('input[placeholder="Start Time"]')
    assert.ok(clock, popup().innerHTML.slice(0, 1500))
    clock.value = '10:15'
    clock.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    clock.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
    await demo.tick()
    assert.equal(
      demo.controls.datetime.field.state.input.start,
      '2026-03-06T10:15',
    )
    await chooseDates('datetime', 9, 11)
    assert.equal(
      demo.controls.datetime.field.state.input.start,
      '2026-03-09T10:15',
      'calendar edits retain clocks changed during the same popup session',
    )
    await close()
    await demo.format('DMY')
    await open('datetime')
    assert.equal(
      popup().querySelector('input[placeholder="Start date"]').value,
      '09/03/2026',
    )
    await close()

    await open('precise')
    await chooseDates('precise', 6, 8)
    assert.equal(
      JSON.stringify(demo.controls.precise.field.state.input),
      JSON.stringify({
        start: '2026-03-06T09:05:12.123',
        end: '2026-03-08T17:10:34.456',
      }),
    )
    await close()
    const editors = [...section('date').querySelectorAll('input')]
    editors[0].focus()
    editors[0].value = 'unfinished'
    editors[0].dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    await demo.tick()
    editors[1].dispatchEvent(
      new dom.window.KeyboardEvent('keydown', {
        key: 'ArrowDown',
        altKey: true,
        bubbles: true,
      }),
    )
    await demo.tick()
    assert.ok(popup())
    await close()
    assert.equal(editors[0].value, 'unfinished')
    assert.equal(demo.controls.date.field.state.input.start, 'unfinished')
    demo.controls.date.field.reset()
    await demo.tick()

    section('date').querySelector('[data-temporal-mode]').click()
    await demo.tick()
    doc.querySelector('[data-temporal-mode-value=start]').click()
    await demo.tick()
    assert.equal(
      section('date').querySelector('[data-temporal-range-trigger]'),
      null,
    )
    section('date').querySelector('[data-temporal-trigger]').click()
    await demo.tick()
    const scalar = doc.querySelector('[data-temporal-popup]')
    assert.ok(scalar.querySelector('.el-date-picker'))
    scalar.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await demo.tick()
    section('date').querySelector('[data-temporal-mode]').click()
    await demo.tick()
    doc.querySelector('[data-temporal-mode-value=bounded]').click()
    await demo.tick()
    assert.ok(section('date').querySelector('[data-temporal-range-trigger]'))
    assert.equal(
      section('time').querySelector('[data-temporal-range-trigger]'),
      null,
    )
    assert.equal(
      section('time').querySelectorAll('[data-temporal-trigger]').length,
      2,
      'overnight clocks retain independent native time pickers',
    )
    assert.notEqual(
      section('time').querySelector('[data-temporal-next-day]').style
        .visibility,
      'hidden',
    )

    await demo.mobile(true)
    await open('date')
    assert.ok(popup().querySelector('.single-panel'))
    assert.equal(popup().querySelectorAll('.el-date-table').length, 1)
    await demo.disabled(true)
    assert.equal(popup(), null)
    assert.ok(
      section('date').querySelector('[data-temporal-range-trigger]').disabled,
    )
    await demo.disabled(false)
    await demo.readonly(true)
    assert.ok(
      section('date').querySelector('[data-temporal-range-trigger]').disabled,
    )
    await demo.readonly(false)
    assert.deepEqual(Array.from(demo.errors), [])
  } finally {
    demo?.dispose()
    dom.window.close()
  }
})
