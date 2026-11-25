<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiUploadRegionView,
    type UiUploadRegionViewProps,
  } from '@uninterface/uninterface/backend'
  import Preview from './UiFilePreview.vue'
  import Progress from './UiUploadProgress.vue'
  import { ElButton, ElIcon } from 'element-plus'
  import { Delete as RemoveIcon, UploadFilled } from '@element-plus/icons-vue'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiUploadRegionViewProps>()
  const {
    root,
    input,
    dragging,
    labelled,
    choose,
    changed,
    dragover,
    dragleave,
    drop,
    focus,
  } = useUiUploadRegionView(props)
  defineExpose({ focus })
</script>
<template>
  <div
    ref="root"
    v-bind="$attrs"
    role="group"
    :aria-label="label || chooseLabel"
    :aria-busy="busy || undefined"
    :aria-disabled="binding.disabled || undefined"
    :aria-describedby="labelled['aria-describedby']"
    :tabindex="binding.disabled ? undefined : -1"
    data-ui-upload-region
    :data-upload-phase="phase"
    :data-upload-error="!!issue || undefined"
    :data-upload-recovery="!!issue || !!progress?.canRetry || undefined"
    class="element-plus-upload-region el-upload-dragger"
    :class="{ 'is-dragover': dragging && canAcquire }"
    :data-extent="extent"
    :style="
      allocatedHeight === undefined
        ? undefined
        : { blockSize: allocatedHeight + 'px' }
    "
    :data-drop-ready="canAcquire || undefined"
    :data-dragging="(dragging && canAcquire) || undefined"
    :data-invalid="binding.invalid || !!issue || undefined"
    @dragover="dragover"
    @dragleave="dragleave"
    @drop="drop"
  >
    <span
      v-if="requiredLabel"
      :id="binding.id + '-upload-required'"
      class="upload-required-description"
    >
      {{ requiredLabel }}
    </span>
    <input
      ref="input"
      type="file"
      hidden
      :accept="accept"
      :capture="capture"
      :disabled="!canAcquire"
      @change="changed"
    />
    <button
      v-bind="labelled"
      type="button"
      data-upload-choose
      :title="chooseLabel"
      v-if="phase === 'ready' && !issue && !progress?.canRetry"
      class="element-plus-upload-choose"
      :disabled="!canAcquire"
      @click="choose"
    >
      <ElIcon
        class="el-icon--upload"
        aria-hidden="true"
      >
        <UploadFilled />
      </ElIcon>
      <span class="el-upload__text">
        {{ chooseLabel }}
      </span>
    </button>
    <ElButton
      v-else-if="phase === 'ready'"
      v-bind="labelled"
      native-type="button"
      circle
      text
      data-upload-choose
      :title="chooseLabel"
      :disabled="!canAcquire"
      @click="choose"
    >
      <ElIcon aria-hidden="true"><UploadFilled /></ElIcon>
    </ElButton>
    <span
      v-if="
        fileName &&
        !preview &&
        !(
          progress?.fileName &&
          (progress.active || progress.issue || progress.canRetry)
        )
      "
      data-ui-file-name
      :title="fileName ?? undefined"
      class="element-plus-upload-name"
    >
      {{ fileName }}
    </span>
    <div
      v-if="!progress?.issue"
      :id="binding.id + '-upload-issue'"
      role="status"
      class="element-plus-upload-feedback"
      :title="issue ?? undefined"
    >
      {{ issue }}
    </div>
    <Progress
      v-if="progress"
      v-bind="progress"
    />
    <div
      v-if="preview"
      data-upload-preview
      class="element-plus-upload-preview"
    >
      <Preview
        v-bind="preview"
        :presentation="issue ? 'row' : preview.presentation"
      />
    </div>
    <div
      v-if="actions.length"
      class="element-plus-upload-actions"
    >
      <ElButton
        v-for="action in actions"
        :key="action.name"
        native-type="button"
        :circle="action.name === 'remove'"
        :text="action.name === 'remove'"
        :data-upload-action="action.name"
        :aria-label="
          action.accessibleLabel ??
          (action.name === 'remove' ? action.label : undefined)
        "
        :title="action.name === 'remove' ? action.label : undefined"
        :disabled="action.disabled"
        @click="action.invoke"
      >
        <RemoveIcon
          v-if="action.name === 'remove'"
          aria-hidden="true"
          class="upload-remove-icon"
        />
        <template v-if="action.name !== 'remove'">{{ action.label }}</template>
      </ElButton>
    </div>
  </div>
</template>
