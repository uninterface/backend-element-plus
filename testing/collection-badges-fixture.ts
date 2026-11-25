import { h, ref } from 'vue'
import { createUiApplication } from '@uninterface/uninterface/setup'
import { ElConfigProvider, ElTag } from 'element-plus'
import Badge from '../src/CollectionQueryBadge.vue'

export async function mountBadges() {
  const removed = ref(0)
  const host = document.createElement('div')
  document.body.append(host)
  const app = createUiApplication({
    render: () =>
      h('main', [
        ...(['small', 'default', 'large'] as const).map((size) =>
          h(
            ElConfigProvider,
            { size },
            {
              default: () =>
                h(
                  'section',
                  {
                    'data-size': size,
                    style:
                      'margin: 20px; display: flex; align-items: start; gap: 16px; flex-wrap: wrap',
                  },
                  [
                    h(
                      ElTag,
                      {
                        type: 'info',
                        closable: true,
                        disableTransitions: true,
                        'data-native': '',
                      },
                      () => 'Native tag',
                    ),
                    h(
                      Badge,
                      {
                        label: 'Amount ascending',
                        removeLabel: 'Remove sort',
                        disabled: false,
                        'data-sort': '',
                        onRemove: () => removed.value++,
                      },
                      () => 'Amount ↑',
                    ),
                    h(
                      Badge,
                      {
                        label: 'Status Open',
                        removeLabel: 'Remove filter',
                        disabled: false,
                        'data-filter': '',
                        onRemove: () => removed.value++,
                      },
                      () => 'Status: Open',
                    ),
                    h(
                      Badge,
                      {
                        label: 'Long filter summary',
                        removeLabel: 'Remove long filter',
                        disabled: false,
                        'data-long': '',
                        style: 'max-width: 110px',
                      },
                      () => 'A long customer filter with several words to wrap',
                    ),
                    h(
                      Badge,
                      {
                        label: 'Disabled filter',
                        removeLabel: 'Remove disabled filter',
                        disabled: true,
                        'data-disabled': '',
                      },
                      () => 'Disabled',
                    ),
                  ],
                ),
            },
          ),
        ),
        h('output', { 'data-removals': '' }, String(removed.value)),
      ]),
  })
  await app.ui.ready
  app.mount(host)
}
