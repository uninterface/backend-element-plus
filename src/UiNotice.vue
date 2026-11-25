<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { ElIcon } from 'element-plus'
  import {
    Close,
    InfoFilled,
    SuccessFilled,
    WarningFilled,
    CircleCloseFilled,
  } from '@element-plus/icons-vue'
  import { uiFocusPresentation } from './focus'
  import type { UiNoticeViewProps } from '@uninterface/uninterface/backend'
  const props = defineProps<UiNoticeViewProps>()
  const icons = {
    info: InfoFilled,
    success: SuccessFilled,
    warning: WarningFilled,
    error: CircleCloseFilled,
  }
  const nativeColor = computed(() =>
    props.color === 'secondary'
      ? 'info'
      : props.color === 'danger'
        ? 'error'
        : props.color,
  )
  import {
    computed,
    ref,
    onMounted,
    onUpdated,
    onBeforeUnmount,
    useSlots,
  } from 'vue'
  const slots = useSlots()
  const root = ref<HTMLElement>()
  const measuredLarge = ref<boolean>()
  const largeIcon = computed(
    () =>
      measuredLarge.value ??
      (!!props.title &&
        !!(slots.default || props.message || props.details?.length)),
  )
  let observer: ResizeObserver | undefined
  let frame: number | undefined
  let view: Window | null = null
  function measure() {
    frame = undefined
    if (!root.value) return
    const height = root.value.offsetHeight
    // Ignore hidden notices; measure again when their layout becomes visible.
    if (!height) return
    // Two ordinary message lines plus native vertical insets. This is a
    // backend presentation threshold, independent of title/slot presence.
    measuredLarge.value = height >= 56
  }
  function scheduleMeasure() {
    if (view && frame === undefined) frame = view.requestAnimationFrame(measure)
  }
  onMounted(() => {
    view = root.value?.ownerDocument.defaultView ?? null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(scheduleMeasure)
      observer.observe(root.value!)
    }
    scheduleMeasure()
  })
  onUpdated(scheduleMeasure)
  onBeforeUnmount(() => {
    observer?.disconnect()
    if (view && frame !== undefined) view.cancelAnimationFrame(frame)
  })
</script>
<template>
  <div
    ref="root"
    class="el-alert element-notice"
    :data-variant="variant"
    :style="
      !nativeColor
        ? {
            '--element-notice-color': 'var(--el-text-color-primary)',
            '--element-notice-soft': 'var(--el-fill-color-light)',
            '--element-notice-on-color': 'var(--el-bg-color)',
          }
        : {
            '--element-notice-color': `var(--el-color-${nativeColor})`,
            '--element-notice-soft': `var(--el-color-${nativeColor}-light-9)`,
            '--element-notice-on-color': 'var(--el-color-white)',
          }
    "
    :class="[
      nativeColor ? `el-alert--${nativeColor}` : 'element-notice-neutral',
      variant === 'filled' ? 'is-dark' : 'is-light',
      { 'element-notice-dismissible': dismissible },
    ]"
  >
    <span
      v-if="$slots.icon || kind !== 'custom'"
      class="el-alert__icon element-notice-icon"
      :class="{ 'is-big': largeIcon }"
      aria-hidden="true"
    >
      <slot
        v-if="$slots.icon"
        name="icon"
      />
      <ElIcon v-else-if="kind !== 'custom'">
        <component :is="icons[kind]" />
      </ElIcon>
    </span>
    <div class="el-alert__content">
      <div class="element-notice-message">
        <span
          v-if="title"
          class="el-alert__title"
          :class="{
            'with-description': !!(
              $slots.default ||
              message ||
              details?.length
            ),
          }"
        >
          {{ title }}
        </span>
        <div
          v-if="$slots.default || message || details?.length"
          class="el-alert__description"
        >
          <slot>
            <div v-if="message">{{ message }}</div>
            <ul v-if="details?.length">
              <li
                v-for="(detail, index) in details"
                :key="index"
              >
                {{ detail }}
              </li>
            </ul>
          </slot>
        </div>
      </div>
      <div
        v-if="$slots.actions"
        class="element-notice-actions"
      >
        <slot name="actions" />
      </div>
    </div>
    <button
      v-if="dismissible"
      v-bind="uiFocusPresentation"
      type="button"
      class="el-alert__close-btn element-notice-close"
      :aria-label="dismissLabel"
      @click="onDismissRequest"
    >
      <ElIcon><Close /></ElIcon>
    </button>
  </div>
</template>
