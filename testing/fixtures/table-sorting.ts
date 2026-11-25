import '@uninterface/backend/style.css'
import { h, ref } from 'vue'
import {
  createUiListControl,
  UiTable,
  UiTableColumn,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

async function mountSortingTable() {
  const items = [
    { id: 'z', name: 'Zulu', amount: 2 },
    { id: 'a', name: 'Alpha', amount: 1 },
  ]
  const control = createUiListControl<
    (typeof items)[number],
    Record<string, never>,
    'name' | 'amount'
  >({
    itemKey: (item) => item.id,
    sorting: { mode: 'multiple', keys: ['name', 'amount'] },
    query: { filters: {}, sort: [] },
    source: () => ({ items, complete: true }),
  })
  const amountWidth = ref<number | 'content'>()
  const amountLabel = ref('Amount')
  const amountAlign = ref<'left' | 'center' | 'right'>('left')
  const app = createUiApplication({
    render: () =>
      h(
        UiTable,
        { binding: control.bindings.list, ariaLabel: 'Sort records' },
        {
          default: () => [
            h(
              UiTableColumn,
              { columnKey: 'name', label: 'Name', sortBy: 'name' },
              {
                default: ({ item }: { item: (typeof items)[number] }) =>
                  item.name,
              },
            ),
            h(
              UiTableColumn,
              {
                columnKey: 'amount',
                label: amountLabel.value,
                sortBy: 'amount',
                preferredWidth: amountWidth.value,
                minWidth:
                  amountWidth.value === 'content' ? 'content' : undefined,
                spring: amountWidth.value === undefined,
                align: amountAlign.value,
              },
              {
                default: ({ item }: { item: (typeof items)[number] }) =>
                  String(item.amount),
              },
            ),
          ],
        },
      ),
  })
  await app.ui.ready
  await control.refresh()
  const host = document.body.appendChild(document.createElement('div'))
  host.style.width = '900px'
  app.mount(host)
  return { amountWidth, amountLabel, amountAlign }
}

declare global {
  interface Window {
    elementSortingFixture: Awaited<ReturnType<typeof mountSortingTable>>
  }
}

void mountSortingTable().then((fixture) => {
  window.elementSortingFixture = fixture
})
