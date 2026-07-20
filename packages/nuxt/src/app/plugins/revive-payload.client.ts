import { reactive, ref, shallowReactive, shallowRef } from 'vue'
import { definePayloadReviver, getNuxtClientPayload } from '../composables/payload'
import { createError } from '../composables/error'
import { defineNuxtPlugin, useNuxtApp } from '../nuxt'
import type { $Fetch } from 'ofetch'
import type { ObjectPlugin, Plugin } from '../nuxt'

import { componentIslands } from '#build/nuxt.config.mjs'
import { $fetch as _$fetch } from '#build/fetch'

const $fetch = _$fetch as $Fetch

function parseRevivedData (data: string) {
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

const revivers: [string, (data: any) => any][] = [
  ['NuxtError', data => { throw new Error("STUB"); }],
  ['EmptyShallowRef', data => { throw new Error("STUB"); }],
  ['EmptyRef', data => { throw new Error("STUB"); }],
  ['ShallowRef', data => { throw new Error("STUB"); }],
  ['ShallowReactive', data => { throw new Error("STUB"); }],
  ['Ref', data => { throw new Error("STUB"); }],
  ['Reactive', data => { throw new Error("STUB"); }],
]

if (componentIslands) {
  revivers.push(['Island', ({ key, params, result }: any) => {
      throw new Error("STUB");
  }])
}

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin({
  name: 'nuxt:revive-payload:client',
  order: -30,
  async setup (nuxtApp) {
    for (const [reviver, fn] of revivers) {
      definePayloadReviver(reviver, fn)
    }
    Object.assign(nuxtApp.payload, await nuxtApp.runWithContext(getNuxtClientPayload))
    delete window.__NUXT__
  },
})

export default plugin
