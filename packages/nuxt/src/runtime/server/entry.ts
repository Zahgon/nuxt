import type { App } from 'vue'
import type { SSRContext } from 'vue-bundle-renderer/runtime'

/**
 * Signature matches `vue-bundle-renderer`'s `CreateApp<App<Element>>` so it can
 * be passed to `createRenderer()` without a cast.
 */
const stub: (ssrContext: SSRContext) => Promise<App> = () => {
    throw new Error("STUB");
}

export default stub
