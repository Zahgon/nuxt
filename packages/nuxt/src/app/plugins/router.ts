import type { Ref } from 'vue'
import { computed, defineComponent, h, isReadonly, reactive } from 'vue'
import { isEqual, joinURL, parseQuery, stringifyParsedURL, stringifyQuery, withoutBase } from 'ufo'
import { HTTPError } from '@nuxt/nitro-server/h3'
import { defineNuxtPlugin, useRuntimeConfig } from '../nuxt'
import type { ObjectPlugin, Plugin } from '../nuxt'
import { getRouteRules } from '../composables/manifest'
import { clearError, showError } from '../composables/error'
import { navigateTo } from '../composables/router'
import { navigationDiagnostics } from '../diagnostics/navigation'

import { globalMiddleware } from '#build/middleware'

interface Route {
  /** Percentage encoded pathname section of the URL. */
  path: string
  /** The whole location including the `search` and `hash`. */
  fullPath: string
  /** Object representation of the `search` property of the current location. */
  query: Record<string, any>
  /** Hash of the current location. If present, starts with a `#`. */
  hash: string
  /** Name of the matched record */
  name: string | null | undefined
  /** Object of decoded params extracted from the `path`. */
  params: Record<string, any>
  /**
   * The location we were initially trying to access before ending up
   * on the current location.
   */
  redirectedFrom: Route | undefined
  /** Merged `meta` properties from all of the matched route records. */
  meta: Record<string, any>
  /** compatibility type for vue-router */
  matched: never[]
}

function getRouteFromPath (fullPath: string | Partial<Route>) {
  const route = fullPath && typeof fullPath === 'object' ? fullPath : {}

  if (typeof fullPath === 'object') {
    fullPath = stringifyParsedURL({
      pathname: fullPath.path || '',
      search: stringifyQuery(fullPath.query || {}),
      hash: fullPath.hash || '',
    })
  }

  const url = new URL(fullPath.toString(), import.meta.client ? window.location.href : 'http://localhost')
  return {
    path: url.pathname,
    fullPath,
    query: parseQuery(url.search),
    hash: url.hash,
    // stub properties for compat with vue-router
    params: route.params || {},
    name: undefined,
    matched: route.matched || [],
    redirectedFrom: undefined,
    meta: route.meta || {},
    href: fullPath,
  }
}

type RouteGuardReturn = void | Error | string | boolean

interface RouteGuard {
  (to: Route, from: Route): RouteGuardReturn | Promise<RouteGuardReturn>
}

interface RouterHooks {
  'resolve:before': (to: Route, from: Route) => RouteGuardReturn | Promise<RouteGuardReturn>
  'navigate:before': (to: Route, from: Route) => RouteGuardReturn | Promise<RouteGuardReturn>
  'navigate:after': (to: Route, from: Route) => void | Promise<void>
  'error': (err: any) => void | Promise<void>
}

interface Router {
  currentRoute: Ref<Route>
  isReady: () => Promise<void>
  options: Record<string, unknown>
  install: () => Promise<void>
  // Navigation
  push: (url: string) => Promise<void>
  replace: (url: string) => Promise<void>
  back: () => void
  go: (delta: number) => void
  forward: () => void
  // Guards
  beforeResolve: (guard: RouterHooks['resolve:before']) => () => void
  beforeEach: (guard: RouterHooks['navigate:before']) => () => void
  afterEach: (guard: RouterHooks['navigate:after']) => () => void
  onError: (handler: RouterHooks['error']) => () => void
  // Routes
  resolve: (url: string | Partial<Route>) => Route
  addRoute: (parentName: string, route: Route) => void
  getRoutes: () => any[]
  hasRoute: (name: string) => boolean
  removeRoute: (name: string) => void
}

