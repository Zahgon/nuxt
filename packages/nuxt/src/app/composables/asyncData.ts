import { computed, getCurrentInstance, getCurrentScope, inject, isRef, isShallow, nextTick, onBeforeMount, onScopeDispose, onServerPrefetch, onUnmounted, queuePostFlushCb, ref, shallowRef, toRef, toValue, unref, watch } from 'vue'
import type { ComputedRef, MaybeRefOrGetter, MultiWatchSources, Ref } from 'vue'
import { hashFunction, hashKey } from '../utils/hash'
import { debounceTick } from '../utils/debounce-tick'
import type { NuxtApp } from '../nuxt'
import { useNuxtApp } from '../nuxt'
import { getUserCaller, toArray } from '../utils'
import { clientOnlySymbol } from '../components/client-only'
import type { NuxtError } from './error'
import { createError } from './error'
import { onNuxtReady } from './ready'
import { traceAsync } from '../internal/tracing'
import { defineKeyedFunctionFactory } from '../../compiler/runtime'
import { dataDiagnostics } from '../diagnostics/data'

import { asyncDataDefaults, granularCachedData, pendingWhenIdle, purgeCachedData, tracingChannelNuxt } from '#build/nuxt.config.mjs'

export type AsyncDataRequestStatus = 'idle' | 'pending' | 'success' | 'error'

export type _Transform<Input = any, Output = any> = (input: Input) => Output | Promise<Output>

export type AsyncDataHandler<ResT> = (nuxtApp: NuxtApp, options: { signal: AbortSignal }) => Promise<ResT>

export type PickFrom<T, K extends Array<string>> = T extends Array<any>
  ? T
  : T extends Record<string, any>
    ? keyof T extends K[number]
      ? T // Exact same keys as the target, skip Pick
      : K[number] extends never
        ? T
        : Pick<T, K[number]>
    : T

export type KeysOf<T> = Array<
  T extends T // Include all keys of union types, not just common keys
    ? keyof T extends string
      ? keyof T
      : never
    : never
>

export type KeyOfRes<Transform extends _Transform> = KeysOf<ReturnType<Transform>>

export type { MultiWatchSources }

export type NoInfer<T> = [T][T extends any ? 0 : never]

export type AsyncDataRefreshCause = 'initial' | 'refresh:hook' | 'refresh:manual' | 'watch'

interface BaseAsyncDataOptions<
  ResT,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
> {
  /**
   * Whether to fetch on the server side.
   * @default true
   */
  server?: boolean
  /**
   * Whether to resolve the async function after loading the route, instead of blocking client-side navigation
   * @default false
   */
  lazy?: boolean
  /**
   * a factory function to set the default value of the data, before the async function resolves - useful with the `lazy: true` or `immediate: false` options
   */
  default?: () => DefaultT | Ref<DefaultT>
  /**
   * Only pick specified keys in this array from the handler function result.
   * Do not use it along with the `transform` option.
   */
  pick?: PickKeys
  /**
   * Watch reactive sources to auto-refresh when changed
   */
  watch?: MultiWatchSources
  /**
   * When set to false, will prevent the request from firing immediately
   * @default true
   */
  immediate?: boolean
  /**
   * Return data in a deep ref object (it is false by default). It can be set to false to return data in a shallow ref object, which can improve performance if your data does not need to be deeply reactive.
   */
  deep?: boolean
  /**
   * Avoid fetching the same key more than once at a time
   * @default 'cancel'
   */
  dedupe?: 'cancel' | 'defer'
  /**
   * A timeout in milliseconds after which the request will be aborted if it has not resolved yet.
   */
  timeout?: number
  /**
   * Controls whether to run the async function
   * @default true
   */
  enabled?: MaybeRefOrGetter<boolean>
}

export interface AsyncDataOptions<
  ResT,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
> extends BaseAsyncDataOptions<ResT, DataT, PickKeys, DefaultT> {
  /**
   * Provide a function which returns cached data.
   * An `undefined` return value will trigger a fetch.
   * Default is `key => nuxt.isHydrating ? nuxt.payload.data[key] : nuxt.static.data[key]` which only caches data when payloadExtraction is enabled.
   */
  getCachedData?: (key: string, nuxtApp: NuxtApp, context: { cause: AsyncDataRefreshCause }) => NoInfer<DataT> | undefined
  /**
   * A function that can be used to alter handler function result after resolving.
   * Do not use it along with the `pick` option.
   */
  transform?: _Transform<ResT, DataT>
}

export interface AsyncDataOptionsWithTransform<
  ResT,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
