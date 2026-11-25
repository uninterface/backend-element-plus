import { defineComponent, h, nextTick, ref } from 'vue'
import {
  createUiListControl,
  UiTable,
  UiTableColumn,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountSorting(mode: 'single' | 'multiple' = 'multiple') {
  const disabled = ref(false)
  const shown = ref(true)
  const sortable = ref(true)
  const filterable = ref(true)
  const amountWidth = ref<number | 'content'>()
  const amountLabel = ref('Amount')
  const amountAlign = ref<'left' | 'center' | 'right'>('left')
  const scroll = ref<'none' | 'horizontal'>('none')
  let reads = 0
  const errors: string[] = []
  const items = [
    { id: 'z', name: 'Zulu', amount: 2 },
    { id: 'a', name: 'Alpha', amount: 1 },
  ]
  const control = createUiListControl<
    (typeof items)[number],
    { term: string },
    'name' | 'amount' | 'external'
  >({
    itemKey: (item) => item.id,
    sorting: { mode, keys: ['name', 'amount', 'external'] },
    disabled: () => disabled.value,
    query: { filters: { term: 'kept' }, sort: [] },
    source() {
      reads++
      return { items, complete: true }
    },
  })
  await control.refresh()
  const Draft = defineComponent({
    setup() {
      const value = ref('draft')
      return () =>
        h('input', {
          'aria-label': 'Draft',
          value: value.value,
          onInput: (event: Event) => {
            value.value = (event.target as HTMLInputElement).value
          },
        })
    },
  })
  const host = document.createElement('div')
  host.style.width = '900px'
  document.body.append(host)
  const app = createUiApplication({
    render: () =>
      shown.value
        ? h(
            UiTable,
            {
              binding: control.bindings.list,
              ariaLabel: 'Sort records',
              scroll: scroll.value,
            },
            {
              default: () => [
                h(
                  UiTableColumn,
                  {
                    columnKey: 'name',
                    label: 'Name',
                    sortBy: sortable.value ? 'name' : undefined,
                  },
                  {
                    default: ({ item }: any) => item.name,
                    filter: filterable.value
                      ? () =>
                          h('button', { 'data-filter-action': '' }, 'Filter')
                      : undefined,
                  },
                ),
                h(
                  UiTableColumn,
                  {
                    columnKey: 'amount',
                    label: amountLabel.value,
                    sortBy: sortable.value ? 'amount' : undefined,
                    preferredWidth: amountWidth.value,
                    minWidth:
                      amountWidth.value === 'content' ? 'content' : undefined,
                    spring: amountWidth.value === undefined,
                    align: amountAlign.value,
                  },
                  { default: ({ item }: any) => String(item.amount) },
                ),
                h(
                  UiTableColumn,
                  { columnKey: 'draft', label: 'Notes' },
                  { default: () => h(Draft) },
                ),
              ],
            },
          )
        : null,
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  await app.ui.ready
  await app.ui.ready
  await app.ui.i18n.loadNamespace('uninterface.collections')
  await app.ui.i18n.loadNamespace('uninterface.entries')
  app.mount(host)
  const tick = async () => {
    for (let i = 0; i < 15; i++) await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 30))
  }
  await tick()
  return {
    host,
    control,
    disabled,
    shown,
    sortable,
    filterable,
    amountWidth,
    amountLabel,
    amountAlign,
    scroll,
    errors,
    tick,
    reads: () => reads,
    dispose() {
      app.unmount()
      control.dispose()
      app.ui.dispose()
      host.remove()
    },
  }
}
