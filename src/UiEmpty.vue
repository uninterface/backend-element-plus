<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { ElEmpty } from 'element-plus'
  import type { UiEmptyViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiEmptyViewProps>()
</script>
<template>
  <ElEmpty
    class="element-empty"
    :class="{ 'element-empty-with-icon': !!$slots.icon }"
  >
    <!-- Override native default artwork; no illustration is requested implicitly. -->
    <template #image>
      <slot name="icon"><span hidden /></slot>
    </template>
    <template #description>
      <slot>{{ label }}</slot>
    </template>
    <template
      v-if="$slots.actions"
      #default
    >
      <slot name="actions" />
    </template>
  </ElEmpty>
</template>
