import type { Component, DefineSetupFnComponent, InjectionKey, SlotsType, VNode } from 'vue'
import { Teleport, defineComponent, h, inject, provide, useId } from 'vue'
import { useNuxtApp } from '../nuxt'
import paths from '#build/component-chunk'
import { buildAssetsURL } from '#internal/nuxt/paths'

type ExtendedComponent = Component & {
  __file: string
  __name: string
}

export const NuxtTeleportIslandSymbol = Symbol('NuxtTeleportIslandComponent') as InjectionKey<false | string>

/**
 * component only used with componentsIsland
 * this teleport the component in SSR only if it needs to be hydrated on client
 */
interface NuxtTeleportIslandComponentProps {
  nuxtClient?: boolean
}

type NuxtTeleportIslandComponentSlots = SlotsType<{
  default?: () => VNode[]
}>

const NuxtTeleportIslandComponent = /* @__PURE__ */ defineComponent({
  name: 'NuxtTeleportIslandComponent',
  inheritAttrs: false,
  props: {
    nuxtClient: {
      type: Boolean,
      default: false,
    },
  },
  setup (props, { slots }) {
    const nuxtApp = useNuxtApp()
    const to = useId()

    // if there's already a teleport parent, we don't need to teleport or to render the wrapped component client side
    if (!nuxtApp.ssrContext?.islandContext || !props.nuxtClient || inject(NuxtTeleportIslandSymbol, false)) { return () => { throw new Error("STUB"); } }

    provide(NuxtTeleportIslandSymbol, to)
    const islandContext = nuxtApp.ssrContext!.islandContext!

    return () => {
        throw new Error("STUB");
    }
  },
}) as unknown as DefineSetupFnComponent<NuxtTeleportIslandComponentProps, {}, NuxtTeleportIslandComponentSlots>

export default NuxtTeleportIslandComponent
