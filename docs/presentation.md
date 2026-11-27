# Element Plus presentation and native integration

[Documentation index](README.md) · [Application setup](setup.md)

This reference describes presentation policies, toolkit mappings and integration limits. Application consumers can start with setup; backend maintainers should also review the native coordination and upgrade-sensitive details here.

## Inline table alignment

A UiField directly occupying a UiTable cell uses the native table insets instead of ElFormItem's inter-field bottom margin. This preserves native middle alignment with read-only values and row actions. Nested compositions retain their own spacing, and displayed field feedback retains its allocated height.

The same private cell-content part middle-aligns a direct button host, retaining ElButton's native inline treatment through the announcement wrapper without additional baseline space. Caption-baseline layouts outside that direct cell composition are unchanged. Browser verification uses a standards-mode document and checks actual editor, output, button and artwork centers, including hover and different fonts.

## Content wrapping in narrow regions

UiContent allows an otherwise unbreakable word to wrap when it exceeds the available line width (`overflow-wrap: break-word`). This includes bare text and inline spans, independently of an enclosing card or paragraph. Ordinary word boundaries remain preferred; explicit descendant whitespace/wrapping rules retain ownership. The adapter supplies this default without author-side CSS, and without changing content insets or resize shares. Bootstrap's native card already provides equivalent inherited wrapping; UiContent also supplies it outside cards.

This is text wrapping, not a measured horizontal resize minimum: a panel narrower than its insets plus a glyph, or non-wrapping/non-text content, still needs an appropriate allocation or scrolling policy. Vertical measured minima remain separate. Verify both supporting regions near horizontal divider limits with enough width for insets and characters, and preserve mounted reading content.

## Document baseline

The stylesheet includes the complete Element Plus component CSS, its document reset and opt-in `.dark` theme variables. CSS is not selectively bundled. The reset is compiled from the pinned toolkit's `theme-chalk/src/reset.scss`; see [source attribution and regeneration](../THIRD-PARTY-NOTICES.md). Applications need no Sass compilation step.

This is document-wide styling: body typography, font inheritance for text inputs/buttons, and native heading, paragraph, link and horizontal-rule defaults. Teleported menus and pickers inherit the same document font as ordinary content. The font stack uses installed fonts; this package does not download Inter or another font. The integration declares `theme.color-mode.v1` and maps shared application mode to native `html.light` / `html.dark` selection. Importing CSS alone does not take ownership of the document mode.

`UiApp` supplies the application surface and space offer, inheriting this baseline. It is not the document's font owner. `UiContent` adds content insets without another reset or prose theme. The document reset does not remove body margins; core's explicit `uninterface-body-margin0` utility remains an independent assembly choice.

## Feature mapping

| Uninterface feature | Element Plus integration |
|---|---|
| Form submission, reset and feedback | `ElForm` supplies presentation context and native field rhythm. Core handles submit/reset, validation, pending state and draft baselines. No toolkit model, field paths or business rules are installed. |
| Field labels, requirements and errors | `ElFormItem`, top labels, right-side required marker, externally supplied error/validation state, and its error slot. Error presentation retains native debounce/transition timing. |
| Single checkbox field | The field label is consumed by `ElCheckbox` through private backend coordination; a group retains its outer label. Control-level required semantics remain on the actual checkbox. |
| Text input | `ElInput` with model-value/update, native focus and attributes. Toolkit validation events are disabled. |
| Select | `ElSelect`, `ElOption`, `ElOptionGroup`; source activity maps to `loading` with native loading presentation and wording, and idle/failure/empty messages to `no-data-text`. Core supplies values, labels and eligible candidates. |
| Button | `ElButton` with native type, plain treatment, loading indicator and effective disabled state. Localized activity is also announced outside the busy button. |
| Command menus, inline/popup/context | `ElMenu` in vertical mode, `ElSubMenu`, `ElMenuItem`, `ElMenuItemGroup` and `ElDivider`. Root popup hosting uses a pure/light `ElTooltip`; native submenus own their poppers. |
| Navigation | The same menu family with `ElMenu mode="horizontal"`. Native title/arrow/item composition supplies navigation appearance and menubar semantics; modelValue alone determines current state. Optional hrefs render native links within items. |
| Async menus | A backend extension uses the select feedback class and `useLocale().t('el.select.loading')` because ElMenu has no async loading facility. Core failure/empty text and a native retry item complete recovery. |
| Navbar | A wrapping navigation shell using Element menu spacing/surface tokens. Its horizontal minimum block size uses `--el-menu-horizontal-height` (native default 60px), including ordinary-link and brand-only content; taller/wrapped content grows. Element has no corresponding generic brand/navigation/actions component; no fixed header height or app-layout service is imposed. |
| Layout and flow | Keyed grid/flex allocations with native ElSpace's small spacing (8px). ElSpace's positional child wrapping cannot guarantee keyed child identity; ElRow/ElCol do not express arbitrary shares. |
| Regions and hosting | Direct allocation and grouped scrolling. ElContainer/Header/Main/Footer introduce fixed default heights, insets, landmarks or independent overflow that do not implement the same contract. |
| Content | An inset wrapper using `--el-main-padding` (20px by default), without ElMain's landmark, flex growth or overflow ownership. |
| Application context | createUiApplication consumes the integration descriptor and installs ElConfigProvider with the committed native locale. Business components need no provider wrapper. |

