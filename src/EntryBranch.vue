<script setup lang="ts">
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { useUiOverlayTarget } from '@uninterface/uninterface/backend'
  const overlayTarget = useUiOverlayTarget()
  import {
    computed,
    getCurrentInstance,
    inject,
    provide,
    onMounted,
    onUpdated,
    onBeforeUnmount,
    ref,
    useId,
    watchEffect,
  } from 'vue'
  import {
    ElButton,
    ElMenuItem,
    ElMenuItemGroup,
    ElSubMenu,
    ElDivider,
    useLocale,
    MENU_INJECTION_KEY,
    type MenuProvider,
  } from 'element-plus'
  import { ArrowRight } from '@element-plus/icons-vue'
  import {
    useUiMenuPopup,
    useUiMenuIconColumn,
    type UiEntryViewNode,
    type UiEntryStatusViewBinding,
  } from '@uninterface/uninterface/backend'
  import {
    entryIndex,
    menuPresentationKey,
    commandCheckColumnKey,
  } from './menuPresentation'
  import EntryContent from './EntryContent.vue'
  import { useNavigationDropdownHeight } from './navigationDropdownHeight'
  const props = defineProps<{
    entries: readonly UiEntryViewNode[]
    status?: UiEntryStatusViewBinding
    label: string
    parentKey?: string
    surfaceId?: string
    group?: boolean
  }>()
  defineSlots<{
    entry(props: {
      entry: Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
    }): any
    icon(props: {
      entry: Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
      icon?: unknown
    }): any
  }>()
  const presentation = inject(menuPresentationKey)!
  const parentCheckColumn = inject(commandCheckColumnKey, undefined)
  function hasCheck(entries: readonly UiEntryViewNode[]): boolean {
    return entries.some(
      (node) =>
        Boolean(node.selectionMode) ||
        (node.entry.kind === 'group' && hasCheck(node.children ?? [])),
    )
  }
  const checkColumn = computed(() =>
    presentation.navigation
      ? false
      : props.group && parentCheckColumn
        ? parentCheckColumn.value
        : hasCheck(props.entries),
  )
  provide(commandCheckColumnKey, checkColumn)
  const iconColumn = useUiMenuIconColumn(() => props.entries, {
    group: () => Boolean(props.group),
    reserve: () =>
      presentation.navigation &&
      (presentation.persistent() ||
        (props.parentKey === undefined && !presentation.horizontal())),
    enabled: () =>
      !(
        presentation.navigation &&
        presentation.horizontal() &&
        props.parentKey === undefined
      ),
  })
  const { t } = useLocale()
  const message = computed(() =>
    props.status?.pending ? t('el.select.loading') : props.status?.message,
  )
  const id = useId()
  const instance = getCurrentInstance()!
  const surface = ref<HTMLElement>()
  const dropdownRoot = ref<HTMLElement>()
  const nativeMenu = inject<MenuProvider>(MENU_INJECTION_KEY)!
  const dropdownHeight = useNavigationDropdownHeight(
    () => dropdownRoot.value,
    () =>
      presentation.navigation &&
      presentation.horizontal() &&
      props.parentKey === undefined,
    () => nativeMenu.props.popperOffset,
    () => props.entries.some((node) => node.expanded),
  )
  useUiMenuPopup(surface)
  // Root and inline branches forward the enclosing scope to their descendants.
  const ownsPopup = () =>
    props.parentKey !== undefined && !props.group && !presentation.persistent()
  useUiZPopup(
    () =>
      ownsPopup()
        ? surface.value?.closest<HTMLElement>('.el-popper')
        : undefined,
    { scope: true, scopeActive: ownsPopup },
  )
  let detach: (() => void) | undefined
  onMounted(() => {
    // Fragment anchors are in the actual ElMenu/ElSubMenu UL. No extra wrapper
    // or parallel popup is rendered just to register teleported ownership.
    const element = (instance.vnode.el as Node).parentElement!
    dropdownRoot.value =
      element.closest<HTMLElement>('.element-navigation-menu') ?? undefined
    if (props.group) {
      element.setAttribute('role', 'none')
      return
    }
    surface.value = element
    if (!presentation.navigation && props.parentKey !== undefined)
      element.classList.add('element-command-menu')
    detach = presentation.register(props.parentKey, element)
    if (props.parentKey !== undefined) {
      element.id = props.surfaceId!
      element.setAttribute('role', 'menu')
      element.setAttribute('aria-label', props.label)
      element.setAttribute('data-parent', props.parentKey)
      element.tabIndex = -1
    }
  })
  watchEffect(() => {
    const element = surface.value
    if (element) {
      if (props.status?.pending) element.setAttribute('aria-busy', 'true')
      else element.removeAttribute('aria-busy')
    }
  })
  onUpdated(presentation.tabstops)
  onBeforeUnmount(() => detach?.())
  function current(node: UiEntryViewNode): boolean {
    return Boolean(node.current || node.children?.some(current))
  }
  function forwardLink(event: MouseEvent, node: UiEntryViewNode) {
    if (
      !presentation.navigation ||
      !('href' in node.entry) ||
      !node.entry.href ||
      node.entry.disabled
    )
      return
    const item = event.currentTarget as HTMLElement
    const link = item.querySelector<HTMLAnchorElement>('a[href]')
    if (!link || link.contains(event.target as Node)) return
    // Preserve modifier intent even when clicking the native item's padding.
    event.preventDefault()
    event.stopImmediatePropagation()
    link.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        button: event.button,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
      }),
    )
  }
  function clickSubmenu(event: MouseEvent, node: UiEntryViewNode) {
    if (presentation.rail()) {
      event.stopPropagation()
      // Collapsed ElMenu opens on hover. A following click must not undo that
      // opening; also allow a touch/click to open without a preceding hover.
      if (!node.expanded) presentation.expand(node.entry.key, true)
      return
    }
    // Keyboard consumers click the menuitem LI; Element's action is on its title.
    if (event.target === event.currentTarget)
      (event.currentTarget as HTMLElement)
        .querySelector<HTMLElement>(':scope > .el-sub-menu__title')
        ?.click()
  }
