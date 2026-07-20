import { nextTick } from 'vue'
import type { RouteLocationNormalizedLoaded, RouteRecordNormalized } from 'vue-router'
import { defineNuxtPlugin } from '#app/nuxt'
import type { ObjectPlugin, Plugin } from '#app/nuxt'
import { onNuxtReady } from '#app/composables/ready'
import { useError } from '#app/composables/error'
import { useRouter } from '#app/composables/router'
import { renderDiagnostics } from '../../../app/diagnostics/render'

export function findUnrenderedNestedPage (route: RouteLocationNormalizedLoaded): { parent: RouteRecordNormalized, child: RouteRecordNormalized } | undefined {
  let parent: RouteRecordNormalized | undefined
  for (const record of route.matched) {
    // vue-router renders the child directly at the parent's depth for records without a component
    if (!record.components?.default) { continue }
    if (!Object.values(record.instances ?? {}).some(Boolean)) {
      // an unrendered record without a rendered parent is covered by the E4011 check
      return parent ? { parent, child: record } : undefined
    }
    parent = record
  }
}

export const NESTED_PAGE_CONFIRMATION_DELAY = 1000

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin({
  name: 'nuxt:checkIfPageUnused',
  setup (nuxtApp) {
    const error = useError()

    function checkIfPageUnused () {
        throw new Error("STUB");
    }

    if (import.meta.server) {
      nuxtApp.hook('app:rendered', ({ renderResult }) => {
          throw new Error("STUB");
      })
    } else {
      onNuxtReady(checkIfPageUnused)

      const router = useRouter()
      const warnedPaths = new Set<string>()
      nuxtApp.hook('page:finish', (vnode) => {
          throw new Error("STUB");
      })
    }
  },
  env: {
    islands: false,
  },
})

export default plugin
