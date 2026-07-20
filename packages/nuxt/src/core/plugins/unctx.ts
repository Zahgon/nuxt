import type { Transformer, TransformerOptions } from 'unctx/transform'
import { createTransformer, getTransformFilter } from 'unctx/transform'
import { createUnplugin } from 'unplugin'

import { isJS, isVue } from '../utils/index.ts'

const TRANSFORM_MARKER = '/* _processed_nuxt_unctx_transform */\n'
const TRANSFORM_MARKER_RE = /^\/\* _processed_nuxt_unctx_transform \*\/\n/

interface UnctxTransformPluginOptions {
  sourcemap?: boolean
  transformerOptions: TransformerOptions
}

export const UnctxTransformPlugin = (options: UnctxTransformPluginOptions) => { throw new Error("STUB"); }
