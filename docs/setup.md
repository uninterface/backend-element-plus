# Set up the Element Plus backend

This guide owns the application integration requirements for `@uninterface/backend-element-plus`. Business components use `@uninterface/uninterface`; toolkit configuration stays at application assembly.

## Requirements

Use Node.js 24 or 26, Vue `^3.5.18`, and Vite `^7.3.7 || ~8.1.6 || ~8.2.4 || ^8.3.3` with a compatible `@vitejs/plugin-vue`. The backend requires Vite for its build hook. Use Vue-aware TypeScript checking and keep one runtime copy of Vue and core.

## Select the backend

The release package ships compiled ES modules and TypeScript declarations.
Install `@uninterface/backend-element-plus` under the alias `@uninterface/backend`.

```sh
npm install @uninterface/uninterface@^0.1.0 @uninterface/backend@npm:@uninterface/backend-element-plus@2.14.0
```

Choose a Core version that satisfies the selected backend release's peer dependency.

Use TypeScript's `Bundler` module resolution to resolve the package's type
exports. See [package build](package-build.md) for a source checkout.

## Configure Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import backendPlugins from '@uninterface/backend/vite'

export default defineConfig({
  plugins: [vue(), backendPlugins()],
  resolve: { dedupe: ['vue', '@uninterface/uninterface'] },
})
```

## Initialize the application

```ts
// src/main.ts
import { createUiApplication } from '@uninterface/uninterface/setup'
import '@uninterface/backend/font.css'
import '@uninterface/backend/style.css'
import App from './App.vue'

const app = createUiApplication(App, { document })
await app.ui.ready
app.mount('#app')
```

The backend Vite hook is required: it initializes explicit native input IDs before mount while preserving native form registration, so server markup and hydration agree. It also starts native popup resize observation on initially visible mounts and refreshes native Popper positioning after entrance transitions. This lets lazy content growth and nested references measured during an ancestor transition receive updated placement. The hook also forwards the owning surface to native submenu Teleports. These adjustments preserve native menu markup, transitions and overflow/flip modifiers. The hook checks the pinned native source and rejects incompatible changes; reassess these workarounds on toolkit upgrades. All guarded adjustments run during Vite development dependency optimization and ordinary builds. Keep dependency optimization enabled for Element Plus: its CommonJS dependencies, including Day.js, need prebundling for browser loading. Do not add Element Plus to `optimizeDeps.exclude`. The required `./integration` export is a descriptor consumed automatically by createUiApplication, not a Vue plugin to install directly. The adapter declares Element Plus 2.14.7 as its dependency and imports toolkit components explicitly; do not add a global component registry or automatic resolver for these views. The stylesheet includes the full Element Plus component CSS, the compiled upstream document reset, and opt-in `.dark` theme variables. The reset establishes body typography for ordinary content and teleported popups, and affects native headings, paragraphs, links and horizontal rules. These document-wide effects apply with or without UiApp. The compiled reset ships with the backend; applications do not need Sass. The document reset does not remove body margins. The separate font.css entry loads default fonts from jsDelivr; font-bundled.css explicitly selects self-hosted assets. Loading these variables does not implement application-wide dark-mode control.

The integration descriptor is loaded by core through the selected alias; business components need no backend imports. Import the stylesheet once. The top-level `document` option grants ownership of document language attributes; omit it for an embedded application. Await readiness before mounting. For SSR/hydration, supply the same explicit `idPrefix` on both sides, create a fresh application per request and call `app.ui.dispose()` in `finally`. The core application-isolation guide defines the verified editing baseline and request-owned business-session cleanup.

Create a minimal `App.vue` to verify the configured application:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UiApp, UiButton, UiContent } from '@uninterface/uninterface'

const acknowledged = ref(false)
</script>

<template>
  <UiApp>
    <UiContent>
      <h1>Application ready</h1>
      <UiButton
        :disabled="acknowledged"
        @click="acknowledged = true"
      >
        Acknowledge
      </UiButton>
      <p v-if="acknowledged" role="status">Acknowledged.</p>
    </UiContent>
  </UiApp>
</template>
```

Mount into the existing Vue application's `#app` element. Use its configured Vite and Vue type-check commands to build/check the source. Confirm that the button responds, becomes disabled and displays the status. This verifies a basic interaction, not every backend capability or browser.

## Scope and verification

The [presentation reference](presentation.md) documents native mappings and limitations; [exports](exports.md) documents assembly modules. Capability declarations describe supported contracts; they do not certify accessibility. Browser keyboard, focus, popup, contrast and scrolling checks remain necessary in addition to builds and DOM simulation.

## Localization and icons

Use `createUiApplication` to install this backend's `integration` alongside core resources. Do not separately install a native toolkit plugin. Core's application-localization service owns language selection and synchronizes the native resources supplied by this backend.

