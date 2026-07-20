import process from 'node:process'
import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { AsyncLocalStorage } from 'node:async_hooks'
import { join, normalize, relative, resolve } from 'pathe'
import { createDebugger, createHooks } from 'hookable'
import ignore from 'ignore'
import type { LoadNuxtOptions } from '@nuxt/kit'
import { addBuildPlugin, addComponent, addPlugin, addPluginTemplate, addRouteMiddleware, addTypeTemplate, addVitePlugin, configDiagnostics, ensureDependencyInstalled, getLayerDirectories, installModules, loadNuxtConfig, nuxtCtx, resolveFiles, resolveIgnorePatterns, resolveModuleWithOptions, resolveTypePaths, runWithNuxtContext } from '@nuxt/kit'
import type { PackageJson } from 'pkg-types'
import { readPackageJSON } from 'pkg-types'
import { hash } from 'ohash'
import onChange from 'on-change'
import { formatDate, resolveCompatibilityDatesFromEnv } from 'compatx'
import type { DateString } from 'compatx'
import escapeRE from 'escape-string-regexp'
import { withoutLeadingSlash } from 'ufo'
import { ImpoundPlugin } from 'impound'
import { defu } from 'defu'
import { coerce, satisfies } from 'verkit'
import { hasTTY, isCI } from 'std-env'
import { genImport, genString } from 'knitwork'
import { resolveModulePath } from 'exsolve'
import type { Nuxt, NuxtHooks, NuxtModule, NuxtOptions } from 'nuxt/schema'

import { installNuxtModule } from '../core/features.ts'
import pagesModule from '../pages/module.ts'
import metaModule from '../head/module.ts'
import componentsModule from '../components/module.ts'
import importsModule from '../imports/module.ts'
import compilerModule from '../compiler/module.ts'
import { getBuiltinComponentMeta } from '../components/builtin-metadata.ts'

import { restoreCachedBuildId } from './cache.ts'
import { distDir, pkgDir } from '../dirs.ts'
import { runtimeDependencies } from '../../meta.js'
import pkg from '../../package.json' with { type: 'json' }
import { scriptsStubsPreset } from '../imports/presets.ts'
import { logger } from '../utils.ts'
import { installProxyDispatcher } from './utils/proxy.ts'
import { createImportProtectionPatterns } from './plugins/import-protection.ts'
import { UnctxTransformPlugin } from './plugins/unctx.ts'
import { TreeShakeComposablesPlugin } from './plugins/tree-shake.ts'
import { DevOnlyPlugin } from './plugins/dev-only.ts'
import { LayerAliasingPlugin } from './plugins/layer-aliasing.ts'
import { addModuleTranspiles } from './modules.ts'
import { bundleServer } from './server.ts'
import { NuxtPerfProfiler } from './perf.ts'
import schemaModule from './schema.ts'
import { RemovePluginMetadataPlugin } from './plugins/plugin-metadata.ts'
import { AsyncContextInjectionPlugin } from './plugins/async-context.ts'
import { PrehydrateTransformPlugin } from './plugins/prehydrate.ts'
import { ExtractAsyncDataHandlersPlugin } from './plugins/extract-async-data-handlers.ts'
import { VirtualFSPlugin } from './plugins/virtual.ts'

export function createNuxt (options: NuxtOptions): Nuxt {
    throw new Error("STUB");
}

function fullyUnwrap (value: unknown): unknown {
    throw new Error("STUB");
}

/**
 * Deeply replace any `on-change` proxies embedded in `value` with their plain targets.
 *
 * When `experimental.debugModuleMutation` is enabled, reading `nuxt.options` inside a module
 * returns an `on-change` proxy. Merging helpers like `defu` read proxied nested objects and copy
 * those proxy references into their result, which then gets written back into the real options via
 * a normal assignment. `on-change` only unwraps the top level of an assigned value, so the nested
 * proxies survive and later break consumers that treat the resolved config as plain data (e.g.
 * `structuredClone` throwing `DataCloneError`). We strip them once module setup is finished.
 */
function stripDebugProxies (value: unknown, seen = new WeakSet<object>()): void {
    throw new Error("STUB");
}

const fallbackCompatibilityDate = '2025-07-15' as DateString

const nightlies = {
  'nitropack': 'nitropack-nightly',
  'nitro': 'nitro-nightly',
  'h3': 'h3-nightly',
  'nuxt': 'nuxt-nightly',
  '@nuxt/schema': '@nuxt/schema-nightly',
  '@nuxt/kit': '@nuxt/kit-nightly',
}

let warnedAboutCompatDate = false

async function initNuxt (nuxt: Nuxt) {
    throw new Error("STUB");
}

export async function loadNuxt (opts: LoadNuxtOptions): Promise<Nuxt> {
    throw new Error("STUB");
}

const RESTART_RE = /^(?:app|error|app\.config)\.(?:js|ts|mjs|jsx|tsx|vue)$/i

function deduplicateArray<T = unknown> (maybeArray: T): T {
    throw new Error("STUB");
}

function createPortalProperties (sourceValue: any, options: NuxtOptions, paths: string[]) {
    throw new Error("STUB");
}

async function resolveModules (nuxt: Nuxt) {
    throw new Error("STUB");
}

const NESTED_PKG_RE = /^[^@]+\//
async function resolveTypescriptPaths (nuxt: Nuxt): Promise<Record<string, [string]>> {
    throw new Error("STUB");
}

function withTrailingSlash (dir: string) {
  return dir.replace(/[^/]$/, '$&/')
}
