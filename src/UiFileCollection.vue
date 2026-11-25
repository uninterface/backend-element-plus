<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiFileCollectionViewProps } from '@uninterface/uninterface/backend'
  import { ElButton } from 'element-plus'
  defineProps<UiFileCollectionViewProps>()
</script>
<template>
  <ul class="element-plus-file-collection">
    <li
      v-for="file in files"
      :key="file.key"
    >
      <slot :file="file" />
      <ElButton
        v-if="removable"
        native-type="button"
        :disabled="disabled"
        :aria-label="`${removeLabel}: ${file.name}`"
        @click="remove(file.key)"
      >
        {{ removeLabel }}
      </ElButton>
    </li>
  </ul>
</template>
