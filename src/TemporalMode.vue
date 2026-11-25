<script setup lang="ts">
  import { computed, ref, watch, onDeactivated } from 'vue'
  import {
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem,
    ElButton,
    ElIcon,
  } from 'element-plus'
  import TemporalRangeIcon from './TemporalRangeIcon.vue'
  import {
    useUiControlFrameParticipant,
    useUiOverlayTarget,
    focusUiTarget,
    type UiTemporalBoundaryMode,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<{
    value: UiTemporalBoundaryMode
    modes: { value: UiTemporalBoundaryMode; label: string; symbol: string }[]
    label: string
    disabled: boolean
  }>()
  const emit = defineEmits<{ change: [value: UiTemporalBoundaryMode] }>()
  const menu = ref<InstanceType<typeof ElDropdown>>()
  const trigger = ref<InstanceType<typeof ElButton>>()
  const portal = useUiOverlayTarget()
  const focus = () =>
    focusUiTarget(
      () => trigger.value?.$el,
      () => props.disabled,
    )
  defineExpose({ focus })
  const { setEngaged } = useUiControlFrameParticipant({
    focus: async () => null,
  })
  const open = ref(false)
  function visible(value: boolean) {
    open.value = value && !props.disabled
    setEngaged(open.value)
  }
  function close() {
    menu.value?.handleClose()
    visible(false)
  }
  watch(
    () => props.disabled,
    (disabled) => {
      if (disabled) close()
    },
  )
  onDeactivated(close)
  const selected = computed(() =>
    props.modes.find((item) => item.value === props.value),
  )
  function select(value: UiTemporalBoundaryMode) {
    if (props.disabled) return
    emit('change', value)
    void focus()
  }
</script>
<template>
  <ElDropdown
    ref="menu"
    trigger="click"
    :disabled="disabled"
    :append-to="portal"
    :persistent="false"
    placement="bottom-start"
    @visible-change="visible"
    @command="select"
  >
    <ElButton
      ref="trigger"
      text
      circle
      native-type="button"
      :disabled="disabled"
      :aria-label="label + ': ' + selected?.label"
      :title="selected?.label"
      :aria-expanded="open"
      aria-haspopup="menu"
      data-temporal-mode
    >
      <ElIcon><TemporalRangeIcon :mode="value" /></ElIcon>
    </ElButton>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem
          v-for="item in modes"
          :key="item.value"
          :command="item.value"
          :disabled="disabled"
          :text-value="item.label"
          :aria-current="item.value === value ? 'true' : undefined"
          :data-temporal-mode-value="item.value"
        >
          <ElIcon>
            <TemporalRangeIcon
              :mode="item.value"
              data-temporal-mode-icon
            />
          </ElIcon>
          {{ item.label }}
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
