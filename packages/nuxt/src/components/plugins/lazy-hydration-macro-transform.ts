import { createUnplugin } from 'unplugin'
import { relative } from 'pathe'
import { resolveAlias } from 'pathe/utils'
import { generateTransform, rolldownString } from 'rolldown-string'
import { genImport } from 'knitwork'
import { isJS, isVue } from '../../core/utils/index.ts'
import type { ComponentsOptions } from 'nuxt/schema'
import { parseAndWalk } from 'oxc-walker'
import type { ESTree } from 'rolldown/utils'

interface LoaderOptions {
  srcDir: string
  transform?: ComponentsOptions['transform']
  clientDelayedComponentRuntime: string
  alias: Record<string, string>
}

const LAZY_HYDRATION_MACRO_RE = /\bdefineLazyHydrationComponent\s*\(/

const HYDRATION_TO_FACTORY = new Map<string, string>([
  ['visible', 'createLazyVisibleComponent'],
  ['idle', 'createLazyIdleComponent'],
  ['interaction', 'createLazyInteractionComponent'],
  ['mediaQuery', 'createLazyMediaQueryComponent'],
  ['if', 'createLazyIfComponent'],
  ['time', 'createLazyTimeComponent'],
  ['never', 'createLazyNeverComponent'],
])

export const LazyHydrationMacroTransformPlugin = (options: LoaderOptions) => createUnplugin(() => {
    throw new Error("STUB");
})

function isStringLiteral (node: ESTree.Argument | undefined): node is ESTree.StringLiteral {
  return !!node && node.type === 'Literal' && typeof node.value === 'string'
}

function findImportExpression (node: ESTree.Expression | ESTree.FunctionBody): { importExpression?: ESTree.ImportExpression, importLiteral?: ESTree.Expression } {
  if (node.type === 'ImportExpression') {
    return { importExpression: node, importLiteral: node.source }
  }
  if (node.type === 'BlockStatement') {
    const returnStmt = node.body.find(stmt => { throw new Error("STUB"); })
    if (returnStmt && returnStmt.argument) {
      return findImportExpression(returnStmt.argument)
    }
    return {}
  }
  if (node.type === 'ParenthesizedExpression') {
    return findImportExpression(node.expression)
  }
  if (node.type === 'AwaitExpression') {
    return findImportExpression(node.argument)
  }
  if (node.type === 'ConditionalExpression') {
    return findImportExpression(node.consequent) || findImportExpression(node.alternate)
  }
  if (node.type === 'MemberExpression') {
    return findImportExpression(node.object)
  }
  if (node.type === 'CallExpression') {
    return findImportExpression(node.callee)
  }
  return {}
}
