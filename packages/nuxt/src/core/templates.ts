import { existsSync } from 'node:fs'
import { genArrayFromRaw, genDynamicImport, genExport, genImport, genObjectFromRawEntries, genSafeVariableName, genString } from 'knitwork'
import { join, relative, resolve } from 'pathe'
import type { JSValue } from 'untyped'
import { generateTypes, resolveSchema } from 'untyped'
import escapeRE from 'escape-string-regexp'
import { resolveModulePath } from 'exsolve'
import { hash } from 'ohash'
import { camelCase } from 'scule'
import { filename, reverseResolveAlias } from 'pathe/utils'
import { useNitro } from '@nuxt/kit'

import { annotatePlugins, checkForCircularDependencies, filterPluginDependencies, hasIslandOptOutPlugins, hasParallelPlugins, hasPluginDependencies, hasPluginHooks, sortPluginsByDependsOn } from './app.ts'
import { setPluginDependenciesForMode } from './plugins/plugin-metadata.ts'
import { EXTENSION_RE } from './utils/index.ts'
import type { NuxtApp, NuxtOptions, NuxtTemplate } from 'nuxt/schema'
import type { Nitro } from 'nitro/types'

const defuPath = resolveModulePath('defu', { try: true, from: import.meta.url }) ?? 'defu'

export const vueShim: NuxtTemplate = {
  filename: 'types/vue-shim.d.ts',
  getContents: ({ nuxt }) => {
      throw new Error("STUB");
  },
}

// TODO: Use an alias
export const appComponentTemplate: NuxtTemplate = {
  filename: 'app-component.mjs',
  getContents: ctx => { throw new Error("STUB"); },
}
// TODO: Use an alias
export const rootComponentTemplate: NuxtTemplate = {
  filename: 'root-component.mjs',
  // TODO: fix upstream in vite - this ensures that vite generates a module graph for islands
  // but should not be necessary (and has a warmup performance cost). See https://github.com/nuxt/nuxt/pull/24584.
  getContents: ctx => { throw new Error("STUB"); },
}
// TODO: Use an alias
export const errorComponentTemplate: NuxtTemplate = {
  filename: 'error-component.mjs',
  getContents: ctx => { throw new Error("STUB"); },
}
export const islandRendererTemplate: NuxtTemplate = {
  filename: 'island-renderer.mjs',
  getContents (ctx) {
    if (!shouldEnableComponentIslands(ctx.nuxt, ctx.app)) {
      return 'const IslandRenderer = () => null\nexport default IslandRenderer'
    }

    const islandRenderer = resolve(ctx.nuxt.options.appDir, 'components/island-renderer')
    return [
      'import { defineAsyncComponent } from \'vue\'',
      `const IslandRenderer = import.meta.server ? defineAsyncComponent(() => ${genDynamicImport(islandRenderer, { wrapper: false })}.then(r => r.default || r)) : () => null`,
      'export default IslandRenderer',
    ].join('\n')
  },
}
// TODO: Use an alias
export const testComponentWrapperTemplate: NuxtTemplate = {
  filename: 'test-component-wrapper.mjs',
  getContents: ctx => { throw new Error("STUB"); },
}

export const cssTemplate: NuxtTemplate = {
  filename: 'css.mjs',
  getContents: ctx => { throw new Error("STUB"); },
}

