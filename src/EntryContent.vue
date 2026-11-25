<script setup lang="ts">
  import type { UiEntryViewNode } from '@uninterface/uninterface/backend'
  type Entry = Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
  defineSlots<{
    entry?: (props: { entry: Entry }) => unknown
    icon?: (props: {
      entry: Entry
      icon: NonNullable<Entry['icon']>
    }) => unknown
  }>()
  defineProps<{
    entry: Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
    href?: string
    rail?: boolean
    iconColumn?: boolean
    descriptionId?: string
  }>()
  defineEmits<{ navigate: [event: MouseEvent] }>()
</script>
<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href"
    :tabindex="href ? -1 : undefined"
    :class="[
      href ? 'element-entry-link' : 'element-entry-content',
      { 'element-entry-rail': rail },
    ]"
    @click="
      (event: MouseEvent) => {
        if (href) {
          event.stopPropagation()
          $emit('navigate', event)
        }
      }
    "
  >
    <span
      v-if="entry.icon || iconColumn"
      aria-hidden="true"
      class="element-entry-icon"
    >
      <slot
        v-if="entry.icon"
        name="icon"
        :entry="entry"
        :icon="entry.icon"
      />
    </span>
    <span
      class="element-entry-copy"
      :class="{ 'element-navigation-rail-label': rail }"
    >
      <slot
        name="entry"
        :entry="entry"
      >
        {{ entry.label }}
      </slot>
      <small
        v-if="entry.description"
        :id="descriptionId"
      >
        {{ entry.description }}
      </small>
    </span>
    <kbd
      v-if="
        entry.kind !== 'submenu' && entry.kind !== 'group' && entry.shortcut
      "
    >
      {{ entry.shortcut }}
    </kbd>
  </component>
</template>

<style scoped>
  .element-navigation-rail-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
