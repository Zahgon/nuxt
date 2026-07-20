import { hasProtocol } from 'ufo'
import { defineNuxtRouteMiddleware } from '../composables/router'
import type { RouteMiddleware } from '../composables/router'
import { getRouteRules } from '../composables/manifest'

const middleware: RouteMiddleware = defineNuxtRouteMiddleware((to) => {
    throw new Error("STUB");
})

export default middleware
