<script setup lang="ts">
  import { inject, onMounted, onBeforeUnmount } from 'vue'
  import { fieldPresentationKey } from './fieldPresentation'
  defineProps<{
    id: string
    message: string
    inline: boolean
    deferred: boolean
  }>()
  const field = inject(fieldPresentationKey)!
  onMounted(() => {
    field.errorVisible.value = true
  })
  onBeforeUnmount(() => {
    field.errorVisible.value = false
  })
</script>
<template>
  <div
    :id="id"
    class="el-form-item__error element-field-error"
    :class="{
      'el-form-item__error--inline': inline,
      'element-visually-hidden': deferred,
    }"
    role="alert"
  >
    {{ message }}
  </div>
</template>
