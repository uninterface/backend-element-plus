<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { computed } from 'vue'
  import { useFormSize } from 'element-plus'
  import {
    useUiFieldFailure,
    type UiPreviewRegionViewProps,
  } from '@uninterface/uninterface/backend'
  import { useControlSize } from './controlSize'
  import { useFieldPresentation } from './fieldPresentation'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiPreviewRegionViewProps>()
  const invalid = useUiFieldFailure(() => props.binding)
  const presentation = useFieldPresentation()
  const description = computed(() => presentation.describedBy(props.binding))
  const size = useControlSize('UiPreviewRegion')
  const nativeSize = useFormSize()
</script>
<template>
  <div
    class="el-input"
    :class="[
      size || nativeSize ? 'el-input--' + (size || nativeSize) : undefined,
      { 'is-disabled': binding.disabled },
    ]"
  >
    <div
      v-bind="$attrs"
      :id="binding.id"
      data-ui-preview-region
      :data-extent="extent"
      role="group"
      :aria-label="label"
      :aria-describedby="description"
      :aria-invalid="binding.invalid || undefined"
      :aria-disabled="binding.disabled || undefined"
      :aria-busy="binding.validating || undefined"
      class="el-input__wrapper element-plus-preview-region"
      :class="{ 'element-preview-invalid': invalid }"
    >
      <div
        class="element-plus-preview-viewport"
        data-preview-viewport
      >
        <slot />
      </div>
    </div>
  </div>
</template>
