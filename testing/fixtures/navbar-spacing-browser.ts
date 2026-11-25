import '@uninterface/backend/font.css'
import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
import { h } from 'vue'
import {
  createUiEntryControl,
  UiNavbar,
  UiNavMenu,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

const links = createUiEntryControl([
  { key: 'home', label: 'Home', href: '#home' },
])
const app = createUiApplication({
  render: () =>
    h('main', [
      h(
        UiNavbar,
        { 'aria-label': 'Example navigation' },
        {
          brand: () => h('span', 'Workspace'),
          default: () => h('a', { href: '#example' }, 'Example link'),
        },
      ),
      h(
        UiNavbar,
        { 'aria-label': 'Main navigation' },
        {
          default: () =>
            h(UiNavMenu, { control: links, 'aria-label': 'Sections' }),
          actions: () => h('div', { style: 'min-block-size: 64px' }, 'Actions'),
        },
      ),
    ]),
})
void app.ui.ready.then(() =>
  app.mount(document.body.appendChild(document.createElement('div'))),
)
