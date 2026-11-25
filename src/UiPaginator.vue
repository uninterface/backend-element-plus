<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import {
    useUiCollectionFooterNavigation,
    useUiCollectionFooterCompact,
  } from '@uninterface/uninterface/backend'
  const footerCompact = useUiCollectionFooterCompact()

  import { computed } from 'vue'
  import {
    DArrowLeft,
    DArrowRight,
    ArrowLeft,
    ArrowRight,
  } from '@element-plus/icons-vue'
  import { ElIcon } from 'element-plus'
  import { ElButton, ElPagination } from 'element-plus'
  import type { UiPaginatorViewProps } from '@uninterface/uninterface/backend'
  const props = defineProps<UiPaginatorViewProps>()
  const footerWidth = useUiCollectionFooterNavigation(
    () => (4 + Math.min(props.pageCount ?? 1, 7)) * 2 + 1,
    () => (4 + Math.min(props.pageCount ?? 1, 7)) * 1.5 + 1,
  )
  const compact = computed(() => footerCompact?.value ?? false)
  const numbered = computed(
    () =>
      props.page !== undefined &&
      props.pageCount !== undefined &&
      props.pageCount > 0 &&
      props.page <= props.pageCount &&
      props.canJump,
  )
</script>
<template>
  <nav
    class="element-paginator"
    :data-compact="compact ? '' : undefined"
    :aria-label="label"
    :aria-busy="pending"
  >
    <div
      v-if="numbered"
      class="el-pagination"
      :class="{ 'el-pagination--small': compact }"
    >
      <button
        class="btn-prev"
        type="button"
        :aria-label="firstLabel"
        :disabled="!canFirst"
        @click="first"
      >
        <ElIcon><DArrowLeft /></ElIcon>
      </button>
      <ElPagination
        :size="compact ? 'small' : undefined"
        :pager-count="compact ? 5 : 7"
        :current-page="page"
        :page-count="pageCount"
        :page-size="acceptedPageSize"
        :disabled="pending"
        layout="prev, pager, next"
        @update:current-page="goTo"
      />
      <button
        class="btn-next"
        type="button"
        :aria-label="lastLabel"
        :disabled="!canLast"
        @click="last"
      >
        <ElIcon><DArrowRight /></ElIcon>
      </button>
    </div>
    <template v-else>
      <ElButton
        native-type="button"
        :disabled="!canFirst"
        :aria-label="firstLabel"
        @click="first"
      >
        <ElIcon
          v-if="compact"
          class="element-paginator-direction"
          aria-hidden="true"
        >
          <DArrowLeft />
        </ElIcon>
        <template v-else>{{ firstLabel }}</template>
      </ElButton>
      <ElButton
        native-type="button"
        :disabled="!canPrevious"
        :aria-label="previousLabel"
        @click="previous"
      >
        <ElIcon
          v-if="compact"
          class="element-paginator-direction"
          aria-hidden="true"
        >
          <ArrowLeft />
        </ElIcon>
        <template v-else>{{ previousLabel }}</template>
      </ElButton>
      <span
        v-if="pageLabel"
        :aria-label="pageLabel"
      >
        {{ compact ? page : pageLabel }}
      </span>
      <ElButton
        native-type="button"
        :disabled="!canNext"
        :aria-label="nextLabel"
        @click="next"
      >
        <ElIcon
          v-if="compact"
          class="element-paginator-direction"
          aria-hidden="true"
        >
          <ArrowRight />
        </ElIcon>
        <template v-else>{{ nextLabel }}</template>
      </ElButton>
      <ElButton
        native-type="button"
        :disabled="!canLast"
        :aria-label="lastLabel"
        @click="last"
      >
        <ElIcon
          v-if="compact"
          class="element-paginator-direction"
          aria-hidden="true"
        >
          <DArrowRight />
        </ElIcon>
        <template v-else>{{ lastLabel }}</template>
      </ElButton>
    </template>
  </nav>
</template>
