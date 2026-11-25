<script setup lang="ts">
  import {
    useUiZView,
    type UiProgressBarViewProps,
  } from '@uninterface/uninterface/backend'
  import { useUiI18n } from '@uninterface/uninterface'
  import { ElProgress } from 'element-plus'
  useUiZView()
  defineProps<UiProgressBarViewProps>()
  const i18n = useUiI18n()
  const formatPercentage = (percentage: number) =>
    i18n.number(percentage / 100, {
      style: 'percent',
      maximumFractionDigits: 0,
    })
</script>
<template>
  <ElProgress
    class="element-plus-progress-bar"
    data-ui-progress-bar
    :data-state="value === null ? 'indeterminate' : 'determinate'"
    type="line"
    :aria-label="label"
    :aria-valuetext="valueText"
    aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="value ?? undefined"
    :percentage="fraction === null ? 35 : fraction * 100"
    :indeterminate="value === null"
    :show-text="value === null ? false : undefined"
    :format="formatPercentage"
    :color="`var(--el-${color === 'secondary' ? 'text-color-secondary' : `color-${color}`})`"
  />
</template>
