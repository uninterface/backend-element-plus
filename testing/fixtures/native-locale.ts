import { useLocale } from 'element-plus'
import { createLocaleFixture } from '@uninterface/testing/fixtures/locale'

export const { mountLocale, renderLocale } = createLocaleFixture(() => {
  const { t } = useLocale()
  return () => t('el.select.loading')
})
