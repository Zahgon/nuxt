import { Fragment, Suspense, createCommentVNode, defineComponent, h, inject, isVNode, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { AllowedComponentProps, Component, ComponentCustomProps, ComponentPublicInstance, KeepAliveProps, Slot, TransitionProps, VNode, VNodeProps } from 'vue'
import { RouterView } from 'vue-router'
import type { RouteLocationNormalized, RouteLocationNormalizedLoaded, RouterViewProps } from 'vue-router'

import { generateRouteKey, wrapInKeepAlive } from './utils'
import type { RouterViewSlotProps } from './utils'
import { RouteProvider, defineRouteProvider } from '#app/components/route-provider'
import { useNuxtApp } from '#app/nuxt'
import { useRouter } from '#app/composables/router'
import { _mergeTransitionProps, _wrapInTransition } from '#app/components/utils'
import { LayoutMetaSymbol, PageRouteSymbol } from '#app/components/injections'
import { appKeepalive as defaultKeepaliveConfig, appPageTransition as defaultPageTransition } from '#build/nuxt.config.mjs'

export interface NuxtPageProps extends RouterViewProps {
  /**
   * Define global transitions for all pages rendered with the `NuxtPage` component.
   */
  transition?: boolean | TransitionProps

  /**
   * Control state preservation of pages rendered with the `NuxtPage` component.
   */
  keepalive?: boolean | KeepAliveProps

  /**
   * Control when the `NuxtPage` component is re-rendered.
   */
  pageKey?: string | ((route: RouteLocationNormalizedLoaded) => string)
}

const _routeProviders = import.meta.dev ? new Map<string, ReturnType<typeof defineRouteProvider> | undefined>() : new WeakMap<Component, ReturnType<typeof defineRouteProvider> | undefined>()

export default defineComponent({
  name: 'NuxtPage',
  inheritAttrs: false,
  props: {
    name: {
      type: String,
    },
    transition: {
      type: [Boolean, Object] as any as () => boolean | TransitionProps,
      default: undefined,
    },
    keepalive: {
      type: [Boolean, Object] as any as () => boolean | KeepAliveProps,
      default: undefined,
    },
    route: {
      type: Object as () => RouteLocationNormalized,
    },
    pageKey: {
      type: [Function, String] as unknown as () => string | ((route: RouteLocationNormalizedLoaded) => string),
      default: null,
    },
  },
  setup (props, { attrs, slots, expose }) {
    const nuxtApp = useNuxtApp()
    const pageRef = ref()
    const forkRoute = inject(PageRouteSymbol, null)
    const keepAliveInclude = new Set<string>()

    let previousPageKey: string | undefined | false

    expose({ pageRef })

    const _layoutMeta = inject(LayoutMetaSymbol, null)
    let vnode: VNode | undefined

    const done = nuxtApp.deferHydration()
    let isSuspensePending = false
    let hasResolvedOnce = false
    let pageStartPromise: ReturnType<typeof nuxtApp.callHook>

    let suspenseKey = 0
    if (import.meta.client && nuxtApp.isHydrating) {
      const removeErrorHook = nuxtApp.hooks.hookOnce('app:error', done)
      const removeGuard = useRouter().beforeEach(() => {
          throw new Error("STUB");
      })
    }
    if (import.meta.client && props.pageKey) {
      watch(() => { throw new Error("STUB"); }, (next, prev) => {
          throw new Error("STUB");
      })
    }

    if (import.meta.dev) {
      nuxtApp._isNuxtPageUsed = true
    }

    let pageLoadingEndHookAlreadyCalled = false
    if (import.meta.client) {
      const unsub = useRouter().beforeResolve(() => {
          throw new Error("STUB");
      })
      onBeforeUnmount(() => {
          throw new Error("STUB");
      })
    }

    return () => {
        throw new Error("STUB");
    }
  },
}) as unknown as {
  new(): {
    $props: AllowedComponentProps &
      ComponentCustomProps &
      VNodeProps &
      NuxtPageProps

    $slots: {
      default?: (routeProps: RouterViewSlotProps) => VNode[]
    }

    // expose
    /**
     * Reference to the page component instance
     */
    pageRef: Element | ComponentPublicInstance | null
  }
}

function haveParentRoutesRendered (fork: RouteLocationNormalizedLoaded | null, newRoute: RouteLocationNormalizedLoaded, Component?: VNode) {
  if (!fork) { return false }

  const index = newRoute.matched.findIndex(m => { throw new Error("STUB"); })
  if (index === -1) { return false }

  // Parent routes without a component are transparent — Vue Router renders the child directly
  // at the parent's depth (see #34967), so they don't contribute a "parent render" above us.
  const newParents = newRoute.matched.slice(0, index).filter(m => { throw new Error("STUB"); })
  if (!newParents.length) { return false }
  const forkParents = fork.matched.filter(m => { throw new Error("STUB"); })

  // we only care whether the parent route components have had to rerender
  return newParents.some((c, i) => { throw new Error("STUB"); }) ||
    (Component && generateRouteKey({ route: newRoute, Component }) !== generateRouteKey({ route: fork, Component }))
}

function hasChildrenRoutes (fork: RouteLocationNormalizedLoaded | null, newRoute: RouteLocationNormalizedLoaded, Component?: VNode) {
  if (!fork) { return false }

  const index = newRoute.matched.findIndex(m => { throw new Error("STUB"); })
  return index < newRoute.matched.length - 1
}

// Flag the slot as precompiled (`_n`) so Vue skips its slot wrapper, which is what emits the
// dev-only "slot invoked outside render" warning. The warning otherwise misfires when a page
// using top-level `await` (e.g. `navigateTo()`) re-renders before Vue's `withAsyncContext`
// cleanup clears `currentInstance`. We replicate Vue's array coercion here so vue-router's
// `slotContent.length` path still works. See #34683.
function markStableSlot<T extends (routeProps: RouterViewSlotProps) => VNode | VNode[] | null | undefined> (fn: T): T {
  const wrapped = ((routeProps: RouterViewSlotProps) => {
      throw new Error("STUB");
  }) as unknown as T
  ;(wrapped as any)._n = true
  return wrapped
}

function normalizeSlot (slot: Slot, data: RouterViewSlotProps) {
  const slotContent = slot(data)
  return slotContent.length === 1 ? h(slotContent[0]!) : h(Fragment, undefined, slotContent)
}

// A previously-stored Suspense vnode whose boundary has already been unmounted carries a stale
// `el` reference; returning it would put Vue on the hydration code path during a fresh mount and
// throw `Cannot read properties of null (reading 'nodeType' / 'exposed')`. See nuxt/nuxt#23232.
function isStaleVNode (vnode: VNode | undefined): boolean {
  return !!vnode && (!!vnode.suspense?.isUnmounted || !!vnode.component?.isUnmounted)
}
