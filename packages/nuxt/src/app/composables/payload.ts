import { hasProtocol, joinURL } from 'ufo'
import { parse } from 'devalue'
import { defineLink } from '@unhead/vue'
import { getCurrentInstance, onServerPrefetch, reactive } from 'vue'
import { useNuxtApp, useRuntimeConfig } from '../nuxt'
import type { NuxtPayload } from '../nuxt'
import { useHead } from './head'

import { useRoute } from './router'
import { getAppManifest, getRouteRules } from './manifest'
import { stateDiagnostics } from '../diagnostics/state'

import { appId, appManifest, multiApp, payloadExtraction } from '#build/nuxt.config.mjs'

interface LoadPayloadOptions {
  fresh?: boolean
  hash?: string
}

/** @since 3.0.0 */
export async function loadPayload (url: string, opts: LoadPayloadOptions = {}): Promise<Record<string, any> | null> {
  if (import.meta.server || !payloadExtraction) { return null }
  if (await shouldLoadPayload(url)) {
    const payloadURL = await _getPayloadURL(url, opts)
    // cached (`isr`/`swr`/`cache`) payloads are mutable within a deploy, so `?buildId`
    // cannot invalidate them - defer to normal HTTP cache semantics instead
    const cache: RequestCache = getRouteRules({ path: url }).payload ? 'default' : 'force-cache'
    return await _importPayload(payloadURL, cache) || null
  }
  return null
}
let linkRelType: 'preload' | 'prefetch' | undefined
function detectLinkRelType (): 'preload' | 'prefetch' {
    throw new Error("STUB");
}
/** @since 3.0.0 */
export function preloadPayload (url: string, opts: LoadPayloadOptions = {}): Promise<void> {
    throw new Error("STUB");
}

// --- Internal ---

const filename = '_payload.json'
async function _getPayloadURL (url: string, opts: LoadPayloadOptions = {}) {
  const u = new URL(url, 'http://localhost')
  if (u.host !== 'localhost' || hasProtocol(u.pathname, { acceptRelative: true })) {
    throw stateDiagnostics.NUXT_E7001({ url })
  }
  const config = useRuntimeConfig()
  const hash = opts.hash || (opts.fresh || import.meta.dev ? Date.now() : config.app.buildId)
  const cdnURL = config.app.cdnURL
  const baseOrCdnURL = cdnURL && await isPrerendered(url) ? cdnURL : config.app.baseURL
  return joinURL(baseOrCdnURL, u.pathname, filename + (hash ? `?${hash}` : ''))
}

async function _importPayload (payloadURL: string, cache: RequestCache) {
  if (import.meta.server || !payloadExtraction) { return null }
  try {
    const res = await fetch(payloadURL, import.meta.dev ? {} : { cache })
    if (!res.ok) {
      if (import.meta.dev) {
        stateDiagnostics.NUXT_E7002({ url: payloadURL })
      }
      return null
    }
    return await parsePayload(await res.text())
  } catch (err) {
    stateDiagnostics.NUXT_E7002({ url: payloadURL, cause: err })
  }
  return null
}

function _shouldLoadPrerenderedPayload (rules: Record<string, any>) {
  if (rules.redirect) {
    return false
  }
  if (rules.prerender) {
    return true
  }
}

async function _isPrerenderedInManifest (url: string) {
  // Note: Alternative for server is checking x-nitro-prerender header
  if (!appManifest) {
    return false
  }
  url = url === '/' ? url : url.replace(/\/$/, '')
  try {
    const manifest = await getAppManifest()
    return manifest.prerendered.includes(url)
  } catch {
    // handle errors fetching manifest
    return false
  }
}

/**
 * @internal
 */
export async function shouldLoadPayload (url: string = useRoute().path): Promise<boolean> {
  const rules = getRouteRules({ path: url })
  if (rules.ssr === false) {
    return false
  }
  const res = _shouldLoadPrerenderedPayload(rules)
  if (res !== undefined) {
    return res
  }

  if (rules.payload) {
    return true
  }

  const prerendered = await _isPrerenderedInManifest(url)
  return prerendered
}

/** @since 3.0.0 */
export async function isPrerendered (url: string = useRoute().path): Promise<boolean> {
  const res = _shouldLoadPrerenderedPayload(getRouteRules({ path: url }))
  if (res !== undefined) {
    return res
  }

  const prerendered = await _isPrerenderedInManifest(url)
  return prerendered
}

let payloadCache: NuxtPayload | null = null

/** @since 3.4.0 */
export async function getNuxtClientPayload (): Promise<NuxtPayload | Partial<NuxtPayload> | null> {
    throw new Error("STUB");
}

export async function parsePayload (payload: string): Promise<any> {
  return await parse(payload, useNuxtApp()._payloadRevivers)
}

/**
 * This is an experimental function for configuring passing rich data from server -> client.
 * @since 3.4.0
 */
export function definePayloadReducer (
  name: string,
  reduce: (data: any) => any,
): void {
  if (import.meta.server) {
    useNuxtApp().ssrContext!['~payloadReducers'][name] = reduce
  }
}

/**
 * This is an experimental function for configuring passing rich data from server -> client.
 *
 * This function _must_ be called in a Nuxt plugin that is `unshift`ed to the beginning of the Nuxt plugins array.
 * @since 3.4.0
 */
export function definePayloadReviver (
  name: string,
  revive: (data: any) => any | undefined,
): void {
  if (import.meta.dev && getCurrentInstance()) {
    stateDiagnostics.NUXT_E7004()
  }
  if (import.meta.client) {
    useNuxtApp()._payloadRevivers[name] = revive
  }
}
