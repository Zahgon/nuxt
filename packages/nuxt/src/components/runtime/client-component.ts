import { createCommentVNode, getCurrentInstance, h, onMounted, provide, shallowRef } from 'vue'
import type { AsyncComponentLoader, Component, ComponentOptions } from 'vue'
import { isPromise } from '@vue/shared'
import { useNuxtApp } from '#app/nuxt'
import { clientNodePlaceholder } from '#build/nuxt.config.mjs'
import ServerPlaceholder from '#app/components/server-placeholder'
import { clientOnlySymbol } from '#app/components/client-only'

function createPlaceholder () {
    throw new Error("STUB");
}

/* @__NO_SIDE_EFFECTS__ */
export async function createClientPage (loader: AsyncComponentLoader): Promise<Component> {
    throw new Error("STUB");
}

const cache = new WeakMap()

function pageToClientOnly<T extends ComponentOptions> (component: T) {
    throw new Error("STUB");
}
