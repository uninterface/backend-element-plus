export function cardParts(find) {
  return {
    header: find(':scope > .el-card__header'),
    body: find(':scope > .el-card__body'),
    footer: find(':scope > .el-card__footer'),
    topEnd: find(':scope > .el-card__body > .element-card-top-end'),
  }
}

export const fieldSelectors = {
  root: '.element-field',
  surface: '.el-input__wrapper,.el-select__wrapper',
  required: '.element-required',
  invalid: '.el-form-item.is-error, .el-input.is-error, .el-select.is-error',
}

export function fieldGroupParts(find) {
  return {
    label: find(
      ':scope > .el-form-item__label, :scope > .el-form-item__label-wrap > .el-form-item__label',
    ),
    controlArea: find(
      ':scope > .el-form-item__content, :scope > .element-field-content',
    ),
  }
}

export function temporalPickerParts(find) {
  return {
    dateInput: find('input[type=date],input[type=datetime-local]'),
    timeInput: find('input[type=time],input[type=datetime-local]'),
    day(isoDate) {
      return find('td.element-calendar-day-DATE'.replaceAll('DATE', isoDate))
    },
    timeSegment(unit) {
      return find(
        '.el-time-spinner__wrapper:nth-of-type(UNIT_INDEX)'.replace(
          'UNIT_INDEX',
          String(['hour', 'minute', 'second'].indexOf(unit) + 1),
        ),
      )
    },
  }
}

export const entryIconColumn = '.element-entry-icon'
