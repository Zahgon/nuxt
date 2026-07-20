import { defineAsyncComponent, defineComponent, h, hydrateOnIdle, hydrateOnInteraction, hydrateOnMediaQuery, hydrateOnVisible, mergeProps } from 'vue'
import type { AsyncComponentLoader, ComponentObjectPropsOptions, DefineSetupFnComponent, ExtractPropTypes, HydrationStrategy } from 'vue'
import { useNuxtApp } from '#app/nuxt'

type LazyHydrationEmits = {
  hydrated: () => void
}

type LazyComponentFactory<Props extends Record<string, any>> = (id: string, loader: AsyncComponentLoader) => DefineSetupFnComponent<Props, LazyHydrationEmits>

function defineLazyComponent<P extends ComponentObjectPropsOptions, Props extends Record<string, any> = ExtractPropTypes<P>> (props: P, defineStrategy: (props: ExtractPropTypes<P>) => HydrationStrategy | undefined): LazyComponentFactory<Props> {
  return (id: string, loader: AsyncComponentLoader) => { throw new Error("STUB"); }
}

interface LazyVisibleProps { hydrateOnVisible?: true | IntersectionObserverInit }

/* @__NO_SIDE_EFFECTS__ */
export const createLazyVisibleComponent: LazyComponentFactory<LazyVisibleProps> = defineLazyComponent({
  hydrateOnVisible: {
    type: [Object, Boolean] as unknown as () => true | IntersectionObserverInit,
    required: false,
    default: true,
  },
},
props => { throw new Error("STUB"); },
)

interface LazyIdleProps { hydrateOnIdle?: true | number }

/* @__NO_SIDE_EFFECTS__ */
export const createLazyIdleComponent: LazyComponentFactory<LazyIdleProps> = defineLazyComponent({
  hydrateOnIdle: {
    type: [Number, Boolean] as unknown as () => true | number,
    required: false,
    default: true,
  },
},
props => { throw new Error("STUB"); },
)

const defaultInteractionEvents: Array<keyof HTMLElementEventMap> = ['pointerenter', 'click', 'focus']

interface LazyInteractionProps { hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true }

/* @__NO_SIDE_EFFECTS__ */
export const createLazyInteractionComponent: LazyComponentFactory<LazyInteractionProps> = defineLazyComponent({
  hydrateOnInteraction: {
    type: [String, Array] as unknown as () => keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true,
    required: false,
    default: (): Array<keyof HTMLElementEventMap> => { throw new Error("STUB"); },
  },
},
props => { throw new Error("STUB"); },
)

interface LazyMediaQueryProps { hydrateOnMediaQuery: string }

/* @__NO_SIDE_EFFECTS__ */
export const createLazyMediaQueryComponent: LazyComponentFactory<LazyMediaQueryProps> = defineLazyComponent({
  hydrateOnMediaQuery: {
    type: String as unknown as () => string,
    required: true,
  },
},
props => { throw new Error("STUB"); },
)

interface LazyIfProps { hydrateWhen?: boolean }

/* @__NO_SIDE_EFFECTS__ */
export const createLazyIfComponent: LazyComponentFactory<LazyIfProps> = defineLazyComponent({
  hydrateWhen: {
    type: Boolean,
    default: true,
  },
},
props => { throw new Error("STUB"); }, /* Vue will trigger the hydration automatically when the prop changes */
)

interface LazyTimeProps { hydrateAfter: number }

/* @__NO_SIDE_EFFECTS__ */
export const createLazyTimeComponent: LazyComponentFactory<LazyTimeProps> = defineLazyComponent({
  hydrateAfter: {
    type: Number,
    required: true,
  },
},
props => { throw new Error("STUB"); },
)

interface LazyNeverProps { hydrateNever?: true }

/* @__NO_SIDE_EFFECTS__ */
const hydrateNever = (): void => {
    throw new Error("STUB");
}
export const createLazyNeverComponent: LazyComponentFactory<LazyNeverProps> = defineLazyComponent({
  hydrateNever: {
    type: Boolean as () => true,
    required: false,
    default: true,
  },
},
() => { throw new Error("STUB"); },
)
