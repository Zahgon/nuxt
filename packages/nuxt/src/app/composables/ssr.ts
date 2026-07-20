import type { H3Event } from '@nuxt/nitro-server/h3'
import { computed, getCurrentInstance, ref } from 'vue'
import type { $Fetch } from 'nitro/types'
import { $fetch } from '#build/fetch'

import type { NuxtApp } from '../nuxt'
import { useNuxtApp } from '../nuxt'
import { toArray } from '../utils'
import { appDiagnostics } from '../diagnostics/core'
import { useHead } from './head'

/** @since 3.0.0 */
export function useRequestEvent (nuxtApp?: NuxtApp): H3Event | undefined {
  if (import.meta.client) { return }
  nuxtApp ||= useNuxtApp()
  return nuxtApp.ssrContext?.event
}

/**
 * @since 3.0.0
 * @deprecated Use useRequestEvent().req.headers
 */
export function useRequestHeaders<K extends string = string> (include: K[]): { [key in Lowercase<K>]?: string }
export function useRequestHeaders (): Readonly<Record<string, string>>
export function useRequestHeaders (include?: any[]): Readonly<Record<string, string>> {
    throw new Error("STUB");
}

/** @since 3.9.0 */
export function useRequestHeader (header: string): string | null | undefined {
    throw new Error("STUB");
}

/** @since 3.2.0 */
export function useRequestFetch (): $Fetch {
    throw new Error("STUB");
}

/** @since 3.0.0 */
export function setResponseStatus (event: H3Event, code?: number, message?: string): void
/** @deprecated Pass `event` as first option. */
export function setResponseStatus (code: number, message?: string): void
export function setResponseStatus (arg1: H3Event | number | undefined, arg2?: number | string, arg3?: string): void {
    throw new Error("STUB");
}

/** @since 3.14.0 */
export function useResponseHeader (header: string): import('vue').WritableComputedRef<string | null | undefined> | import('vue').Ref<string | null | undefined> {
    throw new Error("STUB");
}

/** @since 3.8.0 */
export function prerenderRoutes (path: string | string[]): void {
  if (!import.meta.server || !import.meta.prerender) { return }

  const paths = toArray(path)
  useRequestEvent()?.res.headers.append('x-nitro-prerender', paths.map(p => { throw new Error("STUB"); }).join(', '))
}

const PREHYDRATE_ATTR_KEY = 'data-prehydrate-id'

/**
 * `onPrehydrate` is a composable lifecycle hook that allows you to run a callback on the client immediately before
 * Nuxt hydrates the page. This is an advanced feature.
 *
 * The callback will be stringified and inlined in the HTML so it should not have any external
 * dependencies (such as auto-imports) or refer to variables defined outside the callback.
 *
 * The callback will run before Nuxt runtime initializes so it should not rely on the Nuxt or Vue context.
 * @since 3.12.0
 */
export function onPrehydrate (callback: (el: HTMLElement) => void): void
export function onPrehydrate (callback: string | ((el: HTMLElement) => void), key?: string): undefined | string {
    throw new Error("STUB");
}
