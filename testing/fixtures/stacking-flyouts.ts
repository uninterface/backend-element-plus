import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
import { h } from 'vue'
import { createUiApplication } from '@uninterface/uninterface/setup'
import StackingFlyouts from './StackingFlyouts.vue'

declare global {
  interface Window {
    inspectElementFlyout(element: Element): { exact: boolean; rank?: number }
    elementFlyoutErrors: string[]
  }
}

const params = new URLSearchParams(location.search)
const requestedSurface = params.get('surface')
const surface =
  requestedSurface === 'modal' || requestedSurface === 'drawer'
    ? requestedSurface
    : 'popover'
document.documentElement.dir = params.get('dir') === 'rtl' ? 'rtl' : 'ltr'
window.elementFlyoutErrors = []
const app = createUiApplication({
  render: () => h(StackingFlyouts, { surface }),
})
app.config.errorHandler = (error) =>
  window.elementFlyoutErrors.push(String(error))
const host = document.body.appendChild(document.createElement('div'))
void app.ui.ready.then(() => app.mount(host))
