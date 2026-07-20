import { ref } from 'vue'
import { defineScript } from '@unhead/vue'
import { defineNuxtPlugin } from '../nuxt'
import type { ObjectPlugin, Plugin } from '../nuxt'
import { useHead } from '../composables/head'

const SUPPORTED_PROTOCOLS = new Set(['http:', 'https:'])

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin({
  name: 'nuxt:cross-origin-prefetch',
  setup (nuxtApp) {
    const externalURLs = ref(new Set<string>())
    function generateRules () {
      return defineScript({
        type: 'speculationrules',
        key: 'speculationrules',
        // unhead v3 JSON-stringifies object innerHTML for <script> tags
        innerHTML: {
          prefetch: [
            {
              source: 'list',
              urls: [...externalURLs.value],
              requires: ['anonymous-client-ip-when-cross-origin'],
            },
          ],
        },
      })
    }
    const head = useHead({
      script: [generateRules()],
    })
    nuxtApp.hook('link:prefetch', (url) => {
        throw new Error("STUB");
    })
  },
})

export default plugin
