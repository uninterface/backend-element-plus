<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiSuggestionsView,
    useUiOverlayTarget,
    type UiSuggestionsViewProps,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<UiSuggestionsViewProps>()
  const { anchor, anchorWidth, surface, visible, host, active, accept } =
    useUiSuggestionsView(props)
  const portal = useUiOverlayTarget()
  import { computed } from 'vue'
  // Give Popper the editor geometry without letting its virtual trigger
  // replace the combobox's listbox attributes on the input.
  const reference = computed(() => {
    const editor = anchor.value
    if (editor)
      return {
        getBoundingClientRect: () => editor.getBoundingClientRect(),
        contextElement: editor,
      }
  })
  import { ElPopover, ElScrollbar } from 'element-plus'
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { popupTarget } from './zOrder'
  useUiZPopup(() => popupTarget(surface.value), { source: 'UiSuggestions' })
</script>
<template>
  <slot
    name="host"
    :host="host"
  />
  <ElPopover
    v-if="anchor"
    :virtual-ref="reference"
    role="group"
    virtual-triggering
    :visible="visible"
    :append-to="portal"
    :width="anchorWidth"
    popper-class="element-plus-suggestions-popup"
    placement="bottom-start"
    :persistent="false"
  >
    <div
      ref="surface"
      class="element-plus-suggestions el-autocomplete-suggestion"
    >
      <ElScrollbar wrap-class="el-autocomplete-suggestion__wrap">
        <ul
          class="el-autocomplete-suggestion__list"
          :id="id"
          role="listbox"
          :aria-busy="pending || undefined"
          :aria-label="label"
        >
          <li
            v-for="(item, index) in results"
            :id="`${id}-${index}`"
            :key="item.key"
            role="option"
            :class="{ highlighted: active === index }"
            :aria-label="item.label"
            :aria-selected="active === index"
            :aria-disabled="item.disabled || undefined"
            @mousedown.prevent
            @click="accept(index)"
          >
            <slot
              name="suggestion"
              :item="item"
              :active="active === index"
            >
              {{ item.label }}
            </slot>
          </li>
        </ul>
      </ElScrollbar>
      <div
        v-if="message"
        role="status"
      >
        <small v-if="results.length">{{ message }}</small>
        <template v-else>{{ message }}</template>
      </div>
    </div>
  </ElPopover>
</template>
