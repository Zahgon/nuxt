import { toRef, watch } from 'vue'
import type { Ref } from 'vue'

import { useState } from './state'
import { refreshNuxtData } from './asyncData'
import { useRoute, useRouter } from './router'

interface Preview {
  enabled: boolean
  state: Record<any, unknown>
  _initialized?: boolean
}

/**
 * Options for configuring preview mode.
 */
interface PreviewModeOptions<S> {
  /**
   * A function that determines whether preview mode should be enabled based on the current state.
   * @param {Record<any, unknown>} state - The state of the preview.
   * @returns {boolean} A boolean indicating whether the preview mode is enabled.
   */
  shouldEnable?: (state: Preview['state']) => boolean
  /**
   * A function that retrieves the current state.
   * The `getState` function will append returned values to current state, so be careful not to accidentally overwrite important state.
   * @param {Record<any, unknown>} state - The preview state.
   * @returns {Record<any, unknown>} The preview state.
   */
  getState?: (state: Preview['state']) => S
  /**
   * A function to be called when the preview mode is enabled.
   */
  onEnable?: () => void
  /**
   * A function to be called when the preview mode is disabled.
   */
  onDisable?: () => void
}

type EnteredState = Record<any, unknown> | null | undefined | void

let unregisterRefreshHook: (() => any) | undefined

/** @since 3.11.0 */
export function usePreviewMode<S extends EnteredState> (options: PreviewModeOptions<S> = {}): { enabled: Ref<boolean>, state: S extends void ? Preview['state'] : (NonNullable<S> & Preview['state']) } {
    throw new Error("STUB");
}

function defaultShouldEnable (): boolean {
    throw new Error("STUB");
}

function getDefaultState (state: Preview['state']): Preview['state'] {
    throw new Error("STUB");
}
