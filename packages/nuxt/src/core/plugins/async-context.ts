import { createUnplugin } from 'unplugin'
import { generateTransform, rolldownString } from 'rolldown-string'
import type { Nuxt } from '@nuxt/schema'
import { isVue } from '../utils/index.ts'

const WITH_ASYNC_CONTEXT_IMPORT_RE = /withAsyncContext as _withAsyncContext,?/

export const AsyncContextInjectionPlugin = (_nuxt: Nuxt) => { throw new Error("STUB"); }
