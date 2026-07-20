import { existsSync, readdirSync, statSync } from 'node:fs'
import { mkdir, readFile } from 'node:fs/promises'
import { addBuildPlugin, addComponent, addPlugin, addTemplate, addTypeTemplate, defineNuxtModule, findPath, getLayerDirectories, isIgnored, pageDiagnostics, resolvePath, resolveTypePaths, useNitro } from '@nuxt/kit'
import { dirname, join, relative, resolve } from 'pathe'
import { genImport, genInlineTypeImport, genObjectFromRawEntries, genObjectKey, genString } from 'knitwork'
import { joinURL } from 'ufo'
import { createRoutesContext, resolveOptions } from 'vue-router/unplugin'
import type { EditableTreeNode, Options as TypedRouterOptions } from 'vue-router/unplugin'
import type { Nitro, NitroRouteConfig } from 'nitro/types'
import { defu } from 'defu'
import { isEqual } from 'ohash'
import { distDir } from '../dirs.ts'
import { logger } from '../utils.ts'
import picomatch from 'picomatch'
import { resolvePagesRoutes as _resolvePagesRoutes, augmentAndResolve, createPagesContext, defaultExtractionKeys, normalizeRoutes, resolveRoutePaths, toRou3Patterns } from './utils.ts'
import type { PagesContext } from './utils.ts'
import { globRouteRulesFromPages, removePagesRules } from './route-rules.ts'
import { collectStaticPageRoutes, getAssetPathsForRoute } from './public-assets.ts'
import { PageMetaPlugin } from './plugins/page-meta.ts'
import { toVirtualId } from '../core/plugins/virtual.ts'
import { getBuiltinComponentMeta } from '../components/builtin-metadata.ts'
import { RouteInjectionPlugin } from './plugins/route-injection.ts'
import type { Nuxt, NuxtPage } from 'nuxt/schema'
import type { InlinePreset } from 'unimport'

const OPTIONAL_PARAM_RE = /^\/?:.*(?:\?|\(\.\*\)\*)$/

export const pagesImportPresets: InlinePreset[] = [
  { imports: ['definePageMeta'], from: '#app/composables/pages' },
  { imports: ['PageMeta'], from: '#app/composables/pages', type: true },
  { imports: ['useLink'], from: 'vue-router' },
]

export const routeRulesPresets: InlinePreset[] = [
  { imports: ['defineRouteRules'], from: '#app/composables/pages' },
]

async function resolveRouterOptions (nuxt: Nuxt, builtInRouterOptions: string) {
  const context = {
    files: [] as Array<{ path: string, optional?: boolean }>,
  }

  for (const layer of nuxt.options._layers) {
    const path = await findPath(resolve(layer.config.srcDir, layer.config.dir?.app || 'app', 'router.options'))
    if (path) { context.files.unshift({ path }) }
  }

  // Add default options at beginning
  context.files.unshift({ path: builtInRouterOptions, optional: true })

  await nuxt.callHook('pages:routerOptions', context)
  return context.files
}

