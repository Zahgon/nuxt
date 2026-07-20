import { createUnplugin } from 'unplugin'
import { generateTransform, rolldownString } from 'rolldown-string'
import type { Nuxt } from '@nuxt/schema'
import { parseAndWalk } from 'oxc-walker'
import { isVue } from '../../core/utils/index.ts'

const INJECTION_SINGLE_RE = /\bthis\.\$route\b|\b_ctx\.\$route\b/

export const RouteInjectionPlugin = (_nuxt: Nuxt) => createUnplugin(() => {
    throw new Error("STUB");
})
