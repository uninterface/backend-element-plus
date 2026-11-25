import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Element Plus lazy submenu focus survives root popup transition completion', async () => {
  const result = await build({
    logLevel: 'silent',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env': '{}',
    },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(new URL('./fixtures/menu.ts', import.meta.url)),
        formats: ['iife'],
        name: 'MenuFixture',
      },
    },
  })
  const code = (Array.isArray(result) ? result : [result])
    .flatMap((result) => result.output)
    .find((output) => output.type === 'chunk').code
  const outputs = (Array.isArray(result) ? result : [result]).flatMap(
    (result) => result.output,
  )
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  try {
    installDomEnvironment(dom.window)
    for (const asset of outputs.filter((item) =>
      item.fileName.endsWith('.css'),
    )) {
      const style = dom.window.document.createElement('style')
      style.textContent = String(asset.source)
      dom.window.document.head.append(style)
    }
    dom.window.eval(code)
    const fixture = await dom.window.MenuFixture.mountMenu()
    const settle = async () => {
      await fixture.tick()
      await new Promise((resolve) => setTimeout(resolve, 40))
    }
    const { document, KeyboardEvent } = dom.window
    const key = (value) =>
      document.activeElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: value,
          bubbles: true,
          cancelable: true,
        }),
      )
    await settle()
    const root = document.querySelector('[role=menu][aria-label="Commands"]')
    assert.ok(root.classList.contains('el-menu'))
    assert.match(root.className, /element-command-menu/)
    assert.match(root.closest('.el-popper').className, /element-command-popup/)
    const refresh = root.querySelector('[data-entry-key=refresh]')
    assert.equal(refresh.tagName, 'LI')
    const refreshStyle = dom.window.getComputedStyle(refresh)
    assert.equal(refreshStyle.minHeight, '32px')
    assert.equal(refreshStyle.lineHeight, '22px')
    assert.equal(refreshStyle.paddingBlock, '5px')
    assert.equal(refreshStyle.paddingInline, '16px')
    for (const name of ['refresh', 'checked', 'ordinary', 'more'])
      assert.ok(
        root.querySelector(`[data-entry-key="${name}"] .element-entry-check`),
        `${name}: checks and ordinary entries share a column through groups`,
      )
    const more = root.querySelector('[data-entry-key=more]')
    for (let step = 0; step < 3; step++) key('ArrowDown')
    assert.equal(document.activeElement, more)
    assert.equal(
      dom.window.getComputedStyle(more).outline,
      'none',
      'submenu LI does not add an outline outside its highlighted title',
    )
    fixture.shown()
    await settle()
    assert.equal(
      document.activeElement,
      more,
      'late root show must retain an already focused root item',
    )
    key('ArrowRight')
    await settle()
    const branch = document.querySelector('[role=menu][aria-label="More"]')
    assert.ok(branch)
    assert.equal(
      branch
        .querySelector('.el-select-dropdown__empty[role=status]')
        ?.textContent.trim(),
      'Loading',
    )
    assert.match(branch.className, /element-command-menu/)
    assert.match(
      branch.closest('.el-popper').className,
      /element-command-popup/,
    )
    assert.equal(
      document.activeElement,
      branch,
      'loading branch receives keyboard focus once mounted',
    )
    fixture.shown()
    await settle()
    assert.equal(
      document.activeElement,
      branch,
      'late root show must retain teleported branch focus',
    )
    await fixture.finish()
    await settle()
    assert.equal(
      document.activeElement,
      branch,
      'source completion does not move the keyboard cursor',
    )
    key('ArrowDown')
    const archive = branch.querySelector('[data-entry-key=archive]')
    assert.equal(document.activeElement, archive)
    fixture.shown()
    await settle()
    assert.equal(document.activeElement, archive)
    assert.equal(
      archive.querySelector('.element-entry-check'),
      null,
      'a separate popup without checked entries does not reserve a check column',
    )
    key('ArrowDown')
    const organize = branch.querySelector('[data-entry-key=organize]')
    assert.equal(document.activeElement, organize)
    assert.equal(dom.window.getComputedStyle(organize).outline, 'none')
    organize.click()
    await settle()
    const third = document.querySelector('[role=menu][aria-label=Organize]')
    const tag = third.querySelector('[data-entry-key=tag]')
    assert.equal(
      document.activeElement,
      tag,
      'explicit command click enters the branch',
    )
    assert.match(third.className, /element-command-menu/)
    assert.match(third.closest('.el-popper').className, /element-command-popup/)
    assert.equal(dom.window.getComputedStyle(tag).lineHeight, '22px')
    assert.equal(dom.window.getComputedStyle(tag).paddingInline, '16px')
    more.dispatchEvent(new dom.window.MouseEvent('mouseenter'))
    tag.dispatchEvent(new dom.window.MouseEvent('mouseenter'))
    await new Promise((resolve) => setTimeout(resolve, 450))
    await settle()
    assert.equal(
      document.activeElement,
      tag,
      'pointer travel does not take focus from level three',
    )
    assert.equal(organize.getAttribute('aria-expanded'), 'true')
    key('Escape')
    await settle()
    assert.equal(document.activeElement, organize)
    key('Escape')
    await settle()
    assert.equal(document.activeElement, more)
    assert.equal(more.getAttribute('aria-expanded'), 'false')
    assert.deepEqual(Array.from(fixture.errors), [])
    fixture.dispose()
    const setViewport = (width, height) => {
      Object.defineProperty(dom.window, 'innerWidth', {
        configurable: true,
        value: width,
      })
      Object.defineProperty(dom.window, 'innerHeight', {
        configurable: true,
        value: height,
      })
      dom.window.dispatchEvent(new dom.window.Event('resize'))
    }
    setViewport(1280, 900)
    const contextFixture = await dom.window.MenuFixture.mountMenu({
      x: 1000,
      y: 700,
    })
    const settleContext = async () => {
      await contextFixture.tick()
      await new Promise((resolve) => setTimeout(resolve, 80))
    }
    await settleContext()
    const retainedRoot = document.querySelector(
      '[role=menu][aria-label="Commands"]',
    )
    const focused = document.activeElement
    for (const [width, height, x, y] of [
      [1280, 900, 1000, 700],
      [400, 300, 400, 300],
      [800, 600, 800, 600],
      [1280, 900, 1000, 700],
    ]) {
      setViewport(width, height)
      await settleContext()
      const rect = contextFixture.positionedReference()
      assert.equal(
        rect.x,
        x,
        'native positioning consumes the viewport-constrained x',
      )
      assert.equal(
        rect.y,
        y,
        'native positioning consumes the viewport-constrained y',
      )
      assert.equal(
        document.querySelector('[role=menu][aria-label="Commands"]'),
        retainedRoot,
      )
      assert.equal(
        document.activeElement,
        focused,
        'resize does not take focus or remount',
      )
    }
    assert.deepEqual(Array.from(contextFixture.errors), [])
    contextFixture.dispose()
    setViewport(500, 400)
    await new Promise((resolve) => setTimeout(resolve, 40))
    assert.equal(
      document.querySelector('[role=menu][aria-label="Commands"]'),
      null,
    )
  } finally {
    dom.window.close()
  }
})
