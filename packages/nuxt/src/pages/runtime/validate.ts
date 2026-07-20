import { createError } from '#app/composables/error'
import { defineNuxtRouteMiddleware } from '#app/composables/router'
import type { RouteMiddleware } from '#app/composables/router'

const middleware: RouteMiddleware = defineNuxtRouteMiddleware(async (to) => {
    throw new Error("STUB");
})

export default middleware
