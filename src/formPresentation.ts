import type { InjectionKey } from 'vue'

/** Identifies an ElForm whose editing/reset lifecycle belongs to Uninterface. */
export const formPresentationKey: InjectionKey<boolean> = Symbol(
  'element-form-presentation',
)
