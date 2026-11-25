<script setup lang="ts">
  import { uiFocusPresentation } from './focus'
  import { useUiCollectionHeaderField } from '@uninterface/uninterface/backend'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { computed, provide, ref } from 'vue'
  import { useControlSize } from './controlSize'
  import { useUiFieldStrategies } from '@uninterface/uninterface/backend'
  import { ElFormItem } from 'element-plus'
  import {
    fieldPresentationKey,
    useFieldFormContext,
  } from './fieldPresentation'
  import FieldFailureTooltip from './FieldFailureTooltip.vue'
  import FieldError from './FieldError.vue'
  import type { UiFieldViewBinding } from '@uninterface/uninterface/backend'
  const element = ref()
  useUiCollectionHeaderField(
    element,
    '.el-input__wrapper, .el-select__wrapper, .el-textarea',
  )
  const props = defineProps<{ binding: UiFieldViewBinding }>()
  const nativeForm = useFieldFormContext(() => policy.value.showFailure)
  const policy = useUiFieldStrategies(() => props.binding, {
    help: 'together',
    defaultLabels: () =>
      nativeForm?.labelPosition === 'left'
        ? 'beside-far'
        : nativeForm?.labelPosition === 'right'
          ? 'beside-near'
          : 'above',
    defaultBeside: () =>
      nativeForm?.labelPosition === 'left' ? 'beside-far' : 'beside-near',
    showRequiredAnnotations: () => !nativeForm?.hideRequiredAsterisk,
    requiredAnnotations: () =>
      nativeForm?.requireAsteriskPosition === 'right' ? 'suffix' : 'prefix',
    failureModes: ['show-below', 'show-tooltip'],
    defaultFailure: () =>
      nativeForm?.showMessage === false ? 'none' : 'show-below',
    labels: ['above', 'beside'],
  })
  const inlineMessage = computed(() => Boolean(nativeForm?.inlineMessage))
  const controlSize = useControlSize('UiField')
  const checkboxes = ref(0)
  const errorVisible = ref(false)
  const checkboxLabel = computed(
    () =>
      !props.binding.group &&
      checkboxes.value === 1 &&
      policy.value.checkableMode !== 'separated',
  )
  import { useCheckableDescriptionAlignment } from './checkableDescription'
  useCheckableDescriptionAlignment(
    element,
    () => checkboxLabel.value && policy.value.checkableMode === 'flushed',
  )
  // Native placement belongs to Form, so independently scoped exceptions use the label slot.
  const nativeMarker = computed(
    () =>
      Boolean(nativeForm) &&
      !nativeForm?.hideRequiredAsterisk &&
      !checkboxLabel.value &&
      policy.value.marker === 'required' &&
      nativeForm?.requireAsteriskPosition ===
        (policy.value.markerPosition === 'prefix' ? 'left' : 'right'),
  )
  provide(fieldPresentationKey, {
    binding: computed(() => props.binding),
    errorVisible,
    checkboxLabel,
    registerCheckbox() {
      checkboxes.value++
      return () => {
        checkboxes.value--
      }
    },
  })
  const groupDescription = computed(
    () =>
      policy.value.describedBy
        ?.split(' ')
        .filter(
          (id) =>
            id !== `${props.binding.id}-issue` ||
            (policy.value.issue &&
              (policy.value.failure === 'show-tooltip' || errorVisible.value)),
        )
        .join(' ') || undefined,
  )
</script>
<template>
  <ElFormItem
    ref="element"
    :data-ui-label-align="policy.labelAlignment"
    :data-ui-checkable="policy.checkableMode"
    :data-ui-checkable-group="
      binding.checkable && binding.group ? true : undefined
    "
    :data-ui-checkable-label-align="
      binding.checkable ? policy.checkableLabelAlignment : undefined
    "
    class="element-field"
    :size="controlSize"
    :class="{
      'element-labels-beside':
        Boolean(policy.labels?.startsWith('beside')) && !checkboxLabel,
      'element-labels-hidden': policy.labels === 'hidden',
    }"
    :label-position="
      policy.labels === 'beside-far'
        ? 'left'
        : policy.labels === 'beside-near'
          ? 'right'
          : 'top'
    "
    :label-width="
      policy.labels?.startsWith('beside') && !checkboxLabel ? '25%' : undefined
    "
    :label="checkboxLabel ? undefined : binding.label"
    :for="binding.group ? '' : binding.id"
    :error="policy.issue ?? undefined"
    :show-message="policy.showFailure && policy.failure !== 'show-tooltip'"
    :required="nativeMarker"
    :inline-message="inlineMessage"
    :validate-status="
      binding.issue ? 'error' : binding.validating ? 'validating' : ''
    "
    :role="binding.group ? 'group' : undefined"
    :aria-labelledby="binding.group ? `${binding.id}-label` : undefined"
    :aria-describedby="
      binding.group
        ? [
            groupDescription,
            binding.requiredLabel ? `${binding.id}-required` : undefined,
          ]
            .filter(Boolean)
            .join(' ') || undefined
        : undefined
    "
    :aria-busy="(binding.group && binding.validating) || undefined"
    :aria-invalid="(binding.group && Boolean(binding.issue)) || undefined"
    v-bind="binding.group ? uiFocusPresentation : {}"
  >
    <template
      v-if="!checkboxLabel"
      #label
    >
      <span :id="`${binding.id}-label`">
        <span
          v-if="
            !nativeMarker &&
            policy.marker === 'required' &&
            policy.markerPosition === 'prefix'
          "
          class="element-required element-required-prefix"
          aria-hidden="true"
        >
          *
        </span>
        {{ binding.label }}
        <span
          v-if="
            !nativeMarker &&
            policy.marker === 'required' &&
            policy.markerPosition === 'suffix'
          "
          class="element-required"
          aria-hidden="true"
        >
          *
        </span>
      </span>
    </template>
    <div class="element-field-content">
      <FieldFailureTooltip
        :message="policy.failure === 'show-tooltip' ? policy.issue : null"
        :id="`${binding.id}-issue`"
      >
        <slot />
      </FieldFailureTooltip>
      <span
        v-if="binding.group && binding.requiredLabel"
        :id="`${binding.id}-required`"
        class="element-visually-hidden element-required-description"
      >
        {{ binding.requiredLabel }}
      </span>
      <small
        v-if="policy.showHelp"
        :id="`${binding.id}-help`"
        class="element-help"
      >
        {{ binding.help }}
      </small>
    </div>
    <template #error="{ error }">
      <FieldError
        v-if="policy.issue && policy.failure !== 'show-tooltip'"
        :id="`${binding.id}-issue`"
        :message="error"
        :inline="inlineMessage ?? false"
      />
    </template>
  </ElFormItem>
</template>
