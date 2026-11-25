<script setup lang="ts">
  import FooterActions from './FooterActions.vue'
  import { computed, ref, watch } from 'vue'
  import { ElButton } from 'element-plus'
  import { Close } from '@element-plus/icons-vue'
  import Message from 'element-plus/es/components/message/src/message2.mjs'
  import Notification from 'element-plus/es/components/notification/src/notification2.mjs'
  import {
    useUiFeedbackView,
    type UiFeedbackItemViewProps,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<UiFeedbackItemViewProps>()
  const native = ref<{ $el: HTMLElement; close(): void }>()
  const root = computed(() => native.value?.$el)
  const { events, summary, role } = useUiFeedbackView(props, root)
  watch(
    () => props.open,
    (open) => {
      if (!open) native.value?.close()
    },
    { flush: 'post' },
  )
</script>
<template>
  <component
    :is="surface === 'toast' ? Message : Notification"
    ref="native"
    v-bind="events"
    :id="id"
    data-ui-feedback-item
    :data-closing="!open || undefined"
    class="element-feedback-item"
    custom-class="element-managed-feedback"
    :title="surface === 'notification' ? title : undefined"
    message=" "
    :type="kind === 'custom' ? '' : kind"
    :duration="0"
    :show-close="false"
    :placement="placement.startsWith('bottom') ? 'bottom-right' : 'top-right'"
    :position="`${placement.startsWith('bottom') ? 'bottom' : 'top'}-${placement.endsWith('start') ? 'left' : 'right'}`"
    :data-placement="placement"
    :offset="0"
    :z-index="0"
    :role="undefined"
    @destroy="onExited"
  >
    <div
      class="element-feedback-body"
      tabindex="0"
      role="region"
      :aria-label="title || viewportLabel"
    >
      <strong v-if="surface === 'toast' && title">{{ title }}</strong>
      <slot>
        <div v-if="message">{{ message }}</div>
        <ul v-if="details?.length">
          <li
            v-for="(detail, index) in details"
            :key="index"
          >
            {{ detail }}
          </li>
        </ul>
      </slot>
      <FooterActions v-if="$slots.actions">
        <slot name="actions" />
      </FooterActions>
      <ElButton
        v-if="dismissible"
        text
        :icon="Close"
        class="element-feedback-close"
        :aria-label="closeLabel"
        @click="onDismissRequest"
      />
      <span
        class="element-feedback-announcement"
        :role="role"
        :aria-live="announcement"
        aria-atomic="true"
      >
        {{ summary }}
      </span>
    </div>
  </component>
</template>
