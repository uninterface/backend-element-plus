<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { ref, useAttrs, watchPostEffect, onUpdated } from 'vue'
  import { ElSwitch } from 'element-plus'
  import {
    focusUiTarget,
    syncUiTargetAttributes,
    type UiSwitchViewProps,
  } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { useFieldPresentation } from './fieldPresentation'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiSwitchViewProps>()
  const emit = defineEmits<{ update: [value: boolean] }>()
  const presentation = useFieldPresentation(true)
  const element = ref<InstanceType<typeof ElSwitch>>()
  const attrs = useAttrs()
  const size = useControlSize('UiSwitch')
  function keydown(event: KeyboardEvent) {
    if (
      !(event.target instanceof HTMLInputElement) ||
      ![' ', 'Enter'].includes(event.key) ||
      event.isComposing
    )
      return
    // ElSwitch cancels a native checkbox click after publishing model state.
    // Handle keyboard activation before the browser's checkbox default action.
    event.preventDefault()
    event.stopPropagation()
    if (!event.repeat && !props.binding.disabled && !props.readonly)
      emit('update', !props.value)
  }
  function sync() {
    const target = element.value?.$el?.querySelector('input')
    if (target)
      syncUiTargetAttributes(target, {
        ...attrs,
        id: props.binding.id,
        role: 'switch',
        'aria-checked': String(props.value),
        'aria-readonly': props.readonly || undefined,
        'aria-labelledby': presentation.label.value
          ? `${props.binding.id}-switch-label`
          : presentation.labelledBy(props.binding, attrs),
        'aria-required': props.binding.required || undefined,
        'aria-invalid': props.binding.invalid || undefined,
        'aria-describedby': presentation.describedBy(props.binding),
        'aria-busy': props.binding.validating || undefined,
      })
  }
  watchPostEffect(sync)
  onUpdated(sync)
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => element.value?.$el?.querySelector('input'),
        () => props.binding.disabled,
      ),
  })
</script>
<template>
  <span
    class="element-switch-field"
    @keydown.capture="keydown"
    :class="attrs.class"
    :style="attrs.style as any"
  >
    <ElSwitch
      ref="element"
      :id="binding.id"
      :size="size"
      :model-value="value"
      :disabled="binding.disabled"
      :before-change="() => !readonly"
      :validate-event="false"
      @update:model-value="emit('update', Boolean($event))"
    />
    <label
      v-if="presentation.label.value"
      :id="`${binding.id}-switch-label`"
      :for="binding.id"
    >
      <span
        v-if="
          presentation.policy?.value.marker &&
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
          presentation.policy?.value.marker &&
          presentation.policy.value.markerPosition === 'suffix'
        "
        class="element-required"
        aria-hidden="true"
      >
        *
      </span>
    </label>
  </span>
</template>
