<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { ElIcon } from 'element-plus'
  import type { UiIconViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiIconViewProps>()
</script>
<template>
  <ElIcon
    class="element-icon"
    :color="
      tone
        ? `var(--el-color-${tone === 'secondary' ? 'info' : tone})`
        : undefined
    "
  >
    <slot />
  </ElIcon>
</template>
<style scoped>
  /* The native menu sets a 24px icon column but an 18px glyph height.
     UiIcon's own box stays square, inside its separately allocated menu part. */
  .el-icon.element-icon {
    width: 1em;
    height: 1em;
  }
</style>
