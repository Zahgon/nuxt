import { createUnplugin } from 'unplugin'
import { generateTransform, rolldownString } from 'rolldown-string'
import { hash } from 'ohash'

import { parseAndWalk } from 'oxc-walker'
import { transformAndMinify } from '../../core/utils/parse.ts'
import { isJS, isVue } from '../utils/index.ts'

export function PrehydrateTransformPlugin () {
    throw new Error("STUB");
}
