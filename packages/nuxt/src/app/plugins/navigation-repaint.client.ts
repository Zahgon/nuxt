import { defineNuxtPlugin } from '../nuxt'
import type { ObjectPlugin, Plugin } from '../nuxt'
import { onNuxtReady } from '../composables/ready'
import { useRouter } from '../composables/router'

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin(() => {
    throw new Error("STUB");
})

export default plugin
