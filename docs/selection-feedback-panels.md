# Selection, feedback and panels

## Multiple selection

UiMultiSelect uses ElSelect multiple with collapse-tags, collapse-tags-tooltip and native clearing. The native clear-icon position contains a keyboard-operable button using the native CircleClose artwork. It edits the complete field-owned string array; codecs translate business values. Clearing preserves loaded disabled selections and is available only when editable memberships exist in a ready source. Missing selected choices remain visible and removable after a ready response. Pending/error sources retain current values and block candidate edits. This is separate from UiSelect's single-value surface.

The popup keeps its choices inside the owning modal's interaction scope. Selected values, available choices and source feedback are independent. See the core multiple-selection guide for source lifetime and validation.

## Inline feedback and record details

UiNotice and UiBadge use Element Plus alert surface classes and ElTag. Severity never forces announcement: core supplies explicit off/polite/assertive policy. Badges are passive textual labels, not action chips or live counters.

UiKeyValueList/Item render dl/dt/dd with a two-column desktop arrangement and stacked labels/values below 40rem. Rich values remain opaque; business code supplies Intl formatting, empty/redacted wording and access policy. Exact spacing, typography and native theme colors are adapter presentation. Ordinary content needs no consumer stylesheet. Application-owned configuration and styles from the existing customization guide also cover these surfaces; there are no new business presentation knobs.

## Tabs and collapsibles

The bar uses ElTabs/ElTabPane with native headers, indicator and overflow. Empty toolkit panels are hidden and stripped of tabpanel semantics; actual content lives in separate UiTabPanel views. A beforeLeave gate prevents native internal selection from committing a denied request. Native arrow auto-activation is replaced by captured manual movement. The adapter synchronizes trigger IDs/attributes and the tablist name after mount/update because ElTabs does not expose them. Initial SSR does not provide the complete interactive bar/association contract; hydration is required. The empty native content area and unused header-to-content margin are removed; native header typography and indicator styles are retained. Manual activation uses arrows/Home/End for focus and Enter/Space or pointer activation for selection. UiTab default slots supply labels, including passive icons/badges. UiTabsBinding and separately placed UiTabPanelBindings share one selection; no panel containment in the tab bar is required. Stable values preserve panels and disabled triggers are skipped. Full-height panels fill a definite business-owned allocation; their inner layout owns scrolling.


UiCollapsible uses actual ElCollapse/ElCollapseItem components, including their native arrow, active classes, content wrapper and collapse transition. The supported beforeCollapse hook forwards the request and returns false to prevent optimistic native selection; accepted owner state comes back through modelValue. This preserves denial without remounting the native widget. Content remains mounted, with an inert interior while closed or exiting. A private inline-flex summary wrapper adds the backend's normal 8px peer gap for rich summary children. Each view owns a one-item native host; shared expansion state does not imply a joined visual group.

UiCollapsible accepts a plain label or noninteractive summary slot. The backend supplies the operable toggle; summary content must include meaningful accessible text and cannot contain nested buttons, links or inputs. Core resolves standalone v-model or UiCollapsibleBinding, including local disabled restrictions. No backend imports the expansion control. That control supports at-most-one or multiple expanded keys, preserving state across view unmount/remount.

UiTabPanel and UiCollapsible retain mounted content. Lazy defers only first mount. Collapsing does not stop validation or background work. Reveal content before focusing a field. Native motion, markup and theme treatment vary; application-level theme customization follows this backend's existing customization guide. Controls do not require business-side CSS.

## Collapsible color

Does not declare `collapsible.color.v1`. Core ignores the optional color request and preserves the native Collapse treatment. Application-owned styling through native Collapse CSS variables remains available; it is separate from per-component semantic color support.

## Verification and limits

Verify selection codecs, retained values, clearing and source states, notice urgency, passive badge semantics, definition-list associations, manual tab activation and lazy content retention. In a browser, check geometry, focus containment, visible focus and touch behavior. Check announcements with assistive technology. Use the core component references for shared behavior and the installed theme’s guidance for contrast.

