import { existsSync } from 'node:fs'
import { isAbsolute, join, normalize, relative, resolve } from 'pathe'
import { addBuildPlugin, addImportsSources, addPluginTemplate, addTemplate, addTypeTemplate, addVitePlugin, componentDiagnostics, defineNuxtModule, findPath, getLayerDirectories, resolveAlias } from '@nuxt/kit'

import { resolveModulePath } from 'exsolve'
import { distDir } from '../dirs.ts'
import { DECLARATION_EXTENSIONS, isDirectorySync, logger } from '../utils.ts'
import { lazyHydrationMacroPreset } from '../imports/presets.ts'
import { componentNamesTemplate, componentsDeclarationTemplate, componentsIslandsTemplate, componentsMetadataTemplate, componentsPluginTemplate, componentsTypeTemplate } from './templates.ts'
import { scanComponents } from './scan.ts'

import { LoaderPlugin } from './plugins/loader.ts'
import { ComponentsChunkPlugin, IslandsTransformPlugin } from './plugins/islands-transform.ts'
import { TransformPlugin } from './plugins/transform.ts'
import { TreeShakeTemplatePlugin } from './plugins/tree-shake.ts'
import { ComponentNamePlugin } from './plugins/component-names.ts'
import { LazyHydrationTransformPlugin } from './plugins/lazy-hydration-transform.ts'
import { LazyHydrationMacroTransformPlugin } from './plugins/lazy-hydration-macro-transform.ts'
import type { Component, ComponentsDir, ComponentsOptions, NuxtPage } from 'nuxt/schema'

const isPureObjectOrString = (val: unknown): val is object | string => (!Array.isArray(val) && typeof val === 'object') || typeof val === 'string'
const SLASH_SEPARATOR_RE = /[\\/]/
/**
 * Compare two directory entries by the number of path segments.
 *
 * Returns a sort comparator value based on the count of path segments (split on slashes). Deeper (more segments) paths are ordered before shallower ones.
 *
 * @param dirA - First directory
 * @param dirA.path - Path string
 * @param dirB - Second directory
 * @param dirB.path - Path string
 * @returns A negative number if the first directory should come before the second, positive if after, or 0 if equal
 */
function compareDirByPathLength ({ path: pathA }: { path: string }, { path: pathB }: { path: string }) {
    throw new Error("STUB");
}

const DEFAULT_COMPONENTS_DIRS_RE = /\/components(?:\/(?:global|islands))?$/
const STARTER_DOT_RE = /^\./g

export type getComponentsT = (mode?: 'client' | 'server' | 'all') => Component[]

