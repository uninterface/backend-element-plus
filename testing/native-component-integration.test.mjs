import { test } from 'node:test'
import assert from 'node:assert/strict'
import { withBuiltDomFixture } from '@uninterface/testing/jsdom'
import { build } from './fixture-build.mjs'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'

test('the reduced-motion patch is scoped to Uninterface buttons', () => {
  const buttonClasses = 'el-button is-loading'
  const indicatorClass = 'is-loading'
  const ownedClass = 'element-button'
  const css = readFileSync(
    new URL('../src/style.css', import.meta.url),
    'utf8',
  ).replace(/^@import[^;]+;/gm, '')
  const dom = new JSDOM(`<!doctype html><style>${css}</style><body>
      <button class="${buttonClasses}"><span id="independent" class="${indicatorClass}"></span></button>
      <button class="${buttonClasses} ${ownedClass}"><span id="owned" class="${indicatorClass}"></span></button>
    </body>`)
  try {
    const { document } = dom.window
    const rules = [...document.styleSheets[0].cssRules]
      .filter((rule) => rule.conditionText?.includes('prefers-reduced-motion'))
      .flatMap((rule) => [...rule.cssRules])
    assert.ok(rules.length > 0)
    assert.ok(
      rules.some((rule) =>
        document.querySelector('#owned').matches(rule.selectorText),
      ),
    )
    for (const rule of rules)
      assert.equal(
        document.querySelector('#independent').matches(rule.selectorText),
        false,
        'vendor-only button remains outside patch scope',
      )
  } finally {
    dom.window.close()
  }
})

test('native button variants and indicators follow the declared treatments', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/buttons.ts', import.meta.url),
    async ({ mountButton }) => {
      const treatment = (value) =>
        ({
          filled: 'el-button--info',
          outline: 'element-button-outline',
          soft: 'is-plain',
          text: 'is-text',
          icon: 'is-circle',
        })[value]
      const strategies = await mountButton({}, { strategy: 'text', icon: true })
      const strategyButton = strategies.host.querySelector('button')
      try {
        assert.ok(strategyButton.classList.contains(treatment('text')))
        await strategies.update({ variant: 'outline' })
        assert.ok(strategyButton.classList.contains(treatment('outline')))
        await strategies.update({ variant: undefined })
        await strategies.updateContent({ strategy: 'soft' })
        assert.ok(strategyButton.classList.contains(treatment('soft')))
      } finally {
        strategies.dispose()
      }
    },
  ))

test('full height toggles the native fixed-header presentation', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/collection-scrolling.ts', import.meta.url),
    async ({ mountCollectionScrolling }) => {
      const example = await mountCollectionScrolling()
      try {
        for (const [full, horizontal] of [
          [false, false],
          [false, true],
          [true, false],
          [true, true],
          [false, false],
        ]) {
          await example.configure(full, horizontal)
          const table = example.host.querySelector('.element-table')
          assert.equal(table.style.height, full ? '100%' : '')
          assert.equal(
            Boolean(table.querySelector('.el-scrollbar__wrap[role="region"]')),
            full,
          )
        }
      } finally {
        example.dispose()
      }
    },
  ))

test('native ascending caret changes the secondary sort clause once', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/native-sort-clause.ts', import.meta.url),
    async ({ mountSorting }, window) => {
      const fixture = await mountSorting()
      try {
        await fixture.control.setQuery(
          window.JSON.parse(
            JSON.stringify({
              sort: [
                { key: 'amount', direction: 'desc' },
                { key: 'name', direction: 'desc' },
              ],
            }),
          ),
        )
        await fixture.tick()
        const header = (name) =>
          [...fixture.host.querySelectorAll('thead th')].find((node) =>
            node.textContent.includes(name),
          )
        const before = fixture.reads()
        header('Name').querySelector('.sort-caret.ascending').click()
        await fixture.tick()
        assert.equal(fixture.reads(), before + 1)
        assert.equal(
          fixture.control.state.query.sort[1].direction,
          'asc',
          'native directional caret sets the requested direction',
        )
        assert.ok(header('Amount').classList.contains('descending'))
        assert.ok(header('Name').classList.contains('ascending'))
      } finally {
        fixture.dispose()
      }
    },
  ))

