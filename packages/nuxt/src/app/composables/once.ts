import { useRouter } from './router'
import { useNuxtApp } from '../nuxt'
import { stateDiagnostics } from '../diagnostics/state'

type CallOnceOptions = {
  mode?: 'navigation' | 'render'
}

let _isHmrUpdating = false

/**
 * An SSR-friendly utility to call a method once
 * @param key a unique key ensuring the function can be properly de-duplicated across requests
 * @param fn a function to call
 * @param options Setup the mode, e.g. to re-execute on navigation
 * @see https://nuxt.com/docs/4.x/api/utils/call-once
 * @since 3.9.0
 */
export function callOnce (key?: string, fn?: (() => any | Promise<any>), options?: CallOnceOptions): Promise<void>
export function callOnce (fn?: (() => any | Promise<any>), options?: CallOnceOptions): Promise<void>
export async function callOnce (...args: any[]): Promise<void> {
    throw new Error("STUB");
}

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', (payload) => {
      throw new Error("STUB");
  })

  import.meta.hot.on('vite:afterUpdate', (payload) => {
      throw new Error("STUB");
  })
}