</script>
<template>
  <template
    v-for="(node, index) in entries"
    :key="node.entry.key"
  >
    <li
      v-if="node.entry.kind === 'separator'"
      role="none"
    >
      <ElDivider />
    </li>
    <ElMenuItemGroup
      v-else-if="node.entry.kind === 'group'"
      :title="node.entry.label"
      :data-rail-group="
        (presentation.rail() && parentKey === undefined) || undefined
      "
      role="group"
      :aria-label="node.entry.label"
    >
      <template #title>
        <span
          v-if="checkColumn"
          aria-hidden="true"
          class="element-entry-check"
        />
        <EntryContent
          :entry="node.entry"
          :icon-column="iconColumn"
          :rail="presentation.rail() && parentKey === undefined"
        >
          <template #entry="scope">
            <slot
              name="entry"
              v-bind="scope"
            />
          </template>
          <template #icon="scope">
            <slot
              name="icon"
              v-bind="scope"
            />
          </template>
        </EntryContent>
      </template>
      <EntryBranch
        :entries="node.children ?? []"
        :label="node.entry.label"
        group
        :parent-key="parentKey"
      >
        <template #entry="scope">
          <slot
            name="entry"
            v-bind="scope"
          />
        </template>
        <template #icon="scope">
          <slot
            name="icon"
            v-bind="scope"
          />
        </template>
      </EntryBranch>
    </ElMenuItemGroup>
    <ElSubMenu
      v-else-if="node.entry.kind === 'submenu'"
      :index="entryIndex(node.entry.key)"
      :disabled="node.entry.disabled"
      :class="{ 'is-active': current(node) }"
      :expand-open-icon="
        presentation.navigation &&
        (presentation.persistent() ||
          (presentation.horizontal() && parentKey === undefined))
          ? undefined
          : ArrowRight
      "
      :expand-close-icon="
        presentation.navigation &&
        (presentation.persistent() ||
          (presentation.horizontal() && parentKey === undefined))
          ? undefined
          : ArrowRight
      "
      :teleported="true"
      :append-to="overlayTarget"
      :popper-class="
        presentation.navigation
          ? presentation.persistent()
            ? undefined
            : 'element-navigation-popup'
          : 'element-command-popup'
      "
      :popper-style="{
        direction: presentation.direction(),
        maxBlockSize: dropdownHeight,
      }"
      :aria-label="node.entry.label"
      :aria-disabled="node.entry.disabled || undefined"
      :aria-controls="node.expanded ? `${id}-sub-${index}` : undefined"
      :data-entry-key="node.entry.key"
      tabindex="-1"
      @click="clickSubmenu($event, node)"
    >
      <template #title>
        <span
          v-if="checkColumn"
          aria-hidden="true"
          class="element-entry-check"
        />
        <EntryContent
          :entry="node.entry"
          :icon-column="iconColumn"
          :rail="presentation.rail() && parentKey === undefined"
        >
          <template #entry="scope">
            <slot
              name="entry"
              v-bind="scope"
            />
          </template>
          <template #icon="scope">
            <slot
              name="icon"
              v-bind="scope"
            />
          </template>
        </EntryContent>
      </template>
      <EntryBranch
        :entries="node.children ?? []"
        :status="node.status"
        :label="node.entry.label"
        :parent-key="node.entry.key"
        :surface-id="`${id}-sub-${index}`"
      >
        <template #entry="scope">
          <slot
            name="entry"
            v-bind="scope"
          />
        </template>
        <template #icon="scope">
          <slot
            name="icon"
            v-bind="scope"
          />
        </template>
      </EntryBranch>
    </ElSubMenu>
    <ElMenuItem
      v-else
      v-bind="{
        onClickCapture: (event: MouseEvent) => forwardLink(event, node),
      }"
      :index="entryIndex(node.entry.key)"
      :disabled="node.entry.disabled"
      :role="
        node.selectionMode === 'multiple'
          ? 'menuitemcheckbox'
          : node.selectionMode === 'single'
            ? 'menuitemradio'
            : 'menuitem'
      "
      :aria-label="node.entry.label"
      :aria-disabled="node.entry.disabled || undefined"
      :aria-checked="node.selectionMode ? Boolean(node.selected) : undefined"
      :aria-current="node.current ? 'page' : undefined"
      :data-entry-key="node.entry.key"
      :aria-describedby="
        node.entry.description ? `${id}-description-${index}` : undefined
      "
    >
      <!-- The navigation surface owns hover/focus hints, including Escape and
           overlay containment. A native title slot would add a second tooltip. -->
      <span
        v-if="checkColumn"
        aria-hidden="true"
        class="element-entry-check"
      >
        {{ node.selected ? (node.selectionMode === 'single' ? '●' : '✓') : '' }}
      </span>
      <EntryContent
        :entry="node.entry"
        :icon-column="iconColumn"
        :rail="presentation.rail() && parentKey === undefined"
        :description-id="`${id}-description-${index}`"
        :href="
          presentation.navigation && !node.entry.disabled
            ? node.entry.href
            : undefined
        "
        @navigate="presentation.link(node.entry.key, $event)"
      >
        <template #entry="scope">
          <slot
            name="entry"
            v-bind="scope"
          />
        </template>
        <template #icon="scope">
          <slot
            name="icon"
            v-bind="scope"
          />
        </template>
      </EntryContent>
    </ElMenuItem>
  </template>
  <li
    v-if="message"
    role="none"
  >
    <!-- ElMenu has no async-state slot. Reuse ElSelect's feedback treatment. -->
    <p
      class="el-select-dropdown__empty"
      role="status"
    >
      {{ message }}
    </p>
    <ElButton
      v-if="status?.failed"
      native-type="button"
      type="primary"
      text
      role="menuitem"
      tabindex="-1"
      @click="presentation.retry(parentKey)"
    >
      {{ status.retryLabel }}
    </ElButton>
  </li>
</template>
