import { ElConfigProvider as Defaults, ElForm } from 'element-plus'
import { h, nextTick, reactive } from 'vue'
import { createUiApplication } from '@uninterface/uninterface/setup'
import {
  UiField,
  UiTextInput,
  UiStrategy,
  createUiFieldControl,
  uiControlSize,
  uiControlSizeQuery,
  uiFieldHelp,
  uiFieldLabels,
  UiCheckbox,
  uiRequiredAnnotations,
  uiValidationFailure,
  uiValidationFailureQuery,
} from '@uninterface/uninterface'

export async function mount() {
  const field = createUiFieldControl('Draft')
  const placement = reactive({
    position: 'left' as 'left' | 'right',
    labelPosition: 'left' as 'left' | 'right' | 'top',
    hidden: false,
    inline: false,
    messages: true,
  })
  const theme = { size: 'large' as const }
  const checkbox = createUiFieldControl(false)
  const host = document.createElement('div')
  document.body.append(host)
  const app = createUiApplication({
    render: () =>
      h(Defaults, theme, () => [
        h(
          ElForm,
          {
            requireAsteriskPosition: placement.position,
            labelPosition: placement.labelPosition,
            hideRequiredAsterisk: placement.hidden,
            inlineMessage: placement.inline,
            showMessage: placement.messages,
          },
          () => [
            h(UiStrategy, { use: uiFieldLabels('show') }, () =>
              h(UiField, { field, label: 'Native show' }, () =>
                h(UiTextInput, { 'data-native-show': '' }),
              ),
            ),
            h(
              UiField,
              {
                field,
                label: 'Unspecified presentation',
                required: true,
                'data-unspecified-presentation': '',
              },
              () => h(UiTextInput),
            ),
            ...(['omitted', 'show', 'floating'] as const).map((mode) =>
              h(
                UiStrategy,
                { use: mode === 'omitted' ? [] : uiFieldLabels(mode) },
                () =>
                  h(
                    UiField,
                    {
                      field: checkbox,
                      label: 'Native checkable placement',
                      'data-native-checkable': mode,
                    },
                    () => h(UiCheckbox),
                  ),
              ),
            ),
            ...(['show', 'show-below', 'show-embedded'] as const).map((mode) =>
              h(UiStrategy, { use: uiValidationFailure(mode) }, () =>
                h(
                  UiField,
                  { field, label: mode, 'data-native-failure': mode },
                  () => h(UiTextInput),
                ),
              ),
            ),
            h(UiStrategy, { use: uiValidationFailure('show') }, () =>
              h(UiField, { field, group: true, label: 'Visible parent' }, () =>
                h(UiStrategy, { block: uiValidationFailureQuery }, () =>
                  h(
                    UiField,
                    {
                      field,
                      label: 'Blocked child',
                      'data-native-blocked-failure': '',
                    },
                    () => h(UiTextInput),
                  ),
                ),
              ),
            ),
            ...(['ordinary', 'yes', 'prefix', 'suffix', 'no'] as const).map(
              (mode) =>
                h(
                  UiStrategy,
                  {
                    use: [
                      uiFieldLabels('beside'),
                      ...(mode === 'ordinary'
                        ? []
                        : [uiRequiredAnnotations(mode)]),
                    ],
                  },
                  () =>
                    h(
                      UiField,
                      {
                        field,
                        label: mode,
                        required: true,
                        'data-annotation-mode': mode,
                      },
                      () => h(UiTextInput),
                    ),
                ),
            ),
            h(UiStrategy, { use: uiRequiredAnnotations('yes') }, () => [
              h(
                UiField,
                {
                  field: checkbox,
                  label: 'Native checkbox',
                  required: true,
                  'data-annotation-checkbox': '',
                },
                () => h(UiCheckbox),
              ),
              h(
                UiField,
                {
                  field,
                  label: 'Native group',
                  required: true,
                  group: true,
                  'data-annotation-group': '',
                },
                () => h(UiTextInput),
              ),
            ]),
          ],
        ),
        h(UiStrategy, { use: uiFieldLabels('show') }, () =>
          h(UiField, { field, label: 'Show labels' }, () =>
            h(UiTextInput, { 'data-native-show': '' }),
          ),
        ),
        h(UiStrategy, { use: uiFieldLabels('floating') }, () =>
          h(UiField, { field, label: 'Explicit floating' }, () =>
            h(UiTextInput, { 'data-native-floating': '' }),
          ),
        ),
        h(UiField, { field, label: 'Native defaults' }, () =>
          h(UiTextInput, { 'data-native-default': '' }),
        ),
        h(
          UiStrategy,
          { use: [uiControlSize(-1), uiFieldHelp('together')] },
          () =>
            h(
              UiField,
              { field, label: 'Sized field', help: 'Themed helper' },
              () =>
                h(UiStrategy, { block: uiControlSizeQuery }, () =>
                  h(UiTextInput, { 'data-native-blocked': '' }),
                ),
            ),
        ),
      ]),
  })
  await app.ui.ready
  app.mount(host)
  await nextTick()
  return {
    host,
    field,
    async setDefaults(values: Partial<typeof placement>) {
      Object.assign(placement, values)
      await nextTick()
      // Wait for native form feedback to finish its leave transition.
      await new Promise((resolve) => setTimeout(resolve, 150))
      await nextTick()
    },
    async setPlacement(position: typeof placement.position) {
      placement.position = position
      placement.labelPosition = position
      await nextTick()
    },
    dispose() {
      app.unmount()
      host.remove()
    },
  }
}
