<script setup lang="ts">
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { shallowRef } from 'vue'
  import { popupTarget } from './zOrder'
  const zPopup = shallowRef<HTMLElement>()
  useUiZPopup(() => popupTarget(zPopup.value))
  import {
    computed,
    nextTick,
    onDeactivated,
    ref,
    shallowReactive,
    watch,
  } from 'vue'
  import {
    ElPopover,
    ElButton,
    ElIcon,
    ElDatePickerPanel,
    parseDate,
  } from 'element-plus'
  import { Calendar } from '@element-plus/icons-vue'
  import { useUiI18n, useUiResponsive } from '@uninterface/uninterface'
  import {
    useUiControlFrameParticipant,
    useUiOverlayTarget,
    type UiTemporalEditorViewProps,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<
    Omit<UiTemporalEditorViewProps, 'kind' | 'value' | 'update'> & {
      kind: 'date' | 'datetime'
      value: { start: string; end: string }
      update(value: { start: string; end: string }): void
    }
  >()
  const open = ref(false)
  const trigger = ref<InstanceType<typeof ElButton>>()
  const portal = useUiOverlayTarget()
  const { context } = useUiResponsive()
  const i18n = useUiI18n()
  const { setEngaged } = useUiControlFrameParticipant({
    focus: async () => null,
  })
  watch(open, setEngaged, { flush: 'sync' })
  const pickerLabel = computed(
    () =>
      i18n.text({
        namespace: 'uninterface',
        key: props.kind === 'date' ? 'pickDate' : 'pickDateTime',
      }) +
      ' — ' +
      props.label,
  )
  const dateFormat = computed(
    () =>
      ({ YMD: 'YYYY-MM-DD', DMY: 'DD/MM/YYYY', MDY: 'MM/DD/YYYY' })[
        props.dateFormatWish ?? 'YMD'
      ],
  )
  const clockFormat = computed(() =>
    props.precision === 'minute' ? 'HH:mm' : 'HH:mm:ss',
  )
  const timeFormat = computed(() =>
    props.presentation?.hourCycle === 'h12'
      ? clockFormat.value.replace('HH', 'hh') + ' A'
      : clockFormat.value,
  )
  const valueFormat = computed(() =>
    props.kind === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD[T]' + clockFormat.value,
  )
  function nativeValue(value: string) {
    const text = value.split('.')[0]!
    const parsed = parseDate(text, valueFormat.value, 'en')
    // Invalid/unfinished text stays in the editor; never let Day.js repair it.
    return parsed?.isValid() && parsed.format(valueFormat.value) === text
      ? text
      : undefined
  }
  const model = computed<string[]>((previous) => {
    const pair = [nativeValue(props.value.start), nativeValue(props.value.end)]
    const next = pair.every((value): value is string => value !== undefined)
      ? pair
      : []
    // Presentation/focus rerenders must not reset an unfinished native selection.
    return previous?.length === next.length &&
      next.every((value, index) => value === previous[index])
      ? previous
      : next
  })
  // The native panel captures this array on mount. Keep its identity while
  // updating the clocks, including time edits made in the same open panel.
  const defaultTime = shallowReactive<[Date, Date]>([
    new Date(2000, 0, 1),
    new Date(2000, 0, 1),
  ])
  watch(
    () => [props.value.start, props.value.end],
    (values) =>
      values.forEach((value, index) => {
        const clock = /T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(value)
        defaultTime[index] = new Date(
          2000,
          0,
          1,
          Number(clock?.[1] ?? 0),
          Number(clock?.[2] ?? 0),
          Number(clock?.[3] ?? 0),
        )
      }),
    { immediate: true },
  )
  function close() {
    open.value = false
    void nextTick(() => trigger.value?.$el?.focus())
  }
  function choose(value: unknown) {
    if (
      props.binding.disabled ||
      props.readonly ||
      !Array.isArray(value) ||
      value.length !== 2 ||
      !value.every((item) => typeof item === 'string')
    )
      return
    const endpoints = value.map((item, index) =>
      props.kind === 'datetime' && props.precision === 'millisecond'
        ? item.split('.')[0] +
          ([props.value.start, props.value.end][index]!.match(
            /\.\d{1,3}$/,
          )?.[0] ?? '.000')
        : item,
    )
    if (!endpoints.every(props.eligible)) return
    props.update({ start: endpoints[0]!, end: endpoints[1]! })
    void nextTick(() => props.blur())
    if (props.kind === 'date') close()
  }
  function dateString(date: Date) {
    return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  function calendarChange(value: unknown) {
    // The native panel suppresses model updates for an unchanged selection.
    if (
      props.kind === 'date' &&
      Array.isArray(value) &&
      value.length === 2 &&
      value.every((item) => item instanceof Date) &&
      dateString(value[0]) === props.value.start &&
      dateString(value[1]) === props.value.end
    )
      close()
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
</script>
<template>
  <ElPopover
    v-model:visible="open"
    trigger="click"
    role="dialog"
    :aria-label="pickerLabel"
    placement="bottom-start"
    width="auto"
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
        native-type="button"
        :disabled="binding.disabled || readonly"
        :aria-label="pickerLabel"
        :aria-expanded="open"
        aria-haspopup="dialog"
        @keydown.esc.stop.prevent="close"
        data-temporal-trigger
        data-temporal-range-trigger
      >
        <ElIcon><Calendar /></ElIcon>
      </ElButton>
    </template>
    <div
      ref="zPopup"
      data-temporal-popup
      data-temporal-range-popup
      :aria-label="pickerLabel"
      @keydown.esc.stop.prevent="close"
    >
      <ElDatePickerPanel
        :cell-class-name="
          (date: Date) => 'element-calendar-day-' + dateString(date)
        "
        v-if="open"
        :type="kind === 'date' ? 'daterange' : 'datetimerange'"
        :model-value="model"
        :value-format="valueFormat"
        :date-format="dateFormat"
        :time-format="timeFormat"
        :default-time="kind === 'datetime' ? defaultTime : undefined"
        :single-panel="context === 'mobile'"
        :clearable="false"
        :show-footer="false"
        :disabled-date="
          kind === 'date'
            ? (date: Date) => !eligible(dateString(date))
            : undefined
        "
        @calendar-change="calendarChange"
        @update:model-value="choose"
      />
    </div>
  </ElPopover>
</template>
