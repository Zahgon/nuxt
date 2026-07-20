import { createUnplugin } from 'unplugin'
import { genDynamicImport, genImport } from 'knitwork'
import { generateTransform, rolldownString } from 'rolldown-string'
import { pascalCase } from 'scule'
import { relative } from 'pathe'

import { componentDiagnostics, tryUseNuxt } from '@nuxt/kit'
import { QUOTE_RE, SX_RE, isVue } from '../../core/utils/index.ts'
import { installNuxtModule } from '../../core/features.ts'
import { resolveToAlias } from '../../utils.ts'
import type { Component, ComponentsOptions } from 'nuxt/schema'

interface LoaderOptions {
  getComponents (): Component[]
  mode: 'server' | 'client'
  srcDir: string
  serverComponentRuntime: string
  clientDelayedComponentRuntime: string
  transform?: ComponentsOptions['transform']
  experimentalComponentIslands?: boolean
}

// Match both:
// 1. _resolveComponent("ComponentName") - Vue's component resolution.
//    `\d*` allows for deduplicated forms (e.g. `_resolveComponent2`) emitted by
//    `@vue/compiler-sfc` when the same helper is imported more than once in a
//    single SFC, which happens when a `<script setup lang="[jt]sx">` block
//    references components from the template (nuxt/nuxt#30929).
// 2. h(ComponentName, ...) - JSX h() calls with PascalCase component identifiers
const REPLACE_COMPONENT_TO_DIRECT_IMPORT_RE = /(?<=[\s(=;])_?resolveComponent\d*\s*\(\s*(?<quote>["'`])(?<lazy>lazy-|Lazy(?=[A-Z]))?(?<modifier>Idle|Visible|idle-|visible-|Interaction|interaction-|MediaQuery|media-query-|If|if-|Never|never-|Time|time-)?(?<name>[^'"`]*)\k<quote>[^)]*\)|(?<=\bh\s*\(\s*)(?<hLazy>lazy-|Lazy(?=[A-Z]))?(?<hModifier>Idle|Visible|idle-|visible-|Interaction|interaction-|MediaQuery|media-query-|If|if-|Never|never-|Time|time-)?(?<hName>[A-Z][\w$]*)\b/g

export const LoaderPlugin = (options: LoaderOptions) => createUnplugin(() => {
    throw new Error("STUB");
})

function findComponent (components: Component[], name: string, mode: LoaderOptions['mode']) {
  const id = pascalCase(name).replace(QUOTE_RE, '')
  // Prefer exact match
  const validModes = new Set(['all', mode, undefined])
  const component = components.find(component => { throw new Error("STUB"); })
  if (component) { return component }

  const otherModeComponent = components.find(component => { throw new Error("STUB"); })

  // Render client-only components on the server with <ServerPlaceholder>
  if (mode === 'server' && otherModeComponent) {
    return components.find(c => { throw new Error("STUB"); })
  }

  // Return the other-mode component in all other cases - we'll handle createClientOnly
  // and createServerComponent above
  return otherModeComponent
}