> extends BaseAsyncDataOptions<ResT, DataT, PickKeys, DefaultT> {
  /**
   * Provide a function which returns cached data.
   * An `undefined` return value will trigger a fetch.
   * Default is `key => nuxt.isHydrating ? nuxt.payload.data[key] : nuxt.static.data[key]` which only caches data when payloadExtraction is enabled.
   */
  getCachedData?: (key: string, nuxtApp: NuxtApp, context: { cause: AsyncDataRefreshCause }) => NoInfer<DataT | undefined>
  /**
   * A function that can be used to alter handler function result after resolving.
   * Do not use it along with the `pick` option.
   */
  transform: _Transform<ResT, DataT>
}

export interface AsyncDataExecuteOptions {
  /**
   * Force a refresh, even if there is already a pending request. Previous requests will
   * not be cancelled, but their result will not affect the data/pending state - and any
   * previously awaited promises will not resolve until this new request resolves.
   */
  dedupe?: 'cancel' | 'defer'

  cause?: AsyncDataRefreshCause

  /** @internal */
  cachedData?: any

  signal?: AbortSignal

  timeout?: number
}

export interface _AsyncData<DataT, ErrorT> {
  data: Ref<DataT>
  pending: Ref<boolean>
  refresh: (opts?: AsyncDataExecuteOptions) => Promise<void>
  execute: (opts?: AsyncDataExecuteOptions) => Promise<void>
  clear: () => void
  error: Ref<ErrorT | undefined>
  status: Ref<AsyncDataRequestStatus>
}

export type AsyncData<Data, Error> = _AsyncData<Data, Error> & Promise<_AsyncData<Data, Error>>

// Type of the public-facing `useAsyncData` returned by the factory below.
// Expressed as a callable interface so we can spell out all eight overloads
// without losing them in an inline function expression: oxc's isolated
// declarations dts pipeline can't infer them otherwise.
type NuxtErrorFor<NuxtErrorDataT> = NuxtErrorDataT extends Error | NuxtError ? NuxtErrorDataT : NuxtError<NuxtErrorDataT>
type FactoryDataT<FDataT, ResT> = [unknown] extends [FDataT] ? ResT : FDataT
type FactoryDefaultT<FDefaultT, Fallback> = [undefined] extends [FDefaultT] ? Fallback : FDefaultT
type FactoryPickKeys<FPickKeys, PickKeys, DataT> = [Array<never>] extends [FPickKeys] ? PickKeys : FPickKeys & KeysOf<DataT>
export interface UseAsyncData<FResT = unknown, FDataT = unknown, FPickKeys extends KeysOf<FDataT> = never[], FDefaultT = undefined> {
  // Auto-key, opts with transform, default = undefined
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, undefined>>(
    handler: AsyncDataHandler<ResT>,
    opts: AsyncDataOptionsWithTransform<ResT, DataT, PickKeys, DefaultT>,
  ): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>
  // Auto-key, opts with transform, default = DataT
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, DataT>>(
    handler: AsyncDataHandler<ResT>,
    opts: AsyncDataOptionsWithTransform<ResT, DataT, PickKeys, DefaultT>,
  ): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>
  // Auto-key, plain opts, default = undefined
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = FactoryDataT<FDataT, ResT>, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, undefined>>(
    handler: AsyncDataHandler<ResT>,
    opts?: AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>,
  ): AsyncData<PickFrom<DataT, FactoryPickKeys<FPickKeys, PickKeys, DataT>> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>
  // Auto-key, plain opts, default = DataT
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = FactoryDataT<FDataT, ResT>, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, DataT>>(
    handler: AsyncDataHandler<ResT>,
    opts?: AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>,
  ): AsyncData<PickFrom<DataT, FactoryPickKeys<FPickKeys, PickKeys, DataT>> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>
  // Explicit key, opts with transform, default = undefined
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, undefined>>(
    key: MaybeRefOrGetter<string>,
    handler: AsyncDataHandler<ResT>,
    opts: AsyncDataOptionsWithTransform<ResT, DataT, PickKeys, DefaultT>,
  ): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>
  // Explicit key, opts with transform, default = DataT
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = ResT, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, DataT>>(
    key: MaybeRefOrGetter<string>,
    handler: AsyncDataHandler<ResT>,
    opts: AsyncDataOptionsWithTransform<ResT, DataT, PickKeys, DefaultT>,
  ): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>
  // Explicit key, plain opts, default = undefined
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = FactoryDataT<FDataT, ResT>, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, undefined>>(
    key: MaybeRefOrGetter<string>,
    handler: AsyncDataHandler<ResT>,
    opts?: AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>,
  ): AsyncData<PickFrom<DataT, FactoryPickKeys<FPickKeys, PickKeys, DataT>> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>
  // Explicit key, plain opts, default = DataT
  <ResT = FResT, NuxtErrorDataT = unknown, DataT = FactoryDataT<FDataT, ResT>, PickKeys extends KeysOf<DataT> = KeysOf<DataT>, DefaultT = FactoryDefaultT<FDefaultT, DataT>>(
    key: MaybeRefOrGetter<string>,
    handler: AsyncDataHandler<ResT>,
    opts?: AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>,
  ): AsyncData<PickFrom<DataT, FactoryPickKeys<FPickKeys, PickKeys, DataT>> | DefaultT, NuxtErrorFor<NuxtErrorDataT> | undefined>
}