## Presentation policies

The six baseline theme roles are supported. `secondary` and `info` both map to Element Plus's neutral `info` treatment. Filled uses native type treatment; outline uses native `plain` with a transparent resting background. No additional theme colors are declared.

Uninterface remains the control owner. Native focus, keyboard, loading, feedback timing and positioning are used wherever they fulfill the contract; disabling toolkit validation does not disable its presentation facilities.

UiForm spaces all direct children, including fields, action layouts and notices, with a column gap matching native field separation: 18px for default/small forms and 22px for large forms. An application-owned `--el-form-item-margin-bottom` on the form can override that gap. Direct UiField bottom margins are removed so separation is not doubled; nested compositions retain their own spacing. Individual field size strategies change field internals without changing the containing form's gap. Help and error descriptions coexist. Displayed below-field errors occupy a full row within the field's measured content, including wrapped messages and native enter/leave lifetimes. This deliberately adapts native absolute error placement: compact error-free fields reserve no error space, and fields grow only as their displayed content requires. Native error color, typography, size-dependent padding and configured inline-message modifier remain in use; inline-message is not forced on. None and tooltip errors add no below-message allocation. The adapter attaches error descriptions only while the native error is mounted; validity itself updates immediately. Required fields use a danger-colored asterisk at the native Form’s configured position (prefix by native default). Required annotations yes preserves this placement; prefix/suffix select it explicitly and no hides it. A checkbox's native label uses a decorative annotation because ElCheckbox has no equivalent required-marker slot; groups retain a localized required description.

Select source status appears inside the native picker status area, separate from collapsed selection text. Loading uses Element Plus's native default without a `loading-text` override. The accessible loading announcement uses the same Element Plus locale (`useLocale`); an enclosing ElConfigProvider locale applies to both. Core's `entriesLoading` fallback does not override this wording. Idle/failure/empty messages retain the core message mapping through `no-data-text`; application locale selection synchronizes core and toolkit resources through backend integration. Status and cached alternatives cannot be selected while results are unavailable. Hidden records contribute only collapsed display text. Unloaded and failed pickers stay openable, and source recovery remains with business controls. An empty-string entry remains a real selectable business key; only null/undefined are configured as native empty values.

ElSelect consumes Escape even when collapsed. Inside an active shared overlay,
the adapter forwards Escape from the collapsed combobox to the overlay during
key capture. An expanded picker still handles Escape through ElSelect.

All menu contents use the same native family, including rich, grouped, checked and lazy entries. Refreshing sources does not switch renderers or replace host elements. Native submenus own title geometry, arrows, placement, transitions and popup frames. Checked/radio marks and rich descriptions are small content extensions; their state comes from core. Navigation current state stays independent of checked selection. Hrefs are optional; key-only navigation uses application activation handlers. No toolkit router is installed.

Command popup/context surfaces adapt this family to the pinned ElDropdown default presentation: 22px line height, 5px/16px row padding, 5px menu padding, and native dropdown frame, hover/focus and disabled colors. Each teleported level receives the same treatment. The popper owns the border and shadow; its inner menu has neither. Rows grow for descriptions and wrapped labels. Groups, checks/radios, shortcuts and async feedback are adapter extensions, because ElDropdown does not supply all these concepts. Check and icon columns align siblings through transparent groups and restart independently at each submenu. Navigation keeps its separate native geometry; ordinary business consumers still supply entries, operations and complete host bindings without styling these internals.

Command branches retain click opening. Explicit command clicks and keyboard entry move focus into a branch; generic native open/close notifications do not move it. This vertical, non-collapsed composition does not currently open on hover. Acceptance must compare root and three-level geometry with native ElDropdown, confirm one frame per popup, check mixed checked/icon-free rows and wrapping, and exercise focus, dismissal, lazy recovery, context placement and narrow/RTL layouts in light/dark mode. Scoped style and simulated-DOM regressions are implemented; real-browser visual and pointer acceptance for this command adaptation is pending.

Keyboard-focused submenu triggers use the dropdown highlight on their visible title, matching ordinary command items. The focused outer submenu LI adds no second outline. In forced-colors mode, an inset system-color outline keeps focused items and submenu titles visible without extending beyond the popup edges.

The horizontal menu uses click opening and disables native ellipsis: Element's ellipsis calculation partitions immediate slot VNodes, which does not preserve this recursively composed entry tree. Horizontal item sizing remains native. Narrow-screen overflow and keyboard access require browser verification; the adapter does not silently substitute a different navigation pattern.

### Layout separators

