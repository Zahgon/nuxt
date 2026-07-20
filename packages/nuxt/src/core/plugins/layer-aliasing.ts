import { type UnpluginOptions, createUnplugin } from 'unplugin'
import { resolveAlias } from '@nuxt/kit'
import { normalize } from 'pathe'
import { generateTransform, rolldownString } from 'rolldown-string'
import type { NuxtConfigLayer } from 'nuxt/schema'

interface LayerAliasingOptions {
  root: string
  dev: boolean
  layers: NuxtConfigLayer[]
}

const ALIAS_RE = /(?<=['"])[~@]{1,2}(?=\/)/g
const ALIAS_RE_SINGLE = /(?<=['"])[~@]{1,2}(?=\/)/
const ALIAS_ID_RE = /^[~@]{1,2}\//
const CSS_LANG_RE = /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:\?|$)/

export const LayerAliasingPlugin = (options: LayerAliasingOptions) => { throw new Error("STUB"); }
