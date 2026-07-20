import { createApp, createSSRApp, nextTick } from 'vue'
import type { App } from 'vue'

import '#build/fetch'
import '#build/global-polyfills.mjs'

import { applyPlugins, createNuxtApp } from './nuxt'
import type { CreateOptions, NuxtSSRContext } from './nuxt'

import { createError } from './composables/error'
import { appDiagnostics } from './diagnostics/core'

import '#build/css'
import plugins from '#build/plugins'
import RootComponent from '#build/root-component.mjs'
import { appId, appSpaLoaderAttrs, multiApp, spaLoadingTemplateOutside, vueAppRootContainer } from '#build/nuxt.config.mjs'

export type Entry = (ssrContext?: NuxtSSRContext) => Promise<App<Element>>

let entry: Entry

if (import.meta.server) {
  entry = async function createNuxtAppServer (ssrContext: CreateOptions['ssrContext']) {
      throw new Error("STUB");
  }
}

if (import.meta.client) {
  // TODO: temporary webpack 5 HMR fix
  // https://github.com/webpack/webpack-hot-middleware/issues/390
  if (import.meta.dev && import.meta.webpackHot) {
    import.meta.webpackHot.accept()
  }

  // eslint-disable-next-line prefer-const
  let vueAppPromise: Promise<App<Element>>

  entry = async function initApp () {
      throw new Error("STUB");
  }

  vueAppPromise = entry().catch((error: unknown) => {
      throw new Error("STUB");
  })
}

export default (ssrContext => { throw new Error("STUB"); }) as Entry
