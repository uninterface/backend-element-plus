import {
  computed,
  inject,
  provide,
  type ComputedRef,
  type InjectionKey,
} from 'vue'
import { useGlobalConfig } from 'element-plus'
import {
  useUiStrategy,
  uiControlSizeQuery,
} from '@uninterface/uninterface/backend'
const strategySizeKey: InjectionKey<ComputedRef<boolean>> = Symbol(
  'element-field-strategy-size',
)
export function useControlSize(component: string) {
  const inherited = inject(
    strategySizeKey,
    computed(() => false),
  )
  const globalSize = useGlobalConfig('size')
  const result = useUiStrategy(uiControlSizeQuery, [-2, -1, 0, 1, 2])
  if (component === 'UiField') {
    provide(
      strategySizeKey,
      computed(() => result.value.status === 'answered' || inherited.value),
    )
  }
  return computed(() =>
    result.value.status === 'answered'
      ? ({ '-1': 'small', '0': 'default', '1': 'large' } as const)[
          Math.max(-1, Math.min(1, result.value.value)) as -1 | 0 | 1
        ]
      : // A query barrier must also stop native FormItem size inheritance.
        inherited.value
        ? globalSize.value || 'default'
        : undefined,
  )
}