`UiLayout.vue` supplies `layout.separator.v1` for `UiSeparator`. It paints a
solid 1px line in the existing peer gap using Element Plus's
`--el-border-color`. A short vertical line appears between horizontal peers
on the same row. A horizontal line spans the layout between vertical peers.

## Field spacing in layouts

UiField retains ElFormItem for native label, size and validation presentation. When an `.element-field` is the sole direct element child of an `.element-layout-item` directly owned by UiLayout, its native bottom margin is removed: UiLayout supplies peer separation. Direct UiForm fields retain their existing margin-to-form-gap integration. Fields inside other compositions and independently authored ElFormItems are not targeted by the layout rule.

This uses the selected layout density rather than reproducing native form-row spacing. UiField owns the space for its displayed help and below-field errors; peer gaps do not double as reserved error space. Checkbox height and label placement retain their native treatment. Ordinary consumers supply field data, validation and optional strategies without CSS repairs. Verify that fields keep their compact dimensions when no message is displayed, grow enough for wrapped errors clear of the next field and its label, and recover their compact dimensions after correction/reset or suppression. Backend browser regressions cover native sizes, responsive above/beside labels, checkable groups, direct UiForm and UiLayout arrangements, native inline-message true/false, coexisting/replaced help, localized wrapping and normal error transitions. Source/DOM checks alone do not establish browser geometry.

### Checkboxes, radio choices and switches

Checkable spacing is adapter-owned; ordinary consumers do not need a compact layout strategy to compensate for wrapper whitespace. Standalone checkbox/switch hosts use content-sized block flex rows, and each choice-group option uses a flex column so native inline controls do not acquire a surrounding form line box. Native small/default/large control heights remain intact, with no changes to focus, disabled state or input associations.

Vertical checkbox/radio groups add no extra gap between native rows. Horizontal groups retain their 16px gap and wrapping. Option descriptions use the extra-small theme font with a 1.5 line height rather than the form's control-row line height. Switches use 10px separation between the control and external field label, matching the native external-label treatment. Independent fields retain ordinary layout or form separation; this does not globally compress forms.

UiSwitch adapts ElSwitch's physical thumb positioning to logical inline positioning. Off sits at inline start and on at inline end, following the nearest inherited `dir`, including nested regions and direction changes. The adapter retains native small/default/large thumb dimensions (12/16/20px), 1px inset, colors, sliding transition, focus and disabled/readonly handling. Its private thumb-size tokens track the pinned toolkit dimensions and must be reviewed when upgrading Element Plus. The rule is scoped to the adapter's switch host; independently authored ElSwitch controls retain their own styling. Consumers supply field data and document/region direction without switch-specific CSS or a new direction prop. Verify all sizes, both themes, opposite nested directions, live direction changes, animated travel, label and keyboard activation, visible focus and disabled/readonly preservation. Automated Chromium evidence and user visual acceptance are separate.

Acceptance covers size variants, horizontal/vertical choices, option and field descriptions, errors, disabled states, label activation and focus. DOM/CSS checks establish structure and rule scope; exact geometry, wrapping and focus paint still require browser review.

## Pinned integration details

Inside UiForm, the button adapter suppresses ElButton's additional `resetFields()` call through a private form-context bridge. The actual HTML `type="reset"` and reset event are preserved; core handles the editing baseline. Native form presentation context remains reactive, and independently authored Element forms are outside this bridge.

Element's select/checkbox wrappers require associations and forwarded listeners on their actual input targets. The adapter synchronizes those targets without replacing toolkit listeners. Delayed field errors update those associations when their native slot mounts or unmounts.

Text inputs and selects reference the field's label text with `aria-labelledby`, excluding the native decorative required asterisk from their accessible name. The native label association and marker placement remain intact, and `aria-required` conveys requiredness. Explicit editor `aria-label` or `aria-labelledby` attributes retain precedence.

Element's exported `MENU_INJECTION_KEY` is bridged inside each native menu. Element normally updates active state immediately, closes branches on item selection, and ties vertical floating submenus to a collapsed icon rail. Those conflict with application-confirmed navigation, retained checked menus and full-label floating command submenus. The private bridge supplies controlled active/open state and translates activation, while retaining native registration, widgets, styling and poppers. This is version-sensitive integration, not a new public API.

Element 2.14.7 installs keyboard listeners once for horizontal DOM children; it does not cover vertical menus or subsequently mounted/teleported branches. The adapter supplies a single scoped keyboard controller for dynamic surfaces, invoking actual native item actions. It handles arrows, Home/End, typeahead, Enter/Space, Escape and ordinary Tab traversal without duplicate native handling. Teleported native menu lists are registered and given accessible names/associations without an extra visual wrapper.

Each registered menu's native popup container also belongs to that menu's interaction boundary. Element focuses this surrounding container on pointer entry; treating that focus as outside would close and reopen a flyout beneath the pointer. Unrelated popups remain outside and dismiss navigation normally. Consumers do not need to manage this focus or identify native wrappers.