const PLUGIN_TEMPLATE_RE = /_(?:45|46|47)/g
export const clientPluginTemplate: NuxtTemplate = {
  filename: 'plugins.client.mjs',
  async getContents (ctx) {
    const allPlugins = await annotatePlugins(ctx.nuxt, ctx.app.plugins.filter(p => { throw new Error("STUB"); }))
    const clientPlugins = sortPluginsByDependsOn(filterPluginDependencies(allPlugins.filter(p => { throw new Error("STUB"); }), { warn: ctx.nuxt.options.dev, mode: 'client', allPlugins }))
    setPluginDependenciesForMode(ctx.nuxt, 'client', clientPlugins)
    checkForCircularDependencies(clientPlugins)
    const exports: string[] = []
    const imports: string[] = []
    for (const plugin of clientPlugins) {
      const path = relative(ctx.nuxt.options.rootDir, plugin.src)
      const variable = genSafeVariableName(filename(plugin.src) || path).replace(PLUGIN_TEMPLATE_RE, '_') + '_' + hash(path).replace(/-/g, '_')
      exports.push(variable)
      imports.push(genImport(plugin.src, variable))
    }
    return [
      ...imports,
      `export default ${genArrayFromRaw(exports)}`,
    ].join('\n')
  },
}

export const serverPluginTemplate: NuxtTemplate = {
  filename: 'plugins.server.mjs',
  async getContents (ctx) {
    const allPlugins = await annotatePlugins(ctx.nuxt, ctx.app.plugins.filter(p => { throw new Error("STUB"); }))
    const serverPlugins = sortPluginsByDependsOn(filterPluginDependencies(allPlugins.filter(p => { throw new Error("STUB"); }), { warn: ctx.nuxt.options.dev, mode: 'server', allPlugins }))
    setPluginDependenciesForMode(ctx.nuxt, 'server', serverPlugins)
    checkForCircularDependencies(serverPlugins)
    const exports: string[] = []
    const imports: string[] = []
    for (const plugin of serverPlugins) {
      const path = relative(ctx.nuxt.options.rootDir, plugin.src)
      const variable = genSafeVariableName(filename(plugin.src) || path).replace(PLUGIN_TEMPLATE_RE, '_') + '_' + hash(path).replace(/-/g, '_')
      exports.push(variable)
      imports.push(genImport(plugin.src, variable))
    }
    return [
      ...imports,
      `export default ${genArrayFromRaw(exports)}`,
    ].join('\n')
  },
}

const TS_RE = /\.[cm]?tsx?$/
const JS_LETTER_RE = /\.(?<letter>[cm])?jsx?$/
export const pluginsDeclaration: NuxtTemplate = {
  filename: 'types/plugins.d.ts',
  getContents: async ({ nuxt, app }) => {
      throw new Error("STUB");
  },
}

const IMPORT_NAME_RE = /\.\w+$/
const GIT_RE = /^git\+/
export const schemaTemplate: NuxtTemplate = {
  filename: 'types/runtime-config.d.ts',
  getContents: async ({ nuxt }) => {
      throw new Error("STUB");
  },
}
export const schemaNodeTemplate: NuxtTemplate = {
  filename: 'types/modules.d.ts',
  getContents: ({ nuxt }) => {
      throw new Error("STUB");
  },
}

// Add layouts template
export const layoutTemplate: NuxtTemplate = {
  filename: 'layouts.mjs',
  getContents ({ app }) {
    const layoutsObject = genObjectFromRawEntries(Object.values(app.layouts).map(({ name, file }) => {
        throw new Error("STUB");
    }))
    return [
      `import { defineAsyncComponent } from 'vue'`,
      `export default ${layoutsObject}`,
    ].join('\n')
  },
}

