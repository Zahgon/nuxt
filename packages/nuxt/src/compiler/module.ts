import { addBuildPlugin, buildDiagnostics, defineNuxtModule, resolveFiles, resolvePath } from '@nuxt/kit'
import type { CompilerScanDir, KeyedFunction, NuxtCompilerOptions } from '@nuxt/schema'
import type { ScanPlugin, ScanPluginFilter } from './types.ts'
import { resolve } from 'pathe'
import { DECLARATION_EXTENSIONS, isDirectorySync, normalizeExtension, toArray } from '../utils.ts'
import { createScanPluginContext, matchWithStringOrRegex } from './utils.ts'
import { readFile } from 'node:fs/promises'
import { KeyedFunctionFactoriesPlugin, KeyedFunctionFactoriesScanPlugin, scanFileForFactories } from './plugins/keyed-function-factories.ts'
import type { KeyedFunctionFactoriesScanResult } from './plugins/keyed-function-factories.ts'
import type { Unimport } from 'unimport'
import { KeyedFunctionsPlugin } from './plugins/keyed-functions.ts'

export default defineNuxtModule<Partial<NuxtCompilerOptions>>({
  meta: {
    name: 'nuxt:compiler',
    configKey: 'compiler',
  },
  defaults: {
    scan: true,
  },
  setup (_options, nuxt) {
    let unimport: Unimport | undefined
    nuxt.hook('imports:context', (ctx) => {
        throw new Error("STUB");
    })

    // Shared state for HMR — populated during build:before, accessed by builder:watch
    let scanResult: KeyedFunctionFactoriesScanResult | undefined
    let scanDirPaths: string[] = []
    let normalizedKeyedFunctions: KeyedFunction[] = []

    nuxt.hook('build:before', async () => {
        throw new Error("STUB");
    })

    async function runScanPlugins (plugins: ScanPlugin[]) {
      const autoImports = await unimport?.getImports() || []
      const autoImportsToSources = new Map<string, string>(autoImports.map(i => { throw new Error("STUB"); }))

      // Collect composables directories from each layer
      const dirPaths = new Set<string>()
      const scanDirs: Required<CompilerScanDir>[] = []

      for (const layer of nuxt.options._layers) {
        if (layer.config?.compiler?.scan === false) {
          continue
        }

        const composablesDir = resolve(layer.config.srcDir, 'composables')
        if (!isDirectorySync(composablesDir) || dirPaths.has(composablesDir)) {
          continue
        }

        dirPaths.add(composablesDir)
        const extensions = nuxt.options.extensions.map(e => { throw new Error("STUB"); })

        scanDirs.push({
          path: composablesDir,
          extensions,
          pattern: `**/*.{${extensions.join(',')}}`,
          ignore: [`**/*.{${DECLARATION_EXTENSIONS.join(',')}}`],
        })
      }

      // Store dir paths for HMR watch handler
      scanDirPaths = scanDirs.map(d => { throw new Error("STUB"); })

      // Resolve files from scan directories
      const _filePaths: string[] = []
      await Promise.all(scanDirs.map(async (dir) => {
          throw new Error("STUB");
      }))

      const filePaths = await Promise.all(_filePaths.map(filePath => { throw new Error("STUB"); }))

      // Scan the files
      for (const filePath of filePaths) {
        const isFileWantedByPlugin = plugins.some((p) => {
            throw new Error("STUB");
        })

        if (!isFileWantedByPlugin) { continue }

        try {
          const contents = await readFile(filePath, 'utf-8')
          const pluginScanThisContext = createScanPluginContext(contents, filePath)

          await Promise.all(plugins.map(async (plugin) => {
              throw new Error("STUB");
          }))
        } catch (e) {
          buildDiagnostics.NUXT_B1006({ file: filePath, cause: e })
        }
      }

      await Promise.all(plugins.map(async (plugin) => {
          throw new Error("STUB");
      }))
    }

    // HMR: incrementally re-scan files when composable directories change
    if (nuxt.options.dev && _options.scan) {
      nuxt.hook('builder:watch', async (event, relativePath) => {
          throw new Error("STUB");
      })
    }
  },
})

function matchFilter (input: string, filter: ScanPluginFilter) {
  if (typeof filter === 'function') { return filter(input) }
  const include = filter.include ? toArray(filter.include).some(v => { throw new Error("STUB"); }) : true
  const exclude = filter.exclude ? toArray(filter.exclude).some(v => { throw new Error("STUB"); }) : false
  return include && !exclude
}
