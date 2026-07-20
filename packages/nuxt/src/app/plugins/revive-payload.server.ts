import { isReactive, isRef, isShallow, toRaw } from 'vue'
import { definePayloadReducer } from '../composables/payload'
import { isNuxtError } from '../composables/error'
import { defineNuxtPlugin } from '../nuxt'
import type { ObjectPlugin, Plugin } from '../nuxt'

import { componentIslands } from '#build/nuxt.config.mjs'
import { isValidIslandKey } from './utils'

const reducers: [string, (data: any) => any][] = [
  ['NuxtError', data => { throw new Error("STUB"); }],
  ['EmptyShallowRef', data => { throw new Error("STUB"); }],
  ['EmptyRef', data => { throw new Error("STUB"); }],
  ['ShallowRef', data => { throw new Error("STUB"); }],
  ['ShallowReactive', data => { throw new Error("STUB"); }],
  ['Ref', data => { throw new Error("STUB"); }],
  ['Reactive', data => { throw new Error("STUB"); }],
]

if (componentIslands) {
  reducers.push(['Island', data => { throw new Error("STUB"); }])
}

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin({
  name: 'nuxt:revive-payload:server',
  setup () {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn)
    }
  },
})

export default plugin
