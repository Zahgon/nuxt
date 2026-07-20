import type { DefineComponent, ExtractPublicPropTypes, MaybeRef, PropType, VNode } from 'vue'
import { Suspense, computed, defineComponent, h, inject, mergeProps, nextTick, onMounted, provide, shallowReactive, shallowRef, unref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

import type { NuxtLayouts, PageMeta } from '../../pages/runtime/composables'

import { resolveLayoutName } from '../composables/layout'
import { useRoute, useRouter } from '../composables/router'
import { useNuxtApp } from '../nuxt'
import { renderDiagnostics } from '../diagnostics/render'
import { _mergeTransitionProps, _wrapInTransition } from './utils'
import { LayoutMetaSymbol, LayoutSymbol, PageRouteSymbol } from './injections'

import { useRoute as useVueRouterRoute } from '#build/pages'
import layouts from '#build/layouts'
import { appLayoutTransition as defaultLayoutTransition } from '#build/nuxt.config.mjs'

const LayoutLoader = defineComponent({
  name: 'LayoutLoader',
  inheritAttrs: false,
  props: {
    name: String,
    layoutProps: Object,
  },
  setup (props, context) {
    // This is a deliberate hack - this component must always be called with an explicit key to ensure
    // that setup reruns when the name changes.
    return () => { throw new Error("STUB"); }
  },
})

// props are moved outside of defineComponent to later explicitly assert the prop types
// this avoids type loss/simplification resulting in things like MaybeRef<string | false>, keeping type hints for layout names
const nuxtLayoutProps = {
  name: {
    type: [String, Boolean, Object] as PropType<unknown extends PageMeta['layout'] ? MaybeRef<string | false> : PageMeta['layout']>,
    default: null,
  },
  fallback: {
    type: [String, Object] as PropType<unknown extends PageMeta['layout'] ? MaybeRef<string> : PageMeta['layout']>,
    default: null,
  },
}

export default defineComponent({
  name: 'NuxtLayout',
  inheritAttrs: false,
  props: nuxtLayoutProps,
  setup (props, context) {
    const nuxtApp = useNuxtApp()
    // Need to ensure (if we are not a child of `<NuxtPage>`) that we use synchronous route (not deferred)
    const injectedRoute = inject(PageRouteSymbol)
    const shouldUseEagerRoute = !injectedRoute /* this should never be true */
      || injectedRoute === useRoute() /* this is only true if we are not within `<NuxtPage>` */
    const route = shouldUseEagerRoute ? useVueRouterRoute() as ReturnType<typeof useRoute> : injectedRoute

    const layout = computed(() => {
        throw new Error("STUB");
    })

    provide(LayoutSymbol, layout)

    const layoutRef = shallowRef()
    context.expose({ layoutRef })

    const done = nuxtApp.deferHydration()
    if (import.meta.client && nuxtApp.isHydrating) {
      const removeErrorHook = nuxtApp.hooks.hookOnce('app:error', done)
      const removeGuard = useRouter().beforeEach(() => {
          throw new Error("STUB");
      })
    }

    if (import.meta.dev) {
      nuxtApp._isNuxtLayoutUsed = true
    }

    let lastLayout: string | boolean | undefined

    return () => {
        throw new Error("STUB");
    }
  },
}) as DefineComponent<ExtractPublicPropTypes<typeof nuxtLayoutProps>>

const LayoutProvider = defineComponent({
  name: 'NuxtLayoutProvider',
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean] as unknown as () => string | false,
    },
    layoutProps: {
      type: Object,
    },
    hasTransition: {
      type: Boolean,
    },
    shouldProvide: {
      type: Boolean,
    },
    isRenderingNewLayout: {
      type: Function as unknown as () => (name?: string | boolean) => boolean,
      required: true,
    },
  },
  setup (props, context) {
    // Prevent reactivity when the page will be rerendered in a different suspense fork

    const name = props.name
    if (props.shouldProvide) {
      provide(LayoutMetaSymbol, {
        // When name=false, always return true so NuxtPage doesn't skip rendering
        isCurrent: (route: RouteLocationNormalizedLoaded) => { throw new Error("STUB"); },
      })
    }

    // this route waits to update until the page has finished changing
    const injectedRoute = inject(PageRouteSymbol)
    const isNotWithinNuxtPage = injectedRoute && injectedRoute === useRoute()

    // The enclosing layout chain, if this layout is nested inside another `<NuxtLayout>`.
    // When the eager route no longer selects that enclosing layout, this layout is being
    // re-rendered in the old suspense fork while the destination page is still pending, so
    // it must keep reading the deferred route rather than jumping ahead to the eager one (#32904).
    const enclosingLayout = inject(LayoutMetaSymbol, null)

    if (isNotWithinNuxtPage) {
      // this route updates immediately
      const vueRouterRoute = useVueRouterRoute() as ReturnType<typeof useRoute>
      const reactiveChildRoute = {} as RouteLocationNormalizedLoaded
      for (const _key in vueRouterRoute) {
        const key = _key as keyof RouteLocationNormalizedLoaded
        Object.defineProperty(reactiveChildRoute, key, {
          enumerable: true,
          get: () => {
              throw new Error("STUB");
          },
        })
      }
      provide(PageRouteSymbol, shallowReactive(reactiveChildRoute))
    }

    let vnode: VNode | undefined
    if (import.meta.dev && import.meta.client) {
      onMounted(() => {
          throw new Error("STUB");
      })
    }

    return () => {
        throw new Error("STUB");
    }
  },
})
