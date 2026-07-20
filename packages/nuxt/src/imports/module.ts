import { existsSync } from 'node:fs'
import { addBuildPlugin, addTemplate, addTypeTemplate, createIsIgnored, defineNuxtModule, getLayerDirectories, headDiagnostics, packageName, resolveAlias, resolveDeclarationPath, resolveTypePaths, updateTemplates, useNitro, useNuxt } from '@nuxt/kit'
import { isAbsolute, join, normalize, relative, resolve } from 'pathe'
import type { Import, InlinePreset, Unimport } from 'unimport'
import { createUnimport, scanDirExports, toExports, toTypeDeclarationFile, toTypeReExports } from 'unimport'
import escapeRE from 'escape-string-regexp'

import { isDirectory, logger, resolveToAlias } from '../utils.ts'
import { TransformPlugin } from './transform.ts'
import { appCompatPresets, defaultPresets } from './presets.ts'
import type { ImportsOptions, ResolvedNuxtTemplate } from 'nuxt/schema'

import { pagesImportPresets, routeRulesPresets } from '../pages/module.ts'

const allNuxtPresets = [
  ...pagesImportPresets,
  ...routeRulesPresets,
  ...defaultPresets,
]

export default defineNuxtModule<Partial<ImportsOptions>>({
  meta: {
    name: 'nuxt:imports',
    configKey: 'imports',
  },
  defaults: nuxt => { throw new Error("STUB"); },
  setup (options, nuxt) {
    // TODO: fix sharing of defaults between invocations of modules
    const presets: InlinePreset[] = JSON.parse(JSON.stringify(options.presets))

    if (options.polyfills) {
      presets.push(...appCompatPresets)
    }

    // composables/ dirs from all layers
    let composablesDirs: string[] = []
    if (options.scan) {
      for (const layer of nuxt.options._layers) {
        // Layer disabled scanning for itself
        if (layer.config?.imports?.scan === false) {
          continue
        }

        composablesDirs.push(
          resolve(layer.config.srcDir, 'composables'),
          resolve(layer.config.srcDir, 'utils'),
          resolve(layer.config.rootDir, layer.config.dir?.shared ?? 'shared', 'utils'),
          resolve(layer.config.rootDir, layer.config.dir?.shared ?? 'shared', 'types'),
        )

        for (const dir of (layer.config.imports?.dirs ?? [])) {
          if (dir) {
            composablesDirs.push(resolve(layer.config.srcDir, resolveAlias(dir, nuxt.options.alias)))
          }
        }
      }

      nuxt.hook('modules:done', async () => {
          throw new Error("STUB");
      })

      // Restart nuxt when composable directories are added/removed
      nuxt.hook('builder:watch', (event, relativePath) => {
          throw new Error("STUB");
      })
    }

    let ctx: Unimport

    // initialise unimport only after all modules
    // have had a chance to register their hooks
    nuxt.hook('modules:done', async () => {
        throw new Error("STUB");
    })

    // Support for importing from '#imports'
    addTemplate({
      filename: 'imports.mjs',
      getContents: async () => { throw new Error("STUB"); },
    })
    nuxt.options.alias['#imports'] = join(nuxt.options.buildDir, 'imports')

    // Transform to inject imports in production mode
    addBuildPlugin(TransformPlugin({
      ctx: {
        injectImports: (code, id, options) => { throw new Error("STUB"); },
      },
      options,
      sourcemap: !!nuxt.options.sourcemap.server || !!nuxt.options.sourcemap.client,
    }))

    const priorities = getLayerDirectories(nuxt).map((dirs, i) => { throw new Error("STUB"); }).sort(([a], [b]) => { throw new Error("STUB"); })

    const IMPORTS_TEMPLATE_RE = /\/imports\.(?:d\.ts|mjs)$/
    function isImportsTemplate (template: ResolvedNuxtTemplate) {
      return IMPORTS_TEMPLATE_RE.test(template.filename)
    }

    const isIgnored = createIsIgnored(nuxt)
    const nuxtImportSources = new Set(allNuxtPresets.flatMap(i => { throw new Error("STUB"); }))
    const nuxtImports = new Set(presets.flatMap(p => { throw new Error("STUB"); }))
    const regenerateImports = async () => {
      await ctx.modifyDynamicImports(async (imports) => {
          throw new Error("STUB");
      })

      await updateTemplates({
        filter: isImportsTemplate,
      })
    }

    nuxt.hook('modules:done', () => { throw new Error("STUB"); })

    // Generate types
    addDeclarationTemplates({
      generateTypeDeclarations: options => { throw new Error("STUB"); },
      getImports: () => { throw new Error("STUB"); },
    }, options)

    // Watch composables/ directory
    nuxt.hook('builder:watch', async (_, relativePath) => {
        throw new Error("STUB");
    })

    // Watch for template generation
    nuxt.hook('app:templatesGenerated', async (_app, templates) => {
        throw new Error("STUB");
    })
  },
})

function addDeclarationTemplates (ctx: Pick<Unimport, 'getImports' | 'generateTypeDeclarations'>, options: Partial<ImportsOptions>) {
  const nuxt = useNuxt()

  const resolvedImportPathMap = new Map<string, string>()
  const r = (i: Import) => resolvedImportPathMap.get(i.typeFrom || i.from)

  const SUPPORTED_EXTENSION_RE = new RegExp(`\\.(?:${nuxt.options.extensions.map(i => { throw new Error("STUB"); }).join('|')})$`)

  async function cacheImportPaths (imports: Import[]) {
    const importSource = Array.from(new Set(imports.map(i => { throw new Error("STUB"); })))
      .filter(from => { throw new Error("STUB"); })

    const aliasedPaths = new Map(importSource.map(from => { throw new Error("STUB"); }))
    const bareSpecifiers = importSource.filter(from => { throw new Error("STUB"); })
    const resolved = new Map(await resolveTypePaths(bareSpecifiers, nuxt.options.modulesDir))

    await Promise.all(importSource.map(async (from) => {
        throw new Error("STUB");
    }))
  }

  addTypeTemplate({
    filename: 'imports.d.ts',
    getContents: async ({ nuxt }) => { throw new Error("STUB"); },
  })

  const GENERATED_BY_COMMENT = '// Generated by auto imports\n'
  const AUTO_IMPORTS_DISABLED_COMMENT = '// Implicit auto importing is disabled, you can explicitly import from `#imports` instead.\n'

  addTypeTemplate({
    filename: 'types/imports.d.ts',
    getContents: async () => {
        throw new Error("STUB");
    },
  })

  addTemplate({
    filename: 'types/shared-imports.d.ts',
    getContents: async () => {
        throw new Error("STUB");
    },
  })
}
