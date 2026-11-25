import '@uninterface/backend/font.css'
import '@uninterface/backend/style.css'
import { defineComponent, h, nextTick, reactive, Fragment } from 'vue'
import {
  UiNotice,
  UiButton,
  UiStrategy,
  uiButtonVariant,
  uiControlSize,
  type UiControlSize,
  type UiButtonVariant,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountNoticeActions() {
  const state = reactive({
    title: 'Action defaults',
    body: 'Message content',
    bodyAction: true,
    showActions: true,
    variant: undefined as UiButtonVariant | undefined,
    strategy: undefined as UiButtonVariant | undefined,
    loading: false,
    disabled: false,
    clicks: 0,
    reversed: false,
    size: 0 as UiControlSize,
    custom: false,
  })
  const button = (label: string, variant?: UiButtonVariant) =>
    h(UiButton, { variant }, () => label)
  const OpaqueActions = defineComponent({
    setup: () => () => button('Opaque action'),
  })
  const host = document.createElement('div')
  document.body.append(host)
  const app = createUiApplication({
    setup: () => () =>
      h(
        UiStrategy,
        {
          use: [
            uiControlSize(state.size),
            ...(state.strategy ? [uiButtonVariant(state.strategy)] : []),
          ],
        },
        () => [
          h(
            UiNotice,
            {
              title: state.title,
              id: 'notice-action-alignment',
              kind: state.custom ? 'custom' : 'info',
            },
            {
              default: () => [
                h('div', { 'data-message-start': '' }, state.body),
                state.bodyAction ? button('Body action') : null,
              ],
              actions: state.showActions
                ? () => {
                    const actions = [
                      h(
                        UiButton,
                        {
                          key: 'retry',
                          variant: state.variant,
                          loading: state.loading,
                          disabled: state.disabled,
                          onClick: () => state.clicks++,
                        },
                        () => 'Retry',
                      ),
                      h(
                        UiButton,
                        { key: 'explicit', variant: 'outline' },
                        () => 'Explicit action',
                      ),
                    ]
                    return [
                      h(Fragment, state.reversed ? actions.reverse() : actions),
                      h(OpaqueActions),
                    ]
                  }
                : undefined,
            },
          ),
          button('Outside action'),
          button('Text reference', 'text'),
          button('Outline reference', 'outline'),
          button('Soft reference', 'soft'),
        ],
      ),
  })
  app.mount(host)
  await app.ui.ready
  await nextTick()
  return {
    host,
    state,
    async update(value: Record<string, unknown>) {
      Object.assign(state, value)
      await nextTick()
    },
    dispose() {
      app.unmount()
      host.remove()
    },
  }
}

declare global {
  interface Window {
    elementNoticeActions: Awaited<ReturnType<typeof mountNoticeActions>>
  }
}

void mountNoticeActions().then((fixture) => {
  window.elementNoticeActions = fixture
})
