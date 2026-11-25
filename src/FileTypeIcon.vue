<script setup lang="ts">
  import { computed, type Component } from 'vue'
  import {
    Document,
    Tickets,
    Files,
    FolderOpened,
    Headset,
    VideoCamera,
    DataAnalysis,
    Monitor,
  } from '@element-plus/icons-vue'
  const props = defineProps<{ kind: string }>()
  const artwork = computed(
    () =>
      (
        ({
          document: Document,
          pdf: Tickets,
          spreadsheet: DataAnalysis,
          presentation: Monitor,
          archive: FolderOpened,
          audio: Headset,
          video: VideoCamera,
          code: Document,
        }) as Record<string, Component>
      )[props.kind] ?? Files,
  )
</script>
<template>
  <component
    :is="artwork"
    aria-hidden="true"
    focusable="false"
  />
</template>
