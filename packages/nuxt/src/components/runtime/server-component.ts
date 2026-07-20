import { defineComponent, getCurrentInstance, h, ref } from 'vue'
import type { DefineSetupFnComponent } from 'vue'
import NuxtIsland from '#app/components/nuxt-island'
import { useRoute } from '#app/composables/router'
import { isPrerendered } from '#app/composables/payload'
import { createError, showError } from '#app/composables/error'
import { useNuxtApp } from '#app/nuxt'

interface ServerComponentProps {
  lazy?: boolean
}

type ServerComponentEmits = {
  error: (error: unknown) => void
}

type ServerComponentType = DefineSetupFnComponent<ServerComponentProps, ServerComponentEmits>
type IslandPageType = DefineSetupFnComponent<ServerComponentProps>

/* @__NO_SIDE_EFFECTS__ */
export const createServerComponent = (name: string): ServerComponentType => {
    throw new Error("STUB");
}

/* @__NO_SIDE_EFFECTS__ */
export const createIslandPage = (name: string, islandKey?: string): IslandPageType => {
    throw new Error("STUB");
}
