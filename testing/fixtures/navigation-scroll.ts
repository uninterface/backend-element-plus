import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
import { h, nextTick, ref } from 'vue'
import {
  UiApp,
  UiNavMenu,
  createUiEntryControl,
  type UiEntry,
  type UiNavMenuPresentation,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountNavigationScroll(
  mode: UiNavMenuPresentation,
  count = 40,
) {
  const destinations = (prefix: string): UiEntry[] =>
    Array.from({ length: count }, (_, i) => ({
      key: `${prefix}-${i}`,
      label: `${prefix} destination ${i}`,
      href: `#${prefix}-${i}`,
    }))
  const children = destinations('Root')
  const nested = destinations('Nested')
  if (count > 12) {
    nested[12] = {
      kind: 'submenu',
      key: 'third',
      label: 'Third level',
      children: [{ key: 'last', label: 'Final destination', href: '#last' }],
    }
    children[12] = {
      kind: 'submenu',
      key: 'nested',
      label: 'Nested destinations',
      children: nested,
    }
  }
  const entries = createUiEntryControl([
    { kind: 'submenu', key: 'root', label: 'Destinations', children },
  ])
  const current = ref<string>()
  const presentation = ref(mode)
  const headerTop = ref(0)
  const errors: string[] = []
  const host = document.createElement('div')
  document.body.append(host)
  const app = createUiApplication({
    render: () =>
      h(UiApp, {}, () => [
        h('div', { style: { height: `${headerTop.value}px` } }),
        h('header', { style: 'position:sticky;top:0' }, [
          h(UiNavMenu, {
            control: entries,
            presentation: presentation.value,
            modelValue: current.value,
            'aria-label': 'Scroll navigation',
            onActivate(key: string) {
              current.value = key
            },
          }),
        ]),
        h('main', { style: 'height:2200px' }, [
          h(
            'button',
            {
              type: 'button',
              style: 'margin-inline-start:calc(100% - 180px);width:180px',
            },
            'Outside navigation',
          ),
          h('output', { 'data-current': '' }, current.value),
        ]),
      ]),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  app.mount(host)
  await nextTick()
  return {
    errors,
    async mode(value: UiNavMenuPresentation) {
      presentation.value = value
      await nextTick()
    },
    async headerTop(value: number) {
      headerTop.value = value
      await nextTick()
    },
    dispose() {
      app.unmount()
      entries.dispose()
      host.remove()
    },
  }
}
