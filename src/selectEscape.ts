import { useUiOverlayEscape } from '@uninterface/uninterface/backend'

export function useSelectEscape() {
  const offerEscape = useUiOverlayEscape()
  return (event: KeyboardEvent) => {
    if (
      event.key === 'Escape' &&
      event.target instanceof HTMLInputElement &&
      event.target.matches('input[role="combobox"][aria-expanded="false"]')
    )
      offerEscape?.(event)
  }
}
