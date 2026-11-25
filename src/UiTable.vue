<script setup lang="ts">
  import FilterButton from './TableFilterButton.vue'
  import AddRow from './TableAddRow.vue'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  defineOptions({ inheritAttrs: false })
  import { useUiLoadingSurface } from '@uninterface/uninterface/backend'
  import Empty from './UiEmpty.vue'
  import LoadingRegion from './UiLoadingRegion.vue'
  import {
    h,
    useSlots,
    computed,
    onMounted,
    onUpdated,
    onUnmounted,
    watchPostEffect,
    nextTick,
    ref,
    shallowRef,
  } from 'vue'
  import {
    ElTable,
    ElTableColumn,
    ElCheckbox,
    type TableInstance,
  } from 'element-plus'
  import {
    useUiCollectionView,
    useUiTableSizing,
    useUiTableAddRow,
    type UiTableViewProps,
    type UiCollectionRow,
  } from '@uninterface/uninterface/backend'
  import Status from './CollectionStatus.vue'
  const props = defineProps<UiTableViewProps>()
  const slots = useSlots()
  const summaryMethod = () => [
    ...(props.selection === 'none' ? [] : ['']),
    ...props.columns.map((column) =>
      h(
        'div',
        {
          ref:
            column.key === props.columns[0]?.key &&
            (props.dataSummary?.labelColumnSpan ?? 1) > 1
              ? undefined
              : sizing.summaryRef(column.key),
          style:
            column.key === props.columns[0]?.key &&
            (props.dataSummary?.labelColumnSpan ?? 1) > 1
              ? { minWidth: '0' }
              : sizing.contentStyle(column.key),
          'data-collection-summary-cell': column.key,
        },
        slots['summary-cell']?.({ column }),
      ),
    ),
  ]
  const { root, target, sentinel, rowRef, id, failure } =
    useUiCollectionView(props)
  const container = ref<HTMLElement>()
  const sizing = useUiTableSizing(props, container, id, { minimumHeader: true })
  const addGeometry = useUiTableAddRow({
    enabled: () => Boolean(props.addRow),
    bounded: () => props.height === 'full',
    host: () => root.value,
    summary: () =>
      container.value?.querySelector<HTMLElement>('[data-collection-summary]'),
    header: () => target.value?.querySelector<HTMLElement>('thead'),
    row: () =>
      target.value?.querySelector<HTMLElement>(
        'tbody tr:not([data-collection-add-track])',
      ),
  })
  const addTracks = computed(() => [
    ...(props.selection === 'none' ? [] : [sizing.selectionWidth.value]),
    ...props.columns.map((column) => sizing.width(column.key)),
  ])
  const addKeys = computed(() => [
    ...(props.selection === 'none' ? [] : ['selection']),
    ...props.columns.map((column) => column.key),
  ])
  const native = ref<TableInstance>()
  // Native sorting is appended after the header slot. Render resize handles
  // at the end of the actual th so their Tab position matches inline-end.
  const resizeTargets = shallowRef(new Map<string, Element>())
  // Element has one active sorting column. Its native header still owns clicks
  // and caret directions; restore all accepted clauses after each native event.
  function syncSort() {
    const columns = native.value?.store.states.columns.value ?? []
    for (const column of columns) {
      const accepted = props.columns.find(
        (entry) => entry.key === column.columnKey,
      )
      const order = accepted?.sort ?? null
      if (column.order !== order) column.order = order
    }
  }
  function syncSortAccessibility() {
    const headers = target.value?.querySelectorAll('thead th')
    if (!headers) return
    const offset = props.selection === 'none' ? 0 : 1
    props.columns.forEach((column, index) => {
      const header = headers[index + offset]
      if (column.primary && column.sort)
        header?.setAttribute('aria-sort', column.sort)
      else header?.removeAttribute('aria-sort')
    })
  }
  async function sortChanged(event: {
    column: { columnKey: string }
    order: 'ascending' | 'descending' | null
  }) {
    const column = props.columns.find(
      (entry) => entry.key === event.column.columnKey,
    )
    try {
      if (!props.disabled && column?.sortable)
        await column.requestSort(event.order)
    } finally {
      await nextTick()
      syncSort()
      await nextTick()
      syncSortAccessibility()
    }
  }
  // ElTable's append slot follows its summary. A backend-owned row group
  // between its record body and native footer preserves the requested order
  // without putting a synthetic record into the toolkit's data pipeline.
  const tailBody = shallowRef<HTMLTableSectionElement>()
  onUnmounted(() => tailBody.value?.remove())
  function syncTailBody(table: HTMLTableElement) {
    if (props.addRow || props.infinite) {
      if (tailBody.value?.parentElement !== table) {
        const previous = tailBody.value
        const body = table.ownerDocument.createElement('tbody')
        body.className = 'element-table-tail-body'
        table.insertBefore(body, table.querySelector('tfoot'))
        tailBody.value = body
        void nextTick(() => previous?.remove())
      }
      const body = tailBody.value!
      body.classList.toggle('element-table-add-body', Boolean(props.addRow))
      const footer = table.querySelector('tfoot')
      if (footer && body.nextElementSibling !== footer)
        table.insertBefore(body, footer)
    } else if (tailBody.value) {
      const previous = tailBody.value
      tailBody.value = undefined
      void nextTick(() => previous.remove())
    }
  }
  const rowKey = (row: UiCollectionRow) => `${typeof row.key}:${row.key}`
  function sync() {
    syncSort()
    const element = native.value?.$el as HTMLElement | undefined
    const viewport = element?.querySelector<HTMLElement>('.el-scrollbar__wrap')
    root.value =
      props.height === 'full' ? (viewport ?? undefined) : container.value
    if (viewport) {
      if (props.height === 'full') {
        viewport.setAttribute('role', 'region')
        viewport.setAttribute('aria-label', props.label)
        viewport.tabIndex = 0
      } else {
        viewport.removeAttribute('role')
        viewport.removeAttribute('aria-label')
        viewport.removeAttribute('tabindex')
      }
    }
    const table = element?.querySelector<HTMLTableElement>('table')
    target.value = table ?? undefined
    if (!table) {
      if (resizeTargets.value.size) resizeTargets.value = new Map()
      return
    }
    syncTailBody(table)
    table.setAttribute('aria-label', props.label)
    const footer = container.value?.querySelector('tfoot')
    if (footer && props.dataSummary) {
      footer.setAttribute('data-collection-summary', '')
      footer.setAttribute('data-summary-status', props.dataSummary.status)
      footer.setAttribute('aria-label', props.dataSummary.label)
      const footerTable = footer.closest('table')
      if (footerTable && footerTable !== table)
        footerTable.setAttribute(
          'aria-label',
          `${props.label}: ${props.dataSummary.label}`,
        )
      ;[...footer.querySelectorAll('td')]
        .slice(props.selection === 'none' ? 0 : 1)
        .forEach((cell, index) => {
          const column = props.columns[index]
          if (column) {
            const span = props.dataSummary?.labelColumnSpan ?? 1
            cell.colSpan = index === 0 ? span : 1
            cell.hidden = index > 0 && index < span
            if (index === 0) cell.style.textAlign = span > 1 ? 'start' : ''
            if (cell.closest('table') === table)
              cell.setAttribute(
                'headers',
                (index === 0 ? props.columns.slice(0, span) : [column])
                  .map((column) => sizing.columnId(column.key))
                  .join(' '),
              )
            else {
              cell.removeAttribute('headers')
              cell.setAttribute(
                'aria-label',
                index === 0 && span > 1
                  ? props.dataSummary!.label
                  : (column.label ?? column.key),
              )
            }
          }
        })
    }
    table.setAttribute('aria-busy', String(props.busy))
    table.tabIndex = -1
    Object.assign(table.style, sizing.tableStyle.value)
    const headers = [...table.querySelectorAll('thead th')].slice(
      props.selection === 'none' ? 0 : 1,
    )
    const nextResizeTargets = new Map<string, Element>()
    headers.forEach((header, index) => {
      const column = props.columns[index]
      if (column) {
        header.id = sizing.columnId(column.key)
        nextResizeTargets.set(column.key, header)
      }
      // Content sizing includes the native caret next to the slotted label.
      const cell = header.querySelector<HTMLElement>('.cell')
      if (cell && column) {
        const style = sizing.contentStyle(column.key)
        for (const property of [
          'display',
          'width',
          'max-width',
          'white-space',
          'min-width',
        ])
          cell.style.removeProperty(property)
        Object.assign(cell.style, style)
        // Keep native carets in the same flex row during intrinsic measurement.
        if (column.sortable && style.display) cell.style.display = 'inline-flex'
        sizing.contentRef(column.key)(cell)
      }
      const control = header.querySelector<HTMLButtonElement>('.caret-wrapper')
      if (control && column) {
        control.disabled = props.disabled
        control.setAttribute(
          'aria-label',
          `${column.sortLabel}: ${column.label ?? column.key}`,
        )
        if (column.sortDescription)
          control.setAttribute('aria-describedby', `${id}-sort-${index}`)
        else control.removeAttribute('aria-describedby')
      }
    })
    // ElTable 2.14.7 writes aria-sort when the native column order updates.
    // Project the primary-only state after its header has rendered the carets.
    void nextTick(syncSortAccessibility)
    if (
      nextResizeTargets.size !== resizeTargets.value.size ||
      [...nextResizeTargets].some(
        ([key, element]) => resizeTargets.value.get(key) !== element,
      )
    )
      resizeTargets.value = nextResizeTargets
    const elements = [...table.querySelectorAll('tbody tr')]
    props.rows.forEach((row, index) => rowRef(row.key, elements[index] ?? null))
  }
  watchPostEffect(sync)
  onMounted(sync)
  onUpdated(sync)
  const loadingSurface = {
    ...useUiLoadingSurface(() => container.value),
    // Keep header filter anchors available while a live query refreshes rows.
    interactionTarget: computed(
      () =>
        target.value?.querySelector<HTMLElement>('tbody') ?? container.value,
    ),
  }
