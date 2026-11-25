<script setup lang="ts">
  import { uiFocusPresentation } from './focus'
  import { computed, ref, watchPostEffect, onUpdated } from 'vue'
  import {
    useUiChoiceGroupView,
    useUiFieldFailure,
  } from '@uninterface/uninterface/backend'
  import type { UiChoiceGroupViewProps } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { useFieldPresentation } from './fieldPresentation'
  import { ElRadio, ElCheckbox } from 'element-plus'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiChoiceGroupViewProps & { multiple: boolean }>()
  const emit = defineEmits<{ choose: [key: string]; blur: [] }>()
  const root = ref<HTMLElement>()
  const size = useControlSize(props.multiple ? 'UiCheckbox' : 'UiRadioGroup')
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
      root.value?.querySelectorAll<HTMLElement>(
        'input[type=radio], input[type=checkbox], [role=radio], [role=checkbox]',
      ) ?? [],
    )
      .filter(
        (element) =>
          element.getAttribute('aria-hidden') !== 'true' &&
          element.tabIndex >= -1,
      )
      .flatMap((element) => {
        const key =
          element
            .closest('[data-uninterface-key]')
            ?.getAttribute('data-uninterface-key') ??
          element.getAttribute('value')
        return key === null || key === undefined ? [] : [{ key, element }]
      })
  }
  const { focus, keydown, focusout } = useUiChoiceGroupView(
    props,
    () => props.multiple,
    () => root.value,
    targets,
    (key) => emit('choose', key),
    () => emit('blur'),
  )
  defineExpose({ focus })
  // ElRadio/ElCheckbox own label wrappers; feedback belongs to each native input.
  function syncInputs() {
    for (const target of targets()) {
      const index = props.options.findIndex(
        (option) => option.key === target.key,
      )
      if (index < 0) continue
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
    :role="multiple ? 'group' : 'radiogroup'"
    :aria-label="label"
    :aria-required="(!multiple && binding.required) || undefined"
    :aria-describedby="describedBy"
    :aria-invalid="binding.invalid || undefined"
    :aria-disabled="binding.disabled || undefined"
    :aria-busy="binding.validating || status.pending || undefined"
    :class="uiFocusPresentation.class"
    data-uninterface-choice-group
    class="element-choice-group"
    @keydown.capture="keydown"
    @focusout="focusout"
  >
    <div
      class="element-choices"
      :class="{ 'element-choices-horizontal': orientation === 'horizontal' }"
    >
      <div
        v-for="(option, index) in options"
        :key="option.key"
        :data-uninterface-key="option.key"
        class="element-choice"
      >
        <ElCheckbox
          v-if="multiple"
          :id="`${binding.id}-option-${index}`"
          :model-value="option.selected"
          :disabled="binding.disabled || !available || option.disabled"
          :size="size"
          :validate-event="false"
          :aria-describedby="optionDescription(index)"
          :aria-invalid="binding.invalid || undefined"
          @update:model-value="emit('choose', option.key)"
        >
          {{ option.label }}
        </ElCheckbox>
        <ElRadio
          v-else
          :id="`${binding.id}-option-${index}`"
          :name="binding.id"
          :value="`choice:${option.key}`"
          :model-value="selected === undefined ? '' : `choice:${selected}`"
          :disabled="binding.disabled || !available || option.disabled"
          :size="size"
          :validate-event="false"
          :aria-describedby="optionDescription(index)"
          :aria-invalid="binding.invalid || undefined"
          @update:model-value="emit('choose', option.key)"
        >
          {{ option.label }}
        </ElRadio>
        <div
          v-if="option.description"
          :id="`${binding.id}-option-${index}-help`"
          class="element-choice-description"
        >
          {{ option.description }}
        </div>
      </div>
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
  .element-choices {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .element-choices-horizontal {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }
  /* Native control rows already provide their interaction height. Flex items
     avoid an inherited form line box around each inline-flex control. */
  .element-choice {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .element-choice-description {
    font-size: var(--el-font-size-extra-small);
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }
</style>
