import { createUnplugin } from 'unplugin'
import { generateTransform, rolldownString } from 'rolldown-string'
import { hash } from 'ohash'

import { isAbsolute, join, parse } from 'pathe'
import { camelCase } from 'scule'
import escapeRE from 'escape-string-regexp'
import { findStaticImports, parseStaticImport } from 'mlly'
import { ScopeTracker, type ScopeTrackerNode, parseAndWalk, walk } from 'oxc-walker'
import { buildDiagnostics, resolveAlias } from '@nuxt/kit'
import type { KeyedFunction } from '@nuxt/schema'
import type { ESTree } from 'rolldown/utils'

import { MACRO_QUERY_RE, NUXT_LIB_RE, STYLE_QUERY_RE, isWhitespace, stripExtension } from '../../utils.ts'
import { type FunctionCallMetadata, parseStaticExportIdentifiers, parseStaticFunctionCall, processImports } from '../../core/utils/parse-utils.ts'

interface KeyedFunctionsOptions {
  keyedFunctions: KeyedFunction[]
  getKeyedFunctions?: () => KeyedFunction[]
  alias: Record<string, string>
  // TODO: remove in Nuxt 5
  appDir: string
  dev?: boolean
}

const stringTypes: Array<string | undefined> = ['Literal', 'TemplateLiteral']
const SUPPORTED_EXT_RE = /^[^?]*\.(?:m?[jt]sx?|vue)(?:$|\?)/
const SCRIPT_RE = /(?<=<script[^>]*>)[\s\S]*?(?=<\/script>)/i
const NUXT_INJECTED_MARKER = '/* nuxt-injected */'

/**
 * Builds the lookup state from a list of keyed functions.
 *
 * Note: `namesToSourcesToFunctionMeta` is a global copy that maps exported names to sources.
 * It does NOT include local import renames — the transform handler builds per-file local
 * name mappings separately. The `source`s have resolved aliases and are without extensions.
 */
function buildKeyedFunctionsState (keyedFunctions: KeyedFunction[]) {
  const namesToSourcesToFunctionMeta = new Map<string, Map<string, KeyedFunction>>()
  // filenames (without extension) of files that have a `default` keyed function export
  const defaultExportSources = new Set<string>()

  for (const f of keyedFunctions) {
    let functionName = f.name
    const fnSource = stripExtension(f.source)

    if (f.name === 'default') {
      const parsedSource = parse(f.source)
      defaultExportSources.add(parsedSource.name)
      functionName = camelCase(parsedSource.name)
    }

    if (import.meta.dev) {
      const sourcesToFunctionMeta = namesToSourcesToFunctionMeta.get(functionName)
      const existingEntry = sourcesToFunctionMeta?.get(fnSource)
      if (existingEntry?.source && existingEntry.source === fnSource) {
        buildDiagnostics.NUXT_B1009({ functionName, name: f.name, source: f.source })
      }
    }

    let sourcesToFunctionMeta = namesToSourcesToFunctionMeta.get(functionName)
    if (!sourcesToFunctionMeta) {
      sourcesToFunctionMeta = new Map<string, KeyedFunction>()
      namesToSourcesToFunctionMeta.set(functionName, sourcesToFunctionMeta)
    }

    sourcesToFunctionMeta.set(fnSource, {
      ...f,
      source: fnSource,
    })
  }

  // resolved paths of all the sources WITHOUT EXTENSIONS
  const sources = new Set<string>()
  for (const sourcesToFunctionMeta of namesToSourcesToFunctionMeta.values()) {
    for (const f of sourcesToFunctionMeta.values()) {
      sources.add(f.source)
    }
  }

  // TODO: come up with a better way to include files importing a `default` export (imported name can be arbitrary)
  const codeIncludeRE = new RegExp(`\\b(${[...namesToSourcesToFunctionMeta.keys(), ...defaultExportSources].map(f => { throw new Error("STUB"); }).join('|')})\\b`)

  return { namesToSourcesToFunctionMeta, defaultExportSources, sources, codeIncludeRE }
}

export const KeyedFunctionsPlugin = (options: KeyedFunctionsOptions) => createUnplugin(() => {
    throw new Error("STUB");
})
