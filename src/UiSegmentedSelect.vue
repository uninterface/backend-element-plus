<script setup lang="ts">
  import { uiFocusPresentation } from './focus'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import { computed, ref, watchPostEffect, onUpdated } from 'vue'
  import {
    useUiChoiceGroupView,
    useUiFieldFailure,
  } from '@uninterface/uninterface/backend'
  import type { UiChoiceGroupViewProps } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { useFieldPresentation } from './fieldPresentation'
  import { ElSegmented } from 'element-plus'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiChoiceGroupViewProps>()
  const emit = defineEmits<{ choose: [key: string]; blur: [] }>()
  const root = ref<HTMLElement>()
  const size = useControlSize('UiSegmentedSelect')
  const presentation = useFieldPresentation()
  const description = computed(() => presentation.describedBy(props.binding))
  const failure = useUiFieldFailure(() => props.binding)
  const describedBy = computed(
    () =>
      [
        description.value,
        props.status.message ? `${props.binding.id}-source-status` : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  )
  const selected = computed(
    () => props.options.find((option) => option.selected)?.key,
  )
  function targets() {
    return Array.from(
      root.value?.querySelectorAll<HTMLInputElement>('input[type=radio]') ?? [],
    ).flatMap((element, index) =>
      props.options[index] ? [{ key: props.options[index].key, element }] : [],
    )
  }
  const { focus, keydown, focusout } = useUiChoiceGroupView(
    props,
    () => false,
    () => root.value,
    targets,
    (key) => emit('choose', key),
    () => emit('blur'),
    { fieldLabel: true },
  )
  defineExpose({ focus })
  // ElSegmented owns label wrappers; feedback belongs to each native radio.
  function syncInputs() {
    for (const target of targets()) {
      const index = props.options.findIndex(
        (option) => option.key === target.key,
      )
      if (index < 0) continue
      target.element
        .closest('label')
        ?.setAttribute('data-uninterface-key', target.key)
      target.element.id = `${props.binding.id}-option-${index}`
      target.element.setAttribute('aria-label', props.options[index].label)
      const descriptions = optionDescription(index)
      if (descriptions)
        target.element.setAttribute('aria-describedby', descriptions)
      else target.element.removeAttribute('aria-describedby')
      if (props.binding.invalid)
        target.element.setAttribute('aria-invalid', 'true')
      else target.element.removeAttribute('aria-invalid')
    }
  }
  watchPostEffect(syncInputs)
  onUpdated(syncInputs)
  function optionDescription(index: number) {
    return (
      [
        description.value,
        props.options[index].description
          ? `${props.binding.id}-option-${index}-help`
          : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined
    )
  }
</script>
<template>
  <div
    ref="root"
    v-bind="$attrs"
    :id="binding.id"
    role="group"
    :aria-label="label"
    :aria-describedby="describedBy"
    :aria-invalid="binding.invalid || undefined"
    :aria-disabled="binding.disabled || undefined"
    :aria-busy="binding.validating || status.pending || undefined"
    :class="uiFocusPresentation.class"
    data-uninterface-segmented-select
    data-uninterface-choice-group
    class="element-choice-group"
    @keydown.capture="keydown"
    @focusout="focusout"
  >
    <div class="segmented-scroll">
      <ElSegmented
        :id="`${binding.id}-segments`"
        :name="binding.id"
        :aria-label="label"
        :aria-orientation="orientation"
        :aria-required="binding.required || undefined"
        :aria-describedby="describedBy"
        :aria-invalid="binding.invalid || undefined"
        :model-value="selected === undefined ? undefined : `choice:${selected}`"
        :options="
          options.map((option, index) => ({
            value: `choice:${option.key}`,
            label: option.label,
            description: option.description,
            index,
            disabled: option.disabled,
          }))
        "
        :disabled="binding.disabled || !available"
        :direction="orientation"
        :size="size"
        block
        :validate-event="false"
        :class="{ 'segmented-invalid': failure }"
        @update:model-value="
          typeof $event === 'string' && emit('choose', $event.slice(7))
        "
      >
        <template #default="{ item }">
          <span>{{ item.label }}</span>
          <small
            v-if="item.description"
            :id="`${binding.id}-option-${item.index}-help`"
          >
            {{ item.description }}
          </small>
        </template>
      </ElSegmented>
    </div>
    <div
      v-for="item in retained"
      :key="item.key"
      data-uninterface-retained
    >
      {{ item.label }}
      <template v-if="unavailableLabel">— {{ unavailableLabel }}</template>
    </div>
    <div
      :id="`${binding.id}-source-status`"
      role="status"
      :data-uninterface-source-state="status.state"
    >
      {{ status.message }}
    </div>
  </div>
</template>
<style scoped>
  .element-choice-group {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }
  .segmented-scroll {
    max-width: 100%;
    overflow-x: auto;
  }
  :deep(.el-segmented) {
    --el-segmented-padding: 0;
    --el-segmented-bg-color: var(--el-fill-color-blank);
    min-width: max-content;
    border: 1px solid var(--el-border-color);
  }
  :deep(.el-segmented__group) {
    border-radius: inherit;
  }
  :deep(.el-segmented.is-block .el-segmented__item) {
    min-width: max-content;
    border-radius: 0;
  }
  :deep(.el-segmented--horizontal .el-segmented__item:first-of-type) {
    border-start-start-radius: inherit;
    border-end-start-radius: inherit;
  }
  :deep(.el-segmented--horizontal .el-segmented__item:last-of-type) {
    border-start-end-radius: inherit;
    border-end-end-radius: inherit;
  }
  :deep(.el-segmented--vertical .el-segmented__item:first-of-type) {
    border-start-start-radius: inherit;
    border-start-end-radius: inherit;
  }
  :deep(.el-segmented--vertical .el-segmented__item:last-of-type) {
    border-end-start-radius: inherit;
    border-end-end-radius: inherit;
  }
  :deep(.el-segmented__item + .el-segmented__item) {
    border-inline-start: 1px solid var(--el-border-color);
  }
  :deep(.el-segmented--vertical .el-segmented__item + .el-segmented__item) {
    border-inline-start: 0;
    border-block-start: 1px solid var(--el-border-color);
  }
  /* Native focus paint tracks the selected pill. An initially unselected
     option still needs a visible keyboard target and its own scroll anchor. */
  :deep(.el-segmented__item) {
    position: relative;
  }
  :deep(.el-segmented__item-input) {
    inset-block-start: 0;
    inset-inline-start: 0;
    width: 1px;
    height: 1px;
  }
  :deep(.el-segmented__item:not(.is-selected):has(input:focus-visible)) {
    outline: 2px solid var(--el-color-primary);
    outline-offset: -2px;
  }
  :deep(.el-segmented__item-selected.is-focus-visible::before) {
    outline-offset: -2px;
    outline-color: var(--el-segmented-item-selected-color);
  }
  :deep(.el-segmented.segmented-invalid) {
    border-color: var(--el-color-danger);
    box-shadow: 0 0 0 1px var(--el-color-danger);
  }
  small {
    display: block;
  }
</style>
