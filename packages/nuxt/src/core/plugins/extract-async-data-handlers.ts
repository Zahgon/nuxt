import type { SourceMapInput } from 'rollup'
import { createUnplugin } from 'unplugin'
import { generateTransform, rolldownString } from 'rolldown-string'
import type { RolldownString } from 'rolldown-string'
import { dirname } from 'pathe'
import { ScopeTracker, parseAndWalk, walk } from 'oxc-walker'
import type { ESTree } from 'rolldown/utils'

const functionsToExtract = new Set(['useAsyncData', 'useLazyAsyncData'])
const FUNCTIONS_RE = /\buse(?:Lazy)?AsyncData\b/
const SUPPORTED_EXT_RE = /^[^?]*\.(?:m?[jt]sx?|vue)(?:$|\?)/
const SCRIPT_RE = /(?<=<script[^>]*>)[\s\S]*?(?=<\/script>)/i
const STYLE_QUERY_RE = /[?&]type=style/
const MACRO_QUERY_RE = /[?&]macro(?:=|&|$)/

export interface ExtractAsyncDataHandlersOptions {
  sourcemap: boolean
  rootDir: string
}

export const ExtractAsyncDataHandlersPlugin = (options: ExtractAsyncDataHandlersOptions) => { throw new Error("STUB"); }
