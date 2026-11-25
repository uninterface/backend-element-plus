<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiFilePreviewView,
    type UiFilePreviewViewProps,
  } from '@uninterface/uninterface/backend'
  import { ElImage } from 'element-plus'
  import UiImagePreview from './UiImagePreview.vue'
  import FileTypeIcon from './FileTypeIcon.vue'
  const props = withDefaults(defineProps<UiFilePreviewViewProps>(), {
    presentation: 'tile',
  })
  const { kind, sizeLabel, icon, thumbnailImage } = useUiFilePreviewView(props)
</script>
<template>
  <UiImagePreview
    v-if="image && !thumbnail"
    :url="url"
    :alt="alt"
  />
  <div
    v-else
    class="element-plus-file-preview"
    data-ui-file-preview
    :data-presentation="presentation"
  >
    <span
      class="element-plus-file-icon"
      data-file-icon
      :data-file-kind="kind"
      aria-hidden="true"
    >
      <ElImage
        v-if="thumbnailImage"
        :key="thumbnailImage.url"
        :src="thumbnailImage.url"
        alt=""
        fit="contain"
        data-file-thumbnail
        v-on="{ error: thumbnailImage.error }"
      >
        <template #placeholder><span /></template>
        <template #error><span /></template>
      </ElImage>
      <component
        v-else-if="icon"
        :is="icon"
        aria-hidden="true"
        focusable="false"
      />
      <FileTypeIcon
        v-else
        :kind="kind"
      />
    </span>
    <div class="element-plus-file-details">
      <span
        class="element-plus-file-preview-name"
        data-file-name
        :title="name"
      >
        {{ name }}
      </span>
      <span
        v-if="sizeLabel !== undefined"
        class="element-plus-file-size"
        data-file-size
      >
        {{ sizeLabel }}
      </span>
    </div>
  </div>
</template>
