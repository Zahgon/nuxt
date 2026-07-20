import { defineComponent, h } from 'vue'
import type { DefineSetupFnComponent } from 'vue'
import { parseQuery } from 'vue-router'
import { isAbsolute, relative, resolve } from 'pathe'
import { renderDiagnostics } from '../diagnostics/render'
import { devRootDir } from '#build/nuxt.config.mjs'

const testComponentWrapper = (url: string): DefineSetupFnComponent<{}> => { throw new Error("STUB"); }

export default testComponentWrapper
