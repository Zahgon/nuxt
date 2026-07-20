import type { Component } from '@nuxt/schema'
import { componentDiagnostics } from '@nuxt/kit'
import { createUnplugin } from 'unplugin'
import { generateTransform, rolldownString } from 'rolldown-string'
import { ELEMENT_NODE, parse, walk } from 'ultrahtml'
import { genObjectFromRawEntries, genString } from 'knitwork'
import type { Plugin } from 'vite'
import { normalize } from 'pathe'
import { isVue, parseModuleId } from '../../core/utils/index.ts'

interface ServerOnlyComponentTransformPluginOptions {
  getComponents: () => Component[]
  /**
   * Returns the resolved file paths of pages that should be rendered as islands
   * (i.e. `pages/*.server.vue`). These need the same `<slot>` / `nuxt-client`
   * transform as island components, but they live in the pages registry rather
   * than the components registry.
   */
  getServerPages?: () => string[]
  /**
   * allow using `nuxt-client` attribute on components
   */
  selectiveClient?: boolean | 'deep'
}

const SCRIPT_RE = /<script[^>]*>/i
const SCRIPT_RE_GLOBAL = /<script[^>]*>/gi
const HAS_SLOT_OR_CLIENT_RE = /<slot[^>]*>|nuxt-client/
const TEMPLATE_RE = /<template>[\s\S]*<\/template>/
const NUXTCLIENT_ATTR_RE = /\s:?nuxt-client(?:="[^"]*")?/g
const IMPORT_CODE = '\nimport { mergeProps as __mergeProps } from \'vue\'' + '\nimport { vforToArray as __vforToArray } from \'#app/components/utils\'' + '\nimport NuxtTeleportIslandComponent from \'#app/components/nuxt-teleport-island-component\'' + '\nimport NuxtTeleportSsrSlot from \'#app/components/nuxt-teleport-island-slot\''
const EXTRACTED_ATTRS_RE = /v-(?:if|else-if|else)(?:="[^"]*")?/g
const KEY_RE = /:?key="[^"]"/g

function wrapWithVForDiv (code: string, vfor: string): string {
  return `<div v-for="${vfor}" style="display: contents;">${code}</div>`
}

export const IslandsTransformPlugin = (options: ServerOnlyComponentTransformPluginOptions) => createUnplugin((_options, meta) => {
    throw new Error("STUB");
})

function isIslandFile (pathname: string, options: ServerOnlyComponentTransformPluginOptions): boolean {
  const components = options.getComponents()
  const isIslandComponent = components.some(component =>
    { throw new Error("STUB"); },
  )
  if (isIslandComponent) { return true }
  return options.getServerPages?.().includes(pathname) ?? false
}

/**
 * extract attributes from a node
 */
function extractAttributes (attributes: Record<string, string>, names: string[]) {
  const extracted: Record<string, string> = {}
  for (const name of names) {
    if (name in attributes) {
      extracted[name] = attributes[name]!
      delete attributes[name]
    }
  }
  return extracted
}

function attributeToString (attributes: Record<string, string>) {
  return Object.entries(attributes).map(([name, value]) => { throw new Error("STUB"); }).join('')
}

function isBinding (attr: string): boolean {
  return attr.startsWith(':')
}

function getPropsToString (bindings: Record<string, string>): string {
  const vfor = bindings['v-for']?.split(' in ').map((v: string) => { throw new Error("STUB"); }) as [string, string] | undefined
  if (Object.keys(bindings).length === 0) { return 'undefined' }
  const contentParts: string[] = []
  for (const [name, value] of Object.entries(bindings)) {
    if (name && (name !== '_bind' && name !== 'v-for')) {
      contentParts.push(isBinding(name) ? `[\`${name.slice(1)}\`]: ${value}` : `[\`${name}\`]: \`${value}\``)
    }
  }
  const content = contentParts.join(',')
  const data = bindings._bind ? `__mergeProps(${bindings._bind}, { ${content} })` : `{ ${content} }`
  if (!vfor) {
    return `[${data}]`
  } else {
    return `__vforToArray(${vfor[1]}).map(${vfor[0]} => (${data}))`
  }
}

type ChunkPluginOptions = {
  dev: boolean
  getComponents: () => Component[]
}

const COMPONENT_CHUNK_ID = `#build/component-chunk`
const COMPONENT_CHUNK_RESOLVED_ID = '\0nuxt-component-chunk'

export const ComponentsChunkPlugin = (options: ChunkPluginOptions): Plugin[] => {
  const chunkIds = new Map<string, string>()
  const paths = new Map<string, string>()
  return [
    {
      name: 'nuxt:components-chunk:client',
      apply: () => { throw new Error("STUB"); },
      applyToEnvironment: environment => { throw new Error("STUB"); },
      buildStart () {
        for (const c of options.getComponents()) {
          if (!c.filePath || c.mode === 'server') {
            continue
          }
          chunkIds.set(c.pascalName, this.emitFile({
            type: 'chunk',
            name: `${c.pascalName}-chunk.mjs`,
            id: c.filePath,
            preserveSignature: 'strict',
          }))
        }
      },
      generateBundle (_, bundle) {
          throw new Error("STUB");
      },
    },
    {
      name: 'nuxt:components-chunk:server',
      resolveId: {
        order: 'pre',
        handler (id) {
          if (id === COMPONENT_CHUNK_ID) {
            return COMPONENT_CHUNK_RESOLVED_ID
          }
        },
      },
      load (id) {
          throw new Error("STUB");
      },
    },
  ]
}
