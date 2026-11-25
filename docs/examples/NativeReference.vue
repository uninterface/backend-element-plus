<script setup lang="ts">
  import { ElCollapse, ElCollapseItem } from 'element-plus'
  const nativeExpanded = ref<string[]>([])
  import { ref } from 'vue'
  import {
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElSelect,
    ElOption,
    ElCheckbox,
    ElButton,
    ElDropdown,
    ElDropdownItem,
    ElDropdownMenu,
    ElMenu,
    ElMenuItem,
    ElSubMenu,
  } from 'element-plus'
  defineProps<{
    invalid: boolean
    loading: boolean
    disabled: boolean
    sourceState?: string
  }>()
  const nativeModal = ref(false)
  const name = ref('Ada')
  const location = ref('shanghai')
  const active = ref(true)
</script>
<template>
  <ElCollapse
    v-model="nativeExpanded"
    data-native-collapsible
  >
    <ElCollapseItem
      name="details"
      title="Additional information"
      :disabled="disabled"
    >
      <p>Retained detail content.</p>
    </ElCollapseItem>
  </ElCollapse>
  <ElButton @click="nativeModal = true">Open native modal</ElButton>
  <ElDialog
    v-model="nativeModal"
    title="Modal presentation"
  >
    <p>Review the operation before continuing.</p>
    <template #footer>
      <ElButton @click="nativeModal = false">Cancel</ElButton>
      <ElButton
        type="primary"
        @click="nativeModal = false"
      >
        OK
      </ElButton>
    </template>
  </ElDialog>
  <ElMenu
    mode="horizontal"
    default-active="editor"
    :ellipsis="false"
    menu-trigger="click"
  >
    <ElMenuItem index="editor">Editor</ElMenuItem>
    <ElSubMenu index="examples">
      <template #title>Examples</template>
      <ElMenuItem index="buttons">Buttons</ElMenuItem>
      <ElSubMenu index="more">
        <template #title>More</template>
        <ElMenuItem index="forms">Forms</ElMenuItem>
      </ElSubMenu>
    </ElSubMenu>
  </ElMenu>
  <ElForm
    label-position="top"
    @submit.prevent
  >
    <ElFormItem
      label="Name"
      required
      inline-message
      :error="invalid ? 'Enter a name.' : undefined"
    >
      <ElInput
        v-model="name"
        :disabled="disabled"
      />
    </ElFormItem>
    <ElFormItem label="Location">
      <ElSelect
        v-model="location"
        :loading="sourceState === 'loading'"
        :no-data-text="
          sourceState === 'error'
            ? 'Entries could not be loaded.'
            : sourceState === 'idle'
              ? 'Entries not loaded.'
              : 'No entries available.'
        "
      >
        <template #label>Shanghai</template>
        <ElOption
          v-if="!sourceState || sourceState === 'ready'"
          value="shanghai"
          label="Shanghai"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem><ElCheckbox v-model="active">Active</ElCheckbox></ElFormItem>
    <ElFormItem>
      <ElButton
        type="primary"
        :loading="loading"
        :disabled="disabled"
      >
        Save
      </ElButton>
      <ElButton
        type="info"
        :disabled="disabled"
      >
        Reset
      </ElButton>
      <ElButton
        type="primary"
        plain
      >
        Outline
      </ElButton>
    </ElFormItem>
  </ElForm>
  <ElDropdown
    data-native-dropdown
    trigger="click"
  >
    <ElButton>Commands</ElButton>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem>Refresh</ElDropdownItem>
        <ElDropdownItem disabled>Delete</ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
