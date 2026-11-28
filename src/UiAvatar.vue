<script setup lang="ts">
  import {
    uiAvatarImageProps,
    useUiZView,
    type UiAvatarViewProps,
  } from '@uninterface/uninterface/backend'
  import { ElAvatar } from 'element-plus'
  import { UserFilled } from '@element-plus/icons-vue'
  defineProps<UiAvatarViewProps>()
  useUiZView()

  const sizeOffsets = {
    '-2': '-16px',
    '-1': '-16px',
    '0': '0px',
    '1': '16px',
    '2': '16px',
  } as const
</script>

<template>
  <span
    class="element-avatar"
    :style="size ? { width: size, height: size } : undefined"
  >
    <ElAvatar
      class="element-avatar-surface"
      :shape="shape"
      :style="{
        width: size ? '100%' : undefined,
        height: size ? '100%' : undefined,
        '--element-avatar-size-offset': sizeOffsets[sizeStep],
      }"
    >
      <img
        v-if="image"
        :key="image.key"
        v-show="image.visible"
        class="element-avatar-image"
        v-bind="uiAvatarImageProps(image)"
        :style="{ objectFit: fit }"
        alt=""
      />
      <span
        v-if="!image?.visible"
        class="element-avatar-fallback"
        aria-hidden="true"
      >
        <slot name="fallback">
          <UserFilled class="element-avatar-glyph" />
        </slot>
      </span>
    </ElAvatar>
  </span>
</template>

<style scoped>
  .element-avatar {
    display: inline-flex;
    flex: none;
    vertical-align: middle;
  }
  .element-avatar-surface {
    --el-avatar-size: calc(3.25em + var(--element-avatar-size-offset));
    position: relative;
    flex: none;
    overflow: hidden;
  }
  .element-avatar-image,
  .element-avatar-fallback {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .element-avatar-fallback {
    display: grid;
    place-items: center;
    line-height: 1;
  }

  .element-avatar-glyph {
    width: 1em;
    height: 1em;
  }
</style>
