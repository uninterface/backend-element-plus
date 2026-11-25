# Common icon asset provenance

Toolkit icons use named imports from `@element-plus/icons-vue` 2.3.2. The license texts in this directory apply to the distributed artwork.

`create` reuses the plus component. `clear` uses the native `CircleClose` artwork because the installed icon set has no eraser. Each semantic name remains independently overridable. `first` and `last` use directional metadata. Sort artwork retains its direction.

Element Plus globe/external-link are original Uninterface backend artwork, not copied vendor exports.

| Meaning | Artwork |
| --- | --- |
| `create` | `Plus` |
| `remove` | `Minus` |
| `reset` | `RefreshLeft` |
| `clear` | `CircleClose` |
| `retry` | `RefreshRight` |
| `home` | `House` |
| `help` | `QuestionFilled` |
| `bookmark` | `CollectionTag` |
| `location` | `Location` |
| `globe` | Backend-owned SVG required |
| `calendar` | `Calendar` |
| `time` | `Clock` |
| `file` | `Document` |
| `image` | `Picture` |
| `attachment` | `Paperclip` |
| `email` | `Message` |
| `filter` | `Filter` |
| `sort` | `Sort` |
| `sort-ascending` | `SortUp` |
| `sort-descending` | `SortDown` |
| `first` | `DArrowLeft` |
| `last` | `DArrowRight` |
| `external-link` | Backend-owned SVG required |

Follow-up common `link` uses native `Link` from the same Element Plus Icons version. It depicts chain links, distinct from the outward-arrow `external-link` artwork. Existing asset licenses apply.

## Native-first common mappings

`menu-item` reuses Element Plus `Document`, the same component as `file`, with an independent override key. `more-vertical` uses a 90-degree rotation of native `MoreFilled`, because the installed Element Plus Icons 2.3.2 has no dedicated vertical-more export.

For new mappings, inspect the supported icon set first and retain suitable native artwork. Transform it only when the required variant is absent; draw new artwork only when the set cannot express the meaning. Record the source/version, license and reason for each transformation or custom asset. See `@uninterface/uninterface` documentation at `docs/contracts/icon.md#backend-artwork-selection`.

Common `settings` uses native `Setting` from Element Plus Icons Vue 2.3.2. Existing gear/cog artwork is preserved without rotation or redrawing; the existing asset license applies.

The `move-up` and `move-down` semantic names reuse the existing `arrow-up` and `arrow-down` shafted arrow artwork respectively, with independent override keys and no RTL mirroring. No additional artwork is bundled for these aliases.

The four physical direction icons, `arrow-up`, `arrow-down`, `arrow-left` and `arrow-right`, use native `Top`, `Bottom`, `Back` and `Right` named imports from the pinned collection/version above. Existing licenses apply. These arrows have shafts and retain their physical direction in RTL; they are distinct from navigation chevrons and logical previous/next actions.
