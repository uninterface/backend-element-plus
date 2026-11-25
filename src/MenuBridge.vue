<script setup lang="ts">
  import { inject, provide } from 'vue'
  import { MENU_INJECTION_KEY, type MenuProvider } from 'element-plus'
  import { entryIndex, menuPresentationKey } from './menuPresentation'

  const native = inject<MenuProvider>(MENU_INJECTION_KEY)!
  const presentation = inject(menuPresentationKey)!
  function nodes() {
    const result: ReturnType<typeof presentation.entries>[number][] = []
    function visit(entries: ReturnType<typeof presentation.entries>) {
      for (const node of entries) {
        result.push(node)
        if (node.children) visit(node.children)
      }
    }
    visit(presentation.entries())
    return result
  }
  function expand(index: string, open: boolean) {
    const node = nodes().find((node) => entryIndex(node.entry.key) === index)
    // Native ElMenu ignores reopening an already open ancestor. A teleported
    // child's mouseenter also enters its parent; forwarding that repeat to core
    // would replace the current popup path with just the ancestor.
    if (node && Boolean(node.expanded) !== open)
      presentation.expand(node.entry.key, open)
  }
  // ElMenu has uncontrolled active/open state and vertical popup mode is tied
  // to its collapsed icon rail. Its exported context is the smallest bridge
  // that preserves controlled state and full-label floating command submenus.
  // Registration, markup, icons, styling, poppers and transitions remain native.
  provide<MenuProvider>(
    MENU_INJECTION_KEY,
    new Proxy(native, {
      get(target, key, receiver) {
        if (key === 'isMenuPopup') return !presentation.persistent()
        if (key === 'activeIndex') {
          const current = nodes().find((node) => node.current)
          return current ? entryIndex(current.entry.key) : undefined
        }
        if (key === 'openedMenus')
          return nodes()
            .filter((node) => node.expanded)
            .map((node) => entryIndex(node.entry.key))
        if (key === 'openMenu') return (index: string) => expand(index, true)
        if (key === 'closeMenu') return (index: string) => expand(index, false)
        if (key === 'handleSubMenuClick')
          return ({ index }: { index: string }) => {
            const node = nodes().find(
              (node) => entryIndex(node.entry.key) === index,
            )
            if (node)
              presentation.expand(
                node.entry.key,
                !node.expanded,
                !presentation.navigation,
              )
          }
        if (key === 'handleMenuItemClick')
          return ({ index }: { index: string }) => {
            const node = nodes().find(
              (node) => entryIndex(node.entry.key) === index,
            )
            if (node) presentation.activate(node.entry.key)
          }
        return Reflect.get(target, key, receiver)
      },
    }),
  )
</script>
<template><slot /></template>
