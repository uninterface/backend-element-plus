import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Element navigation keeps rail icons visible and supports native hover followed by click', async () => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"development"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/navigation.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'NavigationExample',
      },
    },
  })
  const outputs = (Array.isArray(result) ? result : [result]).flatMap(
    (r) => r.output,
  )
  const code = outputs.find((item) => item.type === 'chunk').code
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  const { window } = dom
  installDomEnvironment(window)
  let example
  try {
    for (const asset of outputs.filter((item) =>
      item.fileName.endsWith('.css'),
    )) {
      const style = window.document.createElement('style')
      style.textContent = String(asset.source)
      window.document.head.append(style)
    }
    window.eval(code)
    example = await window.NavigationExample.mount()
    const doc = window.document
    const preview = example.host.querySelector(
      '[data-testid="navigation-preview"]',
    )
    const content = preview.querySelector('[data-testid="navigation-content"]')
    const visible = (node) => {
      for (let el = node; el; el = el.parentElement) {
        const style = window.getComputedStyle(el)
        if (
          el.hidden ||
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          style.clipPath === 'inset(50%)'
        )
          return false
      }
      return true
    }
    const byKey = (key) =>
      [...doc.querySelectorAll(`[data-entry-key="${key}"]`)].find(visible)
    const hover = async (node) => {
      node.dispatchEvent(new window.MouseEvent('mouseenter'))
      await new Promise((resolve) => setTimeout(resolve, 350))
      await example.tick()
    }
    const title = (node) => node.querySelector(':scope > .el-sub-menu__title')
    const rowStyle = (key) => {
      const node = byKey(key)
      const style = window.getComputedStyle(title(node) ?? node)
      return [
        style.height,
        style.lineHeight,
        style.paddingLeft,
        style.paddingRight,
      ]
    }
    let popupStyles
    for (const mode of ['horizontal', 'vertical-popup']) {
      await example.setPresentation(mode)
      title(byKey('destinations')).click()
      await example.tick()
      title(byKey('asia')).click()
      await example.tick()
      assert.ok(visible(byKey('singapore').querySelector('[data-icon]')))
      const styles = ['allDestinations', 'asia', 'singapore'].map(rowStyle)
      assert.deepEqual(
        styles,
        [
          [
            'var(--el-menu-horizontal-sub-item-height)',
            'var(--el-menu-horizontal-sub-item-height)',
            '10px',
            '10px',
          ],
          [
            'var(--el-menu-horizontal-sub-item-height)',
            'var(--el-menu-horizontal-sub-item-height)',
            '10px',
            '40px',
          ],
          [
            'var(--el-menu-horizontal-sub-item-height)',
            'var(--el-menu-horizontal-sub-item-height)',
            '10px',
            '10px',
          ],
        ],
        'floating rows consume native compact-popup height and padding',
      )
      if (popupStyles)
        assert.deepEqual(
          styles,
          popupStyles,
          'vertical flyouts match horizontal popup density at both depths',
        )
      else popupStyles = styles
      byKey('singapore').focus()
      byKey('singapore').click()
      await example.tick()
      const outsideEntry = doc.createElement('button')
      doc.body.append(outsideEntry)
      outsideEntry.focus()
      await example.tick()
      const rootMenu = preview.querySelector('[role=menubar]')
      const roots = [...rootMenu.querySelectorAll('[role^=menuitem]')].filter(
        (item) => item.closest('[role=menu], [role=menubar]') === rootMenu,
      )
      assert.equal(
        roots.filter((item) => item.tabIndex === 0).length,
        1,
        'menu retains one keyboard entry after activating a submenu destination',
      )
      assert.equal(
        doc.activeElement,
        outsideEntry,
        'restoring a tab stop does not move focus',
      )
      outsideEntry.remove()
      assert.equal(content.querySelector('h3').textContent.trim(), 'Singapore')
    }

    await example.setPresentation('icon-popup')
    const sidebar = preview.querySelector('.element-content[data-inset="none"]')
    assert.ok(sidebar, 'the rail uses an explicitly flush content host')
    assert.equal(window.getComputedStyle(sidebar).padding, '0px')
    assert.equal(content.dataset.inset, 'default')
    assert.equal(
      byKey('overview').querySelector('.el-menu-tooltip__trigger'),
      null,
      'native leaf tooltip does not duplicate the navigation hint',
    )
    const rail = preview.querySelector('.el-menu--collapse')
    assert.ok(rail, 'uses native collapsed mode')
    for (const key of [
      'overview',
      'destinations',
      'experiences',
      'essentials',
    ]) {
      assert.ok(
        visible(byKey(key).querySelector('[data-icon]')),
        `${key}: icon is not hidden by collapsed-menu selectors`,
      )
    }
    assert.equal(
      visible(byKey('overview').querySelector('.element-entry-copy')),
      false,
      'root label is visually hidden',
    )
    await hover(byKey('destinations'))
    assert.equal(byKey('destinations').getAttribute('aria-expanded'), 'true')
    assert.equal(
      doc.activeElement,
      byKey('destinations'),
      'hover opening retains native trigger focus',
    )
    // .click() alone omits the pointer modality used by native focus handling.
    title(byKey('destinations')).dispatchEvent(
      new window.MouseEvent('mousedown', { bubbles: true }),
    )
    title(byKey('destinations')).click()
    await example.tick()
    assert.equal(
      byKey('destinations').getAttribute('aria-expanded'),
      'true',
      'click after hover does not collapse the popup',
    )
    await hover(byKey('asia'))
    assert.equal(byKey('asia').getAttribute('aria-expanded'), 'true')
    assert.equal(
      doc.activeElement,
      byKey('asia'),
      'nested hover does not jump to the first destination',
    )
    title(byKey('asia')).click()
    await example.tick()
    assert.equal(byKey('asia').getAttribute('aria-expanded'), 'true')
    // Native ElSubMenu focuses its popup container on mouseenter. That
    // container surrounds the registered UL, so exercise its own event path.
    byKey('asia')
      .closest('.el-menu--popup-container')
      .dispatchEvent(new window.MouseEvent('mouseenter'))
    await example.tick()
    assert.equal(
      byKey('destinations').getAttribute('aria-expanded'),
      'true',
      'native popup-container focus belongs to this navigation menu',
    )
    byKey('singapore')
      .closest('.el-menu--popup-container')
      .dispatchEvent(new window.MouseEvent('mouseenter'))
    await example.tick()
    assert.equal(byKey('destinations').getAttribute('aria-expanded'), 'true')
    assert.equal(
      byKey('asia').getAttribute('aria-expanded'),
      'true',
      'nested popup-container focus retains the complete open path',
    )
    assert.ok(visible(byKey('singapore').querySelector('[data-icon]')))
    assert.deepEqual(
      ['allDestinations', 'asia', 'singapore'].map(rowStyle),
      popupStyles,
      'rail flyouts use the same popup density',
    )
    byKey('singapore').click()
    await example.tick()
    assert.equal(content.querySelector('h3').textContent.trim(), 'Singapore')

    // No hover prerequisite: a touch/click can still open both levels.
    title(byKey('destinations')).click()
    await example.tick()
    title(byKey('asia')).click()
    await example.tick()
    byKey('japan').click()
    await example.tick()
    assert.equal(content.querySelector('h3').textContent.trim(), 'Japan')

    // Moving across the teleported boundaries also leaves their old DOM
    // ancestors. A synthetic hover on just the destination omits that route.
    // Hover may follow keyboard use without any mousedown to change modality.
    doc.body.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'Shift', bubbles: true }),
    )
    await hover(byKey('destinations'))
    const parentPopup = byKey('asia').closest('.el-menu--popup-container')
    byKey('destinations').dispatchEvent(new window.MouseEvent('mouseleave'))
    parentPopup.dispatchEvent(new window.MouseEvent('mouseenter'))
    await hover(byKey('asia'))
    assert.equal(byKey('destinations').getAttribute('aria-expanded'), 'true')
    assert.equal(byKey('asia').getAttribute('aria-expanded'), 'true')
    const childPopup = byKey('singapore').closest('.el-menu--popup-container')
    byKey('asia').dispatchEvent(new window.MouseEvent('mouseleave'))
    parentPopup.dispatchEvent(new window.MouseEvent('mouseleave'))
    childPopup.dispatchEvent(new window.MouseEvent('mouseenter'))
    await new Promise((resolve) => setTimeout(resolve, 400))
    await example.tick()
    assert.equal(byKey('destinations').getAttribute('aria-expanded'), 'true')
    assert.equal(byKey('asia').getAttribute('aria-expanded'), 'true')
    byKey('singapore').click()
    await example.tick()

    // A different popup still counts as outside this navigation menu.
    title(byKey('destinations')).click()
    await example.tick()
    const unrelated = doc.createElement('div')
    unrelated.className = 'el-popper'
    const outside = doc.createElement('button')
    outside.textContent = 'Unrelated action'
    unrelated.append(outside)
    doc.body.append(unrelated)
    byKey('asia').focus()
    await example.tick()
    outside.focus()
    await example.tick()
    assert.equal(byKey('destinations').getAttribute('aria-expanded'), 'false')
    assert.equal(
      doc.activeElement,
      outside,
      'nonmodal popup release must not restore stale trigger focus',
    )
    unrelated.remove()
    assert.deepEqual(Array.from(example.errors), [])
    assert.deepEqual(Array.from(example.warnings), [])
  } finally {
    example?.dispose()
    window.close()
  }
})
