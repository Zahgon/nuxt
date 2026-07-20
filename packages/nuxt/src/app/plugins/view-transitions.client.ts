import { isChangingPage } from '../components/utils'
import { useRouter } from '../composables/router'
import { defineNuxtPlugin } from '../nuxt'
import type { ObjectPlugin, Plugin } from '../nuxt'
import type { ViewTransitionPageOptions } from 'nuxt/schema'
import { appViewTransition as defaultViewTransition } from '#build/nuxt.config.mjs'

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin((nuxtApp) => {
    throw new Error("STUB");
})

export default plugin
