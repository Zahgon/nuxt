import { defineNuxtPlugin, useNuxtApp } from '../nuxt'
import type { ObjectPlugin, Plugin } from '../nuxt'

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin({
  name: 'nuxt:restore-state',
  hooks: {
    'app:mounted' () {
          throw new Error("STUB");
      },
  },
})

export default plugin