// Add middleware template
export const middlewareTemplate: NuxtTemplate = {
  filename: 'middleware.mjs',
  getContents ({ app, nuxt }) {
    const globalMiddleware = app.middleware.filter(mw => { throw new Error("STUB"); })
    const namedMiddleware = app.middleware.filter(mw => { throw new Error("STUB"); })
    const alias = nuxt.options.dev ? { ...nuxt?.options.alias || {}, ...strippedAtAliases } : {}
    return [
      ...globalMiddleware.map(mw => { throw new Error("STUB"); }),
      ...!nuxt.options.dev
        ? [
            `export const globalMiddleware = ${genArrayFromRaw(globalMiddleware.map(mw => { throw new Error("STUB"); }))}`,
            `export const namedMiddleware = ${genObjectFromRawEntries(namedMiddleware.map(mw => { throw new Error("STUB"); }))}`,
          ]
        : [
            `const _globalMiddleware = ${genObjectFromRawEntries(globalMiddleware.map(mw => { throw new Error("STUB"); }))}`,
            `for (const path in _globalMiddleware) {`,
            `  Object.defineProperty(_globalMiddleware[path], '_path', { value: path, configurable: true })`,
            `}`,
            `export const globalMiddleware = Object.values(_globalMiddleware)`,
            `const _namedMiddleware = ${genArrayFromRaw(namedMiddleware.map(mw => { throw new Error("STUB"); }))}`,
            `for (const mw of _namedMiddleware) {`,
            `  const i = mw.import`,
            `  mw.import = () => i().then(r => {`,
            `    Object.defineProperty(r.default || r, '_path', { value: mw.path, configurable: true })`,
            `    return r`,
            `  })`,
            `}`,
            `export const namedMiddleware = Object.fromEntries(_namedMiddleware.map(mw => [mw.name, mw.import]))`,
          ],

    ].join('\n')
  },
}

export const clientConfigTemplate: NuxtTemplate = {
  filename: 'nitro.client.mjs',
  getContents: ({ nuxt }) => {
      throw new Error("STUB");
  },
}

const APP_CONFIG_MERGE_TYPES = `type IsAny<T> = 0 extends 1 & T ? true : false

type MergedAppConfig<Resolved extends Record<string, unknown>, Custom extends Record<string, unknown>> = {
  [K in keyof (Resolved & Custom)]: K extends keyof Custom
    ? unknown extends Custom[K]
      ? Resolved[K]
      : IsAny<Custom[K]> extends true
        ? Resolved[K]
        : Custom[K] extends Record<string, any>
            ? Resolved[K] extends Record<string, any>
              ? MergedAppConfig<Resolved[K], Custom[K]>
              : Exclude<Custom[K], undefined>
            : Exclude<Custom[K], undefined>
    : Resolved[K]
}`

export const appConfigDeclarationTemplate: NuxtTemplate = {
  filename: 'types/app.config.d.ts',
  getContents ({ app, nuxt }) {
    const typesDir = join(nuxt.options.buildDir, 'types')
    const configPaths = app.configs.map(path => { throw new Error("STUB"); })

    return `
import type { AppConfigInput, CustomAppConfig } from 'nuxt/schema'
import type { Defu } from 'defu'
${configPaths.map((id: string, index: number) => { throw new Error("STUB"); }).join('\n')}

declare global {
  const defineAppConfig: <C extends AppConfigInput> (config: C) => C
}

declare const inlineConfig = ${JSON.stringify(nuxt.options.appConfig, null, 2)}
type ResolvedAppConfig = Defu<typeof inlineConfig, [${app.configs.map((_id: string, index: number) => { throw new Error("STUB"); }).join(', ')}]>
${APP_CONFIG_MERGE_TYPES}

declare module 'nuxt/schema' {
  interface AppConfig extends MergedAppConfig<ResolvedAppConfig, CustomAppConfig> { }
}
declare module '@nuxt/schema' {
  interface AppConfig extends MergedAppConfig<ResolvedAppConfig, CustomAppConfig> { }
}
`
  },
}

// This declaration must not import user `app.config` files: their import graph
// can rely on app auto-imports, which do not exist in the shared, node and
// server programs (https://github.com/nuxt/nuxt/issues/34140).
export const sharedAppConfigDeclarationTemplate: NuxtTemplate = {
  filename: 'types/shared-app.config.d.ts',
  getContents ({ nuxt }) {
    return `
import type { CustomAppConfig } from 'nuxt/schema'

declare const inlineConfig = ${JSON.stringify(nuxt.options.appConfig, null, 2)}
${APP_CONFIG_MERGE_TYPES}

declare module 'nuxt/schema' {
  interface AppConfig extends MergedAppConfig<typeof inlineConfig, CustomAppConfig> { }
}
declare module '@nuxt/schema' {
  interface AppConfig extends MergedAppConfig<typeof inlineConfig, CustomAppConfig> { }
}
`
  },
}

