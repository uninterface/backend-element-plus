# Native HTML content defaults

This backend declares `native.content.v1`. Business authors use the native set defined by Uninterface core; `dl`/`dt`/`dd` and quotation elements are outside that set. UiKeyValueList/Item remain the preferred name–value presentation; quotation components are still to be designed.

## Setup and ownership

Follow [setup](setup.md), including the ordinary `@uninterface/backend/style.css` import. That entry includes the private `src/native-content.css`; do not import private files directly. No content wrapper, provider or per-element class is needed. The document baseline applies outside UiApp, including teleported content. Font delivery remains the separate choice documented in [typography](typography.md).

The existing Element document stylesheet owns heading sizes, paragraph rhythm, link colors and thematic rules. Ranks h4–h6 retain its equal-size treatment; semantic ranks remain intact. The adapter underlines content links and adds keyboard borders, highlight surfaces and long-line wrapping using Element tokens (`--el-color-primary`, `--el-border-color`, `--el-text-color-primary`, `--el-color-warning-light-7`).

Bare `pre` preserves authored whitespace with `pre-wrap`; long lines and unbroken prose wrap within the available width. A lone native prose block allocated by an ordinary UiLayout/UiFlowLayout item uses the layout gap instead of adding its own outer block margins. Nested prose retains its margins; content insets are unaffected.

## Customization and limits

Use application-owned theme configuration and styles after backend styles, following [customization](customization.md). The native/theme values above are consumed inputs; use them within the backend’s supported theme configuration instead of copying a second content stylesheet into business components. Application selector overrides can change native presentation and require their own acceptance.

Mode changes use the same native document/theme integration as other content; no content-only palette or teleport wrapper is introduced. `lang`/`dir`, bdi/bdo, time/data and abbreviation attributes retain HTML behavior. They do not translate, format or validate business data.

## Verification

Check representative headings, links, list markers, annotations and long values at narrow and wide widths in both directions and color modes. Include wrapping, dialog focus return and application utility overrides where used. DOM checks cover markup and identity but cannot establish browser geometry or accessibility conformance.
