<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { useControlSize } from './controlSize'
  import {
    focusUiTarget,
    useUiButtonPresentation,
  } from '@uninterface/uninterface/backend'
  import { computed, inject, provide, ref } from 'vue'
  import { ElButton, formContextKey } from 'element-plus'
  import { formPresentationKey } from './formPresentation'
  import type { UiButtonViewProps } from '@uninterface/uninterface/backend'
  defineOptions({ inheritAttrs: false })
  const props = withDefaults(defineProps<UiButtonViewProps>(), {
    color: 'secondary',
  })
  const nativeForm = inject(formContextKey, undefined)
  if (nativeForm && inject(formPresentationKey, false)) {
    // ElButton's reset click calls resetFields before the native reset event.
    // UiForm owns that operation. Preserve live native presentation context,
    // but suppress this competing model reset; the browser event still fires.
    const resetFields = () => {}
    provide(
      formContextKey,
      new Proxy(nativeForm, {
        get(target, key, receiver) {
          return key === 'resetFields'
            ? resetFields
            : Reflect.get(target, key, receiver)
        },
      }),
    )
  }
  const toolkitType = computed(() => {
    switch (props.color) {
      case 'secondary':
        return 'info'
      case 'primary':
        return 'primary'
      case 'success':
        return 'success'
      case 'danger':
        return 'danger'
      case 'warning':
        return 'warning'
      case 'info':
        return 'info'
      default:
        throw new Error(`Unsupported Element Plus theme color: ${props.color}`)
    }
  })
  const element = ref<{ $el: HTMLElement }>()
  defineExpose({
    focus: () =>
      focusUiTarget(
        () => element.value?.$el,
        () => Boolean(props.disabled || props.loading),
      ),
  })
  const {
    variant: buttonVariant,
    width: buttonWidth,
    iconOnly,
    hint,
  } = useUiButtonPresentation(props, { collectionActionVariant: 'bordered' })
  const controlSize = useControlSize('UiButton')
  // Primary neutral is native default ElButton. Other roles retain its surface
  // and use Element's semantic interaction tokens.
  function neutralStyle() {
    if (buttonVariant() !== 'neutral' || props.color === 'primary')
      return undefined
    const token = '--el-color-' + toolkitType.value
    return {
      '--el-button-hover-text-color': 'var(' + token + ')',
      '--el-button-hover-bg-color': 'var(' + token + '-light-9)',
      '--el-button-hover-border-color': 'var(' + token + '-light-7)',
      '--el-button-active-border-color': 'var(' + token + ')',
      '--el-button-outline-color': 'var(' + token + '-light-5)',
    }
  }
</script>
<template>
  <span
    class="element-button-host"
    :data-ui-button-width="buttonWidth()"
    :data-ui-control-frame="frame?.owner"
  >
    <ElButton
      :size="controlSize"
      ref="element"
      v-bind="$attrs"
      :native-type="type"
      :form="form"
      :title="hint()"
      :data-ui-button-variant="buttonVariant()"
      :type="buttonVariant() === 'neutral' ? '' : toolkitType"
      :style="neutralStyle()"
      :plain="
        buttonVariant() === undefined
          ? undefined
          : buttonVariant() === 'outline' || buttonVariant() === 'soft'
      "
      :circle="iconOnly()"
      :text="
        buttonVariant() === undefined
          ? undefined
          : buttonVariant() === 'text' || buttonVariant() === 'icon'
      "
      :class="{
        'element-button-outline': buttonVariant() === 'outline',
        'element-button-icon-only': iconOnly(),
      }"
      class="element-button"
      :loading="loading"
      :disabled="disabled || loading"
      :aria-busy="loading || undefined"
    >
      <template
        v-if="$slots.icon && !iconOnly()"
        #icon
      >
        <span
          class="element-button-icon"
          aria-hidden="true"
        >
          <slot name="icon" />
        </span>
      </template>
      <span
        v-if="iconOnly()"
        class="element-button-icon"
        aria-hidden="true"
      >
        <slot name="icon" />
      </span>
      <span
        class="element-button-label"
        :class="{
          'element-visually-hidden element-button-label-hidden': iconOnly(),
        }"
      >
        <slot />
      </span>
    </ElButton>
    <span
      class="element-visually-hidden element-button-status"
      role="status"
      aria-live="polite"
    >
      {{ loading ? loadingLabel : '' }}
    </span>
  </span>
</template>