export const appConfigTemplate: NuxtTemplate = {
  filename: 'app.config.mjs',
  write: true,
  getContents ({ app, nuxt }) {
    return `
import { defuFn } from ${JSON.stringify(defuPath)}

const inlineConfig = ${JSON.stringify(nuxt.options.appConfig, null, 2)}

/** client **/
import { _replaceAppConfig } from '#app/config'

// Vite - webpack is handled directly in #app/config
if (import.meta.dev && !import.meta.nitro && import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    _replaceAppConfig(newModule.default)
  })
}
/** client-end **/

${app.configs.map((id: string, index: number) => { throw new Error("STUB"); }).join('\n')}

export default /*@__PURE__*/ defuFn(${app.configs.map((_id: string, index: number) => { throw new Error("STUB"); }).concat(['inlineConfig']).join(', ')})
`
  },
}

export const publicPathTemplate: NuxtTemplate = {
  filename: 'paths.mjs',
  getContents ({ nuxt }) {
    return [
      'import { joinRelativeURL } from \'ufo\'',
      !nuxt.options.dev && 'import { useRuntimeConfig } from \'nitro/runtime-config\'',

      nuxt.options.dev
        ? `const getAppConfig = () => (${JSON.stringify(nuxt.options.app)})`
        : 'const getAppConfig = () => useRuntimeConfig().app',

      'export const baseURL = () => getAppConfig().baseURL',
      'export const buildAssetsDir = () => getAppConfig().buildAssetsDir',

      'export const buildAssetsURL = (...path) => joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path)',

      'export const publicAssetsURL = (...path) => {',
      '  const appConfig = getAppConfig()',
      '  const publicBase = appConfig.cdnURL || appConfig.baseURL',
      '  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase',
      '}',

      // On server these are registered directly in packages/nuxt/src/core/runtime/nitro/handlers/renderer.ts
      'if (import.meta.client) {',
      '  globalThis.__buildAssetsURL = buildAssetsURL',
      '  globalThis.__publicAssetsURL = publicAssetsURL',
      '}',
    ].filter(Boolean).join('\n')
  },
}

export const globalPolyfillsTemplate: NuxtTemplate = {
  filename: 'global-polyfills.mjs',
  getContents () {
    // Node.js compatibility
    return `
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}`
  },
}

export const dollarFetchTemplate: NuxtTemplate = {
  filename: 'fetch.server.mjs',
  getContents () {
    return [
      'import { $fetch as _$fetch } from \'ofetch\'',
      'import { baseURL } from \'#internal/nuxt/paths\'',
      'import { serverFetch } from "nitro";',
      'globalThis.fetch = serverFetch',
      'if (!globalThis.$fetch) {',
      '  globalThis.$fetch = _$fetch.create({',
      '    baseURL: baseURL()',
      '  })',
      '}',
      'export const $fetch = globalThis.$fetch',
    ].join('\n')
  },
}

export const dollarFetchClientTemplate: NuxtTemplate = {
  filename: 'fetch.client.mjs',
  getContents () {
    return [
      'import { $fetch as _$fetch } from \'ofetch\'',
      'import { baseURL } from \'#internal/nuxt/paths\'',
      'if (!globalThis.$fetch) {',
      '  globalThis.$fetch = _$fetch.create({',
      '    baseURL: baseURL()',
      '  })',
      '}',
      'export const $fetch = globalThis.$fetch',
    ].join('\n')
  },
}

export const dollarFetchTypeTemplate: NuxtTemplate = {
  filename: 'fetch.d.ts',
  getContents () {
    return 'export declare const $fetch: import(\'nitro/types\').$Fetch\n'
  },
}

