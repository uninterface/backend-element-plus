import type {
  buildFixture,
  fixtureBuildConfig,
} from '@uninterface/testing/fixture-build'

export function build(
  options: Parameters<typeof buildFixture>[0],
): ReturnType<typeof buildFixture>
export function backendConfig(): ReturnType<typeof fixtureBuildConfig>
