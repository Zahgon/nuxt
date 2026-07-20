import { generateTransform, rolldownString } from 'rolldown-string'
import { createUnplugin } from 'unplugin'
import { ScopeTracker, parseAndWalk, walk } from 'oxc-walker'
import escapeStringRegexp from 'escape-string-regexp'

import { isJS, isVue } from '../utils/index.ts'

type ImportPath = string

interface TreeShakeComposablesPluginOptions {
  composables: Record<ImportPath, string[]>
}

export const TreeShakeComposablesPlugin = (options: TreeShakeComposablesPluginOptions) => { throw new Error("STUB"); }
