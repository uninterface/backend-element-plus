# Element Plus contract adaptations

[Documentation index](README.md) · [Presentation and integration](presentation.md)

This backend-owned reference records native mappings, support limits and integration decisions. Shared API semantics remain in @uninterface/uninterface; native component names and concrete appearance do not add business-side parameters. This documentation move adds no runtime support or browser acceptance evidence.
## Fields, controls and strategies

UiField uses native ElFormItem size and label-position: top for above, left for beside-far, right for beside-near. Beside resolves configured horizontal alignment (near/right by default); left/right align text within the label column, not the side of the editor. Required annotations yes resolves the enclosing Form placement, prefix by native default including standalone fields; explicit prefix/suffix remain authoritative. Help and errors coexist by default. Below and tooltip failures are supported; embedded requests resolve below. Equivalent below-message requests retain the same configured inline-message metrics; omission respects native show-message suppression and explicit show restores a visible treatment. Unsupported floating labels resolve ordinary visible placement. Checkable labels remain adjacent except in explicit separated presentation.

UiSelect uses ElSelect; UiMultiSelect uses ElSelect multiple with collapsed tags and a keyboard-operable native clear affordance. UiSegmentedSelect uses ElSegmented with bordered segments. Native beside-label sizing is retained; segmented focus is contained without an extra 3px outer scroll inset. Input frames adapt ElInput. Control-frame browser checks include inherited native error wrappers. Suggestions forward role through containerRole because ElInput overwrites the ordinary role attribute.

