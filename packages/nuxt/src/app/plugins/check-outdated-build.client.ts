import type { FetchError } from 'ofetch'
import { defineNuxtPlugin } from '../nuxt'
import type { ObjectPlugin, Plugin } from '../nuxt'
import { getAppManifest } from '../composables/manifest'
import type { NuxtAppManifestMeta } from '../composables/manifest'
import { onNuxtReady } from '../composables/ready'
import { buildAssetsURL } from '#internal/nuxt/paths'
import { outdatedBuildInterval } from '#build/nuxt.config.mjs'
import { $fetch } from '#build/fetch'

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin((nuxtApp) => {
    throw new Error("STUB");
})

export default plugin
