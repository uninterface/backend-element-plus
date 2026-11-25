<script setup lang="ts">
  import {
    useUiCollectionBadgeReorder,
    type UiCollectionBadgeReorder,
  } from '@uninterface/uninterface/backend'
  import { ElTag } from 'element-plus'
  import { ref, onMounted, onUpdated } from 'vue'
  const props = defineProps<{
    label: string
    removeLabel: string
    disabled: boolean
    reorder?: UiCollectionBadgeReorder
  }>()
  const reorderBody = ref<HTMLElement>()
  const reorderView = useUiCollectionBadgeReorder(reorderBody, () => props)
  const emit = defineEmits<{ remove: [] }>()
  function remove() {
    if (!props.disabled) emit('remove')
  }
  const tag = ref<InstanceType<typeof ElTag>>()
  // Native close is already a real button; add the criterion-specific name and guard.
  function syncClose() {
    const button = tag.value?.$el.querySelector('button.el-tag__close')
    if (button) {
      button.setAttribute('aria-label', props.removeLabel)
      button.disabled = props.disabled
    }
  }
  defineExpose({
    focus() {
      if (!props.disabled)
        tag.value?.$el.querySelector('button.el-tag__close')?.focus()
    },
  })
  onMounted(syncClose)
  onUpdated(syncClose)
</script>
<template>
  <ElTag
    ref="tag"
    class="element-query-badge"
    type="info"
    closable
    disable-transitions
    role="group"
    :aria-label="label"
    @close="remove"
  >
    <span
      ref="reorderBody"
      class="element-query-badge-content"
      v-bind="reorderView.bindings.value"
    >
      <slot />
    </span>
    <span
      v-if="reorder"
      class="element-query-badge-announcement"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ reorderView.announcement.value }}
    </span>
  </ElTag>
</template>
