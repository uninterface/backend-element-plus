<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { uiFocusPresentation } from './focus'
  import {
    useUiMenuView,
    type UiMenuViewBinding,
  } from '@uninterface/uninterface/backend'
  import NativeMenu from './NativeMenu.vue'
  import EntryPopup from './EntryPopup.vue'
  const props = defineProps<{ binding: UiMenuViewBinding }>()
  const emit = defineEmits<{
    open: []
    close: []
    activate: [key: string]
    expand: [key: string, open: boolean]
    retry: [key?: string]
  }>()
  const { host, id, anchor, point, hostBindings, activated, close } =
    useUiMenuView(() => props.binding, emit, {
      contextTriggerClass: uiFocusPresentation.class,
      nativeInteraction: () => true,
    })
</script>
<template>
  <div
    ref="host"
    class="element-entry-host"
  >
    <slot
      v-if="binding.mode === 'popup'"
      name="host"
      v-bind="hostBindings"
    />

    <component
      :is="binding.mode === 'popup' ? EntryPopup : 'div'"
      v-if="binding.open"
      :anchor="anchor"
      :point="point"
      @close="close(false)"
    >
      <NativeMenu
        :id="id"
        :entries="binding.entries"
        :status="binding.status"
        :label="binding.label"
        :popup="binding.mode === 'popup'"
        @activate="activated"
        @expand="(key, open) => $emit('expand', key, open)"
        @retry="$emit('retry', $event)"
        @close="close()"
      >
        <template #entry="scope">
          <slot
            name="entry"
            v-bind="scope"
          />
        </template>
        <template #icon="scope">
          <slot
            name="icon"
            v-bind="scope"
          />
        </template>
      </NativeMenu>
    </component>
  </div>
</template>
