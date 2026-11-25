import type { UiLayoutPresentation } from '@uninterface/uninterface/backend'

export const uiLayoutPresentation: UiLayoutPresentation = {
  scrollFocus: { class: 'element-scroll-focus' },
  peerSpacing: {
    gap: '8px',
  },
  peerSpacingLevels: {
    [-1]: { gap: '4px' },
    1: { gap: '16px' },
  },
}
