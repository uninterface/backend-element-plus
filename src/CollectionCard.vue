<script setup lang="ts">
  import { useUiZPart } from '@uninterface/uninterface/backend'
  const vUiZPart = useUiZPart()
  import { ElCheckbox } from 'element-plus'
  import { computed } from 'vue'
  import type {
    UiCollectionCardViewProps,
    UiCollectionCardFieldView,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<UiCollectionCardViewProps>()
  const inPlace = (place: UiCollectionCardFieldView['placement']) =>
    props.fields.filter((field) => field.placement === place)
  const hasMedia = computed(() => inPlace('media').length > 0)
</script>
<template>
  <div
    v-if="part === 'header'"
    class="element-collection-card-header"
  >
    <div
      v-if="selection !== 'none'"
      class="element-collection-card-selection"
    >
      <ElCheckbox
        :aria-label="row.selectLabel"
        :model-value="row.context.selected"
        :disabled="!row.context.selectable"
        @update:model-value="row.context.requestSelected($event === true)"
      />
    </div>
    <div
      v-if="inPlace('leading').length"
      class="element-collection-card-leading"
    >
      <div
        v-for="field in inPlace('leading')"
        :key="field.key"
        v-ui-z-part="field.z"
      >
        <slot
          name="field"
          :field="field"
        />
      </div>
    </div>
    <div class="element-card-title element-collection-card-title">
      <div
        v-for="field in inPlace('title')"
        :key="field.key"
        v-ui-z-part="field.z"
      >
        <slot
          name="field"
          :field="field"
        />
      </div>
    </div>
    <div
      v-if="
        inPlace('header-end').length ||
        (!hasMedia && inPlace('overlay-end').length)
      "
      class="element-collection-card-indicators"
    >
      <div
        v-for="field in inPlace('header-end')"
        :key="field.key"
        v-ui-z-part="field.z"
      >
        <slot
          name="field"
          :field="field"
        />
      </div>
      <div
        v-for="field in !hasMedia ? inPlace('overlay-end') : []"
        :key="field.key"
        v-ui-z-part="field.z"
      >
        <slot
          name="field"
          :field="field"
        />
      </div>
    </div>
  </div>
  <div
    v-else-if="part === 'body'"
    class="element-collection-card-body"
  >
    <div
      v-if="hasMedia"
      class="element-collection-card-media"
    >
      <div
        v-for="field in inPlace('media')"
        :key="field.key"
        v-ui-z-part="field.z"
      >
        <slot
          name="field"
          :field="field"
        />
      </div>
      <div
        v-if="inPlace('overlay-end').length"
        class="element-collection-card-overlay"
      >
        <div
          v-for="field in inPlace('overlay-end')"
          :key="field.key"
          v-ui-z-part="field.z"
        >
          <slot
            name="field"
            :field="field"
          />
        </div>
      </div>
    </div>
    <dl
      v-if="inPlace('body').length"
      class="element-collection-card-details"
    >
      <div
        v-for="field in inPlace('body')"
        :key="field.key"
        v-ui-z-part="field.z"
      >
        <dt>{{ field.label }}</dt>
        <dd>
          <slot
            name="field"
            :field="field"
          />
        </dd>
      </div>
    </dl>
  </div>
  <div
    v-else
    class="element-collection-card-actions"
  >
    <slot />
  </div>
</template>
