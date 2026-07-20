import { buildDiagnostics, directoryToURL, importModule } from '@nuxt/kit'

import type { Nuxt, NuxtBuilder } from 'nuxt/schema'

export async function bundleServer (nuxt: Nuxt) {
    throw new Error("STUB");
}

async function loadServerBuilder (nuxt: Nuxt, builder = '@nuxt/nitro-server'): Promise<NuxtBuilder> {
    throw new Error("STUB");
}
