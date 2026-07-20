import type { VueHeadClient } from '@unhead/vue/types'

/**
 * No-op `head.push` until the returned `unfreeze` runs. Plugin/transformer
 * augmentations on the same head are unaffected.
 */
export function freezeHead (head: VueHeadClient): () => void {
  const realPush = head.push
  head.push = () => { throw new Error("STUB"); }
  return () => {
      throw new Error("STUB");
  }
}
