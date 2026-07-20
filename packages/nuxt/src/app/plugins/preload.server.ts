import { defineNuxtPlugin } from '../nuxt'
import type { ObjectPlugin, Plugin } from '../nuxt'

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin({
  name: 'nuxt:webpack-preload',
  setup (nuxtApp) {
    nuxtApp.vueApp.mixin({
      beforeCreate () {
            throw new Error("STUB");
        },
    })
  },
})

export default plugin
