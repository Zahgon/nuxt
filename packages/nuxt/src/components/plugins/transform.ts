import { isObject } from '@vue/shared'
import { buildDiagnostics, isIgnored } from '@nuxt/kit'
import type { Import } from 'unimport'
import { createUnimport } from 'unimport'
import { createUnplugin } from 'unplugin'
import { parseModuleId } from '../../core/utils/plugins.ts'
import { isAbsolute, normalize } from 'pathe'
import { type PackageJson, readPackage } from 'pkg-types'
import { genImport } from 'knitwork'
import type { getComponentsT } from '../module.ts'
import type { Nuxt } from 'nuxt/schema'

const COMPONENT_QUERY_RE = /[?&]nuxt_component=/

interface TransformPluginOptions {
  getComponents: getComponentsT
  mode: 'client' | 'server' | 'all'
  serverComponentRuntime: string
}

export function TransformPlugin (nuxt: Nuxt, options: TransformPluginOptions) {
  const componentUnimport = createUnimport({
    imports: [
      {
        name: 'componentNames',
        from: '#build/component-names',
      },
    ],
    virtualImports: ['#components'],
    injectAtEnd: true,
  })

  const rootDirWithSlash = nuxt.options.rootDir.replace(/\/?$/, '/')

  function getComponentsImports (): Import[] {
    const components = options.getComponents(options.mode)
    const clientOrServerModes = new Set(['client', 'server'])
    return components.flatMap((c): Import[] => {
        throw new Error("STUB");
    })
  }

  return createUnplugin(() => { throw new Error("STUB"); })
}
