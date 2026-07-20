import type { DefineSetupFnComponent, SlotsType, VNode } from 'vue'
import { Teleport, createVNode, defineComponent, h, inject } from 'vue'
import { useNuxtApp } from '../nuxt'
import { NuxtTeleportIslandSymbol } from './nuxt-teleport-island-component'

/**
 * component only used within islands for slot teleport
 */
interface NuxtTeleportIslandSlotProps {
  name: string
  /**
   * must be an array to handle v-for
   */
  props?: Array<any>
}

type NuxtTeleportIslandSlotSlots = SlotsType<{
  default?: () => VNode[]
  fallback?: () => VNode[]
}>

const NuxtTeleportIslandSlot = /* @__PURE__ */ defineComponent({
  name: 'NuxtTeleportIslandSlot',
  inheritAttrs: false,
  props: {
    name: {
      type: String,
      required: true,
    },
    /**
     * must be an array to handle v-for
     */
    props: {
      type: Object as () => Array<any>,
    },
  },
  setup (props, { slots }) {
    const nuxtApp = useNuxtApp()
    const islandContext = nuxtApp.ssrContext?.islandContext
    if (!islandContext) {
      return () => { throw new Error("STUB"); }
    }

    const componentName = inject(NuxtTeleportIslandSymbol, false)
    islandContext.slots[props.name] = {
      props: (props.props || []) as unknown[],
    }

    return () => {
        throw new Error("STUB");
    }
  },
}) as unknown as DefineSetupFnComponent<NuxtTeleportIslandSlotProps, {}, NuxtTeleportIslandSlotSlots>

export default NuxtTeleportIslandSlot
