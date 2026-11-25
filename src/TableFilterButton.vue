<script setup lang="ts">
  import { ElIcon } from 'element-plus'
  import { Filter as FilterIcon } from '@element-plus/icons-vue'
  defineProps<{ active: boolean; disabled: boolean }>()
</script>
<template>
  <button
    type="button"
    class="element-table-filter"
    :disabled="disabled"
    :data-filter-active="active || undefined"
  >
    <span aria-hidden="true">
      <ElIcon><FilterIcon /></ElIcon>
    </span>
  </button>
</template>
