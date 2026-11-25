<script setup lang="ts">
  import { useUiZPopup } from '@uninterface/uninterface/backend'
  import { popupTarget } from './zOrder'
  import { useUiOverlayTarget } from '@uninterface/uninterface/backend'
  const overlayTarget = useUiOverlayTarget()
  import {
    useUiMenuPopup,
    useUiMenuPoint,
  } from '@uninterface/uninterface/backend'
  import { ElTooltip } from 'element-plus'
  import {
    computed,
    nextTick,
    onMounted,
    onBeforeUnmount,
    onUnmounted,
    ref,
    watch,
  } from 'vue'
  const props = defineProps<{
    anchor?: HTMLElement
    point?: { x: number; y: number }
  }>()
  const emit = defineEmits<{ close: [] }>()
  const surface = ref<HTMLElement>()
  const tooltip = ref<InstanceType<typeof ElTooltip>>()
  const popup = useUiMenuPopup(surface)
  useUiZPopup(() => popupTarget(surface.value), {
    scope: true,
    source: 'menu popup',
  })
  // A virtual anchor delegates geometry without letting TooltipTrigger rewrite
  // the host's menu-specific ARIA attributes or install competing triggers.
  const effectivePoint = useUiMenuPoint(
    () => props.point,
    () => props.anchor,
  )
  const reference = computed(() => {
    const point = effectivePoint.value
    return {
      getBoundingClientRect: () =>
        point
          ? new DOMRect(point.x, point.y, 0, 0)
          : props.anchor!.getBoundingClientRect(),
      contextElement: props.anchor,
    }
  })
  const direction = ref<'ltr' | 'rtl'>('ltr')
  watch(
    () => props.anchor,
    (anchor, _, onCleanup) => {
      if (!anchor) {
        direction.value = 'ltr'
        return
      }
      const readDirection = () => {
        direction.value =
          getComputedStyle(anchor).direction === 'rtl' ? 'rtl' : 'ltr'
      }
      readDirection()
      // The teleported popup cannot inherit a direction change from the anchor.
      const observer = new MutationObserver(readDirection)
      for (
        let node: HTMLElement | null = anchor;
        node;
        node = node.parentElement
      ) {
        observer.observe(node, {
          attributes: true,
          attributeFilter: ['dir', 'class', 'style'],
        })
      }
      onCleanup(() => observer.disconnect())
    },
    { immediate: true, flush: 'post' },
  )
  let disposed = false
  watch([effectivePoint, direction], async () => {
    await nextTick()
    if (!disposed) tooltip.value?.updatePopper()
  })
  function focus() {
    nextTick(() => {
      // Transition completion may arrive after the user entered a child popup.
      // Registered surfaces include teleported branches, not just DOM children.
      if (disposed || popup.contains(document.activeElement)) return
      ;(
        surface.value?.querySelector<HTMLElement>(
          '[role^="menuitem"], a[href], button:not([disabled])',
        ) ??
        surface.value?.querySelector<HTMLElement>('[role="menu"]') ??
        surface.value
      )?.focus()
    })
  }
  function outside(event: Event) {
    if (
      !popup.contains(event.target as Node) &&
      !props.anchor?.contains(event.target as Node)
    )
      emit('close')
  }
  // Element Plus 2.14.7 restores pre-trap focus even on outside dismissal.
  // Shared menu lifecycle owns focus return; prevent that second restoration.
  // The toolkit emits this cancelable native event on its popper surface.
  function releaseFocus(event: Event) {
    if (surface.value && (event.target as HTMLElement)?.contains(surface.value))
      event.preventDefault()
  }
  onUnmounted(() =>
    document.removeEventListener(
      'focus-trap.focus-after-released',
      releaseFocus,
      true,
    ),
  )
  onMounted(() => {
    focus()
    document.addEventListener(
      'focus-trap.focus-after-released',
      releaseFocus,
      true,
    )
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
  })
  onBeforeUnmount(() => {
    disposed = true
    document.removeEventListener('pointerdown', outside)
    document.removeEventListener('focusin', outside)
  })
</script>
<template>
  <!-- Native ElSubMenu uses a pure, light ElTooltip around its menu surface.
       ElPopover would add a second card border/shadow around that surface. -->
  <ElTooltip
    ref="tooltip"
    pure
    effect="light"
    popper-class="element-command-popup"
    :visible="true"
    :virtual-ref="reference as any"
    virtual-triggering
    :teleported="true"
    :append-to="overlayTarget"
    :show-arrow="false"
    :persistent="false"
    placement="bottom-start"
    :popper-options="{
      strategy: 'fixed',
      modifiers: point
        ? [
            {
              name: 'preventOverflow',
              options: { altAxis: true, tether: false },
            },
          ]
        : [],
    }"
    :popper-style="{
      direction,
      padding: 0,
      width: 'max-content',
      overflow: 'auto',
    }"
    role="group"
    @show="focus"
  >
    <template #content>
      <div ref="surface">
        <slot />
      </div>
    </template>
  </ElTooltip>
</template>
