import { Fragment, createElementBlock, defineComponent, h, onMounted, shallowRef, useId } from 'vue'
import type { DefineSetupFnComponent, SlotsType, VNode } from 'vue'
import { useState } from '../composables/state'
import { sanitizeTag } from './utils'

interface NuxtClientFallbackProps {
  fallbackTag?: string
  fallback?: string
  placeholder?: string
  placeholderTag?: string
  keepFallback?: boolean
}

type NuxtClientFallbackEmits = {
  'ssr-error': (error: unknown) => void
}

type NuxtClientFallbackSlots = SlotsType<{
  default?: () => VNode[]
  fallback?: () => VNode[]
  placeholder?: () => VNode[]
}>

const NuxtClientFallbackClient = defineComponent({
  name: 'NuxtClientFallback',
  inheritAttrs: false,
  props: {
    fallbackTag: {
      type: String,
      default: () => { throw new Error("STUB"); },
    },
    fallback: {
      type: String,
      default: () => { throw new Error("STUB"); },
    },
    placeholder: {
      type: String,
    },
    placeholderTag: {
      type: String,
    },
    keepFallback: {
      type: Boolean,
      default: () => { throw new Error("STUB"); },
    },
  },
  emits: ['ssr-error'],
  setup (props, ctx) {
    const mounted = shallowRef(false)
    const ssrFailed = useState(useId())

    if (ssrFailed.value) {
      onMounted(() => {
          throw new Error("STUB");
      })
    }

    return () => {
        throw new Error("STUB");
    }
  },
}) as unknown as DefineSetupFnComponent<NuxtClientFallbackProps, NuxtClientFallbackEmits, NuxtClientFallbackSlots>

export default NuxtClientFallbackClient