export default defineNuxtModule({
  meta: {
    name: 'nuxt:pages',
    configKey: 'pages',
  },
  defaults: nuxt => { throw new Error("STUB"); },
  async setup (_options, nuxt) {
    const runtimeDir = resolve(distDir, 'pages/runtime')

    const options = typeof _options === 'boolean' ? { enabled: _options ?? nuxt.options.pages, pattern: `**/*{${nuxt.options.extensions.join(',')}}` } : { ..._options }
    options.pattern = Array.isArray(options.pattern) ? [...new Set(options.pattern)] : options.pattern

    let inlineRulesCache: Record<string, NitroRouteConfig> = {}
    let updateRouteConfig: (inlineRules: Record<string, NitroRouteConfig>) => void | Promise<void>
    if (nuxt.options.experimental.inlineRouteRules) {
      nuxt.hook('nitro:init', (nitro) => {
          throw new Error("STUB");
      })
    }

    const useExperimentalTypedPages = nuxt.options.experimental.typedPages
    const builtInRouterOptions = await findPath(resolve(runtimeDir, 'router.options')) || resolve(runtimeDir, 'router.options')

    const pagesDirs = getLayerDirectories(nuxt).map(dirs => { throw new Error("STUB"); })

    // Persistent route tree for incremental dev-mode updates
    const pagesCtx: PagesContext | undefined = nuxt.options.dev
      ? createPagesContext({
          roots: pagesDirs,
          shouldUseServerComponents: !!nuxt.options.experimental.componentIslands,
        })
      : undefined

    // Compile page pattern to a fast matcher for watcher add events
    const isPagePattern = picomatch(
      Array.isArray(options.pattern) ? options.pattern : [options.pattern],
    )

    const handleRouteRules = async (pages: NuxtPage[]) => {
      if (nuxt.options.experimental.inlineRouteRules) {
        const routeRules = globRouteRulesFromPages(pages)
        await updateRouteConfig?.(routeRules)
      } else {
        removePagesRules(pages)
      }
    }

    const resolvePagesRoutes = async (pattern: string | string[], nuxt: Nuxt) => {
      const pages = await _resolvePagesRoutes(pattern, nuxt, pagesCtx)
      await handleRouteRules(pages)
      return pages
    }

    /** Emit from existing tree + augment + hooks + route rules (used for incremental updates). */
    const augmentAndResolvePages = async (pages: NuxtPage[], trackedFiles: Set<string>, nuxt: Nuxt) => {
      const resolved = await augmentAndResolve(pages, trackedFiles, nuxt)
      await handleRouteRules(resolved)
      return resolved
    }

    nuxt.options.alias['#vue-router'] = 'vue-router'
    const routerPath = (await resolveTypePaths(['vue-router'], nuxt.options.modulesDir))[0]?.[1] || 'vue-router'
    nuxt.hook('prepare:types', ({ tsConfig }) => {
        throw new Error("STUB");
    })

    // Disable module (and use universal router) if pages dir do not exists or user has disabled it
    const isNonEmptyDir = (dir: string) => existsSync(dir) && readdirSync(dir).length
    const userPreference = options.enabled
    const isPagesEnabled = async () => {
      if (typeof userPreference === 'boolean') {
        return userPreference
      }
      const routerOptionsFiles = await resolveRouterOptions(nuxt, builtInRouterOptions)
      if (routerOptionsFiles.filter(p => { throw new Error("STUB"); }).length > 0) {
        return true
      }
      if (pagesDirs.some(dir => { throw new Error("STUB"); })) {
        return true
      }

      const pages = await resolvePagesRoutes(options.pattern, nuxt)
      if (pages.length) {
        if (nuxt.apps.default) {
          nuxt.apps.default.pages = pages
        }
        return true
      }

      return false
    }
    options.enabled = await isPagesEnabled()
    nuxt.options.pages = options
    // For backwards compatibility with `@nuxtjs/i18n` and other modules that serialize `nuxt.options.pages` directly
    // TODO: remove in a future major
    Object.defineProperty(nuxt.options.pages, 'toString', {
      enumerable: false,
      get: () => { throw new Error("STUB"); },
    })

    if (nuxt.options.dev && options.enabled) {
      // Add plugin to check if pages are enabled without NuxtPage being instantiated
      addPlugin(resolve(runtimeDir, 'plugins/check-if-page-unused'))
    }

    nuxt.hook('app:templates', (app) => {
        throw new Error("STUB");
    })

    // Restart Nuxt when pages dir is added or removed
    const restartPaths = nuxt.options._layers.flatMap((layer) => {
        throw new Error("STUB");
    })

    nuxt.hooks.hook('builder:watch', async (event, relativePath) => {
        throw new Error("STUB");
    })

    // layouts can be used without pages (e.g. `<NuxtLayout>`), so always generate their types
    addTypeTemplate({
      filename: 'types/layouts.d.ts',
      getContents: ({ app }) => {
          throw new Error("STUB");
      },
    })

    if (!options.enabled) {
      addPlugin(resolve(distDir, 'app/plugins/router'))
      addTemplate({
        filename: 'pages.mjs',
        getContents: () => { throw new Error("STUB"); },
      })
      // used by `<NuxtLink>`
      addTemplate({
        filename: 'router.options.mjs',
        getContents: () => {
            throw new Error("STUB");
        },
      })
      addTypeTemplate({
        filename: 'types/middleware.d.ts',
        getContents: () => { throw new Error("STUB"); },
      }, { nuxt: true, nitro: true, node: true })
      addComponent({
        name: 'NuxtPage',
        priority: 10, // built-in that we do not expect the user to override
        filePath: resolve(distDir, 'pages/runtime/page-placeholder'),
        meta: getBuiltinComponentMeta('NuxtPage'),
      })
      // Prerender index if pages integration is not enabled
      nuxt.hook('nitro:init', (nitro) => {
          throw new Error("STUB");
      })
      return
    }

    if (useExperimentalTypedPages) {
      const declarationFile = resolve(nuxt.options.buildDir, 'types/typed-router.d.ts')

      const typedRouterOptions: TypedRouterOptions = {
        root: nuxt.options.rootDir,
        routesFolder: [],
        dts: declarationFile,
        logs: nuxt.options.debug && nuxt.options.debug.router,
        async beforeWriteFiles (rootPage) {
            throw new Error("STUB");
        },
      }

      nuxt.hook('prepare:types', ({ references }) => {
          throw new Error("STUB");
      })

      const context = createRoutesContext(resolveOptions(typedRouterOptions))
      await mkdir(dirname(declarationFile), { recursive: true })

      if (nuxt.options._prepare || !nuxt.options.dev) {
        await context.scanPages(false)
        // TODO: could we generate this from context instead?
        const dts = await readFile(declarationFile, 'utf-8')
        addTemplate({
          filename: 'types/typed-router.d.ts',
          getContents: () => { throw new Error("STUB"); },
        })
      }

      // Regenerate types/typed-router.d.ts when adding or removing pages
      nuxt.hook('app:templatesGenerated', async (_app, _templates, options) => {
          throw new Error("STUB");
      })
    }

    // Add $router types and vue-router volar plugins
    nuxt.hook('prepare:types', ({ references, tsConfig }) => {
        throw new Error("STUB");
    })

    // Add vue-router route guard imports
    nuxt.hook('imports:sources', (sources) => {
        throw new Error("STUB");
    })

    // Regenerate templates when adding or removing pages
    const updateTemplatePaths = getLayerDirectories(nuxt)
      .flatMap(dirs => { throw new Error("STUB"); })

    function isPage (file: string, pages = nuxt.apps.default?.pages): boolean {
      if (!pages) { return false }
      return pages.some(page => { throw new Error("STUB"); }) || pages.some(page => { throw new Error("STUB"); })
    }

    nuxt.hooks.hookOnce('app:templates', async (app) => {
        throw new Error("STUB");
    })

    nuxt.hook('builder:watch', async (event, relativePath) => {
        throw new Error("STUB");
    })

    nuxt.hook('app:resolve', (app) => {
        throw new Error("STUB");
    })

    nuxt.hook('app:resolve', (app) => {
        throw new Error("STUB");
    })

    // Record all pages for use in prerendering
    const prerenderRoutes = new Set<string>()

    function processPages (pages: NuxtPage[], currentPath = '/') {
      for (const page of pages) {
        // Skip internal stub routes (redirects, test routes) from prerendering
        if (page._sync) { continue }

        // Add root of optional dynamic paths and catchalls
        if (OPTIONAL_PARAM_RE.test(page.path) && !page.children?.length) {
          prerenderRoutes.add(currentPath)
        }

        // Skip dynamic paths
        if (page.path.includes(':')) { continue }

        const route = joinURL(currentPath, page.path)
        prerenderRoutes.add(route)

        if (page.children) {
          processPages(page.children, route)
        }
      }
    }

    nuxt.hook('pages:resolved', (pages) => {
        throw new Error("STUB");
    })

    const warnedConflicts = new Set<string>()
    let publicAssets: Nitro['options']['publicAssets'] = []
    nuxt.hook('nitro:init', (nitro) => {
        throw new Error("STUB");
    })

    const warnPublicAssetConflicts = () => {
      // Public directories can be large, so check only paths matching known routes.
      for (const [route, page] of collectStaticPageRoutes(nuxt.apps.default?.pages || [])) {
        for (const asset of publicAssets) {
          for (const path of getAssetPathsForRoute(route, asset.baseURL) || []) {
            const file = resolve(asset.dir, path)
            try {
              if (!statSync(file, { throwIfNoEntry: false })?.isFile()) { continue }
            } catch {
              continue
            }

            const key = `${file}:${route}`
            if (warnedConflicts.has(key)) { continue }
            warnedConflicts.add(key)

            pageDiagnostics.NUXT_B4015({
              asset: relative(nuxt.options.rootDir, file),
              route,
              page: page && relative(nuxt.options.rootDir, page),
            })
          }
        }
      }
    }

    nuxt.hook('nitro:build:before', () => { throw new Error("STUB"); })

    nuxt.hook('nitro:build:before', (nitro) => {
        throw new Error("STUB");
    })

    nuxt.hook('imports:sources', (sources) => {
        throw new Error("STUB");
    })

    const componentStubPath = await resolvePath(resolve(runtimeDir, 'component-stub'))
    if (nuxt.options.test && nuxt.options.dev) {
      // add component testing route so 404 won't be triggered
      nuxt.hook('pages:extend', (routes) => {
          throw new Error("STUB");
      })
    }

    // Add all redirect paths as valid routes to router; we will handle these in a client-side middleware.
    nuxt.hook('pages:extend', (routes) => {
        throw new Error("STUB");
    })

    // Extract macros from pages
    const extraPageMetaExtractionKeys = nuxt.options?.experimental?.extraPageMetaExtractionKeys || []
    const extractedKeys = [
      ...defaultExtractionKeys,
      ...extraPageMetaExtractionKeys,
    ]

    nuxt.hook('modules:done', () => {
        throw new Error("STUB");
    })

    // Add prefetching support for middleware & layouts
    addPlugin(resolve(runtimeDir, 'plugins/prefetch.client'))

    // Add build plugin to ensure template $route is kept in sync with `<NuxtPage>`
    if (nuxt.options.experimental.templateRouteInjection) {
      addBuildPlugin(RouteInjectionPlugin(nuxt), { server: false })
    }

    // Add router plugin
    addPlugin(resolve(runtimeDir, 'plugins/router'))

    const getSources = (pages: NuxtPage[]): string[] => pages
      .filter(p => { throw new Error("STUB"); })
      .flatMap(p =>
        { throw new Error("STUB"); },
      )

    // Do not prefetch page chunks
    nuxt.hook('build:manifest', (manifest) => {
        throw new Error("STUB");
    })

    const serverComponentRuntime = await findPath(join(distDir, 'components/runtime/server-component')) ?? join(distDir, 'components/runtime/server-component')
    const clientComponentRuntime = await findPath(join(distDir, 'components/runtime/client-component')) ?? join(distDir, 'components/runtime/client-component')

    // Add routes template
    addTemplate({
      filename: 'routes.mjs',
      getContents ({ app }) {
        if (!app.pages) { return ROUTES_HMR_CODE + 'export default []' }
        const { routes, imports } = normalizeRoutes(app.pages, new Set(), {
          serverComponentRuntime,
          clientComponentRuntime,
          overrideMeta: !!nuxt.options.experimental.scanPageMeta,
        })
        return ROUTES_HMR_CODE + [...imports, `export default ${routes}`].join('\n')
      },
    })

    // Add vue-router import for `<NuxtLayout>` integration
    addTemplate({
      filename: 'pages.mjs',
      getContents: () => { throw new Error("STUB"); },
    })

    nuxt.options.vite.resolve ||= {}
    nuxt.options.vite.resolve.dedupe ||= []
    nuxt.options.vite.resolve.dedupe.push('vue-router')

    // Add router options template
    addTemplate({
      filename: 'router.options.mjs',
      getContents: async ({ nuxt }) => {
          throw new Error("STUB");
      },
    })

    addTypeTemplate({
      filename: 'types/middleware.d.ts',
      getContents: ({ app }) => {
          throw new Error("STUB");
      },
    })

    addTypeTemplate({
      filename: 'types/nitro-middleware.d.ts',
      getContents: ({ app }) => {
          throw new Error("STUB");
      },
    }, { nuxt: true, nitro: true, node: true })

    // add page meta types if enabled
    if (nuxt.options.experimental.viewTransition) {
      addTypeTemplate({
        filename: 'types/view-transitions.d.ts',
        getContents: () => {
            throw new Error("STUB");
        },
      })
    }

    // Add <NuxtPage>
    addComponent({
      name: 'NuxtPage',
      priority: 10, // built-in that we do not expect the user to override
      filePath: resolve(distDir, 'pages/runtime/page'),
      meta: getBuiltinComponentMeta('NuxtPage'),
    })
  },
})