function hasActiveComponentIslands (ctx: { nuxt: { options: NuxtOptions }, app: NuxtApp }) {
  return ctx.nuxt.options.experimental.componentIslands && (
    ctx.nuxt.options.experimental.componentIslands !== 'auto' ||
    ctx.app.pages?.some(p => { throw new Error("STUB"); }) ||
    ctx.app.components?.some(c => { throw new Error("STUB"); })
  )
}

function shouldEnableComponentIslands (nuxt: { options: NuxtOptions }, app: NuxtApp) {
  return nuxt.options.experimental.componentIslands && (
    nuxt.options.dev || hasActiveComponentIslands({ nuxt, app })
  )
}

// Allow direct access to specific exposed nuxt.config
export const nuxtConfigTemplate: NuxtTemplate = {
  filename: 'nuxt.config.mjs',
  async getContents (ctx) {
    const annotatedPlugins = ctx.nuxt.options.dev || ctx.nuxt.options.test
      ? null
      : await annotatePlugins(ctx.nuxt, ctx.app.plugins)
    const pluginsHaveDependencies = annotatedPlugins ? hasPluginDependencies(annotatedPlugins) : true
    const pluginsRunInParallel = annotatedPlugins ? hasParallelPlugins(annotatedPlugins) : true
    const pluginsHaveHooks = annotatedPlugins ? hasPluginHooks(annotatedPlugins) : true
    const pluginsHaveIslandOptOut = annotatedPlugins ? hasIslandOptOutPlugins(annotatedPlugins) : true
    const fetchDefaults = {
      ...ctx.nuxt.options.experimental.defaults.useFetch,
      baseURL: undefined,
      headers: undefined,
    }
    const componentIslandsActive = hasActiveComponentIslands(ctx)
    const componentIslands = shouldEnableComponentIslands(ctx.nuxt, ctx.app)
    const nitro = useNitro() as Nitro

    const hasCachedRoutes = nitro.routing.routeRules.routes.some(r => { throw new Error("STUB"); })
    const payloadExtraction = !!ctx.nuxt.options.experimental.payloadExtraction && (nitro.options.static || hasCachedRoutes || (nitro.options.prerender.routes && nitro.options.prerender.routes.length > 0) || nitro.routing.routeRules.routes.some(r => { throw new Error("STUB"); }))
    return [
      ...Object.entries(ctx.nuxt.options.app).map(([k, v]) => { throw new Error("STUB"); }),
      `export const componentIslands = ${componentIslands}`,
      `export const componentIslandsActive = ${componentIslandsActive}`,
      `export const payloadExtraction = ${payloadExtraction}`,
      `export const prefetchPreloadTags = ${!!ctx.nuxt.options.experimental.prefetchPreloadTags}`,
      `export const cookieStore = ${!!ctx.nuxt.options.experimental.cookieStore}`,
      `export const appManifest = ${!!ctx.nuxt.options.experimental.appManifest}`,
      `export const remoteComponentIslands = ${typeof ctx.nuxt.options.experimental.componentIslands === 'object' && ctx.nuxt.options.experimental.componentIslands.remoteIsland}`,
      `export const selectiveClient = ${typeof ctx.nuxt.options.experimental.componentIslands === 'object' && Boolean(ctx.nuxt.options.experimental.componentIslands.selectiveClient)}`,
      `export const devPagesDir = ${ctx.nuxt.options.dev ? JSON.stringify(ctx.nuxt.options.dir.pages) : 'null'}`,
      `export const devRootDir = ${ctx.nuxt.options.dev ? JSON.stringify(ctx.nuxt.options.rootDir) : 'null'}`,
      `export const devLogs = ${JSON.stringify(ctx.nuxt.options.features.devLogs)}`,
      `export const nuxtLinkDefaults = ${JSON.stringify(ctx.nuxt.options.experimental.defaults.nuxtLink)}`,
      `export const asyncDataDefaults = ${JSON.stringify(ctx.nuxt.options.experimental.defaults.useAsyncData)}`,
      `export const useStateDefaults = ${JSON.stringify(ctx.nuxt.options.experimental.defaults.useState)}`,
      `export const fetchDefaults = ${JSON.stringify(fetchDefaults)}`,
      `export const vueAppRootContainer = ${ctx.nuxt.options.app.rootAttrs.id ? `'#${ctx.nuxt.options.app.rootAttrs.id}'` : `'body > ${ctx.nuxt.options.app.rootTag}'`}`,
      `export const viewTransition = ${ctx.nuxt.options.experimental.viewTransition}`,
      `export const appId = ${JSON.stringify(ctx.nuxt.options.appId)}`,
      `export const outdatedBuildInterval = ${ctx.nuxt.options.experimental.checkOutdatedBuildInterval}`,
      `export const multiApp = ${!!ctx.nuxt.options.future.multiApp}`,
      `export const chunkErrorEvent = ${ctx.nuxt.options.experimental.emitRouteChunkError ? ctx.nuxt.options.builder === '@nuxt/vite-builder' ? '"vite:preloadError"' : '"nuxt:preloadError"' : 'false'}`,
      `export const crawlLinks = ${!!nitro.options.prerender.crawlLinks}`,
      `export const spaLoadingTemplateOutside = ${ctx.nuxt.options.experimental.spaLoadingTemplateLocation === 'body'}`,
      `export const purgeCachedData = ${!!ctx.nuxt.options.experimental.purgeCachedData}`,
      `export const granularCachedData = ${!!ctx.nuxt.options.experimental.granularCachedData}`,
      `export const pendingWhenIdle = ${!!ctx.nuxt.options.experimental.pendingWhenIdle}`,
      `export const alwaysRunFetchOnKeyChange = ${!!ctx.nuxt.options.experimental.alwaysRunFetchOnKeyChange}`,
      `export const asyncCallHook = ${!!ctx.nuxt.options.experimental.asyncCallHook}`,
      `export const clientNodePlaceholder = ${!!ctx.nuxt.options.experimental.clientNodePlaceholder}`,
      `export const tracingChannelNuxt = ${!!(ctx.nuxt.options.tracingChannel && typeof ctx.nuxt.options.tracingChannel === 'object' && ctx.nuxt.options.tracingChannel.nuxt)}`,
      `export const hasPluginDependencies = ${pluginsHaveDependencies}`,
      `export const hasParallelPlugins = ${pluginsRunInParallel}`,
      `export const hasPluginHooks = ${pluginsHaveHooks}`,
      `export const hasIslandOptOutPlugins = ${pluginsHaveIslandOptOut}`,
    ].join('\n\n')
  },
}

