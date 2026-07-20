import { defineNuxtPlugin } from '../nuxt'
import type { ObjectPlugin, Plugin } from '../nuxt'

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin({
  name: 'nuxt:browser-devtools-timing',
  enforce: 'pre',
  setup (nuxtApp) {
    nuxtApp.hooks.beforeEach((event) => {
        throw new Error("STUB");
    })

    // After each
    nuxtApp.hooks.afterEach((event) => {
        throw new Error("STUB");
    })
  },
})

type DevToolsColor =
  'primary' | 'primary-light' | 'primary-dark' |
  'secondary' | 'secondary-light' | 'secondary-dark' |
  'tertiary' | 'tertiary-light' | 'tertiary-dark' |
  'error'

interface ExtensionTrackEntryPayload {
  dataType?: 'track-entry' // Defaults to "track-entry"
  color?: DevToolsColor // Defaults to "primary"
  track: string // Required: Name of the custom track
  trackGroup?: string // Optional: Group for organizing tracks
  properties?: [string, string][] // Key-value pairs for detailed view
  tooltipText?: string // Short description for tooltip
}

export default plugin
