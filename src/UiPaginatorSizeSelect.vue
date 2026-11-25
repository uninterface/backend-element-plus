<script setup lang="ts">
  import { onDeactivated, shallowRef as zRef } from 'vue'
  import { useId } from 'vue'
  import {
    useUiZPopup,
    useUiOverlayTarget,
  } from '@uninterface/uninterface/backend'
  import { controlledPopup } from './zOrder'
  const zId = useId(),
    portal = useUiOverlayTarget()
  useUiZPopup(() => controlledPopup(zId))
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import { useUiCollectionFooterCompact } from '@uninterface/uninterface/backend'
  const compact = useUiCollectionFooterCompact()

  import { ElSelect, ElOption } from 'element-plus'
  import type { UiPaginatorSizeSelectViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiPaginatorSizeSelectViewProps>()
  const zNative = zRef<InstanceType<typeof ElSelect>>()
  onDeactivated(() => zNative.value?.blur())
</script>
<template>
  <ElSelect
    :size="compact ? 'small' : undefined"
    ref="zNative"
    :id="zId"
    :append-to="portal"
    class="element-paginator-size"
    :aria-label="label"
    :model-value="value"
    :disabled="disabled"
    :aria-busy="pending"
    @update:model-value="(value) => select(Number(value))"
  >
    <ElOption
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
      :data-uninterface-key="String(option.value)"
    />
  </ElSelect>
</template>
