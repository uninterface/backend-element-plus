<script setup lang="ts">
  import FooterActions from './FooterActions.vue'
  import { useId } from 'vue'
  import { uiFocusPresentation } from './focus'
  import {
    useUiModalView,
    createUiModalCssMotion,
    type UiModalViewProps,
  } from '@uninterface/uninterface/backend'
  import { ElIcon } from 'element-plus'
  import { Close } from '@element-plus/icons-vue'
  const props = defineProps<UiModalViewProps>()
  const emit = defineEmits<{
    cancel: [reason: UiModalViewProps['closeOn'][number]]
  }>()
  const {
    widthStyle,
    vModalPart,
    ModalPart,
    dialog,
    body,
    title: heading,
    open,
    close,
    cancel,
    pointerdown,
    click,
  } = useUiModalView(() => props, emit, createUiModalCssMotion('dialog-fade'))
  const id = useId()
  defineExpose({ open, close })
</script>
<template>
  <dialog
    ref="dialog"
    :style="widthStyle"
    class="element-modal"
    :aria-labelledby="`${id}-title`"
    @cancel="cancel"
    @pointerdown="pointerdown"
    @click="click"
  >
    <div class="el-dialog element-modal-surface">
      <header
        v-modal-part="'header'"
        class="el-dialog__header"
        :class="{ 'show-close': closeOn.includes('close-button') }"
      >
        <div class="element-modal-heading">
          <h2
            :id="`${id}-title`"
            ref="heading"
            v-bind="uiFocusPresentation"
            tabindex="-1"
            class="el-dialog__title"
          >
            {{ title }}
          </h2>
          <button
            v-if="closeOn.includes('close-button')"
            type="button"
            class="el-dialog__headerbtn"
            :disabled="pendingClose"
            :aria-label="closeLabel"
            @click="emit('cancel', 'close-button')"
          >
            <ElIcon class="el-dialog__close"><Close /></ElIcon>
          </button>
        </div>
        <ModalPart part="header">
          <slot name="header-extra" />
        </ModalPart>
      </header>
      <div
        ref="body"
        :data-content-scroll="bodyScroll === 'content' || undefined"
        v-bind="uiFocusPresentation"
        role="region"
        :aria-labelledby="`${id}-title`"
        tabindex="0"
        class="el-dialog__body element-modal-body"
      >
        <slot />
      </div>
      <footer
        v-modal-part="'footer'"
        v-if="$slots.footer || $slots.actions"
        class="el-dialog__footer"
      >
        <ModalPart part="footer">
          <FooterActions v-if="$slots.actions">
            <slot name="actions" />
          </FooterActions>
          <slot
            v-else
            name="footer"
          />
        </ModalPart>
      </footer>
    </div>
  </dialog>
</template>
