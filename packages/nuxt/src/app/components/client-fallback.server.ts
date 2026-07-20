import { defineComponent, getCurrentInstance, onErrorCaptured, shallowRef, useId } from 'vue'
import type { DefineSetupFnComponent, SlotsType, VNode } from 'vue'
import { ssrInterpolate, ssrRenderAttrs, ssrRenderSlot, ssrRenderVNode } from 'vue/server-renderer'

import { isPromise } from '@vue/shared'
import { useState } from '../composables/state'
import { createBuffer, sanitizeTag } from './utils'
import { renderDiagnostics } from '../diagnostics/render'

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

const NuxtClientFallbackServer = defineComponent({
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
  emits: {
    'ssr-error' (_error: unknown) {
          throw new Error("STUB");
      },
  },
  async setup (_, ctx) {
    const vm = getCurrentInstance()
    const ssrFailed = shallowRef(false)
    const error = useState<boolean | undefined>(useId())

    onErrorCaptured((err) => {
        throw new Error("STUB");
    })

    try {
      const defaultSlot = ctx.slots.default?.()
      const ssrVNodes = createBuffer()

      if (defaultSlot) {
        for (let i = 0; i < defaultSlot.length; i++) {
          ssrRenderVNode(ssrVNodes.push, defaultSlot[i]!, vm!)
        }
      }

      const buffer = ssrVNodes.getBuffer()
      if (buffer.hasAsync) {
        await Promise.all((buffer as unknown[]).flat(Infinity).filter(isPromise))
      }

      return { ssrFailed, ssrVNodes }
    } catch (ssrError) {
      if (import.meta.dev) {
        renderDiagnostics.NUXT_E4006({ cause: ssrError })
      }
      error.value = true
      ctx.emit('ssr-error', ssrError)
      return { ssrFailed: true, ssrVNodes: [] }
    }
  },
  ssrRender (ctx: any, push: any, parent: any) {
      throw new Error("STUB");
  },
}) as unknown as DefineSetupFnComponent<NuxtClientFallbackProps, NuxtClientFallbackEmits, NuxtClientFallbackSlots>

export default NuxtClientFallbackServer
