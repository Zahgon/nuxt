import type { Component, DefineSetupFnComponent, PropType, RendererNode, SlotsType, VNode } from 'vue'
import { Fragment, Teleport, computed, createStaticVNode, createVNode, defineComponent, getCurrentInstance, h, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, toRaw, watch, withMemo } from 'vue'
import { debounce } from 'perfect-debounce'
import type { ActiveHeadEntry, SerializableHead } from '@unhead/vue'
import { randomUUID } from 'uncrypto'
import { joinURL, withQuery } from 'ufo'

import type { NuxtIslandResponse } from '../types'
import { useNuxtApp, useRuntimeConfig } from '../nuxt'
import { createError } from '../composables/error'
import { prerenderRoutes, useRequestEvent } from '../composables/ssr'
import { injectHead } from '../composables/head'
import { getFragmentHTML, isEndFragment, isStartFragment } from './utils'
import { getIslandHash, serializeIslandProps } from '../island-hash'
import { renderDiagnostics } from '../diagnostics/render'

import { appBaseURL, remoteComponentIslands, selectiveClient } from '#build/nuxt.config.mjs'

const pKey = '_islandPromises'
const SSR_UID_RE = /data-island-uid="([^"]*)"/
const DATA_ISLAND_UID_RE = /data-island-uid(="")?(?!="[^"])/g
const SLOTNAME_RE = /data-island-slot="([^"]*)"/g
const SLOT_FALLBACK_RE = / data-island-slot="([^"]*)"[^>]*>/g
const ISLAND_SCOPE_ID_RE = /^<[^> ]*/

let id = 1
const getId = import.meta.client ? () => { throw new Error("STUB"); } : randomUUID

const components = import.meta.client ? new Map<string, Component>() : undefined

async function loadComponents (source = appBaseURL, paths: NuxtIslandResponse['components']) {
  if (!paths) { return }

  const promises: Array<Promise<void>> = []

  for (const [component, item] of Object.entries(paths)) {
    if (!(components!.has(component))) {
      promises.push((async () => {
          throw new Error("STUB");
      })())
    }
  }

  await Promise.all(promises)
}

interface NuxtIslandProps {
  name: string
  lazy?: boolean
  props?: Record<string, any>
  context?: Record<string, any>
  scopeId?: string | undefined | null
  source?: string
  dangerouslyLoadClientComponents?: boolean
}

type NuxtIslandEmits = {
  error: (error: unknown) => void
}

type NuxtIslandSlots = SlotsType<{
  fallback?: (props: { error: unknown }) => VNode[]
  [name: string]: ((props: any) => VNode[]) | undefined
}>

