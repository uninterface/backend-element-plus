import {
  uiNativeTestAdapter,
  type UiTestAdapter,
} from '@uninterface/testing/playwright'

/** Toolkit part mapping; browser actions remain in the shared harness. */
import {
  cardParts,
  fieldGroupParts,
  fieldSelectors,
} from './presentation-parts.mjs'
import { presentationParts } from './presentation-mapping'

export const uiTestAdapter: UiTestAdapter = {
  ...presentationParts,
  card: (card) => cardParts((selector) => card.locator(selector)),
  fieldGroup(group) {
    const parts = fieldGroupParts((selector) => group.locator(selector))
    const { label } = parts
    const generated = label
    return {
      ...parts,
      required: {
        elements: label.locator(fieldSelectors.required),
        before: generated,
        after: generated,
      },
    }
  },
  inputFrame: (frame) => ({ surface: frame }),
  buttonFocus: (button) => ({ target: button, kind: 'outline' }),
  async checkable(control) {
    const parts = await uiNativeTestAdapter.checkable!(control)
    const container = control
      .locator('xpath=ancestor::*')
      .and(control.page().locator('.el-checkbox,.el-radio,.el-switch'))
      .last()
    const surface = container.locator(
      '.el-checkbox__inner,.el-radio__inner,.el-switch__core',
    )
    const text = parts.text.locator('.el-checkbox__label,.el-radio__label')
    return {
      text: (await text.count()) ? text : parts.text,
      surface: (await surface.count()) ? surface : control,
    }
  },
  version: 1,
  menuPopup(menu) {
    // ElSubMenu also copies the custom class to its unpainted inner container.
    return menu.locator(
      'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " el-popper ") and contains(concat(" ", normalize-space(@class), " "), " element-command-popup ")][1]',
    )
  },
  async multiSelect(control) {
    const native = await uiNativeTestAdapter.multiSelect!(control)
    return { ...uiTestAdapter.select(control), clear: native.clear }
  },
  choice(group, key, kind) {
    const { control } = uiNativeTestAdapter.choice!(group, key, kind)
    return { control, target: control.locator('xpath=ancestor::label[1]') }
  },

  navigationEntry(scope, { name, kind }) {
    return scope
      .getByRole('menuitem', { name, exact: true })
      .and(
        scope.locator(
          kind === 'submenu'
            ? '.el-sub-menu[data-entry-key]'
            : '.el-menu-item[data-entry-key]',
        ),
      )
  },
  modal(dialog) {
    return {
      body: dialog.locator(
        ':scope > .element-modal-surface > .element-modal-body',
      ),
      actions: dialog.locator(
        ':scope > .element-modal-surface > .el-dialog__footer',
      ),
    }
  },
  tableHeaderSeparator: uiNativeTestAdapter.tableHeaderSeparator,
  columnHeaderParts(header) {
    return {
      caption: header.locator('.element-table-header-copy'),
      sortTarget: header.locator('button.caret-wrapper'),
      sortIndicator: header.locator('.caret-wrapper'),
    }
  },
  popoverSurface(dialog) {
    return dialog.locator(
      ':scope[data-ui-overlay="popover"] > .element-overlay-content.el-popover',
    )
  },
  async field(control) {
    const parts = await uiNativeTestAdapter.field!(control)
    const wrapper = control
      .locator(
        'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " el-input__wrapper ") or contains(concat(" ", normalize-space(@class), " "), " el-select__wrapper ")][1]',
      )
      .or(control.locator('.el-segmented'))
    return {
      ...parts,
      surface: (await wrapper.count()) ? wrapper : parts.surface,
      required: {
        ...parts.required,
        elements: parts.label.locator('.element-required'),
      },
    }
  },
  checkbox: (control) => control.locator('xpath=ancestor::label[1]'),
  select(control) {
    return {
      kind: 'composite',
      trigger: control
        .locator(
          'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " el-select ")][1]',
        )
        .locator('.el-select__wrapper'),
      selection: control
        .locator(
          'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " el-select ")][1]',
        )
        .locator('.el-select__placeholder'),
      async popup() {
        const id = await control.getAttribute('aria-controls')
        if (!id || /\s/.test(id))
          throw new Error(
            'UiSelect must identify exactly one owned popup through aria-controls.',
          )
        const owned = control.page().locator(`[id=${JSON.stringify(id)}]`)
        return owned.locator(
          'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " el-select__popper ")][1]',
        )
      },
    }
  },
}

export { browserControlParts } from './browser-control-parts'
