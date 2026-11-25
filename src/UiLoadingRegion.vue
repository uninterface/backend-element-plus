<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'

  import { Teleport } from 'vue'
  import {
    useUiLoadingRegion,
    type UiLoadingRegionViewProps,
  } from '@uninterface/uninterface/backend'
  import Indicator from './UiLoadingIndicator.vue'
  import { ElLoading } from 'element-plus'
  import { getCurrentInstance, watch, shallowRef, onScopeDispose } from 'vue'
  const props = withDefaults(defineProps<UiLoadingRegionViewProps>(), {
    announce: true,
    manageBusy: true,
  })
  const { visible, overlay, style, announcementHost, announcement } =
    useUiLoadingRegion(props)
  const appContext = getCurrentInstance()!.appContext
  const nativeContent = shallowRef<HTMLElement>()
  let instance: ReturnType<typeof ElLoading.service> | undefined
  function close() {
    nativeContent.value = undefined
    instance?.close()
    instance?.handleAfterLeave()
    instance = undefined
  }
  watch(
    overlay,
    (element) => {
      close()
      if (!element) return
      instance = ElLoading.service(
        { target: element, text: props.label },
        appContext,
      )
      nativeContent.value =
        instance.$el?.querySelector('.el-loading-spinner') ?? undefined
    },
    { flush: 'post' },
  )
  watch(
    () => props.label,
    (label) => instance?.setText(label),
  )
  onScopeDispose(close)
  useUiZView({
    host: () => props.surface.overlayHost.value!,
    targets: () => (overlay.value ? [overlay.value] : []),
  })
</script>
<template>
  <Teleport
    v-if="visible && surface.overlayHost.value"
    :to="surface.overlayHost.value"
  >
    <div
      ref="overlay"
      data-ui-loading-overlay
      class="element-loading-region"
      :data-custom="$slots.default ? '' : undefined"
      :style="style"
    >
      <Teleport
        v-if="$slots.default && nativeContent"
        :to="nativeContent"
      >
        <slot />
      </Teleport>
    </div>
  </Teleport>
  <Teleport
    v-if="announcementHost && announce !== false"
    :to="announcementHost"
  >
    <span
      class="element-loading-announcement"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </span>
  </Teleport>
</template>
