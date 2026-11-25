<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { useControlSize } from './controlSize'
  import { focusUiTarget } from '@uninterface/uninterface/backend'
  import { useFieldPresentation } from './fieldPresentation'
  import { syncUiTargetAttributes } from '@uninterface/uninterface/backend'
  import { ref, useAttrs, watchPostEffect, onUpdated } from 'vue'
  import { ElCheckbox } from 'element-plus'
  import type { UiCheckboxViewProps } from '@uninterface/uninterface/backend'
  defineOptions({ inheritAttrs: false })
  const presentation = useFieldPresentation(true)
  const props = defineProps<UiCheckboxViewProps>()
  const emit = defineEmits<{ update: [value: boolean] }>()
  const root = ref<HTMLElement>()
  const attrs = useAttrs()
  // ElCheckbox owns a label wrapper. Associations belong to its native input.
  function syncTarget() {
    const input = root.value?.querySelector('input')
    if (!input) return
    input.checked = props.value === true
    input.indeterminate = props.value === 'indeterminate'
    syncUiTargetAttributes(input, {
      ...attrs,
      id: props.binding.id,
      disabled: props.binding.disabled || undefined,
      type: 'checkbox',
      'aria-checked':
        props.value === 'indeterminate' ? 'mixed' : String(props.value),
      'aria-required': props.binding.required || undefined,
      'aria-invalid': props.binding.invalid || undefined,
      'aria-busy': props.binding.validating || undefined,
      'aria-describedby': presentation.describedBy(props.binding),
    })
  }
  watchPostEffect(syncTarget)
  onUpdated(syncTarget)
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => root.value?.querySelector<HTMLInputElement>('input'),
        () => props.binding.disabled,
      ),
  })
  // Keep the native default slot present from creation: Element's cached
  // hasOwnLabel detection must survive post-mount field label coordination.
  const controlSize = useControlSize('UiCheckbox')
</script>
<template>
  <span
    ref="root"
    class="element-checkbox"
    :class="attrs.class"
    :style="attrs.style as any"
  >
    <ElCheckbox
      :size="controlSize"
      :id="binding.id"
      :model-value="value === true"
      :indeterminate="value === 'indeterminate'"
      :disabled="binding.disabled"
      :validate-event="false"
      @update:model-value="emit('update', Boolean($event))"
    >
      <template #default>
        <template v-if="presentation.label.value">
          <span
            v-if="
              presentation.policy?.value.marker === 'required' &&
              presentation.policy.value.markerPosition === 'prefix'
            "
            class="element-required element-required-prefix"
            aria-hidden="true"
          >
            *
          </span>
          {{ presentation.label.value }}
          <span
            v-if="
              presentation.policy?.value.marker === 'required' &&
              presentation.policy.value.markerPosition === 'suffix'
            "
            class="element-required"
            aria-hidden="true"
          >
            *
          </span>
        </template>
      </template>
    </ElCheckbox>
  </span>
</template>