export interface CreateUseAsyncData {
  <FResT, FDataT = FResT, FPickKeys extends KeysOf<FDataT> = KeysOf<FDataT>, FDefaultT = undefined>(
    options?:
      | Partial<AsyncDataOptions<FResT, FDataT, FPickKeys, FDefaultT>>
      | ((callerOptions: AsyncDataOptions<unknown>) => Partial<AsyncDataOptions<FResT, FDataT, FPickKeys, FDefaultT>>),
  ): UseAsyncData<FResT, FDataT, FPickKeys, FDefaultT>
}

export const createUseAsyncData: CreateUseAsyncData = defineKeyedFunctionFactory<CreateUseAsyncData>({
  name: 'createUseAsyncData',
  factory<
    FResT,
    FDataT = FResT,
    FPickKeys extends KeysOf<FDataT> = KeysOf<FDataT>,
    FDefaultT = undefined,
  >(options:
    Partial<AsyncDataOptions<FResT, FDataT, FPickKeys, FDefaultT>>
    | ((callerOptions: AsyncDataOptions<unknown>) => Partial<AsyncDataOptions<FResT, FDataT, FPickKeys, FDefaultT>>) = {},
  ): UseAsyncData<FResT, FDataT, FPickKeys, FDefaultT> {
      throw new Error("STUB");
  },
})

export const useAsyncData: UseAsyncData = (createUseAsyncData as unknown as { __nuxt_factory: typeof createUseAsyncData }).__nuxt_factory()

export const useLazyAsyncData: UseAsyncData = (createUseAsyncData as unknown as { __nuxt_factory: typeof createUseAsyncData }).__nuxt_factory({
  lazy: true,
  // @ts-expect-error private property
  _functionName: 'useLazyAsyncData',
})

function writableComputedRef<T> (getter: () => Ref<T>): Ref<T> {
  return computed({
    get () {
      return getter()?.value as T
    },
    set (value: T) {
      const ref = getter()
      if (ref) {
        ref.value = value
      }
    },
  }) as unknown as Ref<T>
}

function _isAutoKeyNeeded (keyOrFetcher: string | MaybeRefOrGetter<string> | (() => any), fetcher: () => any): boolean {
  // string key
  if (typeof keyOrFetcher === 'string') {
    return false
  }
  // ref or computed key
  if (typeof keyOrFetcher === 'object' && keyOrFetcher !== null) {
    return false
  }
  // getter key only if it's followed by a getter function
  if (typeof keyOrFetcher === 'function' && typeof fetcher === 'function') {
    return false
  }
  return true
}

/** @since 3.1.0 */
export function useNuxtData<DataT = any> (key: string): { data: Ref<DataT | undefined> } {
    throw new Error("STUB");
}

/** @since 3.0.0 */
export async function refreshNuxtData (keys?: string | string[]): Promise<void> {
    throw new Error("STUB");
}

/** @since 3.0.0 */
export function clearNuxtData (keys?: string | string[] | ((key: string) => boolean)): void {
    throw new Error("STUB");
}

function clearNuxtDataByKey (nuxtApp: NuxtApp, key: string): void {
  delete nuxtApp.payload.data[key]
  delete nuxtApp.payload._errors[key]

  if (nuxtApp._asyncData[key]) {
    nuxtApp._asyncData[key]!.data.value = unref(nuxtApp._asyncData[key]!._default())
    nuxtApp._asyncData[key]!.error.value = undefined
    if (pendingWhenIdle) {
      nuxtApp._asyncData[key]!.pending.value = false
    }
    nuxtApp._asyncData[key]!.status.value = 'idle'
    nuxtApp._asyncData[key]!._initialCachedData = undefined
  }

  delete nuxtApp._asyncDataPromises[key]
}

