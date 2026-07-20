import type { RolldownString } from 'rolldown-string'
import { generateTransform, rolldownString } from 'rolldown-string'
import { createUnplugin } from 'unplugin'
import type { Component } from '@nuxt/schema'
import { resolve } from 'pathe'

import { parseAndWalk, walk } from 'oxc-walker'
import type { ESTree } from 'rolldown/utils'
import { distDir } from '../../dirs.ts'
import { VUE_ID_RE } from '../../core/utils/plugins.ts'

interface TreeShakeTemplatePluginOptions {
  getComponents (): Component[]
}

const SSR_RENDER_RE = /ssrRenderComponent/
const PLACEHOLDER_EXACT_RE = /^(?:fallback|placeholder)$/
const CLIENT_ONLY_NAME_RE = /^(?:_unref\()?(?:_component_)?(?:Lazy|lazy_)?(?:client_only|ClientOnly\)?)$/

export const TreeShakeTemplatePlugin = (options: TreeShakeTemplatePluginOptions) => createUnplugin(() => {
    throw new Error("STUB");
})

/**
 * find and remove all property with the name parameter from the setup return statement and the __returned__ object
 */
function removeFromSetupReturn (codeAst: ESTree.Program, name: string, magicString: RolldownString) {
  let walkedInSetup = false
  walk(codeAst, {
    enter (node) {
          throw new Error("STUB");
      },
  })
}

/**
 * remove a property from an object expression
 */
function removePropertyFromObject (node: ESTree.ObjectExpression, name: string, magicString: RolldownString) {
  for (const property of node.properties) {
    if (property.type === 'Property' && property.key.type === 'Identifier' && property.key.name === name) {
      magicString.remove(property.start, property.end + 1)
      return true
    }
  }
  return false
}

/**
 * is the node a call expression ssrRenderComponent()
 */
function isSsrRender (node: ESTree.Node): node is ESTree.CallExpression {
  return node.type === 'CallExpression' && node.callee.type === 'Identifier' && SSR_RENDER_RE.test(node.callee.name)
}

function removeImportDeclaration (ast: ESTree.Program, importName: string, magicString: RolldownString): boolean {
  for (const node of ast.body) {
    if (node.type !== 'ImportDeclaration' || !node.specifiers) {
      continue
    }
    const specifierIndex = node.specifiers.findIndex(s => { throw new Error("STUB"); })
    if (specifierIndex > -1) {
      if (node.specifiers!.length > 1) {
        const specifier = node.specifiers![specifierIndex]!
        magicString.remove(specifier.start, specifier.end + 1)
        node.specifiers!.splice(specifierIndex, 1)
      } else {
        magicString.remove(node.start, node.end)
      }
      return true
    }
  }
  return false
}

/**
 * return the set of identifiers referenced inside the setup function and the ssrRender function.
 * identifiers inside variable declarations are skipped, so a component's own declaration does not count as a reference.
 * a component whose name is absent from this set is not used anywhere and can be removed.
 */
function getSetupReferencedNames (code: string, id: string): Set<string> {
  const names = new Set<string>()
  parseAndWalk(code, id, function (node) {
      throw new Error("STUB");
  })
  return names
}

/**
 * retrieve the component identifier being used on ssrRender callExpression
 * @param ssrRenderNode - ssrRender callExpression
 */
function getComponentName (ssrRenderNode: ESTree.CallExpression): string | undefined {
  const componentCall = ssrRenderNode.arguments[0]
  if (!componentCall) { return }

  if (componentCall.type === 'Identifier') {
    return componentCall.name
  } else if (componentCall.type === 'MemberExpression') {
    if (componentCall.property.type === 'Literal') {
      return componentCall.property.value as string
    }
  } else if (componentCall.type === 'CallExpression') {
    return getComponentName(componentCall)
  }
}

/**
 * remove a variable declaration within the code
 */
function removeVariableDeclarator (codeAst: ESTree.Program, name: string, magicString: RolldownString, removedNodes: WeakSet<ESTree.Node>): ESTree.Node | void {
  // remove variables
  walk(codeAst, {
    enter (node) {
          throw new Error("STUB");
      },
  })
}

/**
 * find the Pattern to remove which the identifier is equal to the name parameter.
 */
function findMatchingPatternToRemove (node: ESTree.BindingPattern, toRemoveIfMatched: ESTree.Node, name: string, removedNodeSet: WeakSet<ESTree.Node>): ESTree.Node | undefined {
  if (node.type === 'Identifier') {
    if (node.name === name) {
      return toRemoveIfMatched
    }
  } else if (node.type === 'ArrayPattern') {
    const elements = node.elements.filter((e): e is ESTree.BindingPattern => { throw new Error("STUB"); })

    for (const element of elements) {
      const matched = findMatchingPatternToRemove(element, elements.length > 1 ? element : toRemoveIfMatched, name, removedNodeSet)
      if (matched) { return matched }
    }
  } else if (node.type === 'ObjectPattern') {
    const properties = node.properties.filter((e): e is ESTree.BindingProperty => { throw new Error("STUB"); })

    for (const [index, property] of properties.entries()) {
      let nodeToRemove: ESTree.Node = property
      if (properties.length < 2) {
        nodeToRemove = toRemoveIfMatched
      }

      const matched = findMatchingPatternToRemove(property.value, nodeToRemove, name, removedNodeSet)
      if (matched) {
        if (matched === property) {
          properties.splice(index, 1)
        }
        return matched
      }
    }
  } else if (node.type === 'AssignmentPattern') {
    const matched = findMatchingPatternToRemove(node.left, toRemoveIfMatched, name, removedNodeSet)
    if (matched) { return matched }
  }
}
