import { h, isVNode, nextTick, ref } from 'vue'
import '../../src/style.css'
import { createUiApplication } from '@uninterface/uninterface/setup'
import EntryPopup from '../../src/EntryPopup.vue'
import NativeMenu from '../../src/NativeMenu.vue'
import type { UiEntryViewNode } from '@uninterface/uninterface/backend'

export async function mountMenu(point?: { x: number; y: number }) {
  const host = document.createElement('div')
  const anchor = document.createElement('button')
  anchor.textContent = 'Commands'
  host.append(anchor)
  document.body.append(host)
  const mount = document.createElement('div')
  host.append(mount)
  const expanded = ref(false)
  const nestedExpanded = ref(false)
  const pending = ref(true)
  const popup = ref<InstanceType<typeof EntryPopup>>()
  const errors: string[] = []
  const status = () => ({
    pending: pending.value,
    failed: false,
    message: pending.value ? 'Awaiting commands' : '',
    retryLabel: 'Retry',
  })
  const entries = (): UiEntryViewNode[] => [
    { entry: { key: 'refresh', label: 'Refresh' } },
    {
      entry: { kind: 'group', key: 'options', label: 'Options', entries: [] },
      children: [
        {
          entry: { key: 'checked', label: 'Checked' },
          selectionMode: 'multiple',
          selected: true,
        },
        { entry: { key: 'ordinary', label: 'Ordinary' } },
      ],
    },
    {
      entry: { kind: 'submenu', key: 'more', label: 'More', children: [] },
      expanded: expanded.value,
      status: status(),
      children: pending.value
        ? []
        : [
            { entry: { key: 'archive', label: 'Archive' } },
            {
              entry: {
                kind: 'submenu',
                key: 'organize',
                label: 'Organize',
                children: [],
              },
              expanded: nestedExpanded.value,
              children: [{ entry: { key: 'tag', label: 'Tag' } }],
            },
          ],
    },
  ]
  const app = createUiApplication({
    render: () =>
      h(
        EntryPopup,
        { ref: popup, anchor, point },
        {
          default: () =>
            h(NativeMenu, {
              entries: entries(),
              status: {
                pending: false,
                failed: false,
                message: '',
                retryLabel: 'Retry',
              },
              label: 'Commands',
              popup: true,
              onExpand: (key: string, open: boolean) => {
                if (key === 'organize') nestedExpanded.value = open
                else expanded.value = open
              },
            }),
        },
      ),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  app.mount(mount)
  await nextTick()
  return {
    errors,
    positionedReference() {
      // Read the actual native Popper result, not just the adapter's getter.
      const queue = [popup.value!.$.subTree]
      while (queue.length) {
        const vnode = queue.shift()!
        const native = vnode.component?.exposed as any
        if (native?.popperRef?.value?.popperInstanceRef) {
          const rect =
            native.popperRef.value.popperInstanceRef.state.rects.reference
          return { x: rect.x, y: rect.y }
        }
        if (Array.isArray(vnode.children))
          queue.push(...vnode.children.filter(isVNode))
      }
      throw new Error('Native tooltip positioning state not found.')
    },
    tick: nextTick,
    // Deliver ElTooltip's transition-completion event at a controlled point.
    // jsdom has no CSS transitions; this tests the adapter's native event path.
    shown() {
      const queue = [popup.value!.$.subTree]
      while (queue.length) {
        const vnode = queue.shift()!
        if (vnode.component && vnode.props?.onShow) {
          vnode.component.emit('show')
          return
        }
        if (Array.isArray(vnode.children))
          queue.push(...vnode.children.filter(isVNode))
      }
      throw new Error('Native tooltip transition event not found.')
    },
    async finish() {
      pending.value = false
      await nextTick()
    },
    dispose() {
      app.unmount()
      host.remove()
    },
  }
}
