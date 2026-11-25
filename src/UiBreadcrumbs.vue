<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import { useUiZPart } from '@uninterface/uninterface/backend'
  const vUiZPart = useUiZPart()

  import { ElButton } from 'element-plus'
  import type { UiBreadcrumbsViewProps } from '@uninterface/uninterface/backend'
  import { ElBreadcrumb, useNamespace } from 'element-plus'
  defineProps<UiBreadcrumbsViewProps>()
  const ns = useNamespace('breadcrumb')
  // Native item markup/theme, with link semantics on actual destinations only.
  // ElBreadcrumbItem unconditionally assigns role=link to its inner span.
</script>
<template>
  <ElBreadcrumb :aria-label="label">
    <ol class="element-breadcrumb-list">
      <li
        v-for="item in items"
        :key="item.key"
        v-ui-z-part="item.z"
        :class="ns.e('item')"
        :aria-current="item.current ? 'page' : undefined"
      >
        <span :class="ns.e('inner')">
          <component
            :is="
              item.href === undefined
                ? item.actionable
                  ? 'button'
                  : 'span'
                : 'a'
            "
            v-bind="item.attributes"
            :href="item.href"
            :type="
              item.actionable && item.href === undefined ? 'button' : undefined
            "
            :aria-disabled="item.disabled || undefined"
          >
            <slot :item="item" />
          </component>
        </span>
        <span
          v-if="!item.current"
          :class="ns.e('separator')"
          role="presentation"
          aria-hidden="true"
        >
          /
        </span>
      </li>
    </ol>
    <div
      v-if="status?.message"
      role="status"
      :aria-busy="status.pending || undefined"
    >
      {{ status.message }}
      <ElButton
        text
        v-if="status.failed"
        @click="retry?.()"
      >
        {{ status.retryLabel }}
      </ElButton>
    </div>
  </ElBreadcrumb>
</template>
<style scoped>
  .element-breadcrumb-list {
    display: flow-root;
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
