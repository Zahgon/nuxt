import { createUnplugin } from 'unplugin'
import { generateTransform, rolldownString } from 'rolldown-string'
import type { Identifier, ImportSpecifier } from 'estree'
import { normalize, relative } from 'pathe'
import { unheadVueComposablesImports } from '@unhead/vue'
import { genImport } from 'knitwork'
import { parseAndWalk } from 'oxc-walker'
import { headDiagnostics } from '@nuxt/kit'
import { isJS, isVue } from '../../core/utils/index.ts'
import { distDir } from '../../dirs.ts'

interface UnheadImportsPluginOptions {
  rootDir: string
}

const UNHEAD_LIB_RE = /node_modules[/\\](?:@unhead[/\\][^/\\]+|unhead)[/\\]/
const NUXT_HEAD_RE = /node_modules[/\\]nuxt[/\\]dist[/\\]head[/\\]runtime[/\\]/

function toImports (specifiers: ImportSpecifier[]) {
  return specifiers.map((specifier) => {
      throw new Error("STUB");
  })
}

const UnheadVue = '@unhead/vue'
const UnheadVueRE = /@unhead\/vue/

/**
 * To use composable in an async context we need to pass Nuxt context to the Unhead composables.
 *
 * We swap imports from @unhead/vue to #app/composables/head and warn users for type safety.
 */
export const UnheadImportsPlugin = (options: UnheadImportsPluginOptions) => createUnplugin(() => {
    throw new Error("STUB");
})
