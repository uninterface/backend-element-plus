import type { UiBackendDescriptor } from '@uninterface/uninterface/backend'
import { uiTheme } from '@uninterface/uninterface/theme'
import metadata from '../package.json'
import manifest from '../capabilities.json'
const themeColors = uiTheme.colors.define(manifest.themeColors)

export const uiBackend: UiBackendDescriptor = {
  name: 'Element Plus',
  packageName: metadata.name,
  version: metadata.version,
  description: metadata.description,
  dependencies: [
    { packageName: manifest.backend.name, version: manifest.backend.version },
  ],
  capabilities: manifest.provides,
  themeColors,
}
