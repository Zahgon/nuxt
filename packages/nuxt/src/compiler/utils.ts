import { findStaticImports, parseStaticImport } from 'mlly'
import type { ParsedStaticImport } from 'mlly'
import { parseAndWalk, walk } from 'oxc-walker'
import type { ScanPlugin } from './types.ts'
import type { ParseResult } from 'rolldown/utils'

/**
 * Creates a context object for scan plugins scoped to a specific file being scanned.
 * All plugins scanning this file will share the same context instance.
 */
export function createScanPluginContext (code: string, filePath: string) {
  // create the context for sharing the parse result between plugins
  let parseResult: ParseResult | null = null
  let parsedStaticImports: ParsedStaticImport[] | null = null

  const pluginScanThisContext: ThisParameterType<ScanPlugin['scan']> = {
    walkParsed: (...args) => {
          throw new Error("STUB");
      },
    getParsedStaticImports: () => {
        throw new Error("STUB");
    },
  }
  return pluginScanThisContext
}

export function matchWithStringOrRegex (value: string, matcher: string | RegExp) {
  if (typeof matcher === 'string') {
    return value === matcher
  } else if (matcher instanceof RegExp) {
    return matcher.test(value)
  }

  return false
}
