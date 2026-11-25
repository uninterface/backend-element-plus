import { h, nextTick, ref } from 'vue'
import {
  UiField,
  UiSwitch,
  createUiFieldControl,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function exercise() {
  const host = document.createElement('div')
  document.body.append(host)
  const field = createUiFieldControl(false)
  const readonly = ref(false)
  const disabled = ref(false)
  const app = createUiApplication({
    render: () =>
      h(UiField, { field, label: 'Notifications' }, () =>
        h(UiSwitch, { readonly: readonly.value, disabled: disabled.value }),
      ),
  })
  await app.ui.ready
  app.mount(host)
  await nextTick()
  const input = host.querySelector<HTMLInputElement>('input[role=switch]')!
  const checks: Record<string, boolean> = {}
  const key = async (value: string, expected: boolean, repeat = false) => {
    const event = new KeyboardEvent('keydown', {
      key: value,
      repeat,
      bubbles: true,
      cancelable: true,
    })
    input.dispatchEvent(event)
    await nextTick()
    return (
      event.defaultPrevented &&
      field.state.input === expected &&
      input.checked === expected &&
      input.getAttribute('aria-checked') === String(expected)
    )
  }
  try {
    checks.space = await key(' ', true)
    checks.repeat = await key(' ', true, true)
    checks.enter = await key('Enter', false)
    readonly.value = true
    await nextTick()
    checks.readonly = await key(' ', false)
    readonly.value = false
    disabled.value = true
    await nextTick()
    checks.disabled = await key('Enter', false)
    return checks
  } finally {
    app.unmount()
    host.remove()
  }
}
