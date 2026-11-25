import { readFile } from 'node:fs/promises'

const inputIdentityFile =
  /[/\\]element-plus[/\\]es[/\\]components[/\\]form[/\\]src[/\\]hooks[/\\]use-form-item\.mjs$/
const popupContentFile =
  /[/\\]element-plus[/\\]es[/\\]components[/\\]popper[/\\]src[/\\]composables[/\\]use-content\.mjs$/
const tooltipContentFile =
  /[/\\]element-plus[/\\]es[/\\]components[/\\]tooltip[/\\]src[/\\]content\.vue_vue_type_script_setup_true_lang\.mjs$/
const submenuFile =
  /[/\\]element-plus[/\\]es[/\\]components[/\\]menu[/\\]src[/\\]sub-menu\.mjs$/

function integrateSubmenu(code) {
  // ElSubMenu exposes the Teleport switch but omits its ElTooltip's host prop.
  // Forward it so a native submenu can stay inside its owning dialog or popover.
  const props = '\tpopperOffset: Number,'
  const teleport = 'teleported: appendToBody.value,'
  if (
    !code.includes(props) ||
    !code.includes(teleport) ||
    code.includes('appendTo:')
  )
    throw new Error(
      'Review Element Plus submenu host integration after the toolkit update.',
    )
  // A horizontal navigation dropdown scrolls above/below its header. Native
  // Popper can shift its alignment at a viewport edge; it must not switch to a
  // sideways flyout just because neither aligned vertical candidate fits exactly.
  // Leave command menus, vertical roots and all nested flyouts unchanged.
  const original =
    '"top-end",\n\t\t\t"right-start",\n\t\t\t"left-start"\n\t\t] : ['
  if (!code.includes(original))
    throw new Error(
      'Review Element Plus header navigation placement after the toolkit update.',
    )
  return code
    .replace(
      props,
      `${props}\n\tappendTo: { type: definePropType([String, Object]) },`,
    )
    .replace(teleport, `${teleport}\n\t\t\t\tappendTo: props.appendTo,`)
    .replace(
      original,
      '"top-end",\n\t\t\t...(props.popperClass === "element-navigation-popup" ? [] : ["right-start", "left-start"])\n\t\t] : [',
    )
}

function preserveInputIdentity(code) {
  // Native ID management and registration still run on mount. The explicit
  // ID must already be rendered for server labels and matching hydration.
  const declaration = 'const inputId = ref();'
  const registration = 'if (newId !== inputId.value) {'
  if (!code.includes(declaration) || !code.includes(registration))
    throw new Error(
      'Review Element Plus input identity integration after the toolkit update.',
    )
  return (
    code
      .replace(declaration, 'const inputId = ref(props.id);')
      // The immediate callback runs before idUnwatch is assigned. Keep
      // initial native form registration even when the explicit ID matches.
      .replace(registration, 'if (newId !== inputId.value || !idUnwatch) {')
  )
}

function observeInitialPopup(code) {
  // Nonpersistent tooltips mount with visible=true. The native watcher never
  // sees a change, so content growth would have no ResizeObserver at all.
  const original =
    '\t\tif (visible) stopResizeObserver = useResizeObserver(contentRef, update).stop;\n\t});'
  if (!code.includes(original))
    throw new Error(
      'Review Element Plus initial popup observation after the toolkit update.',
    )
  return code.replace(
    original,
    original.replace('\n\t});', '\n\t}, { immediate: true });'),
  )
}

function updateAfterPopupEntrance(code) {
  // Nested menu references can be measured while an ancestor is transformed.
  // Let native Popper remeasure when the native entrance has actually finished.
  const original = '\t\tconst onAfterShow = () => {\n\t\t\tonShow();'
  if (!code.includes(original))
    throw new Error(
      'Review Element Plus popup entrance positioning after the toolkit update.',
    )
  return code.replace(
    original,
    '\t\tconst onAfterShow = () => {\n\t\t\tcontentRef.value?.updatePopper?.();\n\t\t\tonShow();',
  )
}

// Native service components otherwise listen for Escape on the whole document.
// Only managed feedback opts out; ordinary upstream service behavior is untouched.
function scopeFeedbackKeyboard(code) {
  const original =
    /useEventListener\(document, "keydown", (onKeydown|keydown)\);/
  if (!original.test(code))
    throw new Error(
      'Review Element Plus managed feedback keyboard integration after upgrade.',
    )
  // Rich managed message slots may contain forms/lists. Preserve native content
  // classes while replacing only their paragraph wrapper with a flow container.
  if (code.includes('ref_key: "messageRef"')) {
    const paragraph = 'createElementBlock("p", {\n\t\t\t\t\t\tkey: 2,'
    if (!code.includes(paragraph))
      throw new Error(
        'Review Element Plus managed message content after upgrade.',
      )
    code = code.replace(
      paragraph,
      'createElementBlock(__props.customClass === "element-managed-feedback" ? "div" : "p", {\n\t\t\t\t\t\tkey: 2,',
    )
  }
  return code
    .replace(
      original,
      'if (props.customClass !== "element-managed-feedback") $&',
    )
    .replace(
      'nextZIndex();',
      'if (props.customClass !== "element-managed-feedback") nextZIndex();',
    )
    .replace(
      'zIndex: props.zIndex ?? currentZIndex.value',
      'zIndex: props.customClass === "element-managed-feedback" ? undefined : props.zIndex ?? currentZIndex.value',
    )
    .replace(
      'zIndex: currentZIndex.value',
      'zIndex: props.customClass === "element-managed-feedback" ? undefined : currentZIndex.value',
    )
}
const managedFeedbackFile =
  /[/\\]element-plus[/\\]es[/\\]components[/\\](message|notification)[/\\]src[/\\](message|notification)\.vue_vue_type_script_setup_true_lang\.mjs$/

const integrations = [
  { filter: submenuFile, transform: integrateSubmenu },
  { filter: managedFeedbackFile, transform: scopeFeedbackKeyboard },
  { filter: inputIdentityFile, transform: preserveInputIdentity },
  { filter: popupContentFile, transform: observeInitialPopup },
  { filter: tooltipContentFile, transform: updateAfterPopupEntrance },
]

/** Guarded native lifecycle integration for pinned Element Plus 2.14.7. */
export default function createBackendPlugins() {
  return {
    name: 'uninterface-element-integration',
    enforce: 'pre',
    config() {
      return {
        optimizeDeps: {
          esbuildOptions: {
            plugins: [
              {
                name: 'uninterface-element-integration',
                setup(build) {
                  // Prebundling must remain enabled: the toolkit imports CommonJS
                  // dependencies such as Day.js, which browsers cannot load directly.
                  for (const { filter, transform } of integrations)
                    build.onLoad({ filter }, async ({ path }) => ({
                      contents: transform(await readFile(path, 'utf8')),
                      loader: 'js',
                    }))
                },
              },
            ],
          },
        },
      }
    },
    transform(code, id) {
      const integration = integrations.find(({ filter }) => filter.test(id))
      if (!integration) return
      return { code: integration.transform(code), map: null }
    },
  }
}
