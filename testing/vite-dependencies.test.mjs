import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { optimizeDeps, resolveConfig } from 'vite'
import { backendConfig } from './fixture-build.mjs'
import backendPlugins from '../src/vite.mjs'

test('Element Plus dev dependencies load as ESM and retain native lifecycle repairs', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'uninterface-element-deps-'))
  try {
    const config = await resolveConfig(
      {
        ...backendConfig(),
        cacheDir,
        logLevel: 'silent',
        optimizeDeps: {
          entries: [
            fileURLToPath(new URL('./fixtures/menu.ts', import.meta.url)),
          ],
        },
      },
      'serve',
    )
    // Exercise Vite's real scanner/prebundler without opening a listening socket.
    // Keep the isolated cache separate from application and browser-test artifacts.
    const metadata = await optimizeDeps(config, true)
    const entry = metadata.optimized['element-plus']
    assert.ok(
      entry,
      'the toolkit must be prebundled with its CommonJS dependencies',
    )
    const toolkit = await import(pathToFileURL(entry.file).href)
    assert.ok(toolkit.ElInput)
    assert.ok(toolkit.ElDatePicker)
    assert.ok(toolkit.ElMenu)
    const code = (
      await Promise.all(
        [
          ...Object.values(metadata.optimized),
          ...Object.values(metadata.chunks),
        ].map(({ file }) => readFile(file, 'utf8')),
      )
    ).join('\n')
    assert.match(code, /inputId = ref\w*\(props.id\)/)
    assert.match(code, /newId !== inputId.value \|\| !idUnwatch/)
    assert.match(
      code,
      /useResizeObserver\w*\(contentRef\w*, update\w*\)\.stop;\s*\}, \{ immediate: true \}\)/,
    )
    assert.match(
      code,
      /onAfterShow\w* = \(\) => \{\s*contentRef\w*\.value\?\.updatePopper\?\.\(\);/,
    )
    assert.match(
      code,
      /props\.popperClass === "element-navigation-popup" \? \[\] : \["right-start", "left-start"\]/,
    )
    assert.match(code, /appendTo: props\.appendTo/)
  } finally {
    await rm(cacheDir, { recursive: true, force: true })
  }
})

test('Element Plus identity transform still guards ordinary builds and toolkit upgrades', async () => {
  const path = fileURLToPath(
    new URL(
      '../node_modules/element-plus/es/components/form/src/hooks/use-form-item.mjs',
      import.meta.url,
    ),
  )
  const original = await readFile(path, 'utf8')
  const plugin = backendPlugins()
  const transformed = plugin.transform(original, path)
  assert.ok(transformed)
  assert.match(transformed.code, /const inputId = ref\(props.id\);/)
  assert.match(transformed.code, /newId !== inputId.value \|\| !idUnwatch/)
  assert.throws(
    () =>
      plugin.transform(
        original.replace(
          'const inputId = ref();',
          'const inputId = shallowRef();',
        ),
        path,
      ),
    /Review Element Plus input identity integration/,
  )
  assert.equal(
    plugin.transform(original, '/application/example.mjs'),
    undefined,
  )
})

test('Element Plus popup lifecycle transforms reject incompatible toolkit changes', async () => {
  const plugin = backendPlugins()
  for (const [file, originalCall, error] of [
    [
      'menu/src/sub-menu.mjs',
      'teleported: appendToBody.value,',
      /Review Element Plus submenu host integration/,
    ],
    [
      'menu/src/sub-menu.mjs',
      '"top-end",\n\t\t\t"right-start",\n\t\t\t"left-start"',
      /Review Element Plus header navigation placement/,
    ],
    [
      'popper/src/composables/use-content.mjs',
      'useResizeObserver(contentRef, update).stop',
      /Review Element Plus initial popup observation/,
    ],
    [
      'tooltip/src/content.vue_vue_type_script_setup_true_lang.mjs',
      'const onAfterShow = () => {',
      /Review Element Plus popup entrance positioning/,
    ],
  ]) {
    const path = fileURLToPath(
      new URL(
        `../node_modules/element-plus/es/components/${file}`,
        import.meta.url,
      ),
    )
    const original = await readFile(path, 'utf8')
    assert.notEqual(plugin.transform(original, path).code, original)
    assert.throws(
      () =>
        plugin.transform(
          original.replace(originalCall, 'changed upstream'),
          path,
        ),
      error,
    )
  }
})
