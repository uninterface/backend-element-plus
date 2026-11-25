<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  defineOptions({ inheritAttrs: false })
</script>
<template>
  <span
    class="element-plus-input-frame-spacer"
    data-ui-input-frame-spacer
    aria-hidden="true"
  />
</template>
