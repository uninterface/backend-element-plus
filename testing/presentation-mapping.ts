import {
  browserFieldFeedbackParts,
  type UiTestAdapter,
} from '@uninterface/testing/playwright'
import {
  fieldSelectors,
  temporalPickerParts,
  entryIconColumn,
} from './presentation-parts.mjs'

export const presentationParts = {
  fieldFeedback: (editor) =>
    browserFieldFeedbackParts(editor, fieldSelectors.invalid),
  tableBody(table) {
    const scope = table.locator('xpath=ancestor-or-self::*[@data-scroll][1]')
    return {
      body: scope.locator('.el-table__body-wrapper'),
      scrollSurface: scope.locator('.el-scrollbar__wrap[role="region"]'),
      emptyState: scope.locator('.element-empty'),
      errorState: scope.locator('[data-collection-failure="initial"]'),
    }
  },
  feedbackItem(item) {
    return { content: item.locator('.element-feedback-body'), surface: item }
  },
  progressBar(bar) {
    return {
      track: bar.locator('.el-progress-bar__outer'),
      fill: bar.locator('.el-progress-bar__inner'),
    }
  },
  async uploadRegion(region) {
    const surface = region
    const chooser = region.locator('[data-upload-choose]')
    return {
      surface,
      chooser,
      chooserFocus:
        (await region.getAttribute('data-upload-recovery')) !== null
          ? { target: chooser, kind: 'outline' }
          : { target: surface, kind: 'border' },
    }
  },
  temporalPicker: (picker) =>
    temporalPickerParts((selector) => picker.locator(selector)),
  menuEntryIcon(entry) {
    const column = entry.locator(
      `:is(${entryIconColumn}):not(:scope [data-entry-key] *)`,
    )
    return {
      column,
      icon: column.locator(':scope > *'),
    }
  },
} satisfies Partial<UiTestAdapter>
