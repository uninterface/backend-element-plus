<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiLinkViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiLinkViewProps>()
  import { ElLink } from 'element-plus'
</script>
<template>
  <ElLink
    :href="href"
    :aria-current="current ? 'page' : undefined"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? 0 : undefined"
    :type="
      (color === 'secondary' ? 'info' : color) as
        | 'primary'
        | 'success'
        | 'warning'
        | 'danger'
        | 'info'
        | undefined
    "
    :underline="'hover'"
    :disabled="disabled"
  >
    <template
      v-if="$slots.icon"
      #icon
    >
      <slot name="icon" />
    </template>
    <slot />
  </ElLink>
</template>
