import { createConsola } from 'consola'
import type { LogObject } from 'consola'
import { parse } from 'devalue'
import type { ParsedTrace } from 'errx'

import { h } from 'vue'
import { defineNuxtPlugin } from '../nuxt'
import type { ObjectPlugin, Plugin } from '../nuxt'

import { devLogs, devRootDir } from '#build/nuxt.config.mjs'

const devRevivers: Record<string, (data: any) => any> = import.meta.server
  ? {}
  : {
      VNode: data => { throw new Error("STUB"); },
      URL: data => { throw new Error("STUB"); },
      Symbol: data => { throw new Error("STUB"); },
    }

const plugin: Plugin & ObjectPlugin = defineNuxtPlugin(async (nuxtApp) => {
    throw new Error("STUB");
})

function normalizeFilenames (stack?: ParsedTrace[]) {
  if (!stack) {
    return ''
  }
  let message = ''
  for (const item of stack) {
    const source = item.source.replace(`${devRootDir}/`, '')
    if (item.function) {
      message += `  at ${item.function} (${source})\n`
    } else {
      message += `  at ${source}\n`
    }
  }
  return message
}

function normalizeServerLog (log: LogObject) {
  log.additional = normalizeFilenames(log.stack as ParsedTrace[])
  log.tag = 'ssr'
  delete log.stack
  return log
}

export default plugin
