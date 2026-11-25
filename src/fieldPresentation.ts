import {
  computed,
  inject,
  onScopeDispose,
  onMounted,
  provide,
  reactive,
  toRefs,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue'
import { useUiFieldStrategyContext } from '@uninterface/uninterface/backend'
import type { UiFieldViewBinding } from '@uninterface/uninterface/backend'
import { formContextKey, type FormContext } from 'element-plus'

const originalForms = new WeakMap<FormContext, FormContext>()

/** FormItem gates messages on both its prop and Form context. Give the native
 * view resolved visibility while descendants resolve from original defaults. */
export function useFieldFormContext(showMessages: () => boolean) {
  const inherited = inject(formContextKey, undefined)
  if (!inherited) return undefined
  const original = originalForms.get(inherited) ?? inherited
  const view = reactive({
    ...toRefs(original),
    showMessage: computed(showMessages),
  })
  originalForms.set(view, original)
  provide(formContextKey, view)
  return original
}

export const fieldPresentationKey: InjectionKey<{
  binding: ComputedRef<UiFieldViewBinding>
  errorVisible: Ref<boolean>
  checkboxLabel: ComputedRef<boolean>
  registerCheckbox(): () => void
}> = Symbol('element-field-presentation')

export function useFieldPresentation(checkbox = false) {
  const policy = useUiFieldStrategyContext()
  const field = inject(fieldPresentationKey, undefined)
  let release: (() => void) | undefined
  onMounted(() => {
    if (checkbox && field) release = field.registerCheckbox()
  })
  onScopeDispose(() => release?.())
  const label = computed(() =>
    checkbox && field?.checkboxLabel.value
      ? field.binding.value.label
      : undefined,
  )
  function labelledBy(binding: { id: string }, attrs: Record<string, unknown>) {
    // Name editors from label text, excluding FormItem's generated asterisk.
    // Explicit consumer names take precedence; groups name their own editors.
    if (attrs['aria-labelledby'] !== undefined)
      return attrs['aria-labelledby'] as string
    if (attrs['aria-label'] !== undefined) return undefined
    const owner = field?.binding.value
    return owner &&
      !owner.group &&
      !field?.checkboxLabel.value &&
      owner.id === binding.id
      ? `${owner.id}-label`
      : undefined
  }
  function describedBy(binding: { id: string; describedBy?: string }) {
    const result =
      binding.describedBy
        ?.split(/\s+/)
        .filter(
          (id) =>
            !(
              policy?.value.help === 'replace-help' &&
              policy.value.issue &&
              id === `${binding.id}-help`
            ),
        )
        .filter(
          (id) =>
            id !== `${binding.id}-issue` ||
            !field ||
            (policy?.value.showFailure !== false &&
              field.binding.value.issue &&
              (policy?.value.failure === 'show-tooltip' ||
                field.errorVisible.value)),
        )
        .join(' ') || undefined
    return result
  }
  return { field, label, labelledBy, describedBy, policy }
}
