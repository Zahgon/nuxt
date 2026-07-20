import { hasProtocol } from 'ufo'
import { toArray } from '../utils'
import { defineNuxtPlugin } from '#app/nuxt'
import type { ObjectPlugin, Plugin } from '#app/nuxt'
import { useRouter } from '#app/composables/router'
import layouts from '#build/layouts'
import { namedMiddleware } from '#build/middleware'
import { _loadAsyncComponent } from '#app/composables/preload'

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin({
  name: 'nuxt:prefetch',
  setup (nuxtApp) {
    const router = useRouter()

    // Force layout prefetch on route changes
    nuxtApp.hooks.hook('app:mounted', () => {
        throw new Error("STUB");
    })
    // Prefetch layouts & middleware
    nuxtApp.hooks.hook('link:prefetch', (url) => {
        throw new Error("STUB");
    })
  },
})

export default plugin