test('layout density uses the native spacing at each strategy scope', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/layout-density.ts', import.meta.url),
    async ({ mountDensity }) => {
      const expected = ['4px', '8px', '16px']
      const example = await mountDensity()
      try {
        const root = (name) =>
          example.host.querySelector(`[data-density=${name}]`)
        const spacing = (name, level) => {
          const element = root(name)
          assert.ok(element, name)
          assert.equal(element.style.gap, expected[level + 1], name)
        }

        for (const level of [-1, 1, 0, -1]) {
          await example.update([level])
          for (const name of ['linear', 'flow', 'grid', 'parent', 'nested'])
            spacing(name, level)
          spacing('blocked', 0)
          spacing('reset', 0)
          assert.equal(root('regions').style.gap, '0')
        }
        await example.update([-1, 1])
        for (const name of ['linear', 'flow', 'grid', 'nested'])
          spacing(name, 0)
        await example.update([-1], { depth: 1 })
        for (const name of ['linear', 'flow', 'grid', 'parent'])
          spacing(name, -1)
        spacing('nested', 0)
        await example.update([1], { targets: ['grid-layout'] })
        spacing('grid', 1)
        spacing('linear', 0)
        spacing('flow', 0)
        await example.update([-1], { stopAt: ['layout'] })
        spacing('linear', 0)
        spacing('nested', 0)
        spacing('grid', -1)
        await example.update([])
        for (const name of ['linear', 'flow', 'grid', 'nested'])
          spacing(name, 0)
      } finally {
        example.dispose()
      }
    },
  ))

test('collection footer slots follow the native DOM order', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/collection-footer.ts', import.meta.url),
    async ({ mountCollectionFooter }) => {
      const example = await mountCollectionFooter()
      try {
        const parts = [
          ...example.host.querySelectorAll('#order-footer [data-part]'),
        ]
        assert.deepEqual(
          parts.map((part) => part.dataset.part),
          ['info', 'size', 'paginator', 'jumper'],
        )
      } finally {
        example.dispose()
      }
    },
  ))

test('temporal pickers use their native parts and date format', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/temporal-pickers.ts', import.meta.url),
    async ({ mount }, window) => {
      const demo = await mount()
      const { document } = window
      try {
        const triggers = [
          ...demo.host.querySelectorAll('[data-temporal-trigger]'),
        ]
        const inline = demo.host.querySelector('[data-temporal-inline-time]')
        assert.equal(Boolean(inline), false)
        assert.equal(triggers.length, 3)
        for (const trigger of triggers) {
          assert.ok(
            trigger.closest('.el-input__prefix'),
            'picker uses the native leading slot',
          )
        }
        for (const input of demo.host.querySelectorAll('input'))
          assert.ok(input.closest('.el-form-item--label-top'))
        for (const trigger of triggers) {
          trigger.focus()
          trigger.click()
          await demo.tick()
          assert.ok(document.querySelector('[data-temporal-popup]'))
          assert.equal(document.querySelector('.el-popover__title'), null)
          trigger.click()
          await demo.tick()
        }
        await demo.date.field.set('2024-02-15')
        await demo.tick()
        assert.equal(
          demo.host.querySelector('input[aria-label=Date]').value,
          '2024-02-15',
        )
      } finally {
        demo.dispose()
      }
    },
  ))

test('table cell alignment uses physical direction after RTL changes', () =>
  withBuiltDomFixture(
    build,
    new URL('./fixtures/table-sizing.ts', import.meta.url),
    async ({ mountSizing }, window) => {
      Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', {
        get: () => 800,
      })
      const example = await mountSizing()
      try {
        const cells = () => [
          ...example.host.querySelectorAll(
            'table[aria-label="Sized table"] tbody td',
          ),
        ]
        const matches = (cell, align) => cell.classList.contains('is-' + align)
        assert.ok(matches(cells()[1], 'right'))
        assert.ok(matches(cells()[2], 'center'))
        example.host.setAttribute('dir', 'rtl')
        example.align.value = 'left'
        await example.flush()
        assert.ok(matches(cells()[1], 'left'))
      } finally {
        example.dispose()
      }
    },
  ))
