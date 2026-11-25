import { h, ref, nextTick } from 'vue'
import {
  UiDateInput,
  UiDateTimeInput,
  UiTimeInput,
  createUiDateControl,
  createUiDateTimeControl,
  createUiTimeControl,
} from '@uninterface/uninterface'
import { createUiResponsive } from '@uninterface/uninterface/responsive'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mount() {
  const disabled = ref(false),
    readonly = ref(false),
    mobile = ref('desktop')
  const format = ref<'YMD' | 'DMY' | 'MDY'>('YMD')
  const options = {
    range: true,
    allowOpenStart: true,
    allowOpenEnd: true,
    allowUnrestricted: true,
  }
  const controls = {
    date: createUiDateControl(
      { start: '2026-03-02', end: '2026-03-04' },
      { ...options, allowed: (value) => value !== '2026-03-16' },
    ),
    datetime: createUiDateTimeControl(
      { start: '2026-03-02T09:05', end: '2026-03-04T17:10' },
      options,
    ),
    precise: createUiDateTimeControl(
      { start: '2026-03-02T09:05:12.123', end: '2026-03-04T17:10:34.456' },
      { ...options, precision: 'millisecond' },
    ),
    time: createUiTimeControl({ start: '22:00', end: '02:00' }, options),
  }
  const errors: string[] = []
  const app = createUiApplication({
    render: () =>
      h(
        'main',
        Object.entries(controls).map(([name, control]) =>
          h('section', { 'data-case': name }, [
            h(
              name === 'date'
                ? UiDateInput
                : name === 'time'
                  ? UiTimeInput
                  : UiDateTimeInput,
              {
                binding: Object.values(control.bindings)[0],
                'aria-label': name,
                dateFormatWish: format.value,
                disabled: disabled.value,
                readonly: readonly.value,
              },
            ),
          ]),
        ),
      ),
  })
  app.use(createUiResponsive(mobile))
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  const host = document.createElement('div')
  document.body.append(host)
  app.mount(host)
  const tick = async () => {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 80))
    await nextTick()
  }
  await tick()
  return {
    host,
    controls,
    errors,
    tick,
    async format(value: 'YMD' | 'DMY' | 'MDY') {
      format.value = value
      await tick()
    },
    async mobile(value: boolean) {
      mobile.value = value ? 'mobile' : 'desktop'
      await tick()
    },
    async disabled(value: boolean) {
      disabled.value = value
      await tick()
    },
    async readonly(value: boolean) {
      readonly.value = value
      await tick()
    },
    dispose() {
      app.unmount()
      Object.values(controls).forEach((control) => control.dispose())
      host.remove()
    },
  }
}
