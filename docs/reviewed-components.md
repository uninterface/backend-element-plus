# Component presentation

Element Plus uses ElSwitch, ElLink, ElBreadcrumb, ElTooltip/ElPopover, ElDatePickerPanel and TimePickPanel. Suggestions forward containerRole to the native input because the toolkit overwrites an ordinary role attribute.

Password reveal preserves the editor and uses a named non-submit reveal action. Switches follow the shared switch-then-label arrangement. Search source/selection and temporal validation remain core-owned. Tooltips and suggestions use popup targets inside their owning modal. Directly owned tooltips paint below the header and footer. A managed tooltip requires at least half of its anchor area visible after clipping and overlap by known layout regions. File chooser/drop accepts one file; uploads use an application transport. Preview URLs are resolved and released by core.

Temporal inputs use a normal backend text field with an leading calendar/clock button. The button opens a floating picker; Alt+ArrowDown opens it from the editor, and Escape closes it. Selection and explicit dismissal return focus to the trigger. Disabled/readonly inputs cannot open the picker. Popups use the application/modal overlay target. Element Plus composes ElInput’s prefix with ElButton/ElPopover and [ElDatePickerPanel](https://element-plus.org/en-US/component/date-picker-panel.html), including its datetime panel. Time selection uses the exported TimePickPanel underlying [ElTimePicker](https://element-plus.org/en-US/component/time-picker.html). The integrated CommonPicker clears its raw userInput on popup close, so the adapter retains a separate lossless ElInput. TimePickPanel requires PICKER_BASE_INJECTION_KEY context; this source-level integration must be checked on toolkit upgrades. Native panels edit through seconds; the adapter preserves existing milliseconds, which remain editable in the outer field.

Picker candidates bypass the display-text parser and are validated by the owning control. Native selection is checked before commitment; a toolkit calendar may still display a candidate that a combined datetime or interval rule later rejects. Date and time may be staged independently before a complete datetime is committed. Explicit open boundaries and extended hours remain text/control semantics, not claims of native picker support.

Use the existing application-owned [customization guide](customization.md) for theme setup and stylesheet ordering. These components consume the same native theme configuration; no extra business stylesheet or generic styling wrapper is required. Keep overrides after the backend stylesheet and test teleported popup coverage in light/dark modes. Do not style only the component wrapper when the actual editor or popup lives elsewhere.

Shared control and built-DOM checks exercise state, naming, calendar/time/datetime selection, preservation of milliseconds and invalid text, disabled/readonly behavior, Escape dismissal and focus return, file replacement and tooltip associations. Check picker geometry, touch and keyboard behavior, hover continuity, modal stacking and assistive technology in the intended environment.

Suggestions compose ElPopover, ElScrollbar and the native autocomplete suggestion list treatment. The external host remains the combobox. A virtual geometry reference positions ElPopover while preserving the input's expanded state and its association with the listbox. ElPopover groups the popup content and leaves option names, state and acceptance on the listbox and its options.

Breadcrumbs use ElBreadcrumb and its native breadcrumb classes with ordinary anchors rather than ElLink. Native ancestor weight, hover color, current text and separators are preserved. The adapter uses an ordered list and adapts item markup because ElBreadcrumbItem assigns role=link even to non-link text; only actual destinations have link semantics. The namespace follows Element Plus configuration.

Temporal ranges compose both endpoints, separator and supporting actions inside the backend UiInputFrame view. Bounded date and datetime ranges use one exported ElDatePickerPanel (`daterange` / `datetimerange`) behind a shared calendar trigger. Both text editors remain ElInput participants, preserving permissive typing and incomplete drafts; Alt+Down from either opens the shared range picker. Native date selection updates both endpoints together and closes after a complete date range; datetime selection stays open for time editing and supports Escape/outside dismissal. Existing endpoint times and fractional seconds survive date selection. The mobile responsive context selects the toolkit's single-panel calendar. Open-ended modes use scalar pickers. Time ranges retain independent native time panels because Element Plus's range panel hardcodes same-day hour/minute ordering and cannot select our overnight intervals. Endpoint editors retain their own editing behavior and share one surface; at narrow allocations they stack inside that frame. Owned picker state keeps the frame visually engaged while popup focus is outside it. A leading Element Plus icon dropdown offers only allowed combinations: both specified, start only, end only, unrestricted; each menu item has an icon and localized label. Mode changes retain drafts; external synchronization/reset and Clear discard them. Both endpoint positions and the separator remain present in every mode. An unrestricted endpoint uses a compact infinity tag with an accessible endpoint label; both unrestricted endpoints remain distinct from an absent whole value. Spare width follows the range content before Clear. An overnight time range uses a calendar-plus-one icon with a localized tooltip and accessible label, retaining its space while inactive. The compact × action clears the whole range. These actions obey disabled/readonly state; an empty draft never implicitly opens a boundary.

Standalone UiField labels default above their controls, matching UiForm’s default arrangement. Inside a native form, its configuration remains authoritative; explicit field-label strategies still apply.

Picker triggers occupy the leading side of the input. Their localized “Choose…” strings name the icon button and popup for assistive technology; the adapter does not add a visible popup heading from those strings.

File Clear uses Element Plus input clear-icon classes and CircleClose artwork on a keyboard-operable native button. Range endpoints retain ElInput editing but remove the nested wrapper boundary; the enclosing input wrapper supplies focus and invalid presentation.

UiUploadRegion uses a workflow binding with retained-field or service destinations. Optional progress, preview and actions are arranged entirely by this backend. Element Plus uses the native el-upload-dragger surface, UploadFilled/ElIcon artwork, ElProgress and ElButton. The adapter isolates chooser activation from preview/actions and disables native request/file-list ownership by composing these primitives. Native dragger sizing is adapted to keep contents within the region. The complete named region receives drops and fits its contents within an explicit extent without scrolling; optional contents no longer reserve blank rows. Upload/association locks persist when progress or preview is absent. Focus moves to an available chooser/action or the region when a focused action disappears. Preview URL lifetime remains core-owned; controller lifetime belongs to the business composition.

The upload group is excluded from ordinary Tab traversal (tabindex=-1 while enabled). The ordinary drag-area chooser retains native button activation while its focus is indicated by the outer primary border, with a Highlight outline in forced colors. The previous square inner outline is removed. Recovery uses a native circle/text ElButton, with its own local focus indicator and native dimensions; Retry/Cancel/Remove remain independent. Named fallback focus remains available when no action accepts focus.

The upload group is itself the el-upload-dragger, so native ancestor selectors for .el-upload.is-disabled do not match it. The adapter applies native disabled background/border/text tokens and a not-allowed cursor at that actual root, suppressing the enabled hover border. Focus uses the native input/drag-area primary border rather than an additional 2px outline. Shared input-frame wrappers also lose their focus target when disabled; live disabling releases internal surface focus, and upload recovery cannot focus a disabled region.

Verify appearance and geometry in the browser, including zoom and RTL.

Temporal range-mode arrows use the native Back, Right and Switch components from @element-plus/icons-vue. The next-day indicator uses the custom calendar +1 SVG; infinity is Unicode. Native ElIcon sizing and the existing localized tooltip/accessibility label are retained.

### Concise upload states

The region shows its chooser/artwork only in the ready state. Working and retained states display file/progress or file/preview with available actions. Recovery uses one short error and a row of actions. ElProgress formats visible percentages as localized whole percentages using its native format hook; the bar and reported progress retain their original precision, and unknown totals show no percentage. Progress labels remain accessible without a duplicate visible caption; preview displays the filename once. Embedded previews use a compact file summary. Ordinary demo uploads succeed; deliberate failure is available in the separate Upload failure simulation and test fixtures.

This backend's compact/regular/large allocations are currently 10/12/18rem. There is no shared minimum. The allocation remains stable across states; the host must respect the backend minimum size; content never introduces scrolling. These are adapter defaults, not business-authored dimensions or browser geometry acceptance.

### Image-only preview

UiImagePreview uses the container allocation or explicit dimensions, with contain by default and stretch when requested. It has no border, avatar shape, filename, caption or actions. Missing/failed content uses an accessible broken-image glyph, without visible failure prose. A parent with definite bounds retains its rectangle through failure; auto sizing cannot reserve unknown intrinsic dimensions before loading. Embedded upload previews use their region's available bounds instead of a fixed thumbnail limit. File metadata presentation remains separate.

ElImage supplies contain/fill and load events. Empty native placeholder/error slots suppress text, an adapted SVG supplies the broken-image glyph, and overflow remains parent-owned. DOM checks pass separately from browser geometry/visual acceptance.


Upload regions declare minimum inline/block allocations and do not scroll internally. Long file/error text is abbreviated with full DOM text and title retained; recovery keeps its actions visible. This backend declares a minimum inline size of 14rem and block size of 10rem; hosts, including fill allocations, must respect those constraints. Browser acceptance of fitting is separate from DOM workflow checks.


### Upload minimum-size audit

Fill uses compact dragger padding so the minimum reserves sufficient room for the native chooser and preview. Delivery failures use the same single error line and recovery-action arrangement as acquisition failures, avoiding an extra filename row.

In a browser, check compact, regular, large and fill allocations at the minimum and at narrow widths. Repeat at each supported control size with known, unknown and hidden progress, long file names and errors, delivery retry, portrait and landscape previews, and no preview. Verify that visible descendants stay within the allocated region and that actions remain reachable.



### Transfer failure and retry presentation

UiUploadProgress presents both active transfer progress/Cancel and transfer failure/Cancel/Retry. Failed transfers have concise feedback and available native Cancel and Retry buttons, without a progress indicator. The file name is visible inside the progress/recovery presentation and identifies the transfer group; Retry describes its failure. The view invokes guarded producer callbacks and never creates a task. The backend retains its existing button and progress primitives and arranges feedback/actions within the allocated width.

UiUploadRegion composes the same progress view for transfer recovery, without duplicating the filename, error or Retry. Acquisition rejection and delivery failure remain region-owned. Omitting the progress indicator does not omit essential transfer feedback or selected Retry; cancellation is not an error, but an owner may retain a Retry action. Recovery layout responds to recovery participation, including cancellation without an error message. Keyboard context is preserved across standalone Retry/Cancel changes; region focus coordination includes the chooser. DOM checks cover wiring and lifetime; browser fitting and assistive-technology checks remain separate.

The Files demo's Supporting functions section contains Previews beside the independent Upload progress and Upload failure cards; the two top cards align, and no extra Upload simulation heading is rendered. Both use UiUploadProgress; the failure case has no chooser, region frame or playback controls. Each retry deliberately fails again for presentation review.

### Keyboard switch integration

The adapter handles Space and Enter on the native switch input before its checkbox default action. This avoids publishing a new model value followed by a cancelled native click restoring the old checked state. One activation updates model, checked and ARIA together; repeats, readonly and disabled restrictions retain their normal guards. A backend-owned DOM regression covers these states; browser keyboard acceptance remains separate.

Progress and transfer failure share a filename row above a context/action area. Failure uses the native danger/error foreground. Standalone messages wrap completely, including unbroken text; actions stay at logical end and wrap below if necessary. Inside UiUploadRegion, the concise summary retains full DOM text/title and Retry association. The chooser shares the identity row while the complete lower allocation is available to feedback/actions. Native action labels keep their ordinary dimensions.


Transfer-failure text uses `--el-color-danger`, with color and mode mapping owned by the theme. The optional shared focus helper retains keyboard context across the brief activity-to-failure rendering gap, including an immediately repeated failed Retry. Verify focus after a failure and an immediate failed retry.
