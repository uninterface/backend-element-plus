<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { shallowRef } from 'vue'
  import { useUiLoadingSurface } from '@uninterface/uninterface/backend'
  import LoadingRegion from './UiLoadingRegion.vue'
  defineOptions({ inheritAttrs: false })
  const loadingHost = shallowRef<HTMLElement | { $el: HTMLElement }>()
  const loadingSurface = useUiLoadingSurface(() => loadingHost.value)
  import { ElCard } from 'element-plus'
  import type { UiCardViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiCardViewProps>()
</script>
<template>
  <ElCard
    ref="loadingHost"
    v-bind="$attrs"
    class="element-card"
    :data-card-body="bodyLayout ? 'layout' : undefined"
    :data-card-top-end="$slots['top-end'] ? '' : undefined"
    :data-card-level="level"
    :data-card-header="treatment.header"
    :data-card-footer="treatment.footer"
    :data-card-density="treatment.density"
    :data-card-surface="treatment.surface"
    :data-card-elevation="treatment.elevation"
    :data-card-border="treatment.border"
    :data-card-title-size="treatment.titleSize"
    :style="{
      '--element-card-accent': color
        ? `var(--el-color-${color === 'secondary' ? 'info' : color})`
        : 'var(--el-border-color)',
    }"
    :shadow="treatment.elevation === 'raised' ? 'always' : 'never'"
  >
    <template
      v-if="$slots.header || $slots.title || $slots.description"
      #header
    >
      <slot name="header">
        <div
          v-if="$slots.title"
          class="element-card-title"
        >
          <slot name="title" />
        </div>
        <div
          v-if="$slots.description"
          class="element-card-description"
        >
          <slot name="description" />
        </div>
      </slot>
    </template>
    <slot />
    <div
      v-if="$slots['top-end']"
      class="element-card-top-end"
    >
      <slot name="top-end" />
    </div>
    <template
      v-if="$slots.footer"
      #footer
    >
      <slot name="footer" />
    </template>
  </ElCard>
  <LoadingRegion
    :surface="loadingSurface"
    :loading="loading"
    :label="loadingLabel"
  />
</template>