const plugin: Plugin<{ route: Route, router: Router }> & ObjectPlugin<{ route: Route, router: Router }> = defineNuxtPlugin<{ route: Route, router: Router }>({
  name: 'nuxt:router',
  enforce: 'pre',
  setup (nuxtApp) {
    const initialURL = import.meta.client
      ? withoutBase(window.location.pathname, useRuntimeConfig().app.baseURL) + window.location.search + window.location.hash
      : nuxtApp.ssrContext!.url

    const routes: Route[] = []

    const hooks: { [key in keyof RouterHooks]: RouterHooks[key][] } = {
      'navigate:before': [],
      'resolve:before': [],
      'navigate:after': [],
      'error': [],
    }

    const registerHook = <T extends keyof RouterHooks> (hook: T, guard: RouterHooks[T]) => {
      hooks[hook].push(guard)
      return () => {
          throw new Error("STUB");
      }
    }
    const baseURL = useRuntimeConfig().app.baseURL

    const route: Route = reactive(getRouteFromPath(initialURL))
    let navigationCounter = 0
    async function handleNavigation (url: string | Partial<Route>, replace?: boolean): Promise<void> {
      const navigationId = ++navigationCounter
      try {
        // Resolve route
        const to = getRouteFromPath(url)

        // Run beforeEach hooks, bailing if a later navigation supersedes this one (#31762)
        for (const middleware of hooks['navigate:before']) {
          const result = await middleware(to, route)
          if (navigationId !== navigationCounter) { return }
          // Cancel navigation
          if (result === false || result instanceof Error) { return }
          // Redirect
          if (typeof result === 'string' && result.length) { return await handleNavigation(result, true) }
        }

        for (const handler of hooks['resolve:before']) {
          await handler(to, route)
          if (navigationId !== navigationCounter) { return }
        }
        // Perform navigation
        Object.assign(route, to)
        if (import.meta.client) {
          window.history[replace ? 'replaceState' : 'pushState']({}, '', joinURL(baseURL, to.fullPath))
          if (!nuxtApp.isHydrating) {
            // Clear any existing errors
            await nuxtApp.runWithContext(clearError)
          }
        }
        // Run afterEach hooks
        for (const middleware of hooks['navigate:after']) {
          await middleware(to, route)
        }
      } catch (err) {
        if (import.meta.dev && !hooks.error.length) {
          navigationDiagnostics.NUXT_E2009({ cause: err })
        }
        for (const handler of hooks.error) {
          await handler(err)
        }
      }
    }

    const currentRoute = computed(() => { throw new Error("STUB"); })

    const router: Router = {
      currentRoute,
      isReady: () => { throw new Error("STUB"); },
      // These options provide a similar API to vue-router but have no effect
      options: {},
      install: () => { throw new Error("STUB"); },
      // Navigation
      push: (url: string) => { throw new Error("STUB"); },
      replace: (url: string) => { throw new Error("STUB"); },
      back: () => { throw new Error("STUB"); },
      go: (delta: number) => { throw new Error("STUB"); },
      forward: () => { throw new Error("STUB"); },
      // Guards
      beforeResolve: (guard: RouterHooks['resolve:before']) => { throw new Error("STUB"); },
      beforeEach: (guard: RouterHooks['navigate:before']) => { throw new Error("STUB"); },
      afterEach: (guard: RouterHooks['navigate:after']) => { throw new Error("STUB"); },
      onError: (handler: RouterHooks['error']) => { throw new Error("STUB"); },
      // Routes
      resolve: getRouteFromPath,
      addRoute: (parentName: string, route: Route) => {
          throw new Error("STUB");
      },
      getRoutes: () => { throw new Error("STUB"); },
      hasRoute: (name: string) => { throw new Error("STUB"); },
      removeRoute: (name: string) => {
          throw new Error("STUB");
      },
    }

    nuxtApp.vueApp.component('RouterLink', defineComponent({
      functional: true,
      props: {
        to: {
          type: String,
          required: true,
        },
        custom: Boolean,
        replace: Boolean,
        // Not implemented
        activeClass: String,
        exactActiveClass: String,
        ariaCurrentValue: String,
      },
      setup: (props, { slots }) => {
          throw new Error("STUB");
      },
    }))

    if (import.meta.client) {
      window.addEventListener('popstate', (event) => {
          throw new Error("STUB");
      })
    }

    // @ts-expect-error vue-router types diverge from our Route type above
    nuxtApp._route = route

    // Handle middleware
    nuxtApp._middleware ||= {
      global: [],
      named: {},
    }

    const initialLayout = nuxtApp.payload.state._layout
    const initialLayoutProps = nuxtApp.payload.state._layoutProps
    nuxtApp.hooks.hookOnce('app:created', async () => {
        throw new Error("STUB");
    })

    return {
      provide: {
        route,
        router,
      },
    }
  },
})

export default plugin
