<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiTooltipView,
    useUiOverlayTarget,
    type UiTooltipViewProps,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<UiTooltipViewProps>()
  const {
    anchor,
    surface,
    trigger,
    surfaceEvents,
    visible,
    describe,
    placement,
  } = useUiTooltipView(props)
  const portal = useUiOverlayTarget()
  import { ElTooltip } from 'element-plus'
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { popupTarget } from './zOrder'
  useUiZPopup(() => popupTarget(surface.value), {
    tooltip: { anchor: () => anchor.value, visible: () => visible.value },
    source: 'UiTooltip',
  })
</script>
<template>
  <slot
    name="host"
    :trigger="trigger"
  />
  <ElTooltip
    v-if="anchor"
    :virtual-ref="anchor"
    virtual-triggering
    :visible="visible"
    :disabled="disabled"
    :placement="placement"
    :append-to="portal"
    :persistent="false"
    :show-after="0"
    :hide-after="0"
  >
    <template #content>
      <div
        :id="id"
        ref="surface"
        v-bind="surfaceEvents"
      >
        <slot />
      </div>
    </template>
  </ElTooltip>
</template>
