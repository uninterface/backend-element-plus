<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiFieldFailure,
    useUiInputFrameSurface,
    type UiInputFrameViewProps,
  } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { computed } from 'vue'
  import { useFieldPresentation } from './fieldPresentation'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiInputFrameViewProps>()
  const emit = defineEmits<{ enter: []; leave: [] }>()
  const { attrs, focused, focus } = useUiInputFrameSurface(props, emit)
  defineExpose({ focus })
  const invalid = useUiFieldFailure(() => props.binding)
  const presentation = useFieldPresentation()
  const description = computed(() =>
    presentation.describedBy(props.descriptionBinding),
  )
  const size = useControlSize('UiInputFrame')
  import { useFormSize } from 'element-plus'
  const nativeSize = useFormSize()
</script>
<template>
  <div
    class="el-input element-input-frame-host"
    :class="[
      size || nativeSize ? 'el-input--' + (size || nativeSize) : undefined,
      { 'is-disabled': binding.disabled },
    ]"
  >
    <div
      v-bind="{ ...$attrs, ...attrs }"
      class="el-input__wrapper element-input-frame"
      :class="{
        'is-focus': focused,
        'element-input-frame-invalid': invalid,
      }"
      :aria-describedby="description"
    >
      <slot name="leading" />
      <slot />
      <slot name="trailing" />
    </div>
  </div>
</template>
