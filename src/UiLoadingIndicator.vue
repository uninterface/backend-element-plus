<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiLoadingIndicatorViewProps } from '@uninterface/uninterface/backend'
  import { ElIcon } from 'element-plus'
  import { Loading } from '@element-plus/icons-vue'
  import { computed } from 'vue'
  import {
    useUiStrategy,
    uiControlSizeQuery,
  } from '@uninterface/uninterface/backend'
  const requestedSize = useUiStrategy(uiControlSizeQuery, [-2, -1, 0, 1, 2])
  const scale = computed(() =>
    requestedSize.value.status === 'answered' ? requestedSize.value.value : 0,
  )
  defineProps<UiLoadingIndicatorViewProps>()
</script>
<template>
  <span
    class="element-loading-indicator"
    :style="{ fontSize: `${1 + scale * 0.125}em` }"
  >
    <ElIcon
      class="is-loading"
      aria-hidden="true"
    >
      <Loading />
    </ElIcon>
    <slot>
      <span class="element-loading-label-hidden">{{ label }}</span>
    </slot>
  </span>
</template>
