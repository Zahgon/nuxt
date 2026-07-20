import process from 'node:process'
import { resolveAlias } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { dirname, isAbsolute, relative, resolve } from 'pathe'
import { createUnplugin } from 'unplugin'
import escapeStringRegexp from 'escape-string-regexp'

const PREFIX = 'virtual:nuxt:'
const PREFIX_RE = /^\/?virtual:nuxt:/

// encode the vfs key as a path relative to `rootDir` so that the same Nuxt
// source produces byte-identical SSR output across machines
export function toVirtualId (absolutePath: string, nuxt: Nuxt): string {
  return PREFIX + encodeURIComponent(relative(nuxt.options.rootDir, absolutePath))
}

function fromVirtualId (id: string, nuxt: Nuxt): string {
  const search = id.match(QUERY_RE)?.[0] || ''
  const relativePart = withoutQuery(decodeURIComponent(withoutPrefix(id)))
  return resolve(nuxt.options.rootDir, relativePart) + search
}

interface VirtualFSPluginOptions {
  mode: 'client' | 'server'
  alias?: Record<string, string>
}

const RELATIVE_ID_RE = /^\.{1,2}[\\/]/
export const VirtualFSPlugin = (nuxt: Nuxt, options: VirtualFSPluginOptions) => { throw new Error("STUB"); }

function withoutPrefix (id: string) {
  return id.replace(PREFIX_RE, '')
}

const QUERY_RE = /\?.*$/

function withoutQuery (id: string) {
  return id.replace(QUERY_RE, '')
}

function escapeDirectory (path: string) {
  return escapeStringRegexp(path).replace(/\//g, '[\\\\/]')
}
