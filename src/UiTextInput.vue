<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { useControlSize } from './controlSize'
  import { focusUiTarget } from '@uninterface/uninterface/backend'
  import { useFieldPresentation } from './fieldPresentation'
  import { ref } from 'vue'
  import { ElInput, ElButton } from 'element-plus'
  import type { UiTextInputViewProps } from '@uninterface/uninterface/backend'
  import { View as ShowIcon, Hide as HideIcon } from '@element-plus/icons-vue'
  defineOptions({ inheritAttrs: false })
  const presentation = useFieldPresentation()
  const props = defineProps<UiTextInputViewProps>()
  defineEmits<{ update: [value: string]; blur: [] }>()
  const element = ref<InstanceType<typeof ElInput>>()
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => element.value?.$el?.querySelector('input, textarea'),
        () => props.binding.disabled,
      ),
  })
  // Supply server defaults without competing with ElInput's live value/IME
  // controller: an input attribute and textarea text update default values.
  const controlSize = useControlSize('UiTextInput')
</script>
<template>
  <ElInput
    class="element-text-input"
    :data-ui-control-frame="frame?.owner"
    :style="{
      '--ui-text-min-width':
        minWidthCharacters === undefined
          ? undefined
          : `${minWidthCharacters}ch`,
      '--ui-text-max-width':
        maxWidthCharacters === undefined
          ? undefined
          : `${maxWidthCharacters}ch`,
    }"
    :data-ui-frame-editor="frame?.owner === 'parent' ? '' : undefined"
    :class="{ 'element-control-frame-part': frame?.owner === 'parent' }"
    :size="controlSize"
    ref="element"
    v-bind="{
      ...$attrs,
      ...(multiline ? { textContent: value } : { '^value': value }),
    }"
    :id="binding.id"
    :container-role="$attrs.role as string | undefined"
    :type="multiline ? 'textarea' : type"
    :readonly="readonly"
    :inputmode="inputmode"
    :autocomplete="autocomplete"
    :model-value="value"
    :disabled="binding.disabled"
    :validate-event="false"
    :aria-busy="binding.validating || undefined"
    :aria-required="binding.required || undefined"
    :aria-labelledby="presentation.labelledBy(binding, $attrs)"
    :aria-describedby="presentation.describedBy(descriptionBinding ?? binding)"
    :aria-invalid="binding.invalid || undefined"
    @update:model-value="$emit('update', $event)"
    @keydown="reveal?.keydown($event as KeyboardEvent)"
    @blur="$emit('blur')"
  >
    <template
      v-if="$slots.leading"
      #prefix
    >
      <slot name="leading" />
    </template>
    <!-- ElInput caches suffix presence at mount. The localized reveal action
         can become available after the input has rendered. -->
    <template #suffix>
      <slot name="trailing" />
      <ElButton
        v-if="reveal"
        text
        circle
        :disabled="binding.disabled"
        :aria-label="reveal.label"
        data-password-reveal
        :aria-pressed="reveal.shown"
        @mousedown.prevent
        @click="reveal.toggle"
      >
        <component
          :is="reveal.shown ? HideIcon : ShowIcon"
          aria-hidden="true"
        />
      </ElButton>
    </template>
  </ElInput>
</template>
