import { defineComponent, h } from 'vue'
import type { DefineSetupFnComponent } from 'vue'
import { useLoadingIndicator } from '../composables/loading-indicator'

interface NuxtLoadingIndicatorProps {
  throttle?: number
  duration?: number
  hideDelay?: number
  resetDelay?: number
  height?: number
  color?: string | boolean
  errorColor?: string
  estimatedProgress?: (duration: number, elapsed: number) => number
}

const NuxtLoadingIndicator = defineComponent({
  name: 'NuxtLoadingIndicator',
  props: {
    throttle: {
      type: Number,
      default: 200,
    },
    duration: {
      type: Number,
      default: 2000,
    },
    hideDelay: {
      type: Number,
      default: 500,
    },
    resetDelay: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 3,
    },
    color: {
      type: [String, Boolean],
      default: 'repeating-linear-gradient(to right,#00dc82 0%,#34cdfe 50%,#0047e1 100%)',
    },
    errorColor: {
      type: String,
      default: 'repeating-linear-gradient(to right,#f87171 0%,#ef4444 100%)',
    },
    estimatedProgress: {
      type: Function as unknown as () => (duration: number, elapsed: number) => number,
      required: false,
    },
  },
  setup (props, { slots, expose }) {
    const { progress, isLoading, error, start, finish, clear } = useLoadingIndicator({
      duration: props.duration,
      throttle: props.throttle,
      hideDelay: props.hideDelay,
      resetDelay: props.resetDelay,
      estimatedProgress: props.estimatedProgress,
    })

    expose({
      progress, isLoading, error, start, finish, clear,
    })

    return () => { throw new Error("STUB"); }
  },
}) as unknown as DefineSetupFnComponent<NuxtLoadingIndicatorProps>

export default NuxtLoadingIndicator
