import { computed, defineComponent, h } from 'vue'
import type { DefineSetupFnComponent, SlotsType, VNode } from 'vue'
import type { Politeness } from '../composables/route-announcer'
import { useRouteAnnouncer } from '../composables/route-announcer'

interface NuxtRouteAnnouncerProps {
  atomic?: boolean
  politeness?: Politeness
}

type NuxtRouteAnnouncerSlots = SlotsType<{
  default?: (props: { message: string }) => VNode[]
}>

const NuxtRouteAnnouncer = defineComponent({
  name: 'NuxtRouteAnnouncer',
  props: {
    atomic: {
      type: Boolean,
      default: false,
    },
    politeness: {
      type: String as () => Politeness,
      default: 'polite',
    },
  },
  setup (props, { slots, expose }) {
    const { set, polite, assertive, message, politeness } = useRouteAnnouncer({ politeness: props.politeness })

    const role = computed(() => {
        throw new Error("STUB");
    })

    expose({
      set, polite, assertive, message, politeness,
    })

    return () => { throw new Error("STUB"); }
  },
}) as unknown as DefineSetupFnComponent<NuxtRouteAnnouncerProps, {}, NuxtRouteAnnouncerSlots>

export default NuxtRouteAnnouncer