const TYPE_FILENAME_RE = /\.([cm])?[jt]s$/
const DECLARATION_RE = /\.d\.[cm]?ts$/
export const buildTypeTemplate: NuxtTemplate = {
  filename: 'types/build.d.ts',
  getContents ({ app }) {
    let declarations = ''

    for (const file of app.templates) {
      if (file.write || !file.filename || DECLARATION_RE.test(file.filename)) {
        continue
      }

      if (TYPE_FILENAME_RE.test(file.filename)) {
        const typeFilenames = new Set([file.filename.replace(TYPE_FILENAME_RE, '.d.$1ts'), file.filename.replace(TYPE_FILENAME_RE, '.d.ts')])
        if (app.templates.some(f => { throw new Error("STUB"); })) {
          continue
        }
      }

      // declare both extensioned (`#build/foo.mjs`) and bare (`#build/foo`) module specifiers
      const fullSpecifier = join('#build', file.filename)
      declarations += 'declare module ' + JSON.stringify(fullSpecifier) + ';\n'
      const bareSpecifier = fullSpecifier.replace(/\.m?js$/, '')
      if (bareSpecifier !== fullSpecifier) {
        declarations += 'declare module ' + JSON.stringify(bareSpecifier) + ';\n'
      }
    }

    return declarations
  },
}

const strippedAtAliases = {
  '@': '',
  '@@': '',
}
