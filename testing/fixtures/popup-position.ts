import { defineComponent, h, inject, nextTick, ref, type VNode } from 'vue'
import {
  ElTooltip,
  POPPER_INJECTION_KEY,
  type ElPopperInjectionContext,
} from 'element-plus'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mount() {
  let popper: ElPopperInjectionContext | undefined
  const probe = defineComponent({
    setup() {
      const context = inject(POPPER_INJECTION_KEY)!
      // Expose native measured state to the backend regression, not the app.
      popper = context
      return () => h('span', 'Popup content')
    },
  })
  const tooltip = ref<InstanceType<typeof ElTooltip>>()
  const visible = ref(true)
  const host = document.createElement('div')
  document.body.append(host)
  const app = createUiApplication({
    render: () =>
      h(
        ElTooltip,
        {
          ref: tooltip,
          visible: visible.value,
          persistent: false,
          placement: 'right-start',
          showArrow: false,
        },
        {
          default: () => h('button', { 'data-reference': '' }, 'Open'),
          content: () => h(probe),
        },
      ),
  })
  await app.ui.ready
  app.mount(host)
  async function tick() {
    await nextTick()
    await Promise.resolve()
    await nextTick()
  }
  await tick()
  return {
    tick,
    rects: () => popper?.popperInstanceRef.value?.state.rects,
    shown() {
      // JSDOM has no CSS transitions; deliver the native Transition callback.
      const content = tooltip.value!.contentRef!
      const queue: VNode[] = [content.$.subTree]
      while (queue.length) {
        const vnode = queue.shift()!
        if (vnode.props?.onAfterEnter) {
          vnode.props.onAfterEnter()
          return
        }
        if (Array.isArray(vnode.children))
          queue.push(
            ...(vnode.children.filter(
              (child) => typeof child === 'object',
            ) as VNode[]),
          )
      }
      throw new Error('Native tooltip entrance callback not found.')
    },
    async close() {
      visible.value = false
      await tick()
    },
    dispose() {
      app.unmount()
      host.remove()
    },
  }
}
