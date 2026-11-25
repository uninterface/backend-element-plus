import type { Page, TestInfo } from '@playwright/test'

/** Read native placement state without forcing an update or changing focus. */
export async function attachMenuDiagnostics(page: Page, info: TestInfo) {
  if (info.status === info.expectedStatus || page.isClosed()) return
  const data = await page.evaluate(() => {
    const describe = (element: Element) => {
      const rect = element.getBoundingClientRect()
      const css = getComputedStyle(element)
      return {
        tag: element.tagName,
        id: element.id,
        class: element.className,
        rect: rect.toJSON(),
        position: css.position,
        transform: css.transform,
        overflow: [css.overflowX, css.overflowY],
        visibility: css.visibility,
        inlineStyle: element.getAttribute('style'),
      }
    }
    return {
      viewport: {
        width: innerWidth,
        height: innerHeight,
        clientWidth: document.documentElement.clientWidth,
        clientHeight: document.documentElement.clientHeight,
        scrollX,
        scrollY,
        visualHeight: visualViewport?.height,
      },
      popups: [...document.querySelectorAll('.el-popper')]
        .filter((element) => element.getClientRects().length)
        .map((element) => {
          // Private toolkit data is diagnostic evidence only. No acceptance
          // assertion or application behavior depends on Vue's debug links.
          let native
          for (
            let vm = (element as any).__vueParentComponent;
            vm && !native;
            vm = vm.parent
          ) {
            for (const key of Reflect.ownKeys(vm.provides ?? {})) {
              const state = vm.provides[key]?.popperInstanceRef?.value?.state
              if (state?.elements?.popper !== element) continue
              native = {
                placement: state.placement,
                measuredRects: state.rects,
                modifiersData: state.modifiersData,
                strategy: state.options.strategy,
                modifiers: state.orderedModifiers.map((modifier: any) => ({
                  name: modifier.name,
                  enabled: modifier.enabled,
                  options: modifier.options,
                })),
                reference: state.elements.reference?.getBoundingClientRect(),
              }
              break
            }
          }
          const ancestors = []
          for (
            let node = element.parentElement;
            node && ancestors.length < 8;
            node = node.parentElement
          )
            ancestors.push(describe(node))
          return {
            ...describe(element),
            native,
            ancestors,
            rows: [...element.querySelectorAll('[data-entry-key]')].map(
              (row) => ({
                key: row.getAttribute('data-entry-key'),
                ...describe(row),
              }),
            ),
          }
        }),
    }
  })
  await info.attach('element-menu-placement', {
    body: JSON.stringify(data, null, 2),
    contentType: 'application/json',
  })
}
