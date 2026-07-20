import { defineNuxtPlugin } from '../nuxt'
import type { ObjectPlugin, Plugin } from '../nuxt'
import { loadPayload } from '../composables/payload'
import { onNuxtReady } from '../composables/ready'
import { useRouter } from '../composables/router'
import { getAppManifest } from '../composables/manifest'
import { injectHead } from '../composables/head'
import { stateDiagnostics } from '../diagnostics/state'

import { appManifest as isAppManifestEnabled, prefetchPreloadTags, purgeCachedData } from '#build/nuxt.config.mjs'

// track the active head entry per path for forwarded preload hints
interface ActiveHeadEntryLike { dispose: () => void }
const forwardedPrefetchEntries = new Map<string, ActiveHeadEntryLike>()

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin({
  name: 'nuxt:payload',
  setup (nuxtApp) {
    // Load payload after middleware & once final route is resolved
    const staticKeysToRemove = new Set<string>()
    const router = useRouter()
    if (prefetchPreloadTags) {
      // drop forwarded `rel="prefetch" hints so they don't linger indefinitely.
      router.afterEach(() => {
          throw new Error("STUB");
      })
    }
    router.beforeResolve(async (to, from) => {
        throw new Error("STUB");
    })

    onNuxtReady(() => {
        throw new Error("STUB");
    })
  },
})

export default plugin
