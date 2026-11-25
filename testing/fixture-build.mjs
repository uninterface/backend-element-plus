import {
  buildFixture,
  fixtureBuildConfig,
} from '@uninterface/testing/fixture-build'
import backendVite from '@uninterface/backend-element-plus/vite'

const backend = {
  resolveBackend: (subpath) =>
    import.meta.resolve(
      subpath
        ? '@uninterface/backend-element-plus/' + subpath
        : '@uninterface/backend-element-plus',
    ),
  backendVite,
}

export const build = (options) => buildFixture(options, backend)
export const backendConfig = () => fixtureBuildConfig(backend)
