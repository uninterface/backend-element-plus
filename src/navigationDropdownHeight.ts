import { computed, onActivated, onDeactivated, ref, watchEffect } from 'vue'

/** Leave native placement in charge, but fit a header dropdown above or below
 * its reference instead of offering the height of the entire viewport. */
export function useNavigationDropdownHeight(
  root: () => HTMLElement | undefined,
  enabled: () => boolean,
  offset: () => number,
  opened: () => boolean,
) {
  const height = ref<number>()
  const active = ref(true)
  onActivated(() => (active.value = true))
  onDeactivated(() => (active.value = false))
  watchEffect((cleanup) => {
    const element = root()
    if (!active.value || !enabled() || !element) {
      height.value = undefined
      return
    }
    // Re-measure on opening too: preceding content may have moved the header
    // without changing its own dimensions or emitting a scroll event.
    opened()
    const distance = offset()
    const view = element.ownerDocument.defaultView!
    function measure() {
      const rect = element!.getBoundingClientRect()
      const viewport = view.innerHeight
      const above = rect.top
      const below = viewport - rect.bottom
      height.value = Math.max(
        0,
        Math.min(viewport - 16, Math.max(above, below) - distance - 8),
      )
    }
    measure()
    const observer = new view.ResizeObserver(measure)
    observer.observe(element)
    view.addEventListener('resize', measure)
    view.addEventListener('scroll', measure, true)
    cleanup(() => {
      observer.disconnect()
      view.removeEventListener('resize', measure)
      view.removeEventListener('scroll', measure, true)
    })
  })
  return computed(() =>
    height.value === undefined ? undefined : `${height.value}px`,
  )
}
