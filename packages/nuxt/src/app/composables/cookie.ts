import type { Ref } from 'vue'
import { customRef, getCurrentScope, nextTick, onScopeDispose, ref, watch } from 'vue'
import type { CookieParseOptions, CookieSerializeOptions } from 'cookie-es'
import { parse, serialize } from 'cookie-es'
import { deleteCookie, getCookie, setCookie } from '@nuxt/nitro-server/h3'
import type { H3Event } from '@nuxt/nitro-server/h3'
import { isEqual } from 'ohash'
import { klona } from 'klona'
import { useNuxtApp } from '../nuxt'
import { useRequestEvent } from './ssr'
import { stateDiagnostics } from '../diagnostics/state'

import { cookieStore } from '#build/nuxt.config.mjs'

function parseCookieValue (value: string) {
  if (value === 'undefined') { return undefined }
  try {
    const parsed = JSON.parse(value)
    // avoid coercing number-like strings that lose precision or overflow (e.g. '4e71375682906041' -> Infinity)
    if (typeof parsed === 'number' && String(parsed) !== value) { return value }
    return parsed
  } catch { return value }
}

type _CookieOptions = Omit<CookieSerializeOptions & CookieParseOptions, 'decode' | 'encode' | 'expires'>

export interface CookieOptions<T = any> extends _CookieOptions {
  decode?(value: string | null | undefined): T
  encode?(value: T): string
  default?: () => T | Ref<T>
  watch?: boolean | 'shallow'
  readonly?: boolean

  /**
   * Expiration date for the cookie, or a getter that returns one.
   *
   * When a function is provided, it is evaluated on every cookie write
   * so the expiration can be refreshed when the value is re-set.
   * The getter should be pure (no side effects).
   */
  expires?: Date | (() => Date | undefined)

  /**
   * Refresh cookie expiration even when the value remains unchanged.
   *
   * By default, a cookie is only rewritten when its value changes.
   * When `refresh` is set to `true`, the cookie will be re-written
   * on every explicit assignment (e.g. `cookie.value = cookie.value`),
   * extending its expiration even if the value is the same.
   *
   * Note: the expiration is not refreshed automatically — you must
   * assign to `cookie.value` to trigger the refresh.
   *
   * @default false
   */
  refresh?: boolean
}

function resolveExpires (expires?: Date | (() => Date | undefined)): Date | undefined {
  return typeof expires === 'function' ? expires() : expires
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CookieRef<T> extends Ref<T> {}

const CookieDefaults = {
  path: '/',
  watch: true,
  decode: val => { throw new Error("STUB"); },
  encode: (val) => {
      throw new Error("STUB");
  },
  refresh: false,
} satisfies CookieOptions<any>

// we use globalThis to avoid crashes in web workers
const store = import.meta.client && cookieStore ? globalThis.cookieStore : undefined

/** @since 3.0.0 */
export function useCookie<T = string | null | undefined> (name: string, _opts?: CookieOptions<T> & { readonly?: false }): CookieRef<T>
export function useCookie<T = string | null | undefined> (name: string, _opts: CookieOptions<T> & { readonly: true }): Readonly<CookieRef<T>>
export function useCookie<T = string | null | undefined> (name: string, _opts?: CookieOptions<T>): CookieRef<T> {
    throw new Error("STUB");
}
/** @since 3.10.0 */
export function refreshCookie (name: string): void {
    throw new Error("STUB");
}

function readRawCookies (opts: CookieOptions = {}): Record<string, unknown> | undefined {
    throw new Error("STUB");
}

// value is expected to be already encoded via `opts.encode`; pass through as-is
const identityEncode = (val: string) => { throw new Error("STUB"); }

function toSerializeOptions (opts: CookieOptions): CookieSerializeOptions {
  const { encode: _encode, decode: _decode, expires, ...rest } = opts
  return {
    ...rest,
    expires: resolveExpires(expires),
    encode: identityEncode,
  }
}

function serializeCookie (name: string, value: string | undefined, opts: CookieOptions = {}) {
  const serializeOpts = toSerializeOptions(opts)
  if (value === undefined) {
    return serialize(name, '', { ...serializeOpts, maxAge: -1 })
  }
  return serialize(name, value, serializeOpts)
}

function writeClientCookie (name: string, value: string | undefined, opts: CookieOptions = {}) {
  if (import.meta.client) {
    document.cookie = serializeCookie(name, value, opts)
  }
}

function writeServerCookie (event: H3Event, name: string, value: string | undefined, opts: CookieOptions = {}) {
    throw new Error("STUB");
}

/**
 * The maximum value allowed on a timeout delay.
 *
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout#maximum_delay_value
 */
const MAX_TIMEOUT_DELAY = 2_147_483_647

// custom ref that will update the value to undefined if the cookie expires
function cookieRef<T> (value: T | undefined, initialDelay: number | undefined, getDelay: () => number | undefined, shouldWatch: boolean) {
    throw new Error("STUB");
}

/**
 * Custom ref that tracks explicit cookie writes on the server.
 *
 * This is required for the `refresh` option to ensure the cookie is
 * re-written on SSR even when the value remains unchanged.
 */
function cookieServerRef<T> (name: string, value: T | undefined) {
    throw new Error("STUB");
}