Neutral primary buttons use the native default ElButton; semantic overrides and variant mappings are in [presentation](presentation.md#neutral-buttons). Neutral does not require exact cross-backend hover shades. Full-width standalone buttons fill both their existing host and the native button.

UiPreviewRegion adapts the input wrapper and tokens to arbitrary readonly content without a fake input. UiImagePreview uses ElImage contain/fill facilities and a contained accessible broken-image glyph instead of the native text error placeholder. File previews use toolkit icons. Upload progress displays localized whole percentages without rounding the source/bar value; unknown totals use a native animated segment and omit aria-valuenow.

Ordinary beside form-label arrangements and separated checkable label/control areas stack below a 40rem viewport. Flushed/control-aligned standalone labels and individual option labels stay adjacent. Checkable labels and group titles remain visible under hidden; see the checkable modes in [strategy support](strategies.md).

## Collections and navigation

UiTable uses ElTable auto rendering with one header/body table. ElTableColumn receives resolved numeric widths and align/header-align; fixed CSS table-layout and explicit width implement allocation. Native resizing/filtering are disabled in favor of shared ownership. Wrapper rows prevent business children from enabling a tree. Custom-sort headers/carets project shared multi-sort; only changed clauses are submitted. Priority text participates in column measurement and does not duplicate accessible priority descriptions.

Native positional cell keys can recreate editors during column reorder; sizing/alignment preserve them. See the [known table server-rendering limitation](collections.md#server-rendering-and-hydration).

The bounded native table viewport owns scrolling and is passed to useUiCollectionView; its allocation host supplies size. ElTable height and auto-layout sticky headers retain header visibility. Business footer content stays outside the native viewport; append recovery uses the native append area. Arbitrary column-filter editors use native popovers/icons because the native filter dropdown accepts option lists, not range forms. Removable criteria use ElTag's native close button with criterion-specific names and disabled state.

Bounded jump navigation uses ElPagination plus native-styled first/last buttons. The jumper composes inline FormItem/Input; size uses Select. Footer order is info → size → paginator → jumper, following the complete pagination example rather than claiming the toolkit default. Narrow layouts use small/pager-count facilities and start-aligned rows. Context menus update their virtual reference and request native repositioning after viewport changes.

## Feedback, surfaces and stacking

UiNotice uses rich-block ElAlert markup; secondary maps to info. Custom notices without color use neutral native surface/text tokens. Direct text actions use zero horizontal inset and link-style hover while retaining button height/focus; non-text-led rows retain boundary alignment.

Toasts/notifications use distinct native Message/Notification components with application-local flow, not global service arrays. Guarded opt-in transforms scope document keyboard listeners and disable competing native z-order allocation only for managed feedback. A named native button replaces the service icon-only close. The managed Message paragraph becomes a rich-content div; native transforms remain. Notification progress is an optional upstream feature, off by default and not exposed by managed target options. Floating variant requests do not select native surface variants.

Private FooterActions places the first declared action at inline-end and flows in reverse-inline order for modals, drawers, popovers and floating feedback, preserving DOM/Tab order and keyed identity. ElDrawer/ElPopover surfaces retain native arrow defaults; specialized temporal pickers and suggestions retain corresponding native picker/autocomplete arrows. Popup stacking registers actual .el-popper wrappers. Modal-owned popups target their owning dialog. Loading regions use ElLoading. Empty states map message/icon/actions to ElEmpty description/image/default, suppressing implicit artwork, and use the table's native empty slot.

The visible popover panel borrows `.el-popper` for appearance and suppresses that class's default rank with a scoped override. The outer surface and its owned popup wrappers receive their ranks from Uninterface. ElLoading's mask retains its native local rank inside the managed loading root. For native submenu hosting and registration, see [navigation](navigation.md).

## Temporal and locale adaptation

Date/date-time ranges with two specified endpoints use native range picker panels with shared frame/text editors. One trigger opens the range; Alt+Down from either endpoint opens it. First calendar selection remains draft until the second endpoint is accepted. Date selection retains clocks/fractions. Date-time panels stay open for clock edits; Escape/outside dismisses. Mobile uses single-calendar mode. Open-ended ranges use scalar pickers and infinity markers. Time ranges retain independent native time pickers because the native range panel hardcodes same-day ordering.

Boundary modes use an icon-triggered named menu. Start–separator–end positions remain in all modes; one-sided modes pair a scalar editor with an infinity badge and unrestricted displays two badges. Endpoints are content-sized with spare width after content; narrow allocations stack endpoints in every mode. Next-day time intervals use a calendar-plus-one icon, accessible name and tooltip. Mode changes retain drafts; external value/reset and Clear discard them.

A zh-Hans interface maps to the native zh-CN pack without implying a formatting region. Color mode uses native light/dark classes.

## Icons and default appearance

Clear retains CircleClose because the installed icon set has no dedicated eraser. More-vertical rotates MoreFilled 90 degrees in Icons 2.3.2; menu-item reuses Document/file artwork with an independent override key. Globe/external-link use original backend artwork because suitable exports are absent; compass/chain-link substitutes would change meaning. Native sorting uses simple up/down arrows. First/last and previous/next mirror in RTL; ordering artwork does not automatically mirror.

See [presentation](presentation.md), [strategy support](strategies.md), [collections](collections.md), [typography](typography.md) and [customization](customization.md) for consumed configuration and verification details.

## Support and native defaults

The following mappings describe this installed adapter. Shared strategy requests can generalize to supported fallbacks; native feature availability alone does not imply adapter support. Three-level control scales map out-of-range requests to the nearest native level. Embedded validation is not implemented and is approximated to below feedback. Browser geometry, wrapping, focus paint and assistive-technology acceptance remain separate from source/DOM checks.

### Native size and field-label support

| Backend | Native editor levels | Native button levels | Supported field labels |
|---|---|---|---|
| Element Plus | -1/0/1 | -1/0/1 | above and all beside variants for ordinary/group fields; native beside checkbox/switch labels; hidden throughout |

### Collapsible color

| Backend | Color behavior |
|---|---|
| Element Plus | Request ignored; existing presentation retained. |

### Upload allocation

| Backend | Minimum inline size | Minimum block size | Compact / regular / large block size |
| --- | --- | --- | --- |
| Element Plus | 14rem | 10rem | 10 / 12 / 18rem |

### Upload integration

| Backend | Presentation and concrete adaptation |
|---|---|
| Element Plus | Native el-upload-dragger surface, UploadFilled/ElIcon presentation, ElProgress and ElButton. ElUpload combines chooser activation, file list and transfer behavior; the adapter reuses its surface while isolating independent actions and core-owned acceptance. Dragger spacing and preview bounds are adapted to fit the allocated control without scrolling |

### Notice variants

| Backend | Omitted | filled | outline | soft |
| --- | --- | --- | --- | --- |
| Element Plus | Light alert | Dark alert effect | Theme-token border/transparent adaptation | Light alert |

### Multiple selection

| Backend | Presentation |
| --- | --- |
| Element Plus | Native ElSelect multiple with collapsed tags and its clear affordance; the native clear icon is keyboard operable. |

### Floating feedback integration

| Backend | Implementation |
|---|---|
| Element Plus | Native Message/Notification components, with application-local flow instead of global service arrays; guarded opt-in integration scopes keyboard handling and disables competing native z-order allocation; named native button replaces the service's icon-only close |

### Default font families

| Backend | Family order |
|---|---|
| Element Plus | Inter Variable |


## Checkable label and description alignment

Standalone checkbox/switch labels retain ElCheckbox and the associated external switch label. Helper text is inset to the actual rendered label text using a backend-local ResizeObserver/animation-frame coordinator; direction and ancestor presentation changes schedule recalculation. No fixed checkbox/switch width is assumed. Ordinary SSR renders without geometry work; the inset activates in the browser and releases on unmount. Native checkbox/radio rows retain size minima and glyphs while allowing long labels to wrap inside the field allocation. External switch labels use readable multiline leading instead of inheriting FormItem’s single-row line-height. Group descriptions retain their separate policy.

Business authors supply the existing UiField label/help and business value; no alignment CSS or new public prop is required. Verify short/wrapped labels, descriptions present/absent, requested sizes, narrow/wide fields and both text directions while preserving label activation, keyboard behavior, disabled state and help/error associations. Whole-field flushed/control-aligned/separated arrangements are implemented; see [strategy support](strategies.md) for resolution, alignment and responsive behavior.

Checkable validation recovery focuses the first enabled checkbox or selected enabled/first enabled radio without changing values. Named group/status and form fallbacks get temporary programmatic focusability with blur/disposal cleanup. Native options retain their toolkit indicators and feedback descriptions; fallback containers use the shared backend focus-visible treatment, including forced colors and scrolling containment. Group/field wrappers do not gain standing focusability merely from validation failure.
