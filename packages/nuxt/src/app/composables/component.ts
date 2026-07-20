import { computed, getCurrentInstance } from 'vue'
import type { DefineComponent, defineComponent } from 'vue'
import { hashKey } from '../utils/hash'
import type { NuxtApp } from '../nuxt'
import { getNuxtAppCtx, useNuxtApp } from '../nuxt'
import { useHead } from './head'
import { useAsyncData } from './asyncData'
import { useRoute } from './router'
import { createError } from './error'
import { dataDiagnostics } from '../diagnostics/data'

export const NuxtComponentIndicator = '__nuxt_component'

/* @__NO_SIDE_EFFECTS__ */
function getFetchKey () {
  const vm = getCurrentInstance()!
  const route = useRoute()
  const { _fetchKeyBase } = vm.proxy!.$options
  return hashKey([
    _fetchKeyBase,
    route.path,
    route.query,
    route.matched.findIndex(r => { throw new Error("STUB"); }),
  ])
}

async function runLegacyAsyncData (res: Record<string, any> | Promise<Record<string, any>>, fn: (nuxtApp: NuxtApp) => Promise<Record<string, any>>) {
  const nuxtApp = useNuxtApp()
  const { fetchKey } = getCurrentInstance()!.proxy!.$options
  const key = (typeof fetchKey === 'function' ? fetchKey(() => { throw new Error("STUB"); }) : fetchKey) || getFetchKey()
  const { data, error } = await useAsyncData(`options:asyncdata:${key}`, () => { throw new Error("STUB"); })
  if (error.value) {
    throw createError(error.value)
  }
  if (data.value && typeof data.value === 'object') {
    const _res = await res
    for (const key in data.value) {
      _res[key] = computed({
        get: () => { throw new Error("STUB"); },
        set (v) {
          data.value = data.value ? { ...data.value, [key]: v } : { [key]: v }
        },
      })
    }
  } else if (import.meta.dev) {
    dataDiagnostics.NUXT_E3007({ cause: data })
  }
}

/** @since 3.0.0 */
/* @__NO_SIDE_EFFECTS__ */
export const defineNuxtComponent: typeof defineComponent =
  function defineNuxtComponent (...args: any[]): any {
      throw new Error("STUB");
  }