For collapsible sections, exercise denied requests, accessible summary names, local disabled state, lazy retention and disposal. See [native testing](testing.md#run-the-backends-native-tests) for the source-checkout runner.

## Scrolling content and focus clearance

UiContent supports content/full height and named scrolling, with insets inside the scroll boundary. Use it when a content inset is intended. Use scrolling UiLayout/UiGridLayout for flush content; unpadded scrolling scopes adapt supported outward focus outlines inward without changing alignment. Padded content/card/modal surfaces reset that placement context. The backend keeps scroll-host and tab-panel focus indicators inward. Modal bodies own their own internal clearance and preserve native browser focus scrolling. Do not add another content inset solely to repair focus. Allocation-only layouts still add no content gutter. Native field interiors retain their focus treatment. Custom or third-party focus treatments need their own integration checks. See the core package’s `docs/guides/scrolling-content.md` guide. Browser clearance checks cover the public focus binding; native paint/custom-theme acceptance still requires browser verification.

The dialog surface padding is redistributed among header/body/footer so the body’s scroll boundary encloses its inset. Header and footer do not add another gap at the body seam; the close-button reservation remains native.

## Notice dismissal and presentation

UiNotice retains specialized ElAlert-class markup because the installed ElAlert wraps default content in a paragraph, which cannot host arbitrary rich blocks. Title-with-body treatment follows the installed with-description class; title-only notices omit that treatment. The close affordance uses the native Close icon and alert styling on a real focusable button. Its logical placement and reserved content space support RTL. A wrapping action row replaces adjacent ElButton margins. Native alert styling remains dependency-sensitive and must be checked on upgrades.

Dismissal is opt-in through dismissible. The close control requests dismissal; business code decides visibility and focus handoff. Recovery actions retain source and tab order with backend-owned spacing and wrapping below the message. No automatic dismissal, timer or Escape handling is installed. Rich custom actions own their internal layout. Exercise denied, repeated and accepted dismissal, then change the language and verify content retention. In a browser, dismiss with the keyboard and check that the application restores focus to the intended target. Verify narrow LTR and RTL layouts and check announcements with assistive technology.

## Notice presentation

Default and soft use the native light effect; filled uses dark (an effect name, independent of application color mode). Outline adapts native border/color tokens with a transparent surface. Secondary maps to info; danger maps to error. Neutral custom uses native text/fill/background tokens without a semantic type. Default icons match Element alert TypeComponentsMap (InfoFilled, SuccessFilled, WarningFilled, CircleCloseFilled); icon geometry follows native alert sizing with logical RTL margins. Rich-content markup remains the documented ElAlert paragraph-body adaptation. Ordinary links on filled notices inherit foreground.

UiNotice now supports custom kind/color and filled/outline/soft variants. The core rejects color on standard kinds and rejects undeclared or unsupported theme roles. A supplied icon slot always wins, even if empty; otherwise standard kinds supply their icon and custom supplies none. Icons are decorative/noninteractive; message text carries meaning. Declaration requires notice.color.v1, notice.variant.v1 and notice.icon.v1 alongside notice.v1. Applications customize through the existing backend theme setup; no business-side CSS is required. Native theme defaults remain in force unless a notice requests a treatment.

Focused five-backend DOM checks cover slot replacement, empty-slot suppression, neutral/custom colors, rejected combinations, retained content/focus and controlled dismissal. Browser cases cover variant/color/mode combinations, narrow geometry, icons and keyboard dismissal. Execution/visual acceptance must be recorded separately; passing DOM checks does not establish paint, contrast or assistive-technology conformance. See the shared feedback guide in `@uninterface/uninterface` (`docs/guides/feedback-and-details.md`).


### Notice action alignment

The notice icon centers vertically against the full notice, including its actions. Actions remain in the adjacent content column without shifting into the icon column. Short notices use the native 16px icon token; notices with a rendered border-box height of at least 56px use the native 28px large-icon token. This backend threshold responds to wrapping, content and action changes through a client-side ResizeObserver; title presence alone does not determine the settled size. Before browser measurement (including SSR), title-plus-message notices use the large icon and other notices use the small one. Hidden notices retain their last measurement until visible. The observer and scheduled work are disposed with the view.

Applications can customize the two sizes with Element Plus's `--el-alert-icon-size` and `--el-alert-icon-large-size` on an application-owned class passed to UiNotice, in their stylesheet after the backend styles. This changes glyph sizes, not the 56px selection threshold. Ordinary business authors need no sizing props or CSS. Review wrapping, action clearance and alignment when customizing these native sizes.

Text UiButton hosts directly rendered in the notice action row use link-style feedback: hover and active text colors follow native ElButton link tokens, without a background fill. Their horizontal padding and border widths are zero, so the leading content aligns with the message column without shifting the row toward the notice icon. Native text-button height, vertical padding, visible keyboard focus, loading and disabled behavior remain intact. These remain button operations, not navigation links. The native link prop is not used: its 2px padding and automatic height do not match this notice-specific treatment.

The same treatment applies in LTR and RTL, with or without a notice icon. Explicit non-text variants keep their ordinary presentation. Text buttons outside the action row retain native padding and hover backgrounds. Only direct button hosts receive the adaptation; nested custom action layouts own their internals. No application CSS or extra business prop is required. The narrower horizontal hit area is an intentional tradeoff; row gaps and native button height remain.

Check wide/narrow LTR and RTL, native size levels, a single action, multiple/wrapped actions, explicit variants, loading and keyboard focus. DOM checks verify selectors match live button hosts; browser geometry and visual acceptance remain separate.

## Toast and notification targets

Supports core createUiToastTarget/createUiNotificationTarget and feedback.floating.v1. Targets render automatically in their creation scope, with configurable admission/capacity/duration and per-delivery Vue content. Uses native Message/Notification implementation components rather than module-global service arrays. The pinned Vite integration opts managed feedback out of document-wide Escape handlers and native z-index allocation. Native message/notification transitions remain; a named ElButton supplies keyboard dismissal. Native offset styles are replaced by bounded target flow to support changing content height. Core owns the sole duration clock and summary announcement policy; native auto-dismiss timers are disabled. The core package documents full options in docs/guides/toasts-and-notifications.md. Configure appearance through this backend's existing customization setup and style.css; queue options belong to target creation, not toolkit-global service configuration. Verify concurrent rich forms, changing-height content, modal scope, narrow/RTL layout and native exit behavior before claiming browser/AT acceptance.

Managed flow removes service offsets. Message uses a non-centered native placement, including bottom entry. Managed notifications retain the side entry and fade exit with RTL adaptation. Their side-entry travel is limited by the viewport padding so the keyboard focus outline fits even when the user tabs into an entering notification. The native Close icon is presented by a named ElButton at the native close position, retaining keyboard focus. A guarded managed-only integration changes Message’s paragraph slot wrapper to a div so rich content is valid flow content. The viewport reserves shadow/focus clearance. Upstream Notification progress is optional and off by default; the managed adapter currently leaves it off.

### Toast and notification focus

Both kinds implement the core backend delivery focus standard. A named, keyboard-focusable content region represents the delivery: direct keyboard focus there draws the indicator around the complete toast/notification surface, using Element Plus’s primary-color outline. The body has no duplicate inner outline. Moving into a rich input, link, close button or footer action removes the outer cue and retains the focused control's own treatment. Returning to the content region restores the outer cue. There is no extra equivalent root Tab stop and arrival does not take focus. Forced colors use `Highlight`; the fallback viewport has its own inward indicator.

The outer indicator preserves native shadows/elevation. Focus anywhere inside still follows the configured timer-pause policy. Verify both Tab directions, light/dark, narrow LTR/RTL, forced colors and viewport clearance. DOM selector checks do not establish browser paint or assistive-technology acceptance.
