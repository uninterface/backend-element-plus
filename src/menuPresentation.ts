import {
  computed,
  nextTick,
  onBeforeUnmount,
  onUnmounted,
  onDeactivated,
  onMounted,
  onActivated,
  provide,
  type InjectionKey,
  type Ref,
} from 'vue'
import type { UiEntryViewNode } from '@uninterface/uninterface/backend'

export const entryIndex = (key: string) => `entry:${key}`

export interface MenuPresentation {
  entries(): readonly UiEntryViewNode[]
  navigation: boolean
  persistent(): boolean
  horizontal(): boolean
  rail(): boolean
  activate(key: string): void
  link(key: string, event: MouseEvent): void
  expand(key: string, open: boolean, moveFocus?: boolean): void
  retry(key?: string): void
  register(key: string | undefined, surface: HTMLElement): () => void
  focus(key?: string, last?: boolean): void
  tabstops(): void
  direction(): 'rtl' | 'ltr' | undefined
}
export const menuPresentationKey: InjectionKey<MenuPresentation> = Symbol(
  'element-menu-presentation',
)
export const commandCheckColumnKey: InjectionKey<Readonly<Ref<boolean>>> =
  Symbol('element-command-check-column')

export function useMenuPresentation(
  entries: () => readonly UiEntryViewNode[],
  navigation: boolean,
  emit: {
    (event: 'activate', key: string): void
    (event: 'expand', key: string, open: boolean): void
    (event: 'retry', key?: string): void
    (event: 'close'): void
  },
  mode: () => string = () => 'horizontal',
) {
  const surfaces = new Map<string | undefined, HTMLElement>()
  const nodes = computed(() => {
    const result: UiEntryViewNode[] = []
    function visit(items: readonly UiEntryViewNode[]) {
      for (const node of items) {
        result.push(node)
        if (node.children) visit(node.children)
      }
    }
    visit(entries())
    return result
  })
  const owns = (target: Node | null) =>
    Boolean(
      target &&
        [...surfaces.values()].some((surface) => {
          // ElSubMenu focuses its native popup container on pointer entry. The
          // registered UL is inside that container; its own popup chrome belongs
          // to this menu too. Do not include unrelated native popup surfaces.
          const boundary = surface.closest('.el-popper') ?? surface
          return boundary.contains(target)
        }),
    )
  const items = (surface: HTMLElement) =>
    [...surface.querySelectorAll<HTMLElement>('[role^=menuitem]')].filter(
      (item) => item.closest('[role=menu], [role=menubar]') === surface,
    )
  function focus(key?: string, last = false) {
    const surface = surfaces.get(key)
    if (!surface) return
    const candidates = items(surface)
    ;(last ? candidates.at(-1) : (candidates[0] ?? surface))?.focus()
  }
  function tabstops() {
    const root = surfaces.get(undefined)
    if (!root) return
    // ElMenu's initial horizontal scan makes every direct LI tabbable,
    // including groups/separators. Keep one menu entry point after lazy updates.
    for (const child of root.children)
      if (!child.matches('[role^=menuitem]')) child.removeAttribute('tabindex')
    const candidates = items(root)
    const focused =
      document.activeElement?.closest<HTMLElement>('[role^=menuitem]')
    if (focused && owns(focused)) {
      root.tabIndex = -1
      for (const item of candidates) item.tabIndex = item === focused ? 0 : -1
      return
    }
    root.tabIndex = candidates.length ? -1 : 0
    if (!candidates.some((item) => item.tabIndex === 0)) {
      if (candidates[0]) candidates[0].tabIndex = 0
    }
    let found = false
    for (const item of candidates) {
      if (item.tabIndex !== 0) continue
      if (found) item.tabIndex = -1
      found = true
    }
  }
  function parent(key: string) {
    return [...surfaces.values()]
      .flatMap(items)
      .find((item) => item.dataset.entryKey === key)
  }
  async function expand(key: string, open: boolean, moveFocus = false) {
    emit('expand', key, open)
    await nextTick()
    await nextTick()
    if (moveFocus) {
      if (open) focus(key)
      else parent(key)?.focus()
    }
  }
  let search = ''
  let typedAt = 0
  function keyboard(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    const surface = target.closest<HTMLElement>('[role=menu], [role=menubar]')
    if (!surface || ![...surfaces.values()].includes(surface)) return
    const item = target.closest<HTMLElement>('[role^=menuitem]')
    const candidates = items(surface)
    const index = candidates.indexOf(item!)
    const horizontal =
      navigation &&
      mode() === 'horizontal' &&
      !surface.hasAttribute('data-parent')
    const rtl = getComputedStyle(surface).direction === 'rtl'
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft'
    const key = item?.dataset.entryKey
    let destination: HTMLElement | undefined
    if (event.key === (horizontal ? forward : 'ArrowDown'))
      destination = candidates[(index + 1) % candidates.length]
    else if (event.key === (horizontal ? backward : 'ArrowUp'))
      destination =
        candidates[(index - 1 + candidates.length) % candidates.length]
    else if (event.key === 'Home') destination = candidates[0]
    else if (event.key === 'End') destination = candidates.at(-1)
    else if (
      key !== undefined &&
      item?.hasAttribute('aria-expanded') &&
      item.getAttribute('aria-disabled') !== 'true' &&
      (event.key === (horizontal ? 'ArrowDown' : forward) ||
        event.key === 'Enter' ||
        event.key === ' ')
    ) {
      void expand(key, true, true)
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (item?.getAttribute('aria-disabled') !== 'true')
        (item?.querySelector<HTMLElement>('a[href]') ?? item)?.click()
    } else if (
      event.key === 'Escape' &&
      navigation &&
      mode() === 'vertical-tree'
    ) {
      // A persistent hierarchy has no popup to dismiss. Preserve Escape for its
      // enclosing drawer/dialog and keep the user's expansion model intact.
      return
    } else if (
      (event.key === 'Escape' || event.key === backward) &&
      surface.dataset.parent !== undefined
    ) {
      void expand(surface.dataset.parent, false, true)
    } else if (event.key === 'Escape') {
      for (const node of nodes.value)
        if (node.expanded) emit('expand', node.entry.key, false)
      emit('close')
    } else if (event.key === 'Tab') {
      if (mode() === 'vertical-tree') return
      // Preserve the browser's ordinary focus traversal.
      emit('close')
      for (const node of nodes.value)
        if (node.expanded) emit('expand', node.entry.key, false)
      return
    } else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      search = Date.now() - typedAt > 600 ? event.key : search + event.key
      typedAt = Date.now()
      destination = [
        ...candidates.slice(index + 1),
        ...candidates.slice(0, index + 1),
      ].find((candidate) =>
        (candidate.getAttribute('aria-label') ?? candidate.textContent ?? '')
          .toLocaleLowerCase()
          .startsWith(search.toLocaleLowerCase()),
      )
    } else return
    // Element's one-time horizontal DOM scan does not cover lazy/teleported
    // entries. Handle these keys once, invoking the actual native item actions.
    event.preventDefault()
    event.stopImmediatePropagation()
    destination?.focus()
  }
  function roving(event: FocusEvent) {
    const item = event.target as HTMLElement
    if (!owns(item) || !item.matches('[role^=menuitem]')) return
    for (const surface of surfaces.values())
      for (const candidate of items(surface)) candidate.tabIndex = -1
    item.tabIndex = 0
  }
  function outside(event: Event) {
    if (!navigation || mode() === 'vertical-tree' || owns(event.target as Node))
      return
    // A focused submenu item owns the sole roving tab stop. Closing/removing
    // that branch can leave every root entry at -1. Restore an entry point
    // after focus leaves, even if the branch was already closed by navigation.
    // Do not move focus away from the user's new target.
    void nextTick(tabstops)
    for (const node of nodes.value)
      if (node.expanded) emit('expand', node.entry.key, false)
  }
  function releaseFocus(event: Event) {
    for (const [key, surface] of surfaces) {
      if (surface.closest('.el-popper') !== event.target) continue
      // The menu's keyboard and dismissal routes own focus restoration.
      event.preventDefault()
      // Element Plus 2.14.7 also sends this event through ElTooltip's blur
      // handler. Its delayed hide survives a change back to visible. Once a
      // command branch is closing, its controlled state already drives exit.
      if (
        !navigation &&
        key !== undefined &&
        !nodes.value.some((node) => node.entry.key === key && node.expanded)
      )
        event.stopPropagation()
      return
    }
  }
  function listenRelease() {
    document.addEventListener(
      'focus-trap.focus-after-released',
      releaseFocus,
      true,
    )
  }
  function unlistenRelease() {
    document.removeEventListener(
      'focus-trap.focus-after-released',
      releaseFocus,
      true,
    )
  }
  onMounted(listenRelease)
  onActivated(listenRelease)
  onDeactivated(unlistenRelease)
  // Child poppers release their traps during unmount, before this hook.
  onUnmounted(unlistenRelease)
  function listen() {
    document.addEventListener('keydown', keyboard, true)
    document.addEventListener('focusin', roving)
    document.addEventListener('focusin', outside)
    document.addEventListener('pointerdown', outside)
  }
  function unlisten() {
    document.removeEventListener('keydown', keyboard, true)
    document.removeEventListener('focusin', roving)
    document.removeEventListener('focusin', outside)
    document.removeEventListener('pointerdown', outside)
  }
  onMounted(listen)
  onActivated(listen)
  onDeactivated(unlisten)
  onBeforeUnmount(unlisten)
  const presentation: MenuPresentation = {
    entries,
    navigation,
    persistent: () => mode() === 'vertical-tree',
    horizontal: () => mode() === 'horizontal',
    rail: () => mode() === 'icon-popup',
    tabstops,
    direction() {
      const root = surfaces.get(undefined)
      return root
        ? getComputedStyle(root).direction === 'rtl'
          ? 'rtl'
          : 'ltr'
        : undefined
    },
    activate(key) {
      const link = navigation
        ? parent(key)?.querySelector<HTMLAnchorElement>('a[href]')
        : undefined
      // ElMenuItem also activates from its padding/keyboard target. Route that
      // action through the real link so the whole native item is operable.
      if (link) link.click()
      else {
        const node = nodes.value.find((node) => node.entry.key === key)
        if (node?.request) node.request()
        else emit('activate', key)
      }
    },
    link(key, event) {
      if (
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        !event.altKey &&
        event.button === 0
      ) {
        const node = nodes.value.find((node) => node.entry.key === key)
        if (node?.request) node.request(event)
        else emit('activate', key)
      }
    },
    expand: (key, open, moveFocus = false) => {
      // Native open/close notifications do not identify an input origin.
      // Only explicit command clicks and keyboard entry request focus movement.
      void expand(key, open, moveFocus)
    },
    retry: (key) => emit('retry', key),
    register(key, surface) {
      surfaces.set(key, surface)
      void nextTick(tabstops)
      return () => {
        if (surfaces.get(key) === surface) surfaces.delete(key)
      }
    },
    focus,
  }
  provide(menuPresentationKey, presentation)
  return { nodes, owns, focus }
}
