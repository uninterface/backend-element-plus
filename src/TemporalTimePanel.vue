<script setup lang="ts">
  import { computed, provide } from 'vue'
  import {
    TimePickPanel,
    PICKER_BASE_INJECTION_KEY,
    parseDate,
  } from 'element-plus'
  const props = defineProps<{
    value: string
    precision: 'minute' | 'second' | 'millisecond'
    hourCycle?: 'h12' | 'h23'
  }>()
  const emit = defineEmits<{ pick: [value: string]; close: [] }>()
  const canonicalFormat = computed(() =>
    props.precision === 'minute' ? 'HH:mm' : 'HH:mm:ss',
  )
  const format = computed(() =>
    props.hourCycle === 'h12'
      ? canonicalFormat.value.replace('HH', 'hh') + ' A'
      : canonicalFormat.value,
  )
  const parsed = computed(() => {
    const clock = props.value.split('.')[0]
    return (
      (/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(clock)
        ? parseDate('2000-01-01T' + clock, undefined, 'en')
        : undefined) ?? parseDate('2000-01-01T00:00:00', undefined, 'en')!
    )
  })
  // TimePickPanel is exported by Element Plus; its native parent supplies this
  // documented-by-source context. Keep this integration under upgrade tests.
  provide(PICKER_BASE_INJECTION_KEY, {
    props: {
      get modelValue() {
        return parsed.value.toDate()
      },
      arrowControl: false,
      defaultValue: new Date(2000, 0, 1),
    },
  })
  function pick(
    value: NonNullable<ReturnType<typeof parseDate>>,
    visible: boolean,
  ) {
    let time = value.format(canonicalFormat.value)
    if (props.precision === 'millisecond')
      time += props.value.match(/\.\d{1,3}$/)?.[0] ?? '.000'
    emit('pick', time)
    if (!visible) emit('close')
  }
</script>
<template>
  <TimePickPanel
    :visible="true"
    :actual-visible="true"
    :parsed-value="parsed"
    :format="format"
    @pick="pick"
  />
</template>
