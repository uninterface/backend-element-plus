<script setup lang="ts">
  import { ElMenu } from 'element-plus'
  import { nextTick, onBeforeUpdate, onUpdated, useId } from 'vue'
  import type {
    UiEntryViewNode,
    UiEntryStatusViewBinding,
  } from '@uninterface/uninterface/backend'
  import EntryBranch from './EntryBranch.vue'
  import MenuBridge from './MenuBridge.vue'
  import { useMenuPresentation } from './menuPresentation'
  const props = defineProps<{
    entries: readonly UiEntryViewNode[]
    status: UiEntryStatusViewBinding
    label: string
    navigation?: boolean
    presentation?: import('@uninterface/uninterface').UiNavMenuPresentation
    popup?: boolean
    id?: string
  }>()
  const emit = defineEmits<{
    activate: [key: string]
    expand: [key: string, open: boolean]
    retry: [key?: string]
    close: []
  }>()
  const generatedId = useId()
  const menu = useMenuPresentation(
    () => props.entries,
    props.navigation,
    emit,
    () => props.presentation ?? 'horizontal',
  )
  let hadFocus = false
  onBeforeUpdate(() => {
    hadFocus = menu.owns(document.activeElement)
  })
  onUpdated(async () => {
    await nextTick()
    if (hadFocus && document.activeElement === document.body) {
      const branch = menu.nodes.value.filter((node) => node.expanded).at(-1)
      menu.focus(branch?.entry.key)
    }
  })
</script>
<template>
  <ElMenu
    :id="id ?? generatedId"
    :mode="
      navigation && (!presentation || presentation === 'horizontal')
        ? 'horizontal'
        : 'vertical'
    "
    :collapse="presentation === 'icon-popup'"
    :role="navigation ? 'menubar' : 'menu'"
    :class="{
      'el-menu--popup': popup,
      'element-command-menu': popup && !navigation,
      'element-navigation-menu': navigation,
    }"
    :data-presentation="navigation ? (presentation ?? 'horizontal') : undefined"
    :aria-label="label"
    :aria-busy="status.pending || undefined"
    :aria-orientation="
      navigation && (!presentation || presentation === 'horizontal')
        ? 'horizontal'
        : 'vertical'
    "
    :ellipsis="false"
    :persistent="false"
    :collapse-transition="false"
    menu-trigger="click"
    tabindex="0"
  >
    <MenuBridge>
      <EntryBranch
        :entries="entries"
        :status="status"
        :label="label"
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
      </EntryBranch>
    </MenuBridge>
  </ElMenu>
</template>
