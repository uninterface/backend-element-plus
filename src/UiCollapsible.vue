<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { ElCollapse, ElCollapseItem } from 'element-plus'
  import type { UiCollapsibleViewProps } from '@uninterface/uninterface/backend'
  const props = defineProps<UiCollapsibleViewProps>()
  const emit = defineEmits<{ 'update:expanded': [expanded: boolean] }>()
  function request() {
    if (!props.disabled) emit('update:expanded', !props.expanded)
    // The public hook prevents optimistic native state from overruling a denied request.
    // Accepted owner state is fed back through modelValue on the next Vue update.
    return false
  }
</script>
<template>
  <ElCollapse
    :model-value="expanded ? [panelId] : []"
    :before-collapse="request"
  >
    <ElCollapseItem
      :name="panelId"
      :disabled="disabled"
    >
      <template #title>
        <span class="element-collapsible-summary"><slot name="summary" /></span>
      </template>
      <div :inert="!expanded"><slot v-if="mounted" /></div>
    </ElCollapseItem>
  </ElCollapse>
</template>
<style scoped>
  .element-collapsible-summary {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
</style>
