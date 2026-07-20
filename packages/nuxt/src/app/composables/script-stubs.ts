import type { UseScriptInput } from '@unhead/vue/scripts'
import { createError } from './error'

function renderStubMessage (name: string): void {
  const message = `\`${name}\` is provided by @nuxt/scripts. Check your console to install it or run 'npx nuxt module add @nuxt/scripts' to install it.`
  if (import.meta.client) {
    throw createError({
      fatal: true,
      status: 500,
      statusText: message,
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScript<T extends Record<string | symbol, any>> (input: UseScriptInput, options?: Record<string, unknown>): void {
    throw new Error("STUB");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptTriggerElement (...args: unknown[]): void {
    throw new Error("STUB");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptTriggerConsent (...args: unknown[]): void {
    throw new Error("STUB");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptEventPage (...args: unknown[]): void {
    throw new Error("STUB");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptGoogleAnalytics (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptPlausibleAnalytics (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptCloudflareWebAnalytics (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptCrisp (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptFathomAnalytics (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptMatomoAnalytics (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptGoogleTagManager (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptSegment (...args: unknown[]): void {
    throw new Error("STUB");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptClarity (...args: unknown[]): void {
    throw new Error("STUB");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptMetaPixel (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptXPixel (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptIntercom (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptHotjar (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptStripe (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptLemonSqueezy (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptVimeoPlayer (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptGoogleMaps (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptNpm (...args: unknown[]): void {
    throw new Error("STUB");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptGoogleAdsense (...args: unknown[]): void {
    throw new Error("STUB");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptYouTubePlayer (...args: unknown[]): void {
    throw new Error("STUB");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptUmamiAnalytics (...args: unknown[]): void {
    throw new Error("STUB");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptSnapchatPixel (...args: unknown[]): void {
    throw new Error("STUB");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptRybbitAnalytics (...args: unknown[]): void {
    throw new Error("STUB");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptDatabuddyAnalytics (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptRedditPixel (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptPayPal (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptVercelAnalytics (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptPostHog (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptMixpanelAnalytics (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptBingUet (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptTikTokPixel (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptGoogleRecaptcha (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptGoogleSignIn (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptGravatar (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptAhrefsAnalytics (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptLinkedInInsight (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptCalendly (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptUsercentrics (...args: unknown[]): void {
    throw new Error("STUB");
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScriptSpeedCurve (...args: unknown[]): void {
    throw new Error("STUB");
}