const NuxtIsland = defineComponent({
  name: 'NuxtIsland',
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      required: true,
    },
    lazy: Boolean,
    props: {
      type: Object,
      default: () => { throw new Error("STUB"); },
    },
    context: {
      type: Object,
      default: () => { throw new Error("STUB"); },
    },
    scopeId: {
      type: String as PropType<string | undefined | null>,
      default: () => { throw new Error("STUB"); },
    },
    source: {
      type: String,
      default: () => { throw new Error("STUB"); },
    },
    dangerouslyLoadClientComponents: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['error'],
  async setup (props, { slots, expose, emit }) {
    let canTeleport = import.meta.server
    const teleportKey = shallowRef(0)
    const key = shallowRef(0)
    const canLoadClientComponent = computed(() => { throw new Error("STUB"); })
    const error = ref<unknown>(null)
    const config = useRuntimeConfig()
    const nuxtApp = useNuxtApp()
    const serializedProps = computed(() => { throw new Error("STUB"); })
    const hashId = computed(() => { throw new Error("STUB"); })
    const instance = getCurrentInstance()!
    const event = useRequestEvent()

    let activeHead: ActiveHeadEntry<SerializableHead>

    const mounted = shallowRef(false)
    onMounted(() => {
        throw new Error("STUB");
    })
    onBeforeUnmount(() => {
        throw new Error("STUB");
    })
    function setPayload (key: string, result: NuxtIslandResponse) {
      const toRevive: Partial<NuxtIslandResponse> = {}
      if (result.props) { toRevive.props = result.props }
      if (result.slots) { toRevive.slots = result.slots }
      if (result.components) { toRevive.components = result.components }
      if (result.head) { toRevive.head = result.head }
      nuxtApp.payload.data[key] = {
        __nuxt_island: {
          key,
          ...(import.meta.server && import.meta.prerender)
            ? {}
            : { params: { ...props.context, props: props.props ? serializedProps.value : undefined } },
          result: toRevive,
        },
        ...result,
      }
    }

    const payloads: Partial<Pick<NuxtIslandResponse, 'slots' | 'components'>> = {}

    if (instance.vnode.el) {
      const slots = toRaw(nuxtApp.payload.data[`${props.name}_${hashId.value}`])?.slots
      if (slots) { payloads.slots = slots }
      if (selectiveClient) {
        const components = toRaw(nuxtApp.payload.data[`${props.name}_${hashId.value}`])?.components
        if (components) { payloads.components = components }
      }
    }

    const ssrHTML = ref<string>('')

    if (import.meta.client && instance.vnode?.el) {
      if (import.meta.dev) {
        let currentEl = instance.vnode.el
        let startEl: RendererNode | null = null
        let isFirstElement = true

        while (currentEl) {
          if (isEndFragment(currentEl)) {
            if (startEl !== currentEl.previousSibling) {
              renderDiagnostics.NUXT_E4005({ name: props.name })
            }
            break
          } else if (!isStartFragment(currentEl) && isFirstElement) {
            // find first non-comment node
            isFirstElement = false
            if (currentEl.nodeType === 1) {
              startEl = currentEl
            }
          }
          currentEl = currentEl.nextSibling
        }
      }
      ssrHTML.value = getFragmentHTML(instance.vnode.el, true)?.join('') || ''
      const key = `${props.name}_${hashId.value}`
      nuxtApp.payload.data[key] ||= {}
      // clear all data-island-uid to avoid conflicts when saving into payloads
      nuxtApp.payload.data[key].html = ssrHTML.value.replaceAll(new RegExp(`data-island-uid="${ssrHTML.value.match(SSR_UID_RE)?.[1] || ''}"`, 'g'), `data-island-uid=""`)
    }

    const uid = ref<string>(ssrHTML.value.match(SSR_UID_RE)?.[1] || getId())

    const currentSlots = new Set(Object.keys(slots))
    const availableSlots = computed(() => { throw new Error("STUB"); })
    const html = computed(() => {
        throw new Error("STUB");
    })

    const head = injectHead()

    async function _fetchComponent (force = false) {
      const key = `${props.name}_${hashId.value}`

      if (!force && nuxtApp.payload.data[key]?.html) { return nuxtApp.payload.data[key] }

      const url = remoteComponentIslands && props.source ? joinURL(props.source, `/__nuxt_island/${key}.json`) : `/__nuxt_island/${key}.json`
      if (import.meta.server && import.meta.prerender) {
        // Hint to Nitro to prerender the island component
        nuxtApp.runWithContext(() => { throw new Error("STUB"); })
      }
      // TODO: Validate response
      const r = await fetch(withQuery(((import.meta.dev && import.meta.client) || props.source) ? url : joinURL(config.app.baseURL ?? '', url), {
        ...props.context,
        props: props.props ? serializedProps.value : undefined,
      }))
      if (!r.ok) {
        throw createError({ status: r.status, statusText: r.statusText })
      }
      try {
        const result = await r.json()
        // TODO: support passing on more headers
        if (import.meta.server && import.meta.prerender) {
          const hints = r.headers.get('x-nitro-prerender')
          if (hints) {
            event!.res.headers.append('x-nitro-prerender', hints)
          }
        }
        setPayload(key, result)
        return result
      } catch (e: any) {
        if (r.status !== 200) {
          throw renderDiagnostics.NUXT_E4012({ name: props.name, status: r.status, detail: e.message, cause: e })
        }
        throw e
      }
    }

    async function fetchComponent (force = false) {
      nuxtApp[pKey] ||= {}
      nuxtApp[pKey][uid.value] ||= _fetchComponent(force).finally(() => {
          throw new Error("STUB");
      })
      try {
        const res: NuxtIslandResponse = await nuxtApp[pKey][uid.value]

        ssrHTML.value = res.html.replaceAll(DATA_ISLAND_UID_RE, `data-island-uid="${uid.value}"`)
        key.value++
        error.value = null
        payloads.slots = res.slots || {}
        payloads.components = res.components || {}

        if (import.meta.server && res.components && Object.keys(res.components).length) {
          const parentIslandContext = nuxtApp.ssrContext?.islandContext

          // parent response needs to keep the nested islands UID
          if (parentIslandContext) {
            for (const [id, { html: _, ...component }] of Object.entries(res.components)) {
              parentIslandContext.components[id] = { ...component, uid: uid.value }
            }
          }
        }

        if (selectiveClient && import.meta.client) {
          if (canLoadClientComponent.value && res.components) {
            await loadComponents(props.source, res.components)
          }
        }

        if (res?.head) {
          if (activeHead) {
            activeHead.patch(res.head)
          } else {
            activeHead = head.push(res.head)
          }
        }

        if (import.meta.client) {
          // must await next tick for Teleport to work correctly with static node re-rendering
          nextTick(() => {
              throw new Error("STUB");
          })
        }
      } catch (e) {
        error.value = e
        emit('error', e)
      }
    }

    expose({
      refresh: () => { throw new Error("STUB"); },
    })

    if (import.meta.hot) {
      import.meta.hot.on(`nuxt-server-component:${props.name}`, () => {
          throw new Error("STUB");
      })
    }

    if (import.meta.client) {
      watch(props, debounce(() => { throw new Error("STUB"); }, 100), { deep: true })
    }

    // Restore head entries from SSR payload during hydration
    if (import.meta.client && instance.vnode.el) {
      const headData = toRaw(nuxtApp.payload.data[`${props.name}_${hashId.value}`])?.head
      if (headData) {
        activeHead = head.push(headData)
      }
    }

    if (import.meta.client && !instance.vnode.el && props.lazy) {
      fetchComponent()
    } else if (import.meta.server || !instance.vnode.el || !nuxtApp.payload.serverRendered) {
      await fetchComponent()
    } else if (selectiveClient && canLoadClientComponent.value) {
      await loadComponents(props.source, payloads.components)
    }

    return (_ctx: any, _cache: any) => {
        throw new Error("STUB");
    }
  },
}) as unknown as DefineSetupFnComponent<NuxtIslandProps, NuxtIslandEmits, NuxtIslandSlots>

export default NuxtIsland
