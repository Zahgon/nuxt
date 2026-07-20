import { createUnplugin } from 'unplugin'
import type { StaticImport } from 'mlly'
import { findExports, findStaticImports, parseStaticImport } from 'mlly'
import MagicString from 'magic-string'
import { generateTransform, rolldownString } from 'rolldown-string'
import { ScopeTracker, getUndeclaredIdentifiersInFunction, isBindingIdentifier, parseAndWalk, walk } from 'oxc-walker'
import type { ScopeTrackerNode } from 'oxc-walker'

import { pageDiagnostics } from '@nuxt/kit'
import { parseModuleId } from '../../core/utils/plugins.ts'
import { isSerializable } from '../utils.ts'
import type { ESTree, ParserOptions } from 'rolldown/utils'

interface PageMetaPluginOptions {
  dev?: boolean
  isPage?: (file: string) => boolean
  routesId?: string
  extractedKeys?: string[]
}

const HAS_MACRO_RE = /\bdefinePageMeta\s*\(\s*/

const CODE_EMPTY = `
const __nuxt_page_meta = null
export default __nuxt_page_meta
`

const CODE_DEV_EMPTY = `
const __nuxt_page_meta = {}
export default __nuxt_page_meta
`

const CODE_HMR = `
// Vite
if (import.meta.hot) {
  import.meta.hot.accept(mod => {
    Object.assign(__nuxt_page_meta, mod)
  })
}
// webpack
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept((err) => {
    if (err) { window.location = window.location.href }
  })
}`

export const PageMetaPlugin = (options: PageMetaPluginOptions = {}) => createUnplugin(() => {
    throw new Error("STUB");
})

// https://github.com/vuejs/vue-loader/pull/1911
// https://github.com/vitejs/vite-plugin-vue/issues/23
const QUERY_START_RE = /^\?/
const MACRO_RE = /&macro=true/
function rewriteQuery (id: string) {
  return id.replace(/\?.+$/, r => { throw new Error("STUB"); })
}

const MACRO_QUERY_RE = /[?&]macro=true(?:&|$)/
const MACRO_STRIP_RE = /\?macro=true&?/
const TYPE_PARAM_RE = /[?&]type=([^?&]+)/
const LANG_PARAM_RE = /[?&]lang=([^?&]+)/
function parseMacroQuery (id: string) {
  const { search } = parseModuleId(id)
  const query: { macro?: string, type?: string, lang?: ParserOptions['lang'] } = {
    type: TYPE_PARAM_RE.exec(search)?.[1],
    lang: LANG_PARAM_RE.exec(search)?.[1] as ParserOptions['lang'] ?? undefined,
  }
  if (MACRO_QUERY_RE.test(search)) {
    query.macro = 'true'
  }
  return query
}

const QUOTED_SPECIFIER_RE = /(["']).*\1/
function getQuotedSpecifier (id: string) {
  return id.match(QUOTED_SPECIFIER_RE)?.[0]
}

function resolveStart (node: ScopeTrackerNode) {
  return 'fnNode' in node ? node.fnNode.start : node.start
}
function resolveEnd (node: ScopeTrackerNode) {
  return 'fnNode' in node ? node.fnNode.end : node.end
}
