import { h, nextTick, ref } from 'vue'
import UiUploadProgress from '../../src/UiUploadProgress.vue'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mount() {
  const host = document.createElement('div')
  document.body.append(host)
  const progress = ref<{ loaded: number; total: number | null }>({
    loaded: 1,
    total: 3,
  })
  const app = createUiApplication({
    render: () =>
      h(UiUploadProgress, {
        ...progress.value,
        bar: {
          color: 'primary',
          label: 'Upload in progress',
          value: progress.value.total ? progress.value.loaded : null,
          max: progress.value.total || 100,
          fraction: progress.value.total
            ? progress.value.loaded / progress.value.total
            : null,
        },
        active: true,
        fileName: 'sample.txt',
        issue: null,
        retryLabel: 'Retry',
        canRetry: false,
        retryDisabled: false,
        async retry() {},
        label: 'Upload in progress',
        announcement: 'off',
        canCancel: false,
        cancelLabel: 'Cancel',
        cancelAccessibleLabel: 'Cancel upload',
        async cancel() {},
      }),
  })
  await app.ui.ready
  app.mount(host)
  return {
    host,
    progress,
    tick: nextTick,
    locale(locale: string) {
      app.ui.i18n.setFormattingLocale(locale)
    },
    dispose() {
      app.unmount()
      host.remove()
    },
  }
}