Element's root popup focus trap restores prior focus even on outside dismissal. A narrow cancelable-event handler leaves focus restoration to the host lifecycle. When a command submenu is already closing, the adapter also blocks the focus-release event from scheduling a second tooltip hide that could close a reopened submenu. Nested poppers receive inherited text direction through supported popper styling. Preferred submenu placement follows Element's bottom-start/right-start choices and native collision fallbacks; fully mirrored RTL placement is not supplied. Review context shape, submenu DOM association, keyboard support and focus behavior when upgrading the pinned toolkit.

Root popup transition completion initializes focus only when focus is not already in that menu or one of its registered teleported submenus. It must not reset the keyboard cursor after the user enters a loading branch. The loading surface remains focusable while entries arrive; ordinary arrow navigation then enters the available items. Queued focus work is canceled when the popup is removed.

## Verification and limits

Use the native comparison fixture in [docs/examples/NativeReference.vue](examples/NativeReference.vue) alongside an application scenario that exercises the relevant shared contract. In a browser, verify popup typography, keyboard interaction, focus, narrow navigation, scrolling, overlay bounds, contrast and motion. See [native test setup](testing.md#run-the-backends-native-tests) for the source-checkout runner.

### Known light-mode editor contrast limitation

The default light palette has the following normal-text contrast limitations against WCAG AA's 4.5:1 threshold:

| Presentation | Foreground / background | Measured contrast |
| --- | --- | --- |
| Active navigation | `#409eff` / `#ffffff` | 2.78:1 |
| Primary filled button | `#ffffff` / `#409eff` | 2.78:1 |
| Danger native plain (soft) button | `#f56c6c` / `#fef0f0` | 2.61:1 |
| Field helper text | `#909399` / `#ffffff` | 3.07:1 |

Menu and button colors come from Element Plus. Helper text is adapter-provided and uses Element's `--el-text-color-secondary` token. These are native-theme limitations, not a WCAG AA conformance claim. Keyboard, focus, naming, feedback and interaction obligations still apply; applications requiring AA conformance must assess their own theme and complete workflows.

Applications requiring higher contrast can customize the theme after importing the backend stylesheet. For example, these optional light-mode tokens darken the foreground/background colors involved in the listed normal states:

```css
:root:not(.dark) {
  --el-color-primary: #1d6db5;
  --el-color-danger: #b42323;
  --el-text-color-secondary: #606266;
}
```

These document-wide tokens affect all their consumers, not only the editor. Derived palette shades are independent CSS variables: customize the corresponding `--el-color-*-light-*` and `--el-color-*-dark-*` tokens, or generate a consistent palette through [Element Plus theme customization](https://element-plus.org/en-US/guide/theming.html). Check hover, pressed, focus, validation and disabled states as appropriate, plus dark mode separately. The example is an optional starting point for the listed normal states, not a verified complete accessible theme.

Relative stacking strategies, general strategy negotiation and runtime backend switching remain outside this implementation. Current toolkit defaults are used where no shared configuration is implemented; importing theme CSS alone does not fulfill those future contracts.

Application localization and the icon catalogue are installed through `createUiApplication`; see [setup](setup.md#localization-and-icons). The integration exports native locale mappings and the 58-name default subset.

UiIcon uses native ElIcon artwork and color handling, with a scoped square-sizing rule. Element's menu-specific icon column otherwise sets width independently of glyph height. The semantic icon keeps equal width and height inside the menu entry's separately allocated icon part; toolkit-internal disclosure icons retain their native treatment.

Shared grid layout uses this backend’s static `./layout` export (`uiLayoutPresentation`) for peer spacing, also used by its linear layout. Core owns the grid geometry; no separate backend grid component is needed. See **UiGridLayout** in `@uninterface/uninterface` (`docs/api/components/UiGridLayout.md`).

## Color mode

Use **core application color-mode setup** in `@uninterface/uninterface` (`docs/guides/color-mode.md`) with `colorMode: { document }` to own the document, optionally specifying preference and a storage key. Without ownership, the app observes the existing host document. The integration uses native `light`/`dark` classes on `<html>`; teleported overlays inherit the same tokens. Business components need no toolkit selectors or mode props. Native popup treatment such as Element's `effect="light"` is a surface variant, not a request to bypass the document's dark palette.

For SSR, emit the native `<html class="light">` or `<html class="dark">` selector matching the rendered preference and hydrate with the same initial resolution. Multiple independently themed apps in one document are unsupported. Automatic toolkit mode controllers remain disabled; core owns system and optional storage policy.

Automated controller/DOM acceptance verifies host inheritance, live propagation and state retention. Real-browser computed-style, contrast and focus verification is also required; DOM acceptance alone does not certify visual accessibility.


See [strategy support](strategies.md) for optional regional preferences, control-size mappings and unsupported values.

Label arrangement strategies select above or beside placement through native FormItem behavior; beside placement stacks on narrow screens. See [strategy support](strategies.md#field-presentation).


## Text editing modes

ElInput uses its native text/password/textarea modes and readonly prop. UiTextInput keeps shared field ownership, naming, focus, size, required annotations and feedback across all supported modes. Readonly permits focus and copying without user edits; it does not exclude a field from validation/submission.

Password reveal uses a named button in ElInput's suffix slot. The slot is registered on the first render so the button can appear when its localized label is ready, without remounting the editor.

## Button presentation preferences

Filled uses ElButton's colored treatment; soft uses native plain; text uses native text. Notice action rows adapt text buttons to zero horizontal inset and native link-style hover/active colors, retaining text-button height and focus; see [notice action alignment](selection-feedback-panels.md#notice-action-alignment). Outline uses plain with a transparent resting background to distinguish its subdued interior from soft. Icon uses native text/circle presentation. Labelled buttons use ElButton's icon slot and allow it to grow for explicit icon sizes. Icon-only buttons carry their icon in the content slot so it can set a minimum footprint even while the native loader is visible.

All six variants support every declared color. The explicit variant prop takes precedence over an agreed uiButtonVariant regional preference. With neither specified, this adapter ordinarily uses filled; supported application-owned native configuration remains effective. Icon labels stay accessible and supply a native title hint; title display on focus/touch depends on the browser. Pass an explicit title when label content comes from an opaque component. These are support declarations; real-browser geometry and hint behavior need verification. See **UiButton** and **uiButtonVariant** in the core documentation.

## Cards and hierarchy

Cards support an absent header without reserving a blank header band or separator. The optional `top-end` slot anchors concise actions to the card frame using logical edges, independently of preview/media content. Its inset follows half the current card padding, including density changes; the enclosing frame stays positioned and focus remains unclipped. Collection cards use this slot for `card-action-placement="top-end"` and omit headers without selection or meaningful header fields.

UiCard supports five structural requests: -2/-1 higher, 0 ordinary, 1/2 subordinate. Its default map shares the two higher treatments; all other defaults differ. Every level retains a full outline and readable body content. Ordinary/higher levels use solid outlines; both subordinate levels use dashed outlines, independently of color. Higher cards use roomy insets, a band header, large title and raised surface; zero uses normal insets with a band, large title and raised surface; one uses compact insets and a band header; two retains the band and adds a tinted surface and smaller title. Headerless cards retain surface, boundary, density and elevation cues.

Element Plus retains one ElCard. Native shadow always/never follows raised/flat. Card region padding is 24px/20px/12px for roomy/normal/compact, and title sizes use extra-large/large/base native font tokens. There is no native card color prop: scoped region/boundary styling consumes semantic palette variables (secondary maps to info, matching the adapter palette). Root/body overflow is visible to preserve focus and the no-scrollport contract. Theme variables provide light/dark values.

All eight portable treatment properties are supported through uiCardPresentation: color, header (band/plain), footer (normal/muted), density (roomy/normal/compact), surface (plain/tinted), elevation (flat/raised), border (solid/dashed/dotted/double) and titleSize (large/normal/small). A map can independently customize all five levels, including -2 and -1. Exact native values remain theme-owned; solid/dashed is a primary distinction in Uninterface’s default hierarchy; applications can override patterns, including double, through their presentation maps. This is an Uninterface convention, not a claim of a universal toolkit hierarchy.

UiCard.color overrides the level's color; null explicitly selects neutral and omission uses the profile. Colored boundaries and softly tinted header/body regions use the effective role, while body text retains ordinary foreground. Neutral uses the theme's ordinary boundary tone. Private tokens reset on every card, so a parent's explicit color does not color nested cards or controls. Shared profile scope still independently applies to each participating card. Title/description slots receive structured typography; arbitrary header content retains its own typography and replaces both slots.

The card grows with content, has no sticky regions or scrollport, and preserves descendants when level, color or profile changes. Parent layouts own peer spacing; card regions own insets. No heading rank or interaction role is inferred. See [customization](customization.md) for setup and stylesheet ordering. Structural tests do not establish visual hierarchy quality; compare representative nested content in both modes and at narrow widths.

Footer background and separator color/thickness retain native toolkit presentation; foreground follows the selected footer emphasis. Existing separator patterns follow solid/dashed/dotted card boundaries; double boundaries use solid separators. Pattern-only adaptation fulfills the shared border contract without imposing the card accent on the native footer. Card-density padding adjustments remain to fulfill the explicit shared density request. Native theme configuration can therefore affect footer appearance independently of the enclosing boundary.

Default headers at levels 1/2 retain full insets and a separator so the footer does not receive the only region boundary. Ordinary title typography is semibold, with footer decoration intended to be equal or quieter. Native footer decoration is retained. Application-owned themes, custom plain-header profiles and rich footer content require assessment of the complete pairing; the default styling cannot control the prominence of arbitrary business content.

Element Plus adapts only the existing footer border-block-start-style and band-header border style; native footer border width/color remain intact. Pattern changes never add a separator to a plain header, reveal a missing footer, or change nested-card requests.

Footer emphasis defaults to muted at levels 1/2 and normal elsewhere. Muted uses --el-text-color-secondary with --el-font-size-small. Normal retains the native/reference foreground and body text scale. No whole-region opacity or control-size strategy is applied. Both subordinate levels use the same small scale. Card roots reset typography to the backend body baseline to prevent a nested card from inheriting reduced footer type. Backgrounds, insets and separators retain their independent policies. These scoped text changes fulfill the explicit portable footer request; native HTML/third-party content retains normal CSS inheritance responsibilities. Verify custom content and theme legibility in both modes.


### Context-menu host focus

UiMenu supplies `buttonTrigger` for explicit button activation and `contextTrigger` for contextual interaction on a content group. Apply the complete binding with `v-bind`. The contextual binding includes a private backend class that gives its element a visible keyboard-focus boundary; it does not change child control styling. Focus colors follow this backend's theme, with a system-color outline in forced-colors mode. The boundary uses a backend default radius independent of nested content; it does not infer a child card's shape. Ordinary consumers need no backend class names or focus CSS.


### Reusable focus presentation

Use `useUiFocusPresentation()` from `@uninterface/uninterface` and apply its complete object with `v-bind` to an author-supplied focus target. This backend fulfills `focus.presentation.v1` through its static `./focus` module and stylesheet. The same theme treatment used by context-menu content is available on native links and suitable custom regions anywhere in the application. The binding supplies no tabindex, roles or interaction; callers retain those responsibilities. Branding applies it explicitly rather than relying on navbar ancestry. Avoid adding a second focus treatment to existing toolkit/Uninterface controls. Theme and forced-colors behavior follow the contextual focus treatment described above.

### Region framing

Ordinary UiRegionLayout supports optional separators, selectable adjacent numeric-share resize boundaries and relative sibling layers. Element Plus uses --el-border-color, --el-bg-color and --el-box-shadow-light. Its native Splitter has a separate whole-panel size model; this adapter retains the existing grid for mixed content/numeric allocations and stable children when resizing is enabled. Separators occupy one theme-owned track; resizers replace that track with a pointer/touch target and use this backend's reusable focus treatment. The initial target is 0.5rem across the split; themes may customize the private layout handle/separator size properties. Raised surfaces do not add content insets.

The adapter owns markup/geometry and uses the optional useUiLayoutResizeView helper for measured pointer interaction, RTL-aware keys and cleanup. Core owns the adjusted ratio and validates relationships. This is allocation framing, not a card or a claim of a native splitter widget. Rendering stays stable while framing changes; the reading scrollport cannot clip a sibling header's shadow. Local layering does not establish global overlay order. Forced-colors uses system boundary colors. Shared browser acceptance remains necessary for hit targets, focus and geometry.

Region separation belongs to UiRegionLayout and spans the full allocation boundary, independent of navbar/UiContent size. A designated navigation child suppresses its matching local edge even when the layout explicitly hides ordinary separators. Standalone and unrelated nested navigation retain their own borders.

Start–Main uses `--el-border-color-darker`; Main–End uses `--el-border-color`. These line colors express stronger/quieter emphasis in both equal-depth and raised cases. They never change elevation, shadow opacity/reach or stacking order. This is the adapter's region-framing policy, not a claim that native toolkit navbars independently implement these region roles. Application theme overrides should preserve the distinction and both lines' visibility.

Raised region presentation decorates shared edges toward lower neighbours. The adapter retains `--el-box-shadow-light` on a separate shadow plane: reflect vertically for a before/top edge, rotate for inline edges, and mirror logical mapping in RTL. Absolute decoration uses `container-type: size` and `cqw`/`cqh` units to keep the rotated plane's footprint equal to the allocation; this requires a browser supporting size container queries. Business content is neither size-contained nor clipped. The wrapper clips only edge decoration. Native shadow customization still feeds the plane, with the same recipe at both roles. No exposed outside edge gains a border.

Equal-depth boundaries retain requested ordinary separators, including all-raised and none-raised states. A raised edge replaces the ordinary separator. Resize handles retain their own tracks and boundary lines; the adjoining raised decoration omits its extra line and stays below the interactive handle. Forced-colors uses a system-color line and suppresses shadows; tone and depth distinctions may collapse. Verify short content, both axes, RTL, light/dark themes and custom theme values in a real browser.

## Button announcement containment

The native button and its persistent loading-announcement live region share a private positioned inline-flex host. The clipped announcement is anchored at the host origin so a button inside a long scrollport does not extend document overflow. Attributes, events, form association and focus still target the native button. The live region remains outside its accessible name and mounted while idle.

## Input-styled controls

The core **Input-styled controls** contract (`docs/contracts/input-styled-controls.md` in the core documentation) defines this shared look-and-feel agreement. Applicable text, scalar temporal, select and compact multiselect surfaces normally fill their field-control allocation, align to its logical start, use a coherent input frame with visible focus, and default to one row. Textarea and wrapping selections are explicit adaptations. Field labels and feedback retain their existing arrangement strategies. Native theme tokens and supported customization supply the appearance; business compositions do not compensate with CSS.

UiInputFrame composes sub-inputs and supporting content into one input-styled control. UiTextInput shares its frame without adding another border. Existing native controls can fulfill the same agreement directly. Temporal ranges use the lower-level delegated-frame protocol internally. UiFileInput is input-styled: chooser, accepted filename and clear action share the surface. UiUploadRegion retains its drop-area presentation and owns the internal arrangement of optional progress, preview and actions. UiFileInput keeps previews separate. See the [reviewed components](reviewed-components.md) for ownership and native adaptations. This documents obligations, not new visual acceptance evidence.

## Shared input frames

Framed text editors support `maxWidthCharacters` as an approximate character-cell display cap (`input.frame.sizing.v1`), applied to the real editor allocation while the inner input fills it. It never supplies maxlength or changes parsing. UiInputFrameSpacer receives remaining logical inline space through an automatic start margin after editor growth; it is decorative and has no tab stop. The price example uses eleven cells for ten digits plus a decimal separator and places the spacer after USD. Narrow-width/RTL geometry remains subject to browser verification.

ElInput forwards arbitrary data attributes to its native input. Framed editor allocation uses the existing element-control-frame-part class on the outer ElInput wrapper; the native input fills the wrapper. This prevents full-width wrappers from splitting the compound editor into separate rows.

Element Plus has no generic public input frame. This adapter reuses el-input/el-input__wrapper presentation and native input/size tokens, with a wrapper focus/error projection. It does not mount a hidden ElInput or enable native validation. Feedback descriptions use the existing field-presentation service, including delayed native error visibility. Native class compatibility must be checked on upgrades.

UiInputFrame with ordinary UiTextInput implement input.frame.v1 and input.frame.cooperation.v1; single-line search also declares input.text.search.v1. The frame consumes field invalid/busy/disabled state and existing failure/size strategies. Hidden failure presentation retains aria-invalid. Parts receive unique names/IDs and the owning field's visible feedback descriptions. Leading, default and trailing content share one wrapping surface. Readonly leaves text selectable and blocks in-frame buttons by default; allowWhenReadonly permits appropriate non-editing actions without bypassing disabled/loading. Owned popup engagement is coordinated; popup content has a separate field/surface scope.

Use the [customization guide](customization.md) for consumed configuration. Functional DOM acceptance covers focus movement, invalid-part focus, incomplete drafts, Save/Reset/Clear and restrictions. Check appearance and narrow geometry with the intended theme in a browser; DOM tests are not visual evidence.

The adapter composes the native file chooser and accepted filename within its backend input frame; Clear participates in the same surface. Filename text follows the accepted descriptor independently of the browser file list. Acquisition alone creates no preview object URL. Browser visual acceptance remains separate from functional DOM checks.

Native nonmodal menu poppers emit a cancelable `focus-trap.focus-after-released` event. The adapter cancels automatic focus restoration for its own registered poppers, matching the command-popup integration. Otherwise a release can restore an old trigger after focus has already moved to another branch or an unrelated control. The menu keyboard/dismissal routes retain focus ownership, and unrelated poppers are unaffected. The navigation DOM regression exercises hover traversal across teleported boundaries and verifies that outside dismissal keeps focus on the newly selected control. Actual browser hover/transition acceptance is checked separately.

When focus leaves a popup navigation menu, the adapter also restores one root keyboard entry point after pending updates. A removed submenu must not leave all root entries at `tabindex="-1"`. This changes tab eligibility without moving focus back into the menu. The DOM regression covers submenu destination activation followed by outside focus in horizontal and vertical flyout modes; the shared application-navigation browser test verifies actual Tab re-entry.

## Vertical navbar adaptation

UiNavbar follows core's resolved navigation-region orientation. In a side navigation allocation it stacks brand, links and actions vertically at every width; a top/bottom or standalone navbar retains horizontal wrapping. Theme spacing and child semantics remain native to this backend. Only the acknowledged logical edge is rendered; a region-owned edge is not duplicated. This implements the shared UiNavbar backend guidance in `@uninterface/uninterface` (`docs/api/backend/navigation.md#uinavbar-implementation-guidance`), rather than relying on incidental narrow-width wrapping.

Vertical bars use `--el-menu-base-level-padding` for block insets and release the horizontal row minimum. Horizontal bars retain `--el-menu-horizontal-height` and native menu alignment.

## Native arrows in composed pickers and suggestions

Scalar date/time/datetime pickers, date/datetime range pickers and suggestions retain ElPopover's native default arrow. This matches the corresponding native date/time picker and ElAutocomplete defaults. The adapter leaves `showArrow` at its toolkit default rather than suppressing it; Element Plus owns arrow markup, border/fill, offset, flipping and viewport adjustment. Existing popup ownership, field drafts, selection, typing, dismissal and focus return remain unchanged. No business-side arrow prop or styling is required.

Command/navigation submenu surfaces remain arrowless to match native ElSubMenu. Verify composed picker/suggestion arrows in light/dark and LTR/RTL, near viewport edges and within modal hosts, alongside normal selection and keyboard dismissal. DOM regressions establish native arrow presence and retained interactions; browser placement and paint require separate visual acceptance.


### Context-menu viewport changes

Pointer context menus use the shared backend helper `useUiMenuPoint` to retain their original click coordinates and constrain the effective point to the current document viewport. Changes update the virtual reference and request native ElTooltip repositioning after Vue updates; expanding restores the original point once it fits again. Popper's pointer-context overflow policy may detach from the effective anchor on either axis to keep the menu reachable. Button and keyboard invocation retain their element anchors and native overflow policy. All command poppers use the existing viewport-minus-16px size bounds; the root no longer overrides those bounds with the full viewport. Focus, menu identity and open state are retained. Native ElSubMenu continues to own descendant placement. Shared point observers disconnect on deactivation/unmount, and late native update requests are guarded after disposal. Browser checks cover shrinking past the original point, further nesting and expansion; synthetic native-state tests do not establish actual painted geometry.


## Compound-control baseline alignment

The backend declares `layout.baseline.v1` for horizontal UiLayout/UiFlowLayout rows, with and without wrapping. The existing native CSS Grid/Flexbox allocation consumes `align="baseline"`; keyed allocation and stacking wrappers stay in place. Each wrapped row aligns independently. Vertical baseline alignment and UiRegionLayout baseline requests fail in core.

Input-frame editor participants supply the first editable baseline, ahead of leading icons and trailing actions. Native minimum-height surplus is centered around the content line. Button hosts use baseline vertical alignment; visible captions participate in baseline export while decorations retain their centered treatment. Field/form wrappers propagate the reference naturally; above labels expose their first line, while hidden/floating labels expose editable content. These adaptations preserve native typography, padding and control ownership. Arbitrary opaque content retains native baseline/fallback behavior; no DOM search or measured offset selects its business target.

The Shared input frame keyword row and Collections OrderSearch row exercise this behavior. Source/DOM checks do not establish painted text alignment; browser acceptance must compare actual text baselines at supported sizes, RTL, wrapping, feedback and loading states.


Framed UiTextInput also supports `minWidthCharacters` (`input.frame.min-width.v1`). The real editor allocation consumes a minimum in font-relative `ch` units; the inner native input continues to fill it. This minimum takes precedence over shrinking/percentage maxima in an insufficient host and is never a minlength constraint. Omission preserves the existing compact minimum and maximum-width behavior. OrderSearch and the Shared input frame keyword example request 20 cells; this is a business-composition choice, not a backend-wide search width.

## Neutral buttons

Uses native default ElButton (empty type, plain=false), matching the docs’ neutral Cancel and pale primary hover for primary. Other roles use the same native surface with Element’s semantic hover/active/focus tokens; secondary maps to info. Native dimensions, disabled treatment and loading remain intact.

Select variant="neutral" independently of color. This fulfills the neutral-rest/semantic-interaction contract using backend-owned adaptations; it does not change omitted defaults. Test color changes, variant removal, loading/disabled behavior, keyboard focus, and light/dark themes. DOM mapping coverage does not establish browser visual acceptance.


See [Contract adaptations](contract-adaptations.md) for this backend’s native mappings, support limits, allocation defaults and verification qualifications.

## Infinite table continuation

The adapter places continuation in its private trailing tbody before the native summary, using the same Teleport integration as the optional creation row. ElTable append follows the summary and is not used for infinite continuation. This integration does not establish SSR/hydration support. Loading, append failure/Retry and completion scroll with the data, before any creation row and summary. The sentinel stays at that point. The adapter retains one announcement outside the table/loading mask; non-infinite and card status paths remain separate. Verify pending/retry/completion, bounded infinite and no-summary tables, plus switching to manual content-height accumulation, preserving keyed editor state and column alignment.

## Infinite continuation content

UiTable, UiList and collection card views forward `infinity-loading` and `infinity-complete` message-content slots with `{ message, loadedCount }`. The backend retains its loading indicator, status container, continuation position and independent sentinel; table continuation remains before creation/summary rows. Initial/refresh masks and non-infinite status paths retain their existing presentation. Missing/empty content uses the resolved default text. Core resolves per-view `messages.listAppending`/`listComplete` for visible defaults and the elected announcement. Error slots expose `placement` for initial, replacement and append recovery. See the `@uninterface/uninterface` Collection views guide, Infinite continuation content section for ownership and observable checks.

Default infinite loading/completion feedback is centered and subordinate to record text. Element Plus uses `--el-text-color-secondary` and a smaller relative text size. The local loading message inherits that size instead of enlarging with control-size strategies; the backend retains its indicator. Errors, empty states and non-infinite feedback keep their own treatment. Custom infinity content inherits the status tone/alignment.

## Progress bars

Standalone and upload-hosted bars share `UiProgressBar.vue` and `progress.bar.v1`. Both measured and unknown progress use horizontal bars. See the [shared progress guide](progress.md) for this backend’s native mapping, precise range, semantic color and reduced-motion adaptations. The producer retains operation and announcement ownership.
