<script setup lang="ts">
  import { onDeactivated, shallowRef as zRef } from 'vue'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { useUiOverlayTarget } from '@uninterface/uninterface/backend'
  const overlayTarget = useUiOverlayTarget()
  import { useControlSize } from './controlSize'
  import { focusUiTarget } from '@uninterface/uninterface/backend'
  import { useFieldPresentation } from './fieldPresentation'
  import { syncUiTargetAttributes } from '@uninterface/uninterface/backend'
  import { computed, ref, useAttrs, watchPostEffect, onUpdated } from 'vue'
  import { useSelectEscape } from './selectEscape'
  import { ElSelect, ElOption, ElOptionGroup, useLocale } from 'element-plus'
  import type { UiSelectViewProps } from '@uninterface/uninterface/backend'
  defineOptions({ inheritAttrs: false })
  const presentation = useFieldPresentation()
  const props = defineProps<UiSelectViewProps>()
  const emit = defineEmits<{
    update: [value: string]
    blur: []
    requestLoad: []
  }>()
  const root = ref<HTMLElement>()
  const attrs = useAttrs()
  const { t } = useLocale()
  // Native loading wording also supplies the accessible announcement.
  // Core's message remains the fallback for states without a native equivalent.
  const statusMessage = computed(() =>
    props.status.pending ? t('el.select.loading') : props.status.message,
  )
  const selectedLabel = computed(
    () =>
      props.options.find((option) => option.value === props.value)?.label ??
      props.value,
  )
  const groups = computed(() => {
    const result: { label?: string; options: typeof props.options }[] = []
    if (!props.available) return result
    for (const option of props.options.filter((option) => !option.hidden)) {
      const last = result.at(-1)
      if (last && last.label === option.group)
        last.options = [...last.options, option]
      else result.push({ label: option.group, options: [option] })
    }
    return result
  })
  function requestLoad() {
    if (!props.binding.disabled) emit('requestLoad')
  }
  const dismissOwner = useSelectEscape()
  function keydown(event: KeyboardEvent) {
    dismissOwner(event)
    if (
      ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'F4', ' '].includes(
        event.key,
      ) ||
      (event.key.length === 1 && !event.ctrlKey && !event.metaKey)
    )
      requestLoad()
  }
  function change(value: unknown) {
    const option = props.options.find((option) => option.value === value)
    if (
      !props.binding.disabled &&
      props.available &&
      option &&
      !option.disabled &&
      !option.hidden
    )
      emit('update', option.value)
  }
  function syncTarget() {
    const input = root.value?.querySelector('input[role="combobox"]')
    if (!input) return
    syncUiTargetAttributes(input, {
      ...attrs,
      id: props.binding.id,
      disabled: props.binding.disabled || undefined,
      type: 'text',
      readonly: true,
      role: 'combobox',
      'aria-required': props.binding.required || undefined,
      'aria-labelledby': presentation.labelledBy(props.binding, attrs),
      'aria-invalid': props.binding.invalid || undefined,
      'aria-busy':
        props.binding.validating || props.status.pending || undefined,
      'aria-describedby':
        [
          presentation.describedBy(props.binding),
          statusMessage.value ? `${props.binding.id}-source-status` : undefined,
        ]
          .filter(Boolean)
          .join(' ') || undefined,
    })
  }
  watchPostEffect(syncTarget)
  onUpdated(syncTarget)
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => root.value?.querySelector<HTMLElement>('input[role="combobox"]'),
        () => props.binding.disabled,
      ),
  })
  const controlSize = useControlSize('UiSelect')
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { popupTarget, controlledPopup } from './zOrder'
  useUiZPopup(() => controlledPopup(props.binding.id), {
    source: 'UiSelect choices',
  })
  const zNative = zRef<InstanceType<typeof ElSelect>>()
  onDeactivated(() => zNative.value?.blur())
</script>
<template>
  <div
    ref="root"
    :class="attrs.class"
    :style="attrs.style as any"
    @pointerdown.capture="requestLoad"
    @keydown.capture="keydown"
  >
    <ElSelect
      ref="zNative"
      :size="controlSize"
      :id="binding.id"
      :model-value="value"
      :placeholder="selectedLabel"
      :disabled="binding.disabled"
      :loading="status.pending"
      :no-data-text="status.message"
      :empty-values="[null, undefined]"
      :validate-event="false"
      :teleported="true"
      :append-to="overlayTarget"
      @update:model-value="change"
      @visible-change="
        (open: boolean) => {
          if (open) requestLoad()
        }
      "
      @blur="$emit('blur')"
    >
      <template #label>{{ selectedLabel }}</template>
      <template
        v-for="(group, index) in groups"
        :key="index"
      >
        <ElOptionGroup
          v-if="group.label !== undefined"
          :label="group.label"
        >
          <ElOption
            v-for="option in group.options"
            :key="option.value"
            :data-uninterface-key="option.value"
            :value="option.value"
            :label="option.label"
            :disabled="option.disabled"
          />
        </ElOptionGroup>
        <template v-else>
          <ElOption
            v-for="option in group.options"
            :key="option.value"
            :data-uninterface-key="option.value"
            :value="option.value"
            :label="option.label"
            :disabled="option.disabled"
          />
        </template>
      </template>
    </ElSelect>
    <span
      :id="`${binding.id}-source-status`"
      :data-uninterface-source-state="status.state"
      class="element-visually-hidden element-select-status"
      role="status"
    >
      {{ statusMessage }}
    </span>
  </div>
</template>
