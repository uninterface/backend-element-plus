# Progress bars

[Documentation index](README.md)

The adapter uses native line `ElProgress`. It localizes measured percentage text, preserves original ARIA value/max, and uses an internal segment width only for unknown paint. Unknown mode has no numeric text/current value. Semantic colors use native Element tokens; omitted consumer color resolves to primary. RTL places fill at the logical start; reduced motion freezes the unknown segment.

Standalone and upload-hosted bars share this backend’s `UiProgressBar.vue`, requiring `progress.bar.v1`. Both modes are horizontal bars filling the offered inline allocation. The producer owns outcomes, actions, visibility and announcements; the bar has no live region or default tab stop. Null means unknown; numeric value/max retain their original units and fractional precision. A full bar does not automatically declare success.

Verify accessible naming/range and no unknown current number, known/unknown transitions, narrow/wide containment, light/dark, LTR/RTL and reduced motion. Functional/DOM evidence is separate from browser geometry/paint, human visual review and assistive-technology acceptance. The shared consumer API and usage guide are in `@uninterface/uninterface`, under `docs/api/components/UiProgressBar.md` and `docs/guides/progress.md`.
