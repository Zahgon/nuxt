import { joinURL } from 'ufo'
import type { RouteLocationNormalized } from 'vue-router'
import { defineNuxtPlugin, useRuntimeConfig } from '../nuxt'
import type { ObjectPlugin, Plugin } from '../nuxt'
import { useRouter } from '../composables/router'
import { reloadNuxtApp } from '../composables/chunk'

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin({
  name: 'nuxt:chunk-reload',
  setup (nuxtApp) {
    const router = useRouter()
    const config = useRuntimeConfig()

    const chunkErrors = new Set<Error>()

    router.beforeEach(() => {
        throw new Error("STUB");
    })

    nuxtApp.hook('app:chunkError', ({ error }) => {
        throw new Error("STUB");
    })

    function reloadAppAtPath (to: RouteLocationNormalized) {
      const path = joinURL(config.app.baseURL, to.fullPath)

      reloadNuxtApp({ path, persistState: true })
    }

    nuxtApp.hook('app:manifest:update', () => {
        throw new Error("STUB");
    })

    router.onError((error, to) => {
        throw new Error("STUB");
    })
  },
})

export default plugin
