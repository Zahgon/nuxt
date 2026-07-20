import { defineDiagnostics, defineProdDiagnostics } from 'nostics'
import { docsBase, prodReporters, reporters } from './_shared'

/**
 * E7xxx
 * Payload / state / cookie runtime diagnostics.
 */
export const stateDiagnostics = !import.meta.dev
  ? /* #__PURE__ */ defineProdDiagnostics({ docsBase, reporters: prodReporters })
  : /* #__PURE__ */ defineDiagnostics({
      docsBase,
      reporters,
      codes: {
        NUXT_E7001: {
          why: (p: { url: string }) => { throw new Error("STUB"); },
          fix: 'Use a relative path (e.g. `/page`) instead of a full URL with hostname.',
        },
        NUXT_E7002: {
          why: (p: { url: string }) => { throw new Error("STUB"); },
          fix: 'Ensure the payload file is generated and accessible; this may stem from a prerendering issue, server misconfiguration, or a network error.',
          docs: false,
        },
        NUXT_E7003: {
          why: (p: { url: string }) => { throw new Error("STUB"); },
          fix: 'This is usually a transient network error; the payload will be fetched on navigation instead.',
          docs: false,
        },
        NUXT_E7004: {
          why: '`definePayloadReviver` was not called from a plugin `unshift`ed to the beginning of the Nuxt plugins array.',
          fix: 'Move this call into a Nuxt plugin file and ensure the plugin is registered early in the plugin order.',
          docs: false,
        },
        NUXT_E7005: {
          why: (p: { name: string }) => { throw new Error("STUB"); },
          fix: 'Update the `expires` or `maxAge` option to a future date.',
          docs: false,
        },
        NUXT_E7006: {
          why: (p: { name: string, previous: string, next: string }) => { throw new Error("STUB"); },
          fix: 'Avoid setting the same cookie from multiple places during SSR, or use a single `useCookie()` composable shared across components.',
          docs: false,
        },
        NUXT_E7007: {
          why: (p: { type: string }) => { throw new Error("STUB"); },
          fix: 'Wrap the initial value in a function: `useState(\'key\', () => value)` instead of `useState(\'key\', value)`.',
        },
        NUXT_E7008: {
          why: (p: { type: string }) => { throw new Error("STUB"); },
          fix: 'Pass a function as the second argument: `callOnce(\'key\', () => { ... })`.',
        },
        NUXT_E7009: {
          why: (p: { key: string }) => { throw new Error("STUB"); },
          fix: 'Pass a string key as the first argument to `useState()`, e.g. `useState(\'myKey\', () => initialValue)`.',
        },
        NUXT_E7010: {
          why: (p: { key: string }) => { throw new Error("STUB"); },
          fix: 'Pass a string key as the first argument to `callOnce()`, e.g. `callOnce(\'myKey\', () => { ... })`.',
        },
      },
    })