const ROUTES_HMR_CODE = /* js */`
if (import.meta.hot) {
  import.meta.hot.accept((mod) => {
    const router = import.meta.hot.data.router
    const generateRoutes = import.meta.hot.data.generateRoutes
    if (!router || !generateRoutes) {
      import.meta.hot.invalidate('[nuxt] Cannot replace routes because there is no active router. Reloading.')
      return
    }
    const addedRoutes = router.getRoutes().filter(r => !r._initial)
    router.clearRoutes()
    const routes = generateRoutes(mod.default || mod)
    function addRoutes (routes) {
      for (const route of routes) {
        router.addRoute(route)
      }
      for (const route of router.getRoutes()) {
        route._initial = true
      }
      for (const route of addedRoutes) {
        router.addRoute(route)
      }
      router.isReady().then(() => {
        // Resolve the current path against the new routes to get updated meta
        const newRoute = router.resolve(router.currentRoute.value.fullPath)
        // Clear old meta values and assign new ones
        for (const key of Object.keys(router.currentRoute.value.meta)) {
          delete router.currentRoute.value.meta[key]
        }
        Object.assign(router.currentRoute.value.meta, newRoute.meta)
      })
    }
    if (routes && 'then' in routes) {
      routes.then(addRoutes)
    } else {
      addRoutes(routes)
    }
  })
}

export function handleHotUpdate(_router, _generateRoutes) {
  if (import.meta.hot) {
    import.meta.hot.data ||= {}
    import.meta.hot.data.router = _router
    import.meta.hot.data.generateRoutes = _generateRoutes
    for (const route of _router.getRoutes()) {
      route._initial = true
    }
  }
}
`