The initial full message set is English, Simplified Chinese, Traditional Chinese and Arabic. The integration declares native resource aliases; core exposes the effective native locale through `app.ui.i18n.state.value.resolved.backend`. Additional native resources can be supplied by extending the selected integration at assembly through the `backend` option; core/business components need no backend-name branch. Additional languages and full RTL require acceptance before support claims.

The catalogue supplies 58 semantic icon names. Application overrides affect UiIcon and menu entry icons; native internal glyphs retain their toolkit defaults. Assets are bundled locally without an external icon service. Artwork comes from the installed `@element-plus/icons-vue` dependency, which retains its license. The [third-party notice](../THIRD-PARTY-NOTICES.md) also covers the compiled document reset.

Arabic (`ar`, العربية) uses script-derived RTL direction. The integration lazily loads the toolkit’s native Arabic pack. Some upstream native strings may remain untranslated. `resolved.backend` reports `ar`, including for compatible regional requests. Message and direction support do not certify full RTL layout or browser acceptance.

Request a language through the installed service; do not install another native locale manager:

```ts
await app.ui.i18n.setLocale('zh-Hans')
```

Register your own headings, field labels and business messages through `i18n.resources` at createUiApplication setup. Core/native packs translate library-owned text, not arbitrary strings in your application. Resource failures retain the previous language; handle the rejected request. Additional catalogue definitions use the setup `icons` option. Exact resource and icon contracts are documented by `@uninterface/uninterface` under `docs/guides/localization-and-icons.md`.

## Color mode

This backend supports `theme.color-mode.v1`. To let a top-level application own document mode, include `colorMode` in application setup:

```ts
const app = createUiApplication(App, {
  document,
  colorMode: {
    document,
    preference: 'system',
    storageKey: 'application-appearance', // Optional persistence.
  },
})
await app.ui.ready
app.mount('#app')
```

Core manages preference, system detection and optional persistence; the backend maps the result to native `light`/`dark` classes on html, covering teleported surfaces as well as the app. Do not independently toggle toolkit classes or enable another preference controller. The top-level `document` option for language is separate from `colorMode.document`.

Embedded applications omit colorMode to observe the host document without mutating it. For SSR, emit the native html selector matching the resolved server mode and hydrate with the same initial resolution. Independent simultaneous modes in one document are unsupported. Palette changes and accessible contrast still require browser verification; see [presentation](presentation.md#color-mode).

## Customize presentation

See [customization](customization.md) for supported application-owned styling,
native configuration possibilities and adapter limitations.

See [strategy support](strategies.md) for optional regional preferences, control-size mappings and unsupported values.

## Server rendering and identity

Integration supplies a fresh native ID/z-index context per application. Native IDs use the full Vue application prefix; Element Plus 2.14.7 interpolates that prefix into IDs although its TypeScript provider type declares a number. The adapter preserves the string namespace without hashing it. Both this boundary and the guarded build transformation require review when upgrading Element Plus. Text inputs forward their initial value through native attributes as well as the live model.

Render Vue's teleport output into its target hosts before hydration. Native tooltip hosts use `#el-popper-container-<idPrefix>`; emit the matching container, including empty anchors. The verified baseline covers text/multiline fields, checkbox, form submit/reset, icons and locale/mode. Open overlays and general selection SSR remain outside that baseline. Backend checkbox label coordination settles after mount without replacing the editor.

For `UiTable` and table-mode `UiCollectionView`, see the [known server-rendering limitation](collections.md#server-rendering-and-hydration).

## Typography: fonts first, backend styles second

| Choice | First import: fonts |
|---|---|
| **Backend default · Network** (recommended starting setup) | `@uninterface/backend/font.css` |
| **Backend default · Bundled** | `@uninterface/backend/font-bundled.css` |
| **Uninterface default · Network** | `@uninterface/fonts/font.css` |
| **Uninterface default · Bundled** | `@uninterface/fonts/font-bundled.css` |

Import one selected font entry before the stable `@uninterface/backend/style.css`, as shown in the setup example. The Uninterface choices require the optional `@uninterface/fonts` package. Omitting the font import uses system fonts without downloads. See [typography and fonts](typography.md) for installation, CSP, deployment, language coverage and verification steps.

[Native HTML content defaults](native-html.md): supported element baseline, toolkit mappings, setup, spacing and verification limits.


### Common icon assets

The common catalogue supplies 58 semantic names with independent override keys. The artwork includes icons from `@element-plus/icons-vue` 2.3.2. Setup imports the catalogue as local Vue components. Applications should budget for the whole catalogue in the bundle. Native internal glyphs are separate from the override catalogue. For semantic names and overrides, see `docs/api/constants/uiIconNames.md` and `docs/guides/localization-and-icons.md` in the Core package. See [asset sources and mappings](icon-licenses/SOURCES.md).

`globe` and `external-link` are original backend-owned 1024-unit SVGs; they are not Element Plus exports. Sorting uses native `SortUp`/`SortDown` simple arrows, with ordering meaning supplied by the action/state label. `create` reuses Plus without sharing the `add` override key. See [asset provenance](../THIRD-PARTY-NOTICES.md).
