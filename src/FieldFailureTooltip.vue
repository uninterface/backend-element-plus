<script setup lang="ts">
  import {
    useUiZPopup,
    useUiOverlayTarget,
    useUiTooltipAnchorVisibility,
    useUiTooltipPlacement,
    useUiTooltipPositionUpdate,
  } from '@uninterface/uninterface/backend'
  import { popupTarget } from './zOrder'
  import { ref, onDeactivated, watch } from 'vue'
  import { ElTooltip } from 'element-plus'
  const props = defineProps<{ message: string | null; id: string }>()
  const anchor = ref<HTMLElement>()
  const tooltip = ref<InstanceType<typeof ElTooltip>>()
  const surface = ref<HTMLElement>(),
    portal = useUiOverlayTarget()
  useUiZPopup(() => popupTarget(surface.value), {
    tooltip: { anchor: () => anchor.value, visible: () => visible.value },
    source: 'field failure tooltip',
  })
  const suppressed = ref(false)
  const placement = useUiTooltipPlacement(
    () => anchor.value,
    () => 'top',
  )
  const visible = useUiTooltipAnchorVisibility(
    () => anchor.value,
    () => Boolean(props.message) && !suppressed.value,
  )
  useUiTooltipPositionUpdate(
    () => anchor.value,
    () => popupTarget(surface.value),
    () => visible.value,
    () => tooltip.value?.updatePopper(),
  )
  onDeactivated(() => {
    suppressed.value = true
  })
  watch(
    () => props.message,
    () => {
      suppressed.value = false
    },
  )
</script>
<template>
  <div
    ref="anchor"
    class="element-field-editor"
  >
    <slot />
    <span
      v-if="message"
      :id="id"
      class="element-tooltip-description"
    >
      {{ message }}
    </span>
    <ElTooltip
      ref="tooltip"
      :append-to="portal"
      :virtual-ref="anchor"
      virtual-triggering
      :visible="visible"
      :disabled="!message"
      :placement="placement"
      :show-arrow="true"
      :popper-style="{
        maxWidth: 'min(24rem, calc(100vw - 1rem))',
        overflowWrap: 'anywhere',
      }"
      :persistent="false"
    >
      <template #content>
        <span
          ref="surface"
          :data-ui-field-tooltip-for="id"
        >
          {{ message }}
        </span>
      </template>
    </ElTooltip>
  </div>
</template>
