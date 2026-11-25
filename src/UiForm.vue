<script setup lang="ts">
  import { useUiFormFocus } from '@uninterface/uninterface/backend'
  import { uiFocusPresentation } from './focus'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { provide, ref } from 'vue'
  import { ElForm } from 'element-plus'
  import { formPresentationKey } from './formPresentation'
  import type { UiFormViewBinding } from '@uninterface/uninterface/backend'
  defineProps<{ binding: UiFormViewBinding }>()
  defineEmits<{ submit: []; reset: [] }>()
  provide(formPresentationKey, true)
  const element = ref<InstanceType<typeof ElForm>>()
  const focusInvalid = useUiFormFocus(
    () => element.value?.$el as HTMLElement | undefined,
  )
  defineExpose({ focusInvalid })
</script>
<template>
  <ElForm
    ref="element"
    class="element-form"
    label-position="top"
    :validate-on-rule-change="false"
    :data-form-full="binding.height === 'full' || undefined"
    :id="binding.id"
    :aria-label="binding.label"
    :aria-busy="binding.pending"
    novalidate
    v-bind="uiFocusPresentation"
    @submit.prevent="$emit('submit')"
    @reset.prevent="$emit('reset')"
  >
    <slot />
  </ElForm>
</template>