</script>
<template>
  <div
    class="element-collection-frame"
    :data-collection-full="height === 'full' || undefined"
  >
    <div
      v-if="failed && failurePlacement === 'replacement' && !loading"
      ref="failure"
      class="element-collection-failure"
      data-collection-failure="replacement"
    >
      <slot
        name="error"
        :placement="failurePlacement!"
        :error="error"
        :retry="retry"
        :can-retry="canRetry"
      />
    </div>
    <div
      ref="container"
      v-bind="$attrs"
      class="element-collection"
      :data-full="height === 'full' || undefined"
      :data-loading-empty="(loading && rows.length === 0) || undefined"
      :data-scroll="scroll"
      :data-column-fit="sizing.fits.value"
      :role="height !== 'full' && scroll !== 'none' ? 'region' : undefined"
      :aria-label="height !== 'full' && scroll !== 'none' ? label : undefined"
      :tabindex="height !== 'full' && scroll !== 'none' ? 0 : undefined"
    >
      <div class="element-table-region">
        <ElTable
          v-show="sizing.fits.value"
          :style="
            height === 'full'
              ? { width: '100%', height: '100%' }
              : sizing.tableStyle.value
          "
          :height="height === 'full' ? '100%' : undefined"
          :fit="false"
          ref="native"
          class="element-table"
          :data="[...rows]"
          :row-key="rowKey"
          table-layout="auto"
          :highlight-current-row="false"
          :show-summary="Boolean(dataSummary)"
          :summary-method="summaryMethod"
          @sort-change="sortChanged"
          @click.capture="
            (event: MouseEvent) => {
              if (
                disabled &&
                (event.target as HTMLElement).closest('thead th.is-sortable')
              )
                event.stopPropagation()
            }
          "
        >
          <ElTableColumn
            v-if="selection !== 'none'"
            column-key="selection"
            :width="sizing.selectionWidth.value"
            :resizable="false"
          >
            <template #header>
              <ElCheckbox
                v-if="selection === 'multiple'"
                :aria-label="selectPageLabel"
                :model-value="pageSelected"
                :indeterminate="pageMixed"
                :disabled="!canSelectPage"
                :validate-event="false"
                @update:model-value="selectPage($event === true)"
              />
              <span v-else>{{ selectPageLabel }}</span>
            </template>
            <template #default="{ row }">
              <ElCheckbox
                v-if="row?.context"
                :aria-label="row.selectLabel"
                :model-value="row.context.selected"
                :disabled="!row.context.selectable"
                :validate-event="false"
                @update:model-value="
                  row.context.requestSelected($event === true)
                "
              />
            </template>
          </ElTableColumn>
          <ElTableColumn
            v-for="(column, index) in columns"
            :key="column.key"
            :column-key="column.key"
            :label="column.label"
            :width="sizing.width(column.key)"
            :align="column.align"
            :header-align="column.align"
            :sortable="column.sortable ? 'custom' : false"
            :prop="column.key"
            :resizable="false"
          >
            <template #header>
              <div class="element-table-header-copy">
                <slot
                  name="label"
                  :column="column"
                />
                <span
                  v-if="column.sortDescription"
                  :id="`${id}-sort-${index}`"
                  class="element-collection-announcement"
                >
                  {{ column.sortDescription }}
                </span>
                <div
                  v-if="column.filter"
                  class="element-table-filter-host"
                  @click.stop
                  @keydown="
                    ($event as KeyboardEvent).key !== 'Escape' &&
                    $event.stopPropagation()
                  "
                >
                  <slot
                    name="filter"
                    :trigger="FilterButton"
                    :column="column"
                  />
                </div>
              </div>
              <span
                v-if="showSortPriority && column.sort"
                class="element-table-sort-priority"
                data-ui-sort-priority
                aria-hidden="true"
              >
                {{ column.sortPriority }}
              </span>
              <span
                v-if="showSortPriority && column.sort"
                @click.stop
                @keydown.stop
              >
                <slot
                  name="sort-actions"
                  :column="column"
                />
              </span>
              <Teleport
                :to="resizeTargets.get(column.key)"
                :disabled="!resizeTargets.has(column.key)"
              >
                <span
                  v-if="sizing.handle(column.key)"
                  v-bind="sizing.handle(column.key)"
                  class="element-column-resizer"
                  @click.stop
                  @keydown.stop
                />
              </Teleport>
            </template>
            <template #default="{ row }">
              <div
                v-if="row?.context"
                :ref="sizing.contentRef(column.key, row.key)"
                class="element-table-cell-content"
                :style="sizing.contentStyle(column.key)"
              >
                <slot
                  name="cell"
                  :row="row"
                  :column="column"
                />
              </div>
              <p v-if="row?.issue && index === columns.length - 1">
                {{ row.issue }}
              </p>
            </template>
          </ElTableColumn>
          <template #empty>
            <div
              v-if="failed && failurePlacement === 'initial' && !loading"
              ref="failure"
              class="element-collection-failure"
              data-collection-failure="initial"
            >
              <slot
                name="error"
                :placement="failurePlacement!"
                :error="error"
                :retry="retry"
                :can-retry="canRetry"
              />
            </div>
            <slot
              v-if="empty"
              name="empty"
            >
              <Empty :label="message" />
            </slot>
            <span v-else />
          </template>
          <template
            v-if="
              !infinite && failed && failurePlacement === 'append' && !loading
            "
            #append
          >
            <div
              v-if="failed && failurePlacement === 'append' && !loading"
              ref="failure"
              class="element-collection-failure"
              data-collection-failure="append"
            >
              <slot
                name="error"
                :placement="failurePlacement!"
                :error="error"
                :retry="retry"
                :can-retry="canRetry"
              />
            </div>
          </template>
        </ElTable>
        <Teleport
          v-if="tailBody"
          :to="tailBody"
        >
          <tr
            v-if="infinite"
            data-collection-continuation
          >
            <td
              class="el-table__cell"
              :colspan="
                Math.max(1, columns.length + (selection === 'none' ? 0 : 1))
              "
            >
              <div
                v-if="failed && failurePlacement === 'append' && !loading"
                ref="failure"
                class="element-collection-failure"
                data-collection-failure="append"
              >
                <slot
                  name="error"
                  :placement="failurePlacement!"
                  :error="error"
                  :retry="retry"
                  :can-retry="canRetry"
                />
              </div>
              <div
                ref="sentinel"
                aria-hidden="true"
                class="element-collection-sentinel"
              />
              <Status
                v-bind="props"
                suppress-announcement
                empty-in-body
              >
                <template
                  v-if="$slots['infinity-loading']"
                  #infinity-loading="values"
                >
                  <slot
                    name="infinity-loading"
                    v-bind="values"
                  />
                </template>
                <template
                  v-if="$slots['infinity-complete']"
                  #infinity-complete="values"
                >
                  <slot
                    name="infinity-complete"
                    v-bind="values"
                  />
                </template>
              </Status>
            </td>
          </tr>
          <tr
            v-if="addRow"
            data-collection-add-track
            class="element-table-add-track"
          >
            <td
              :colspan="
                Math.max(1, columns.length + (selection === 'none' ? 0 : 1))
              "
            >
              <AddRow
                :tracks="addTracks"
                :keys="addKeys"
                :viewport="addGeometry.viewportWidth.value"
              >
                <slot name="add-row-action" />
              </AddRow>
            </td>
          </tr>
        </Teleport>
        <p
          v-if="!sizing.fits.value"
          role="status"
        >
          {{ sizeConstraintLabel }}
        </p>
      </div>

      <Status
        v-if="!infinite"
        v-bind="props"
        empty-in-body
      >
        <template
          v-if="$slots['infinity-loading']"
          #infinity-loading="values"
        >
          <slot
            name="infinity-loading"
            v-bind="values"
          />
        </template>
        <template
          v-if="$slots['infinity-complete']"
          #infinity-complete="values"
        >
          <slot
            name="infinity-complete"
            v-bind="values"
          />
        </template>
      </Status>
      <div
        v-else
        class="element-collection-status"
      >
        <span
          class="element-collection-announcement"
          data-ui-loading-status
          role="status"
          aria-atomic="true"
        >
          {{ announcement }}
        </span>
      </div>
    </div>
    <div
      v-if="$slots.footer"
      class="element-table-footer"
    >
      <slot name="footer" />
    </div>
  </div>
  <LoadingRegion
    :surface="loadingSurface"
    :loading="loading"
    :label="message"
    :announce="false"
    :manage-busy="false"
  />
</template>
