<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiBadgeViewProps } from '@uninterface/uninterface/backend'
  const props = defineProps<UiBadgeViewProps>()
  import { computed } from 'vue'
  const type = computed(() => {
    switch (props.color) {
      case 'primary':
      case 'success':
      case 'danger':
      case 'warning':
      case 'info':
        return props.color
      case 'secondary':
        return 'info'
      default:
        throw new Error(`Unsupported Element Plus theme color: ${props.color}`)
    }
  })
  import { ElTag } from 'element-plus'
</script>
<template>
  <ElTag
    class="element-badge"
    :type="type"
    :closable="false"
    :disable-transitions="true"
  >
    <slot />
  </ElTag>
</template>
