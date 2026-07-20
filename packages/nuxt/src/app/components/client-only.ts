import { cloneVNode, createCommentVNode, createElementBlock, defineComponent, getCurrentInstance, h, onMounted, provide, shallowRef } from 'vue'
import type { Component, ComponentInternalInstance, ComponentOptions, DefineSetupFnComponent, InjectionKey, RendererNode, SlotsType, VNode } from 'vue'
import { isPromise } from '@vue/shared'
import { useNuxtApp } from '../nuxt'
import ServerPlaceholder from './server-placeholder'
import { elToStaticVNode, sanitizeTag } from './utils'

import { clientNodePlaceholder } from '#build/nuxt.config.mjs'

export const clientOnlySymbol: InjectionKey<boolean> = Symbol.for('nuxt:client-only')

const STATIC_DIV = '<div></div>'

function isPlaceholderComment (el: RendererNode) {
    throw new Error("STUB");
}

function createPlaceholder (el?: RendererNode | null) {
    throw new Error("STUB");
}

interface ClientOnlyProps {
  fallback?: string
  placeholder?: string
  placeholderTag?: string
  fallbackTag?: string
}

type ClientOnlySlots = SlotsType<{
  default?: () => VNode[]
  /**
   * Specify a content to be rendered on the server and displayed until `<ClientOnly>` is mounted in the browser.
   */
  fallback?: () => VNode[]
  placeholder?: () => VNode[]
}>

const ClientOnly = defineComponent({
  name: 'ClientOnly',
  inheritAttrs: false,
  props: ['fallback', 'placeholder', 'placeholderTag', 'fallbackTag'],
  ...(import.meta.dev && {
    slots: Object as ClientOnlySlots,
  }),
  setup (props, { slots, attrs }) {
    const mounted = shallowRef(false)
    onMounted(() => {
        throw new Error("STUB");
    })
    // Bail out of checking for pages/layouts as they might be included under `<ClientOnly>` 🤷‍♂️
    if (import.meta.dev) {
      const nuxtApp = useNuxtApp()
      nuxtApp._isNuxtPageUsed = true
      nuxtApp._isNuxtLayoutUsed = true
    }
    const vm = getCurrentInstance()
    if (vm) {
      vm._nuxtClientOnly = true
    }
    provide(clientOnlySymbol, true)
    return () => {
        throw new Error("STUB");
    }
  },
}) as unknown as DefineSetupFnComponent<ClientOnlyProps, {}, ClientOnlySlots>

export default ClientOnly

const cache = new WeakMap()

/* @__NO_SIDE_EFFECTS__ */
export function createClientOnly<T extends ComponentOptions> (component: T): Component {
    throw new Error("STUB");
}

function extractDirectives (instance: ComponentInternalInstance | null) {
    throw new Error("STUB");
}
