import { computed, defineComponent, h } from 'vue'
import type { DefineSetupFnComponent, SlotsType, VNode } from 'vue'
import type { AnnouncerPoliteness } from '../composables/announcer'
import { useAnnouncer } from '../composables/announcer'

interface NuxtAnnouncerProps {
  atomic?: boolean
  politeness?: AnnouncerPoliteness
}

type NuxtAnnouncerSlots = SlotsType<{
  default?: (props: { message: string }) => VNode[]
}>

const NuxtAnnouncer = defineComponent({
  name: 'NuxtAnnouncer',
  props: {
    atomic: {
      type: Boolean,
      default: true,
    },
    politeness: {
      type: String as () => AnnouncerPoliteness,
      default: 'polite',
    },
  },
  setup (props, { slots, expose }) {
    const { set, polite, assertive, message, politeness } = useAnnouncer({
      politeness: props.politeness,
    })

    const role = computed(() => {
        throw new Error("STUB");
    })

    expose({
      set,
      polite,
      assertive,
      message,
      politeness,
    })

    return () => { throw new Error("STUB"); }
  },
}) as unknown as DefineSetupFnComponent<NuxtAnnouncerProps, {}, NuxtAnnouncerSlots>

export default NuxtAnnouncer
