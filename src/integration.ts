import { defineComponent, getCurrentInstance, h, provide } from 'vue'
import {
  ElConfigProvider,
  ID_INJECTION_KEY,
  ZINDEX_INJECTION_KEY,
} from 'element-plus'
import en from 'element-plus/es/locale/lang/en'
import type { UiBackendIntegration } from '@uninterface/uninterface/backend'
import icons from './icons'
export default {
  colorMode: { attribute: 'class', light: 'light', dark: 'dark' },
  initialLocale: en,
  locales: {
    resources: {
      en,
      ar: () => import('element-plus/es/locale/lang/ar').then((m) => m.default),
      'zh-CN': () =>
        import('element-plus/es/locale/lang/zh-cn').then((m) => m.default),
      'zh-TW': () =>
        import('element-plus/es/locale/lang/zh-tw').then((m) => m.default),
      'zh-HK': () =>
        import('element-plus/es/locale/lang/zh-hk').then((m) => m.default),
    },
    aliases: {
      'zh-Hans': 'zh-CN',
      'zh-Hant': 'zh-TW',
      'zh-Hant-HK': 'zh-HK',
      zh: 'zh-CN',
    },
  },
  icons,
  create({ nativeLocale }) {
    return {
      Root: defineComponent({
        setup(_, { slots }) {
          // Element Plus 2.14.7 only interpolates this prefix into native IDs.
          // Its declaration restricts it to number; a string preserves Vue's
          // complete namespace without a lossy hash or a request-global counter.
          provide(ID_INJECTION_KEY, {
            prefix: getCurrentInstance()!.appContext.config
              .idPrefix as unknown as number,
            current: 0,
          })
          provide(ZINDEX_INJECTION_KEY, { current: 0 })
          return () =>
            h(
              ElConfigProvider,
              { locale: nativeLocale.value as typeof en },
              slots,
            )
        },
      }),
    }
  },
} satisfies UiBackendIntegration
