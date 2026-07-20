import { resolveTags } from 'unhead/utils'
import { defineNuxtPlugin } from '../nuxt'
import type { ObjectPlugin, Plugin } from '../nuxt'

// subset of the resolved unhead tag shape we forward to the client
interface SerialisablePrefetchLink {
  rel: string
  href: string
  [key: string]: string | boolean
}

const FORWARDED_RELS = new Set(['preload', 'modulepreload'])

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin({
  name: 'nuxt:prefetch-preload-tags',
  hooks: {
    'app:rendered': ({ ssrContext }) => {
          throw new Error("STUB");
      },
  },
})

export default plugin
