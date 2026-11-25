<script setup lang="ts">
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { shallowRef } from 'vue'
  import { popupTarget } from './zOrder'
  const zPopup = shallowRef<HTMLElement>()
  useUiZPopup(() => popupTarget(zPopup.value))
  import { onDeactivated, onScopeDispose } from 'vue'
  import { computed, ref, watch, nextTick } from 'vue'
  import { ElPopover, ElButton, ElIcon, ElDatePickerPanel } from 'element-plus'
  import { Calendar, Clock } from '@element-plus/icons-vue'
  import {
    useUiOverlayTarget,
    type UiTemporalEditorViewProps,
  } from '@uninterface/uninterface/backend'
  import { useUiI18n } from '@uninterface/uninterface'
  import TemporalTimePanel from './TemporalTimePanel.vue'
  const props = defineProps<UiTemporalEditorViewProps>()
  const open = ref(false),
    trigger = ref<InstanceType<typeof ElButton>>()
  const portal = useUiOverlayTarget(),
    i18n = useUiI18n()
  const pickerLabel = computed(() =>
    i18n.text({
      namespace: 'uninterface',
      key:
        props.kind === 'date'
          ? 'pickDate'
          : props.kind === 'time'
            ? 'pickTime'
            : 'pickDateTime',
    }),
  )
  const timeFormat = computed(() =>
    props.precision === 'minute' ? 'HH:mm' : 'HH:mm:ss',
  )
  const dateFormat = computed(
    () =>
      ({ YMD: 'YYYY-MM-DD', DMY: 'DD/MM/YYYY', MDY: 'MM/DD/YYYY' })[
        props.dateFormatWish ?? 'YMD'
      ],
  )
  const valueFormat = computed(() =>
    props.kind === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD[T]' + timeFormat.value,
  )
  function close() {
    open.value = false
    void nextTick(() => trigger.value?.$el?.focus())
  }
  function choose(value: unknown) {
    // The native datetime panel edits seconds, so retain the text-owned
    // fractional part when choosing another date or clock value.
    if (
      typeof value === 'string' &&
      props.kind === 'datetime' &&
      props.precision === 'millisecond'
    )
      value =
        value.split('.')[0] + (props.value.match(/\.\d{1,3}$/)?.[0] ?? '.000')
    if (
      props.binding.disabled ||
      props.readonly ||
      typeof value !== 'string' ||
      !props.eligible(value)
    )
      return
    props.update(value)
    void nextTick(() => props.blur())
    if (props.kind === 'date') close()
  }
  function dateString(date: Date) {
    return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  watch(
    () => [props.binding.disabled, props.readonly],
    () => {
      if (props.binding.disabled || props.readonly) open.value = false
    },
  )
  onDeactivated(() => {
    open.value = false
  })
  defineExpose({
    show() {
      if (!props.binding.disabled && !props.readonly) open.value = true
    },
  })
  const emit = defineEmits<{ 'open-change': [open: boolean] }>()
  watch(open, (value) => emit('open-change', value), { flush: 'sync' })
  onScopeDispose(() => emit('open-change', false))
</script>
<template>
  <ElPopover
    v-model:visible="open"
    trigger="click"
    role="dialog"
    :aria-label="pickerLabel"
    placement="bottom-start"
    :width="'auto'"
    :append-to="portal"
    :persistent="false"
    :disabled="binding.disabled || readonly"
    :popper-style="{ padding: '0' }"
  >
    <template #reference>
      <ElButton
        ref="trigger"
        text
        circle
        :disabled="binding.disabled || readonly"
        :aria-label="pickerLabel + (label ? ' — ' + label : '')"
        :aria-expanded="open"
        aria-haspopup="dialog"
        @keydown.esc.stop.prevent="close"
        data-temporal-trigger
      >
        <ElIcon><component :is="kind === 'time' ? Clock : Calendar" /></ElIcon>
      </ElButton>
    </template>
    <div
      :aria-label="pickerLabel"
      ref="zPopup"
      data-temporal-popup
      @keydown.esc.stop.prevent="close"
    >
      <ElDatePickerPanel
        :cell-class-name="
          (date: Date) => 'element-calendar-day-' + dateString(date)
        "
        v-if="kind !== 'time'"
        :type="kind"
        :model-value="value"
        :value-format="valueFormat"
        :format="kind === 'date' ? dateFormat : dateFormat + ' ' + timeFormat"
        :disabled-date="
          kind === 'date'
            ? (date: Date) => !eligible(dateString(date))
            : undefined
        "
        @update:model-value="choose"
      />
      <TemporalTimePanel
        v-else
        :value="value"
        :precision="precision"
        :hour-cycle="presentation?.hourCycle"
        @pick="choose"
        @close="close"
      />
    </div>
  </ElPopover>
</template>
