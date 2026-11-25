import { h, nextTick, reactive } from 'vue'
import { ElForm } from 'element-plus'
import {
  UiCheckboxGroup,
  UiField,
  UiForm,
  UiLayout,
  UiStrategy,
  UiTextInput,
  createUiEntryControl,
  createUiFieldControl,
  createUiFormControl,
  uiControlSize,
  uiFieldHelp,
  uiFieldLabels,
  uiValidationFailure,
  type UiControlSize,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'
import ValidationPlacement from './fixtures/ValidationPlacement.vue'
import '../src/style.css'
import '@uninterface/uninterface/style.css'

export async function mountValidationFeedback() {
  const state = reactive({
    labels: 'beside' as 'above' | 'beside',
    size: 0 as UiControlSize,
    inline: false,
    help: 'together' as 'together' | 'replace-help',
    failure: 'show-below' as 'show-below' | 'none' | 'show-tooltip',
    message: 'Enter a value.',
  })
  const text = createUiFieldControl('', undefined, [
    (value) => (value === 'ok' ? null : state.message),
  ])
  const checks = createUiFieldControl<string[]>([], undefined, [
    (value) => (value.length ? null : state.message),
  ])
  const after = createUiFieldControl('')
  const form = createUiFormControl({ text, checks, after })
  const choices = createUiEntryControl([
    { key: 'a', label: 'First choice' },
    { key: 'b', label: 'Second choice' },
  ])
  const fields = () => [
    h(UiField, { field: text, label: 'Name', help: 'Enter a name.' }, () =>
      h(UiTextInput),
    ),
    h(
      UiField,
      { field: checks, label: 'Choices', help: 'Choose an item.', group: true },
      () => h(UiCheckboxGroup, { control: choices }),
    ),
    h(UiField, { field: after, label: 'Following field' }, () =>
      h(UiTextInput),
    ),
  ]
  const host = document.createElement('main')
  host.style.cssText = 'width: min(100%, 600px)'
  document.body.append(host)
  const app = createUiApplication({
    render: () =>
      h(
        UiStrategy,
        {
          use: [
            uiFieldLabels(state.labels),
            uiControlSize(state.size),
            uiFieldHelp(state.help),
            uiValidationFailure(state.failure),
          ],
        },
        () => [
          h('section', { 'data-arrangement': 'layout' }, [
            h(UiLayout, null, fields),
          ]),
          h('section', { 'data-arrangement': 'form' }, [
            h(
              UiForm,
              { control: form, save: async () => {}, label: 'Feedback' },
              fields,
            ),
          ]),
          h('section', { 'data-arrangement': 'native-context' }, [
            h(ElForm, { inlineMessage: state.inline }, () =>
              h(UiLayout, null, fields),
            ),
          ]),
        ],
      ),
  })
  await app.ui.ready
  app.mount(host)
  await choices.load()
  await nextTick()
  return {
    async configure(value: Partial<typeof state>) {
      Object.assign(state, value)
      await nextTick()
    },
    async validate() {
      await Promise.all([text.validate(), checks.validate()])
      await nextTick()
    },
    async reset() {
      form.reset()
      await nextTick()
    },
  }
}

declare global {
  interface Window {
    validationFeedback: Awaited<ReturnType<typeof mountValidationFeedback>>
  }
}
if (new URLSearchParams(location.search).get('scenario') === 'placement') {
  const app = createUiApplication(ValidationPlacement)
  void app.ui.ready.then(() =>
    app.mount(document.body.appendChild(document.createElement('main'))),
  )
} else {
  void mountValidationFeedback().then((fixture) => {
    window.validationFeedback = fixture
  })
}
