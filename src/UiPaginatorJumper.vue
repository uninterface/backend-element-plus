<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import { useUiCollectionFooterCompact } from '@uninterface/uninterface/backend'
  const compact = useUiCollectionFooterCompact()

  import { useId } from 'vue'
  import { ElInput, ElFormItem } from 'element-plus'
  import { useUiFieldStrategies } from '@uninterface/uninterface/backend'
  import FieldFailureTooltip from './FieldFailureTooltip.vue'
  import type { UiPaginatorJumperViewProps } from '@uninterface/uninterface/backend'
  const props = defineProps<UiPaginatorJumperViewProps>()
  const id = `paginator-jumper-${useId()}`
  const policy = useUiFieldStrategies(
    () => ({
      id,
      label: props.label,
      issue: props.error || null,
      validating: false,
      describedBy: props.error ? `${id}-issue` : undefined,
    }),
    { failureModes: ['show-tooltip', 'show-below'] },
  )
  function keydown(event: Event | KeyboardEvent) {
    if (!('key' in event) || event.key !== 'Enter' || event.isComposing) return
    event.preventDefault()
    event.stopPropagation()
    void props.commit('enter')
  }
</script>
<template>
  <ElFormItem
    :size="compact ? 'small' : undefined"
    class="element-paginator-jumper"
    :label="label"
    :for="id"
    :error="error"
    :validate-status="error ? 'error' : ''"
    :show-message="policy.failure === 'show-below'"
    label-position="left"
    label-width="auto"
    :aria-busy="pending"
  >
    <FieldFailureTooltip
      :message="policy.failure === 'show-tooltip' ? policy.issue : null"
      :id="`${id}-issue`"
    >
      <ElInput
        :id="id"
        :model-value="value"
        :validate-event="false"
        :disabled="disabled"
        inputmode="numeric"
        autocomplete="off"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="policy.describedBy"
        @update:model-value="update"
        @keydown="keydown"
        @blur="commit('blur')"
      />
    </FieldFailureTooltip>
    <template #error="{ error }">
      <div
        :id="`${id}-issue`"
        class="el-form-item__error"
        role="alert"
      >
        {{ error }}
      </div>
    </template>
  </ElFormItem>
</template>
