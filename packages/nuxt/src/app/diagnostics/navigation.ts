import { defineDiagnostics, defineProdDiagnostics } from 'nostics'
import { docsBase, prodReporters, reporters } from './_shared'

/**
 * E2xxx
 * Navigation / routing / middleware runtime diagnostics.
 */
export const navigationDiagnostics = !import.meta.dev
  ? /* #__PURE__ */ defineProdDiagnostics({ docsBase, reporters: prodReporters })
  : /* #__PURE__ */ defineDiagnostics({
      docsBase,
      reporters,
      codes: {
        NUXT_E2001: {
          why: (p: { toPath: string }) => { throw new Error("STUB"); },
          fix: (p: { toPath: string }) => { throw new Error("STUB"); },
        },
        NUXT_E2002: {
          why: (p: { toPath: string, protocol: string }) => { throw new Error("STUB"); },
          fix: 'Script protocols (e.g. `javascript:`) are blocked for security. Use a valid `http:` or `https:` URL.',
        },
        NUXT_E2003: {
          why: '`abortNavigation()` was called outside a route middleware handler.',
          fix: 'Move this call inside a route middleware defined with `defineNuxtRouteMiddleware()` or `addRouteMiddleware()`.',
        },
        NUXT_E2004: {
          why: (p: { entry: string }) => { throw new Error("STUB"); },
          fix: (p: { entry: string, validMiddleware?: string[] }) => { throw new Error("STUB"); },
        },
        NUXT_E2005: {
          why: (p: { middleware?: string, trace: string }) => { throw new Error("STUB"); },
          fix: 'Use the `to` and `from` arguments passed to the middleware function instead of `useRoute()`.',
        },
        NUXT_E2006: {
          why: 'No route middleware passed to `addRouteMiddleware`.',
          fix: 'Pass a middleware function as the second argument: `addRouteMiddleware(\'name\', (to, from) => { ... })`.',
          docs: false,
        },
        NUXT_E2007: {
          why: '`setPageLayout` was called to change the layout on the server within a component, which will cause hydration errors.',
          fix: 'Call `setPageLayout` in a route middleware or plugin instead of inside a component\'s `setup()`.',
        },
        NUXT_E2008: {
          why: '`setPageLayout` was called to change the layout during hydration, which will cause hydration errors.',
          fix: 'Set the layout in `definePageMeta` or in a route middleware before hydration occurs.',
          docs: false,
        },
        NUXT_E2009: {
          why: 'A middleware error was thrown but no error handlers are registered to handle it.',
          fix: 'Register an error handler with `router.onError()` or add error handling within your middleware.',
          docs: false,
        },
        NUXT_E2010: {
          why: (p: { path: string }) => { throw new Error("STUB"); },
          fix: 'Pass a path on the same host, or use `navigateTo(path, { external: true })` for cross-origin navigation.',
          docs: false,
        },
        NUXT_E2011: {
          why: (p: { componentName: string }) => { throw new Error("STUB"); },
          fix: 'Script protocols (e.g. `javascript:`) are blocked for security. Use a valid `http:` or `https:` URL.',
          docs: false,
        },
      },
    })
