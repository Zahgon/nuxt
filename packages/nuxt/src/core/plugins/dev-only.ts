import { generateTransform, rolldownString } from 'rolldown-string'
import { createUnplugin } from 'unplugin'
import { parse } from 'ultrahtml'
import type { Node } from 'ultrahtml'
import { isVue } from '../utils/index.ts'

const DEVONLY_COMP_SINGLE_RE = /<(?:dev-only|DevOnly|lazy-dev-only|LazyDevOnly)(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?>[\s\S]*?<\/(?:dev-only|DevOnly|lazy-dev-only|LazyDevOnly)>/
const DEVONLY_COMP_RE = /<(?:dev-only|DevOnly|lazy-dev-only|LazyDevOnly)(?:\s(?:[^>"']|"[^"]*"|'[^']*')*)?>[\s\S]*?<\/(?:dev-only|DevOnly|lazy-dev-only|LazyDevOnly)>/g

export const DevOnlyPlugin = () => { throw new Error("STUB"); }