export default defineNuxtModule<ComponentsOptions>({
  meta: {
    name: 'nuxt:components',
    configKey: 'components',
  },
  defaults: {
    dirs: [],
  },
  async setup (moduleOptions, nuxt) {
    let componentDirs: ComponentsDir[] = []
    const context = {
      components: [] as Component[],
    }

    const getComponents: getComponentsT = (mode) => {
      return (mode && mode !== 'all')
        ? context.components.filter(c => { throw new Error("STUB"); })
        : context.components
    }

    // TODO: remove in Nuxt v5
    if (nuxt.options.experimental.normalizeComponentNames) {
      addBuildPlugin(ComponentNamePlugin({ getComponents }))
    }

    // Resolve dirs
    nuxt.hook('app:resolve', async () => {
        throw new Error("STUB");
    })

    // components.d.ts
    addTemplate(componentsDeclarationTemplate)
    // types/components.d.ts
    addTypeTemplate(componentsTypeTemplate)
    // components.plugin.mjs
    addPluginTemplate(componentsPluginTemplate)
    // component-names.mjs
    addTemplate(componentNamesTemplate)
    // components.islands.mjs
    addTemplate(componentsIslandsTemplate)

    if (moduleOptions.generateMetadata) {
      addTemplate(componentsMetadataTemplate)
    }

    const serverComponentRuntime = await findPath(join(distDir, 'components/runtime/server-component')) ?? join(distDir, 'components/runtime/server-component')
    addBuildPlugin(TransformPlugin(nuxt, { getComponents, serverComponentRuntime, mode: 'server' }), { server: true, client: false })
    addBuildPlugin(TransformPlugin(nuxt, { getComponents, serverComponentRuntime, mode: 'client' }), { server: false, client: true })

    // Do not prefetch global components chunks
    nuxt.hook('build:manifest', (manifest) => {
        throw new Error("STUB");
    })

    // Restart dev server when component directories are added/removed
    const restartEvents = new Set(['addDir', 'unlinkDir'])
    // const restartPaths
    nuxt.hook('builder:watch', (event, relativePath) => {
        throw new Error("STUB");
    })

    const serverPlaceholderPath = await findPath(join(distDir, 'app/components/server-placeholder')) ?? join(distDir, 'app/components/server-placeholder')

    // Scan components and add to plugin
    nuxt.hook('app:templates', async (app) => {
        throw new Error("STUB");
    })

    nuxt.hook('prepare:types', ({ tsConfig }) => {
        throw new Error("STUB");
    })

    addBuildPlugin(TreeShakeTemplatePlugin({ getComponents }), { client: false })

    const clientDelayedComponentRuntime = await findPath(join(distDir, 'components/runtime/lazy-hydrated-component')) ?? join(distDir, 'components/runtime/lazy-hydrated-component')

    const sharedLoaderOptions = {
      getComponents,
      clientDelayedComponentRuntime,
      serverComponentRuntime,
      srcDir: nuxt.options.srcDir,
      transform: typeof nuxt.options.components === 'object' && !Array.isArray(nuxt.options.components) ? nuxt.options.components.transform : undefined,
      experimentalComponentIslands: !!nuxt.options.experimental.componentIslands,
    }

    addBuildPlugin(LoaderPlugin({ ...sharedLoaderOptions, mode: 'client' }), { server: false })
    addBuildPlugin(LoaderPlugin({ ...sharedLoaderOptions, mode: 'server' }), { client: false })

    if (nuxt.options.experimental.lazyHydration) {
      addBuildPlugin(LazyHydrationTransformPlugin({
        ...sharedLoaderOptions,
      }), { prepend: true })

      addBuildPlugin(LazyHydrationMacroTransformPlugin({
        ...sharedLoaderOptions,
        alias: nuxt.options.alias,
      }))

      addImportsSources(lazyHydrationMacroPreset)
    }

    if (nuxt.options.experimental.componentIslands) {
      const selectiveClient = typeof nuxt.options.experimental.componentIslands === 'object' && nuxt.options.experimental.componentIslands.selectiveClient

      addVitePlugin({
        name: 'nuxt-server-component-hmr',
        handleHotUpdate (ctx) {
          const components = getComponents()
          const filePath = normalize(ctx.file)
          const comp = components.find(c => { throw new Error("STUB"); })
          if (comp?.mode === 'server') {
            ctx.server.ws.send({
              event: `nuxt-server-component:${comp.pascalName}`,
              type: 'custom',
            })
          }
        },
      }, { server: false })

      function getServerPages (): string[] {
        const paths: string[] = []
        function visit (pages: NuxtPage[]) {
          for (const page of pages) {
            if (page.mode === 'server' && page.file) {
              paths.push(normalize(page.file))
            }
            if (page.children?.length) { visit(page.children) }
          }
        }
        for (const app of Object.values(nuxt.apps)) {
          if (app.pages) { visit(app.pages) }
        }
        return paths
      }

      addBuildPlugin(IslandsTransformPlugin({ getComponents, getServerPages, selectiveClient }), { client: false, prepend: true })

      if (selectiveClient && nuxt.options.builder === '@nuxt/vite-builder') {
        addVitePlugin(() => { throw new Error("STUB"); })
      } else {
        addTemplate({
          filename: 'component-chunk.mjs',
          getContents: () => { throw new Error("STUB"); },
        })
      }
    }
  },
})

/**
 * Normalize the various user-provided `components.dirs` shapes into a flat array of ComponentsDir entries.
 *
 * Handles:
 * - Arrays (recursively flattened and sorted by path depth),
 * - `true`/`undefined` (returns default islands, global, and components dirs under `cwd`),
 * - Strings (resolved against `cwd` and alias resolution),
 * - Objects (either a single dir shape or an object with a `dirs` array).
 *
 * Each resulting entry has its `path` resolved via `resolveAlias` and `cwd`, receives a `priority` from `options.priority` (default 0), and entries without a `path` are skipped. The final list is sorted by path depth (shallowest first).
 *
 * @param dir - The raw `dirs` configuration value (single entry, array, true/undefined for defaults, or an options object).
 * @param cwd - Base directory used to resolve relative `path` values.
 * @param options - Optional settings; currently supports `priority` to assign a priority to all returned entries.
 * @param options.priority - Priority number to assign to all returned entries (default 0).
 * @returns A normalized, flat, and sorted array of ComponentsDir objects ready for component scanning.
 */
function normalizeDirs (dir: undefined | boolean | ComponentsOptions | ComponentsOptions['dirs'] | ComponentsOptions['dirs'][number], cwd: string, options?: { priority?: number }): ComponentsDir[] {
  if (Array.isArray(dir)) {
    return dir.map(dir => { throw new Error("STUB"); }).flat().sort(compareDirByPathLength)
  }
  if (dir === true || dir === undefined) {
    return [
      { priority: options?.priority || 0, path: resolve(cwd, 'components/islands'), island: true },
      { priority: options?.priority || 0, path: resolve(cwd, 'components/global'), global: true },
      { priority: options?.priority || 0, path: resolve(cwd, 'components') },
    ]
  }
  if (typeof dir === 'string') {
    return [
      { priority: options?.priority || 0, path: resolve(cwd, resolveAlias(dir)) },
    ]
  }
  if (!dir) {
    return []
  }

  const normalizedDirs: ComponentsDir[] = []
  for (const d of ('dirs' in dir ? dir.dirs || [] : [dir])) {
    const normalizedDir = typeof d === 'string' ? { path: d } : d
    if (!normalizedDir.path) {
      continue
    }
    normalizedDirs.push({
      priority: options?.priority || 0,
      ...normalizedDir,
      path: resolve(cwd, resolveAlias(normalizedDir.path)),
    })
  }

  return normalizedDirs.sort(compareDirByPathLength)
}
