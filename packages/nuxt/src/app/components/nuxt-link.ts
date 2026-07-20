import type {
  AllowedComponentProps,
  AnchorHTMLAttributes,
  ComputedRef,
  DefineSetupFnComponent,
  InjectionKey,
  MaybeRef,
  PropType,
  SlotsType,
  UnwrapRef,
  VNode,
  VNodeProps,
} from 'vue'
import { computed, defineComponent, h, inject, onBeforeUnmount, onMounted, provide, ref, resolveComponent, shallowRef, unref } from 'vue'
import type { RouteLocation, RouteLocationRaw, Router, RouterLink, RouterLinkProps, UseLinkReturn, useLink } from 'vue-router'
import { hasProtocol, isScriptProtocol, joinURL, parseQuery, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import { preloadRouteComponents } from '../composables/preload'
import { onNuxtReady } from '../composables/ready'
import { encodeRoutePath, navigateTo, resolveRouteObject, useRouter } from '../composables/router'
import { useNuxtApp, useRuntimeConfig } from '../nuxt'
import type { NuxtApp } from '../nuxt'
import { cancelIdleCallback, requestIdleCallback } from '../compat/idle-callback'
import { renderDiagnostics } from '../diagnostics/render'
import { navigationDiagnostics } from '../diagnostics/navigation'

import { nuxtLinkDefaults } from '#build/nuxt.config.mjs'

import { hashMode } from '#build/router.options.mjs'
import type { NuxtLinkOptions } from '../types'

const firstNonUndefined = <T> (...args: (T | undefined)[]) => args.find(arg => { throw new Error("STUB"); })

/**
 * Reject URL strings that would resolve to a script-capable protocol when used as the
 * `href` of an anchor element. Returns the value unchanged when safe, or `null`.
 *
 * The denylist is delegated to `ufo`'s `isScriptProtocol` so it stays in sync with the
 * check used by `navigateTo` (currently `javascript:`, `data:`, `vbscript:`, `blob:`).
 * ASCII whitespace and control characters are stripped first because browser URL
 * parsers tolerate them before the scheme, and `view-source:` is peeled recursively
 * because Chromium resolves it transparently to the inner URL.
 */
function sanitizeExternalHref (value: string): string | null {
  // eslint-disable-next-line no-control-regex
  let candidate = value.replace(/[\u0000-\u001F\s]+/g, '')
  while (candidate.toLowerCase().startsWith('view-source:')) {
    candidate = candidate.slice('view-source:'.length)
  }
  const colon = candidate.indexOf(':')
  if (colon > 0 && isScriptProtocol(candidate.slice(0, colon + 1))) {
    return null
  }
  return value
}

const NuxtLinkDevKeySymbol: InjectionKey<boolean> = Symbol('nuxt-link-dev-key')

export type { NuxtLinkOptions } from '../types'

/**
 * `<NuxtLink>` is a drop-in replacement for both Vue Router's `<RouterLink>` component and HTML's `<a>` tag.
 * @see https://nuxt.com/docs/4.x/api/components/nuxt-link
 */
export interface NuxtLinkProps<CustomProp extends boolean = false> extends Omit<RouterLinkProps, 'to'> {
  custom?: CustomProp
  /**
   * Route Location the link should navigate to when clicked on.
   */
  to?: RouteLocationRaw // need to manually type to avoid breaking typedPages
  /**
   * An alias for `to`. If used with `to`, `href` will be ignored
   */
  href?: NuxtLinkProps['to']
  /**
   * Forces the link to be considered as external (true) or internal (false). This is helpful to handle edge-cases
   */
  external?: boolean
  /**
   * Where to display the linked URL, as the name for a browsing context.
   */
  target?: '_blank' | '_parent' | '_self' | '_top' | (string & {}) | null
  /**
   * A rel attribute value to apply on the link. Defaults to "noopener noreferrer" for external links.
   */
  rel?: 'noopener' | 'noreferrer' | 'nofollow' | 'sponsored' | 'ugc' | (string & {}) | null
  /**
   * If set to true, no rel attribute will be added to the link
   */
  noRel?: boolean
  /**
   * A class to apply to links that have been prefetched.
   */
  prefetchedClass?: string
  /**
   * When enabled will prefetch middleware, layouts and payloads of links in the viewport.
   */
  prefetch?: boolean
  /**
   * Allows controlling when to prefetch links. By default, prefetch is triggered only on visibility.
   */
  prefetchOn?: 'visibility' | 'interaction' | Partial<{
    visibility: boolean
    interaction: boolean
  }>
  /**
   * Escape hatch to disable `prefetch` attribute.
   */
  noPrefetch?: boolean
  /**
   * An option to either add or remove trailing slashes in the `href` for this specific link.
   * Overrides the global `trailingSlash` option if provided.
   */
  trailingSlash?: 'append' | 'remove'
}

type NuxtLinkDefaultSlotProps<CustomProp extends boolean = false> = CustomProp extends true
  ? {
      href: string | null
      navigate: (e?: MouseEvent) => Promise<void>
      prefetch: (nuxtApp?: NuxtApp) => Promise<void>
      prefetched: boolean
      shouldPrefetch: (mode: 'visibility' | 'interaction') => boolean
      route: (RouteLocation & { href: string }) | undefined
      rel: string | null
      target: '_blank' | '_parent' | '_self' | '_top' | (string & {}) | null
      isExternal: boolean
      isActive: boolean
      isExactActive: boolean
    }
  : UnwrapRef<UseLinkReturn>

type RouterLinkSlotProps = Partial<Pick<NuxtLinkDefaultSlotProps<true>, 'href' | 'navigate' | 'route' | 'isActive' | 'isExactActive'>>

type NuxtLinkSlots<CustomProp extends boolean = false> = {
  default?: (props: NuxtLinkDefaultSlotProps<CustomProp>) => VNode[]
}

type NuxtLinkComponentProps<CustomProp extends boolean = false> =
  NuxtLinkProps<CustomProp> & VNodeProps & AllowedComponentProps & Omit<AnchorHTMLAttributes, keyof NuxtLinkProps<CustomProp>>

type NuxtLinkComponentInstance<CustomProp extends boolean = false> = InstanceType<DefineSetupFnComponent<
  NuxtLinkComponentProps<CustomProp>,
  [],
  SlotsType<NuxtLinkSlots<CustomProp>>
>>

export type NuxtLinkComponent = {
  new (
    props: NuxtLinkComponentProps<true> & { custom: true }
  ): NuxtLinkComponentInstance<true>
  new (
    props: NuxtLinkComponentProps<false>
  ): NuxtLinkComponentInstance<false>
  new<CustomProp extends boolean = false>(
    props: NuxtLinkComponentProps<CustomProp>
  ): NuxtLinkComponentInstance<CustomProp>
}

/* @__NO_SIDE_EFFECTS__ */
export function defineNuxtLink (options: NuxtLinkOptions): NuxtLinkComponent & Record<string, any> {
  const componentName = options.componentName || 'NuxtLink'

  function checkPropConflicts (props: NuxtLinkProps, main: keyof NuxtLinkProps, sub: keyof NuxtLinkProps): void {
    if (import.meta.dev && props[main] !== undefined && props[sub] !== undefined) {
      renderDiagnostics.NUXT_E4010({ componentName, main, sub })
    }
  }

  function isHashLinkWithoutHashMode (link: unknown): link is string {
    return !hashMode && typeof link === 'string' && link.startsWith('#')
  }

  function resolveTrailingSlashBehavior (to: string, resolve: Router['resolve'], trailingSlash?: NuxtLinkOptions['trailingSlash']): string
  function resolveTrailingSlashBehavior (to: RouteLocationRaw, resolve: Router['resolve'], trailingSlash?: NuxtLinkOptions['trailingSlash']): Exclude<RouteLocationRaw, string>
  function resolveTrailingSlashBehavior (to: RouteLocationRaw | undefined, resolve: Router['resolve'], trailingSlash?: NuxtLinkOptions['trailingSlash']): RouteLocationRaw | RouteLocation | undefined {
    const effectiveTrailingSlash = trailingSlash ?? options.trailingSlash
    if (!to || (effectiveTrailingSlash !== 'append' && effectiveTrailingSlash !== 'remove')) {
      return to
    }

    if (typeof to === 'string') {
      return applyTrailingSlashBehavior(to, effectiveTrailingSlash)
    }

    const path = 'path' in to && to.path !== undefined ? to.path : resolve(to).path

    const resolvedPath = {
      ...to,
      name: undefined, // named routes would otherwise always override trailing slash behavior
      path: applyTrailingSlashBehavior(path, effectiveTrailingSlash),
    }

    return resolvedPath
  }

  function useNuxtLink (props: { [K in keyof NuxtLinkProps]: MaybeRef<NuxtLinkProps[K]> }) {
    const router = useRouter()
    const config = useRuntimeConfig()

    const hasTarget = computed(() => { throw new Error("STUB"); })

    // Lazily check whether to.value has a protocol
    const isAbsoluteUrl = computed(() => {
        throw new Error("STUB");
    })

    const builtinRouterLink = resolveComponent('RouterLink') as string | typeof RouterLink
    const useBuiltinLink = builtinRouterLink && typeof builtinRouterLink !== 'string' ? builtinRouterLink.useLink : undefined

    // Resolving link type
    const isExternal = computed<boolean>(() => {
        throw new Error("STUB");
    })

    // Resolving `to` value from `to` and `href` props
    const to: ComputedRef<RouteLocationRaw> = computed(() => {
        throw new Error("STUB");
    })

    const link = isExternal.value ? undefined : useBuiltinLink?.({ ...props, to, viewTransition: unref(props.viewTransition) })

    // Resolves `to` value if it's a route location object
    const href = computed(() => {
        throw new Error("STUB");
    })

    return {
      to,
      hasTarget,
      isAbsoluteUrl,
      isExternal,
      //
      href,
      isActive: link?.isActive ?? computed(() => { throw new Error("STUB"); }),
      isExactActive: link?.isExactActive ?? computed(() => { throw new Error("STUB"); }),
      route: link?.route ?? computed(() => { throw new Error("STUB"); }),
      async navigate (_e?: MouseEvent) {
        if (href.value === null) {
          if (import.meta.dev) {
            navigationDiagnostics.NUXT_E2011({ componentName })
          }
          return
        }
        await navigateTo(href.value, { replace: unref(props.replace), external: isExternal.value || hasTarget.value })
      },
    } satisfies Omit<ReturnType<typeof useLink>, 'href'> & {
      to: ComputedRef<RouteLocationRaw>
      href: ComputedRef<string | null>
      hasTarget: ComputedRef<boolean | null | undefined>
      isAbsoluteUrl: ComputedRef<boolean>
      isExternal: ComputedRef<boolean>
    }
  }

  return defineComponent({
    name: componentName,
    props: {
      // Routing
      to: {
        type: [String, Object] as PropType<RouteLocationRaw>,
        default: undefined,
        required: false,
      },
      href: {
        type: [String, Object] as PropType<RouteLocationRaw>,
        default: undefined,
        required: false,
      },

      // Attributes
      target: {
        type: String as PropType<NuxtLinkProps['target']>,
        default: undefined,
        required: false,
      },
      rel: {
        type: String as PropType<NuxtLinkProps['rel']>,
        default: undefined,
        required: false,
      },
      noRel: {
        type: Boolean as PropType<NuxtLinkProps['noRel']>,
        default: undefined,
        required: false,
      },

      // Prefetching
      prefetch: {
        type: Boolean as PropType<NuxtLinkProps['prefetch']>,
        default: undefined,
        required: false,
      },
      prefetchOn: {
        type: [String, Object] as PropType<NuxtLinkProps['prefetchOn']>,
        default: undefined,
        required: false,
      },
      noPrefetch: {
        type: Boolean as PropType<NuxtLinkProps['noPrefetch']>,
        default: undefined,
        required: false,
      },

      // Styling
      activeClass: {
        type: String as PropType<NuxtLinkProps['activeClass']>,
        default: undefined,
        required: false,
      },
      exactActiveClass: {
        type: String as PropType<NuxtLinkProps['exactActiveClass']>,
        default: undefined,
        required: false,
      },
      prefetchedClass: {
        type: String as PropType<NuxtLinkProps['prefetchedClass']>,
        default: undefined,
        required: false,
      },

      // Vue Router's `<RouterLink>` additional props
      replace: {
        type: Boolean as PropType<NuxtLinkProps['replace']>,
        default: undefined,
        required: false,
      },
      ariaCurrentValue: {
        type: String as PropType<NuxtLinkProps['ariaCurrentValue']>,
        default: undefined,
        required: false,
      },

      // Edge cases handling
      external: {
        type: Boolean as PropType<NuxtLinkProps['external']>,
        default: undefined,
        required: false,
      },

      // Slot API
      custom: {
        type: Boolean as PropType<NuxtLinkProps['custom']>,
        default: undefined,
        required: false,
      },
      // Behavior
      trailingSlash: {
        type: String as PropType<NuxtLinkProps['trailingSlash']>,
        default: undefined,
        required: false,
      },
    },
    useLink: useNuxtLink,
    setup (props, { slots }) {
      const router = useRouter()

      const { to, href, navigate, isExternal, hasTarget, isAbsoluteUrl } = useNuxtLink(props)

      // Prefetching
      const prefetched = shallowRef(false)
      const el = import.meta.server ? undefined : ref<HTMLElement | null>(null)
      const elRef = import.meta.server ? undefined : (ref: any) => {
          throw new Error("STUB");
      }

      function shouldPrefetch (mode: 'visibility' | 'interaction'): boolean {
        if (import.meta.server) { return false }
        return Boolean((!prefetched.value && (typeof props.prefetchOn === 'string' ? props.prefetchOn === mode : (props.prefetchOn?.[mode] ?? options.prefetchOn?.[mode])) && (props.prefetch ?? options.prefetch) !== false && props.noPrefetch !== true && props.target !== '_blank' && !isSlowConnection()))
      }

      async function prefetch (nuxtApp = useNuxtApp()) {
        if (import.meta.server) { return }

        if (prefetched.value) { return }

        if (href.value === null) { return }

        prefetched.value = true

        const path = typeof to.value === 'string'
          ? to.value
          : isExternal.value ? resolveRouteObject(to.value) : router.resolve(to.value).fullPath
        const normalizedPath = isExternal.value ? new URL(path, window.location.href).href : path
        await Promise.all([
          nuxtApp.hooks.callHook('link:prefetch', normalizedPath)?.catch(() => {
              throw new Error("STUB");
          }),
          !import.meta.dev && !isExternal.value && !hasTarget.value && preloadRouteComponents(to.value as string, router).catch(() => {
              throw new Error("STUB");
          }),
        ])
      }

      if (import.meta.client && !props.custom) {
        checkPropConflicts(props, 'noPrefetch', 'prefetch')
        if (shouldPrefetch('visibility')) {
          const nuxtApp = useNuxtApp()
          let idleId: number
          let unobserve: (() => void) | null = null
          onMounted(() => {
              throw new Error("STUB");
          })
          onBeforeUnmount(() => {
              throw new Error("STUB");
          })
        }
      }

      if (import.meta.dev && import.meta.server && !props.custom) {
        const isNuxtLinkChild = inject(NuxtLinkDevKeySymbol, false)
        if (isNuxtLinkChild) {
          renderDiagnostics.NUXT_E4009()
        } else {
          provide(NuxtLinkDevKeySymbol, true)
        }
      }

      return () => {
          throw new Error("STUB");
      }
    },
  }) as unknown as NuxtLinkComponent & Record<string, any>
}

const NuxtLink: NuxtLinkComponent & Record<string, any> = defineNuxtLink(nuxtLinkDefaults)
export default NuxtLink

// -- NuxtLink utils --
function applyTrailingSlashBehavior (to: string, trailingSlash: NuxtLinkOptions['trailingSlash']): string {
  // When `trailingSlash` is unset (or not a valid value) the URL is returned untouched
  if (trailingSlash !== 'append' && trailingSlash !== 'remove') {
    return to
  }
  const normalizeFn = trailingSlash === 'append' ? withTrailingSlash : withoutTrailingSlash
  // Until https://github.com/unjs/ufo/issues/189 is resolved
  const hasProtocolDifferentFromHttp = hasProtocol(to) && !to.startsWith('http')
  if (hasProtocolDifferentFromHttp) {
    return to
  }
  return normalizeFn(to, true)
}

// --- Prefetching utils ---
type CallbackFn = () => void
type ObserveFn = (element: Element, callback: CallbackFn) => () => void

function useObserver (): { observe: ObserveFn } | undefined {
  if (import.meta.server) { return }

  const nuxtApp = useNuxtApp()
  if (nuxtApp._observer) {
    return nuxtApp._observer
  }

  let observer: IntersectionObserver | null = null

  const callbacks = new Map<Element, CallbackFn>()

  const observe: ObserveFn = (element, callback) => {
    observer ||= new IntersectionObserver((entries) => {
        throw new Error("STUB");
    })
    callbacks.set(element, callback)
    observer.observe(element)
    return () => {
        throw new Error("STUB");
    }
  }

  const _observer = nuxtApp._observer = {
    observe,
  }

  return _observer
}

const IS_2G_RE = /2g/
function isSlowConnection () {
  if (import.meta.server) { return }

  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/connection
  const cn = (navigator as any).connection as { saveData: boolean, effectiveType: string } | null
  if (cn && (cn.saveData || IS_2G_RE.test(cn.effectiveType))) { return true }
  return false
}
