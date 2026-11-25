<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { computed } from 'vue'
  import {
    useUiNativeTabList,
    type UiTabsViewProps,
  } from '@uninterface/uninterface/backend'
  import { ElTabs, ElTabPane } from 'element-plus'
  const props = defineProps<UiTabsViewProps>()
  const emit = defineEmits<{ select: [key: string] }>()
  const { root, keydown, focusin } = useUiNativeTabList(props, (key) =>
    emit('select', key),
  )
  const selected = computed(
    () => props.items.find((item) => item.selected)?.tabId,
  )
  // ElTabs otherwise commits its own selection before the owner accepts a request.
  const beforeLeave = (value: string | number) => value === selected.value
  function click(pane: { props: { name?: string | number } }) {
    const item = props.items.find((item) => item.tabId === pane.props.name)
    if (item) emit('select', item.key)
  }
</script>
<template>
  <div
    ref="root"
    @keydown.capture="keydown"
    @focusin="focusin"
  >
    <ElTabs
      class="element-tabs"
      :model-value="selected"
      :tab-position="orientation === 'vertical' ? 'left' : 'top'"
      :before-leave="beforeLeave"
      @tab-click="click"
    >
      <ElTabPane
        v-for="item in items"
        :key="item.key"
        :name="item.tabId"
        :disabled="item.disabled"
        role="presentation"
        :id="undefined"
        :aria-labelledby="undefined"
        aria-hidden="true"
        style="display: none"
      >
        <template #label><slot :item="item" /></template>
      </ElTabPane>
    </ElTabs>
  </div>
</template>
