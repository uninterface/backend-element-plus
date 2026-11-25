<script setup lang="ts">
  import { computed } from 'vue'
  import { Back, Right, Switch } from '@element-plus/icons-vue'
  import type { UiTemporalBoundaryMode } from '@uninterface/uninterface/backend'
  const props = defineProps<{ mode: UiTemporalBoundaryMode | 'next-day' }>()
  const icon = computed(
    () =>
      ({
        start: Right,
        end: Back,
        bounded: Switch,
        'next-day': undefined,
        unrestricted: undefined,
      })[props.mode],
  )
</script>
<template>
  <span
    class="element-plus-temporal-symbol"
    aria-hidden="true"
  >
    <span v-if="mode === 'unrestricted'">∞</span>
    <svg
      v-else-if="mode === 'next-day'"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />
      <path d="M8 3v4m8-4v4M3 10h18M6 15h6m-3-3v6m6-4 2-2v6" />
    </svg>
    <component
      v-else
      :is="icon"
    />
  </span>
</template>
