import { createUnplugin } from 'unplugin'
import { generateTransform, rolldownString } from 'rolldown-string'
import { camelCase, pascalCase } from 'scule'

import { componentDiagnostics, tryUseNuxt } from '@nuxt/kit'
import { parse, walk } from 'ultrahtml'
import { ScopeTracker, parseAndWalk } from 'oxc-walker'
import { isVue } from '../../core/utils/index.ts'
import { resolveToAlias } from '../../utils.ts'
import type { Component, ComponentsOptions } from 'nuxt/schema'

interface LoaderOptions {
  getComponents (): Component[]
  transform?: ComponentsOptions['transform']
}

const SCRIPT_RE = /(?<=<script[^>]*>)[\s\S]*?(?=<\/script>)/gi
const TEMPLATE_RE = /<template>([\s\S]*)<\/template>/
const hydrationStrategyMap = {
  hydrateOnIdle: 'Idle',
  hydrateOnVisible: 'Visible',
  hydrateOnInteraction: 'Interaction',
  hydrateOnMediaQuery: 'MediaQuery',
  hydrateAfter: 'Time',
  hydrateWhen: 'If',
  hydrateNever: 'Never',
}

const TEMPLATE_WITH_LAZY_HYDRATION_RE = /<template>[\s\S]*\b(?:hydrate-on-idle|hydrateOnIdle|hydrate-on-visible|hydrateOnVisible|hydrate-on-interaction|hydrateOnInteraction|hydrate-on-media-query|hydrateOnMediaQuery|hydrate-after|hydrateAfter|hydrate-when|hydrateWhen|hydrate-never|hydrateNever)\b[\s\S]*<\/template>/

export const LazyHydrationTransformPlugin = (options: LoaderOptions) => createUnplugin(() => {
    throw new Error("STUB");
})