function pick (obj: Record<string, any>, keys: string[]) {
  const newObj = {}
  for (const key of keys) {
    (newObj as any)[key] = obj[key]
  }
  return newObj
}

export type CreatedAsyncData<ResT, NuxtErrorDataT = unknown, DataT = ResT, DefaultT = undefined> = Omit<_AsyncData<DataT | DefaultT, (NuxtErrorDataT extends Error | NuxtError ? NuxtErrorDataT : NuxtError<NuxtErrorDataT>)>, 'clear' | 'refresh'> & { _off: () => void, _hash?: Record<string, string | undefined>, _default: () => unknown, _init: boolean, _deps: number, _execute: (opts?: AsyncDataExecuteOptions) => Promise<void>, _abortController?: AbortController }

function buildAsyncData<
  ResT,
  NuxtErrorDataT = unknown,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
> (nuxtApp: NuxtApp, key: string, _handler: AsyncDataHandler<ResT>, options: AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>, initialCachedData?: NoInfer<DataT>): CreatedAsyncData<ResT, NuxtErrorDataT, DataT, DefaultT> {
  nuxtApp.payload._errors[key] ??= undefined

  const hasCustomGetCachedData = options.getCachedData !== getDefaultCachedData

  // When prerendering, share payload data automatically between requests
  const baseHandler: AsyncDataHandler<ResT> = import.meta.client || !import.meta.prerender || !nuxtApp.ssrContext?.['~sharedPrerenderCache']
    ? _handler
    : (nuxtApp, options) => {
        throw new Error("STUB");
    }

  const handler: AsyncDataHandler<ResT> = import.meta.server && tracingChannelNuxt
    ? (nuxtApp, opts) => { throw new Error("STUB"); }
    : baseHandler

  const _ref = options.deep ? ref : shallowRef
  const hasCachedData = initialCachedData !== undefined
  const unsubRefreshAsyncData = nuxtApp.hook('app:data:refresh', async (keys) => {
      throw new Error("STUB");
  })
  const asyncData: CreatedAsyncData<ResT, NuxtErrorDataT, DataT, DefaultT> = {
    data: _ref(hasCachedData ? initialCachedData : options.default!()) as any,
    pending: pendingWhenIdle ? shallowRef(!hasCachedData) : computed(() => { throw new Error("STUB"); }),
    error: toRef(nuxtApp.payload._errors, key) as any,
    status: shallowRef('idle'),
    execute: (...args) => {
        throw new Error("STUB");
    },
    _execute: debounceTick((...args) => { throw new Error("STUB"); }),
    _default: options.default!,
    _deps: 0,
    _init: true,
    _hash: import.meta.dev ? createHash(_handler, options) : undefined,
    _off: () => {
        throw new Error("STUB");
    },
  }

  return asyncData
}

// Used to get default values
const getDefault = () => { throw new Error("STUB"); }
const getDefaultCachedData: AsyncDataOptions<any>['getCachedData'] = (key, nuxtApp, ctx) => {
    throw new Error("STUB");
}

function createHash (_handler: AsyncDataHandler<unknown>, options: Partial<Record<keyof AsyncDataOptions<any>, unknown>>) {
  return {
    handler: hashFunction(_handler),
    transform: options.transform ? hashFunction(options.transform as (...args: any[]) => any) : undefined,
    pick: options.pick ? hashKey(options.pick) : undefined,
    getCachedData: options.getCachedData ? hashFunction(options.getCachedData as (...args: any[]) => any) : undefined,
  }
}
function mergeAbortSignals (signals: Array<AbortSignal | null | undefined>, cleanupSignal: AbortSignal, timeout?: number): AbortSignal {
  const list = signals.filter(s => { throw new Error("STUB"); })
  if (typeof timeout === 'number' && timeout >= 0) {
    const timeoutSignal = AbortSignal.timeout?.(timeout)
    if (timeoutSignal) { list.push(timeoutSignal) }
  }

  // Use native if available
  if (AbortSignal.any) {
    return AbortSignal.any(list)
  }

  // Polyfill
  const controller = new AbortController()

  for (const sig of list) {
    if (sig.aborted) {
      const reason = sig.reason ?? new DOMException('Aborted', 'AbortError')
      try {
        controller.abort(reason)
      } catch {
        controller.abort()
      }
      return controller.signal
    }
  }

  const onAbort = () => {
      throw new Error("STUB");
  }

  for (const sig of list) {
    sig.addEventListener?.('abort', onAbort, { once: true, signal: cleanupSignal })
  }

  return controller.signal
}
