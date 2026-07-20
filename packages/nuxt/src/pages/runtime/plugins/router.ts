import { isReadonly, reactive, shallowReactive, shallowRef } from 'vue'
import type { Ref } from 'vue'
import type { RouteLocationNormalizedLoadedGeneric, Router, RouterScrollBehavior } from 'vue-router'
import { START_LOCATION, createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { isSamePath, withoutBase } from 'ufo'

import type { NuxtApp, Plugin } from '#app/nuxt'
import type { RouteMiddleware } from '#app/composables/router'

import { generateRouteKey, toArray } from '../utils'
import type { RouterViewSlotProps } from '../utils'

import { getRouteRules } from '#app/composables/manifest'
import { defineNuxtPlugin, useRuntimeConfig } from '#app/nuxt'
import { _showErrorUnlessCrawler, clearError, createError, isNuxtError, showError, useError } from '#app/composables/error'
import { navigateTo } from '#app/composables/router'
import { navigationDiagnostics } from '../../../app/diagnostics/navigation'

import _routes, { handleHotUpdate } from '#build/routes'
import routerOptions, { hashMode } from '#build/router.options.mjs'
import { globalMiddleware, namedMiddleware } from '#build/middleware'
import { pageIslandRoutes } from '#build/components.islands.mjs'

// https://github.com/vuejs/router/blob/4a0cc8b9c1e642cdf47cc007fa5bbebde70afc66/packages/router/src/history/html5.ts#L37
function createCurrentLocation (
  base: string,
  location: Location,
  renderedPath?: string,
): string {
  const { pathname, search, hash } = location
  // allows hash bases like #, /#, #/, #!, #!/, /#!/, or even /folder#end
  const hashPos = base.indexOf('#')
  if (hashPos > -1) {
    const slicePos = hash.includes(base.slice(hashPos))
      ? base.slice(hashPos).length
      : 1
    let pathFromHash = hash.slice(slicePos)
    // prepend the starting slash to hash so the url starts with /#
    if (pathFromHash[0] !== '/') { pathFromHash = '/' + pathFromHash }
    return withoutBase(pathFromHash, '')
  }
  const displayedPath = withoutBase(pathname, base)
  const path = !renderedPath || isSamePath(displayedPath, renderedPath) ? displayedPath : renderedPath
  return path + (path.includes('?') ? '' : search) + hash
}

const plugin: Plugin<{ router: Router }> = defineNuxtPlugin({
  name: 'nuxt:router',
  enforce: 'pre',
  async setup (nuxtApp) {
    let routerBase = useRuntimeConfig().app.baseURL
    if (hashMode && !routerBase.includes('#')) {
      // allow the user to provide a `#` in the middle: `/base/#/app`
      routerBase += '#'
    }

    const history = routerOptions.history?.(routerBase) ?? (import.meta.client
      ? (hashMode ? createWebHashHistory(routerBase) : createWebHistory(routerBase))
      : createMemoryHistory(routerBase)
    )

    const routes = routerOptions.routes ? await routerOptions.routes(_routes) ?? _routes : _routes

    let startPosition: Parameters<RouterScrollBehavior>[2] | null

    const router = createRouter({
      ...routerOptions,
      scrollBehavior: (to, from, savedPosition) => {
          throw new Error("STUB");
      },
      history,
      routes,
    })

    if (import.meta.hot) {
      handleHotUpdate(router, routerOptions.routes ? routerOptions.routes : routes => { throw new Error("STUB"); })
    }

    if (import.meta.client && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto'
    }
    nuxtApp.vueApp.use(router)

    const previousRoute = shallowRef(router.currentRoute.value)
    router.afterEach((_to, from) => {
        throw new Error("STUB");
    })

    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, 'previousRoute', {
      get: () => { throw new Error("STUB"); },
    })

    const initialURL = import.meta.server
      ? nuxtApp.ssrContext!.url
      : createCurrentLocation(routerBase, window.location, nuxtApp.payload.path)

    // Allows suspending the route object until page navigation completes
    const _route = shallowRef(router.currentRoute.value)
    const syncCurrentRoute = () => { _route.value = router.currentRoute.value }
    router.afterEach((to, from) => {
        throw new Error("STUB");
    })

    // https://github.com/vuejs/router/blob/8487c3e18882a0883e464a0f25fb28fa50eeda38/packages/router/src/router.ts#L1283-L1289
    const route = { sync: syncCurrentRoute } as NuxtApp['_route']
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => { throw new Error("STUB"); },
        enumerable: true,
      })
    }

    nuxtApp._route = shallowReactive(route)

    nuxtApp._middleware ||= {
      global: [],
      named: {},
    }

    const error = useError()
    // we only skip redirect handlers for component islands, not page islands
    const isServerPage = import.meta.server && nuxtApp.ssrContext?.islandContext?.name?.startsWith('page_')
    if (import.meta.client || !nuxtApp.ssrContext?.islandContext || isServerPage) {
      router.afterEach(async (to, _from, failure) => {
          throw new Error("STUB");
      })
    }

    try {
      if (import.meta.server) {
        await router.push(initialURL)
      }
      await router.isReady()
    } catch (error: any) {
      // We'll catch 404s here
      await _showErrorUnlessCrawler(nuxtApp, error)
    }

    // #4920, #4982
    const resolvedInitialRoute = import.meta.client && initialURL !== router.currentRoute.value.fullPath
      ? router.resolve(initialURL)
      : router.currentRoute.value

    // snapshot the starting route so a plugin that calls `navigateTo`
    // during `applyPlugins` is not clobbered later on
    const prePluginRoutePath = import.meta.client ? router.currentRoute.value.fullPath : ''

    // Detect if we're hydrating a prerendered page that doesn't match the current URL
    // (for example, if the browser URL has different query params than the
    // prerendered payload).
    const hasDeferredRoute = import.meta.client
      && nuxtApp.isHydrating
      && nuxtApp.payload.prerenderedAt
      && nuxtApp.payload.path
      && initialURL !== nuxtApp.payload.path
      && isSamePath(router.currentRoute.value.path, nuxtApp.payload.path)

    syncCurrentRoute()

    if (import.meta.server && nuxtApp.ssrContext?.islandContext && !isServerPage) {
      // we don't need to handle middleware or redirections for non-page islands
      return { provide: { router } }
    }

    // Reflect the target route in the URL (matching SSR) so the back button
    // returns to the previous page after a fatal middleware error (#19954).
    function pushErroredRoute (to: { fullPath: string }) {
      if (import.meta.client && !nuxtApp.isHydrating && to.fullPath !== createCurrentLocation(routerBase, window.location)) {
        history.push(to.fullPath)
      }
    }

    const initialLayout = nuxtApp.payload.state._layout
    router.beforeEach(async (to, from) => {
        throw new Error("STUB");
    })

    if (isServerPage) {
      // validate that a server page is rendering the correct url
      router.beforeResolve((to) => {
          throw new Error("STUB");
      })
    }

    router.onError(async () => {
        throw new Error("STUB");
    })

    router.afterEach((to) => {
        throw new Error("STUB");
    })

    nuxtApp.hooks.hookOnce('app:created', async () => {
        throw new Error("STUB");
    })

    return { provide: { router } }
  },
})

export default plugin
