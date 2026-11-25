import '@uninterface/backend/font.css'
import '@uninterface/uninterface/style.css'
import type { UiNavMenuPresentation } from '@uninterface/uninterface'
import { mount } from './navigation'

const params = new URLSearchParams(location.search)
document.documentElement.dir = params.get('dir') === 'rtl' ? 'rtl' : 'ltr'
const mode = params.get('mode') ?? 'horizontal'
void mount(mode as UiNavMenuPresentation)
