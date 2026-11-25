<script setup lang="ts">
  import { onUnmounted } from 'vue'
  import {
    createUiDateControl,
    createUiDateTimeControl,
    createUiEntryControl,
    createUiFieldControl,
    createUiTimeControl,
    UiButton,
    UiCheckboxGroup,
    UiDateInput,
    UiDateTimeInput,
    UiField,
    UiIcon,
    UiInputFrame,
    UiLayout,
    UiMultiSelect,
    UiRadioGroup,
    UiSegmentedSelect,
    UiStrategy,
    UiTextInput,
    UiTimeInput,
    uiFieldLabels,
  } from '@uninterface/uninterface'

  const required = (value: string | readonly string[] | undefined) =>
    value?.length ? null : 'Enter a value.'
  const name = createUiFieldControl('', undefined, [required])
  const search = createUiFieldControl('', undefined, [required])
  const password = createUiFieldControl('', undefined, [required])
  const notes = createUiFieldControl('', undefined, [required])
  const radio = createUiFieldControl<string | undefined>(undefined, undefined, [
    required,
  ])
  const segmented = createUiFieldControl<string | undefined>(
    undefined,
    undefined,
    [required],
  )
  const checks = createUiFieldControl<string[]>([], undefined, [required])
  const multiple = createUiFieldControl<string[]>([], undefined, [required])
  const date = createUiDateControl('', { rules: [required] })
  const time = createUiTimeControl('', { rules: [required] })
  const datetime = createUiDateTimeControl('', { rules: [required] })
  const choices = createUiEntryControl([
    { key: 'a', label: 'First choice' },
    { key: 'b', label: 'Second choice' },
  ])

  function validate() {
    return Promise.all(
      [
        name,
        search,
        password,
        notes,
        radio,
        segmented,
        checks,
        multiple,
        date.field,
        time.field,
        datetime.field,
      ].map((field) => field.validate()),
    )
  }
  onUnmounted(() => choices.dispose())
</script>

<template>
  <UiStrategy :use="uiFieldLabels('beside')">
    <section aria-label="Validation preview">
      <UiLayout>
        <UiField
          :field="name"
          label="Name"
          required
        >
          <UiTextInput />
        </UiField>
        <UiField
          :field="search"
          label="Shared input frame"
          required
        >
          <UiInputFrame>
            <UiIcon name="search" />
            <UiTextInput />
            <UiButton
              :disabled="!search.state.input"
              @click="search.reset()"
            >
              Clear
            </UiButton>
          </UiInputFrame>
        </UiField>
        <UiField
          :field="password"
          label="Password"
          required
        >
          <UiTextInput
            type="password"
            password-reveal
            autocomplete="new-password"
          />
        </UiField>
        <UiField
          :field="notes"
          label="Notes"
          required
        >
          <UiTextInput multiline />
        </UiField>
        <UiField
          :field="radio"
          label="Radio group"
          group
          required
        >
          <UiRadioGroup :control="choices" />
        </UiField>
        <UiField
          :field="segmented"
          label="Segmented selection"
          required
        >
          <UiSegmentedSelect :control="choices" />
        </UiField>
        <UiField
          :field="checks"
          label="Checkbox group"
          group
          required
        >
          <UiCheckboxGroup :control="choices" />
        </UiField>
        <UiField
          :field="multiple"
          label="Multiple selection"
          required
        >
          <UiMultiSelect :control="choices" />
        </UiField>
        <UiField
          :field="date.field"
          label="Calendar date"
          required
        >
          <UiDateInput :binding="date.bindings.dateInput" />
        </UiField>
        <UiField
          :field="time.field"
          label="Time"
          required
        >
          <UiTimeInput :binding="time.bindings.timeInput" />
        </UiField>
        <UiField
          :field="datetime.field"
          label="Local date and time"
          required
        >
          <UiDateTimeInput :binding="datetime.bindings.dateTimeInput" />
        </UiField>
        <UiButton
          color="primary"
          variant="filled"
          @click="validate"
        >
          Check fields
        </UiButton>
      </UiLayout>
    </section>
  </UiStrategy>
</template>
