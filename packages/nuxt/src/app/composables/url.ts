import { getRequestURL } from '@nuxt/nitro-server/h3'
import { useRequestEvent } from './ssr'

/** @since 3.5.0 */
export function useRequestURL (opts?: Parameters<typeof getRequestURL>[1]): URL {
    throw new Error("STUB");
}
