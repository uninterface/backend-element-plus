<script setup lang="ts">
  import { onScopeDispose } from 'vue'
  import {
    UiButton,
    UiCheckbox,
    UiField,
    UiForm,
    UiNavMenu,
    UiNavbar,
    UiSegmentedSelect,
    UiSelect,
    UiStrategy,
    createUiEntryControl,
    createUiFieldControl,
    createUiFormControl,
    uiFieldLabels,
    UiTextInput,
  } from '@uninterface/uninterface'

  const scenario = new URLSearchParams(location.search).get('scenario')
  const choice = createUiFieldControl('one')
  const entries = createUiEntryControl([
    { key: 'one', label: 'First' },
    { key: 'two', label: 'Second' },
    { key: 'three', label: 'Third' },
  ])
  onScopeDispose(entries.dispose)
  const name = createUiFieldControl('Ada', undefined, [
    (value) => (value.trim() ? null : 'Enter a name.'),
  ])
  const reference = createUiFieldControl('')
  const category = createUiFieldControl('general')
  const categories = createUiEntryControl([
    { key: 'general', label: 'General' },
  ])
  const enabled = createUiFieldControl(false)
  const form = createUiFormControl({ name, reference, category, enabled })
  onScopeDispose(form.dispose)
  const navigation = createUiEntryControl([
    {
      kind: 'submenu',
      key: 'records',
      label: 'Records',
      children: [{ key: 'directory', label: 'Directory', href: '#directory' }],
    },
    {
      kind: 'submenu',
      key: 'reports',
      label: 'Reports',
      children:
        scenario === 'pending-navigation'
          ? ({ signal }) =>
              new Promise((resolve) => {
                signal.addEventListener('abort', () => resolve([]), {
                  once: true,
                })
              })
          : [{ key: 'summary', label: 'Summary', href: '#summary' }],
    },
  ])
  onScopeDispose(navigation.dispose)
</script>

<template>
  <main>
    <UiStrategy
      v-if="scenario === 'segmented-focus'"
      :use="uiFieldLabels('above')"
    >
      <UiNavbar aria-label="Field alignment">
        <template #actions>
          <UiField
            :field="choice"
            label="Selection"
          >
            <UiSelect :control="entries" />
          </UiField>
          <UiField
            :field="choice"
            label="Choices"
          >
            <UiSegmentedSelect :control="entries" />
          </UiField>
        </template>
      </UiNavbar>
    </UiStrategy>
    <UiForm
      v-else-if="scenario === 'fields'"
      :control="form"
      label="Field conformance"
      :save="async () => {}"
    >
      <UiField
        :field="name"
        label="Name"
        help="Use your full name."
        required
      >
        <UiTextInput />
      </UiField>
      <UiField
        :field="reference"
        label="Reference"
      >
        <UiTextInput />
      </UiField>
      <UiField
        :field="category"
        label="Category"
        required
      >
        <UiSelect :control="categories" />
      </UiField>
      <UiField
        :field="enabled"
        label="Enabled"
        help="Allow notifications."
      >
        <UiCheckbox />
      </UiField>
      <UiButton @click="name.validate()">Validate name</UiButton>
    </UiForm>
    <UiNavMenu
      v-else-if="scenario === 'pending-navigation'"
      :control="navigation"
      aria-label="Sections"
    />
  </main>
</template>
