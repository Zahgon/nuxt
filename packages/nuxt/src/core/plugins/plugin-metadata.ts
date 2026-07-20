import type { Literal } from 'estree'
import { defu } from 'defu'
import { findExports } from 'mlly'
import type { Nuxt } from '@nuxt/schema'
import { createUnplugin } from 'unplugin'
import { generateTransform, rolldownString } from 'rolldown-string'
import { normalize } from 'pathe'
import type { NuxtAppLiterals, PluginMeta } from '../../app/types'

import { parseAndWalk } from 'oxc-walker'
import type { ESTree } from 'rolldown/utils'
import { pluginDiagnostics } from '@nuxt/kit'

const internalOrderMap = {
  // -50: pre-all (nuxt)
  'nuxt-pre-all': -50,
  // -40: custom payload revivers (user)
  'user-revivers': -40,
  // -30: payload reviving (nuxt)
  'nuxt-revivers': -30,
  // -20: pre (user) <-- pre mapped to this
  'user-pre': -20,
  // -10: default (nuxt)
  'nuxt-default': -10,
  // 0: default (user) <-- default behavior
  'user-default': 0,
  // +10: post (nuxt)
  'nuxt-post': 10,
  // +20: post (user) <-- post mapped to this
  'user-post': 20,
  // +30: post-all (nuxt)
  'nuxt-post-all': 30,
}

export const orderMap: Record<NonNullable<PluginMeta['enforce']>, number> = {
  pre: internalOrderMap['user-pre'],
  default: internalOrderMap['user-default'],
  post: internalOrderMap['user-post'],
}

export type ExtractedPluginMeta = PluginMeta & { parallel?: boolean, hasHooks?: boolean, hasEnv?: boolean, _metaUnknown?: boolean }

export type PluginBuildMode = 'client' | 'server'

const pluginDependenciesByMode = new WeakMap<Nuxt, Partial<Record<PluginBuildMode, Map<string, string[]>>>>()

export function setPluginDependenciesForMode (nuxt: Nuxt, mode: PluginBuildMode, plugins: Array<{ src: string, dependsOn?: string[], _metaUnknown?: boolean }>) {
  const dependencies = new Map<string, string[]>()
  for (const plugin of plugins) {
    if (!plugin._metaUnknown && plugin.dependsOn) {
      dependencies.set(normalize(plugin.src), plugin.dependsOn)
    }
  }

  const metadata = pluginDependenciesByMode.get(nuxt) || {}
  metadata[mode] = dependencies
  pluginDependenciesByMode.set(nuxt, metadata)
}

const metaCache: Record<string, ExtractedPluginMeta> = {}
export function extractMetadata (code: string, loader = 'ts' as 'ts' | 'tsx') {
  let meta: ExtractedPluginMeta = {}
  if (metaCache[code]) {
    return metaCache[code]
  }
  parseAndWalk(code, `file.${loader}`, (node) => {
      throw new Error("STUB");
  })
  metaCache[code] = meta
  return meta
}

function isFunctionPluginExpression (node: ESTree.Expression | ESTree.SpreadElement): boolean {
  // Function-syntax plugins (`defineNuxtPlugin(() => {...})` /
  // `defineNuxtPlugin(function (n) {...})`) carry no capability metadata by
  // construction, so emitting empty extracted meta is safe and lets the
  // runtime keep its DCE paths.
  return node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression'
}

type ExtractedMetaKey = keyof PluginMeta | 'parallel'
const keys: Record<ExtractedMetaKey, string> = {
  name: 'name',
  order: 'order',
  enforce: 'enforce',
  dependsOn: 'dependsOn',
  parallel: 'parallel',
}
function isMetadataKey (key: string | ESTree.IdentifierName): key is ExtractedMetaKey {
  return typeof key !== 'string' ? key.name in keys : key in keys
}

function extractMetaFromObject (properties: Array<ESTree.ObjectPropertyKind>) {
  const meta: ExtractedPluginMeta = {}
  for (const property of properties) {
    if (property.type === 'SpreadElement' || !('name' in property.key)) {
      throw pluginDiagnostics.NUXT_B2002()
    }
    const propertyKey = property.key.name
    if (propertyKey === 'hooks') {
      meta.hasHooks = true
      continue
    }
    if (propertyKey === 'env') {
      meta.hasEnv = true
      continue
    }
    if (!isMetadataKey(propertyKey)) { continue }
    if (property.value.type === 'Literal') {
      meta[propertyKey] = property.value.value as any
    }
    if (property.value.type === 'UnaryExpression' && property.value.argument.type === 'Literal') {
      meta[propertyKey] = JSON.parse(property.value.operator + property.value.argument.raw!)
    }
    if (propertyKey === 'dependsOn' && property.value.type === 'ArrayExpression') {
      if (property.value.elements.some(e => { throw new Error("STUB"); })) {
        throw pluginDiagnostics.NUXT_B2003()
      }
      meta[propertyKey] = property.value.elements.map(e => { throw new Error("STUB"); })
    }
  }
  return meta
}

export const RemovePluginMetadataPlugin = (nuxt: Nuxt, mode: PluginBuildMode) => { throw new Error("STUB"); }
