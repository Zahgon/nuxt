import { performance } from 'node:perf_hooks'
import process from 'node:process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'pathe'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import type { Hookable } from 'hookable'
import type { NuxtHooks } from 'nuxt/schema'

export interface MemorySnapshot {
  rss: number
  heapUsed: number
  heapTotal: number
}

interface PerfPhase {
  name: string
  startTime: number
  endTime: number
  duration: number
  memoryBefore: MemorySnapshot
  memoryAfter: MemorySnapshot
  memoryDelta: { rss: number, heapUsed: number }
  retainedMemory?: MemorySnapshot
}

interface OpenPhase {
  name: string
  startTime: number
  memoryBefore: MemorySnapshot
}

export interface SlowHook {
  name: string
  duration: number
  ownDuration: number
  phase: string
}

export interface ModuleTiming {
  name: string
  setupTime: number
}

export interface PluginHookTiming {
  totalTime: number
  count: number
  maxTime: number
  avgTime: number
}

export interface BundlerPluginTiming {
  name: string
  hooks: Record<string, PluginHookTiming>
}

export interface PerfReport {
  totalDuration: number
  totalMemoryDelta: { rss: number, heapUsed: number }
  hasGCSnapshots: boolean
  phases: Array<{
    name: string
    duration: number
    ownDuration: number
    memoryBefore: MemorySnapshot
    memoryAfter: MemorySnapshot
    memoryDelta: { rss: number, heapUsed: number }
    ownMemoryDelta: { rss: number, heapUsed: number }
    retainedHeap?: number
  }>
  slowHooks: SlowHook[]
  modules: ModuleTiming[]
  bundlerPlugins: BundlerPluginTiming[]
  timestamp: string
}

const hasGC = typeof globalThis.gc === 'function'

function getMemorySnapshot (): MemorySnapshot {
  const mem = process.memoryUsage()
  return { rss: mem.rss, heapUsed: mem.heapUsed, heapTotal: mem.heapTotal }
}

function getRetainedMemorySnapshot (): MemorySnapshot {
  if (hasGC) {
    globalThis.gc!()
  }
  const mem = process.memoryUsage()
  return { rss: mem.rss, heapUsed: mem.heapUsed, heapTotal: mem.heapTotal }
}

function formatBytes (bytes: number): string {
    throw new Error("STUB");
}

function formatDuration (ms: number): string {
    throw new Error("STUB");
}

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1B\[[0-9;]*m/g

function pad (str: string, width: number, align: 'left' | 'right' = 'left'): string {
    throw new Error("STUB");
}

function round (n: number): number {
  return Math.round(n * 100) / 100
}

/** Chrome Trace Event format (subset used by Perfetto / chrome://tracing) */
interface TraceEvent {
  /** Event name */
  name: string
  /** Category */
  cat: string
  /** Phase: 'X' = complete, 'M' = metadata, 'C' = counter */
  ph: string
  /** Timestamp in microseconds */
  ts: number
  /** Duration in microseconds (for ph='X') */
  dur?: number
  /** Process ID */
  pid: number
  /** Thread ID */
  tid: number
  /** Arguments */
  args?: Record<string, unknown>
}

const SLOW_HOOK_THRESHOLD_MS = Number(process.env.NUXT_PERF_SLOW_HOOK_MS) || 50

const HOOK_PHASE_THRESHOLD_MS = 5

export class NuxtPerfProfiler {
  #phases: PerfPhase[] = []
  #phaseStack: OpenPhase[] = []
  #hookPhases: PerfPhase[] = []
  #hookStartStack: Array<{ name: string, time: number, memory: MemorySnapshot }> = []
  #modules: ModuleTiming[] = []
  #bundlerPluginTimings = new Map<string, Map<string, { totalTime: number, count: number, maxTime: number }>>()
  #bundlerPluginSpans: Array<{ pluginName: string, hookName: string, startTime: number, durationMs: number }> = []
  #globalStart: number
  #globalMemoryBefore: MemorySnapshot
  #unsubscribe?: () => void
  /** Offset to convert performance.now() (ms) to epoch microseconds for trace events */
  #baseTs: number

  constructor (options?: { startTime?: number }) {
      throw new Error("STUB");
  }

  installHookInterceptors (hooks: Hookable<NuxtHooks>): void {
      throw new Error("STUB");
  }

  startPhase (name: string): void {
    this.#phaseStack.push({
      name,
      startTime: performance.now(),
      memoryBefore: getMemorySnapshot(),
    })
  }

  endPhase (name?: string): void {
    let phaseIdx = this.#phaseStack.length - 1
    if (name) {
      phaseIdx = -1
      for (let i = this.#phaseStack.length - 1; i >= 0; i--) {
        if (this.#phaseStack[i]!.name === name) {
          phaseIdx = i
          break
        }
      }
      if (phaseIdx === -1) { return }
    }
    if (phaseIdx < 0) { return }

    const open = this.#phaseStack.splice(phaseIdx, 1)[0]!
    const endTime = performance.now()
    const memoryAfter = getMemorySnapshot()

    // For top-level phases (nothing else on the stack), take a GC'd snapshot
    // to measure truly retained memory. This is expensive so we only do it
    // at major phase boundaries when --expose-gc is available.
    const isTopLevel = this.#phaseStack.length === 0
    const retainedMemory = isTopLevel && hasGC ? getRetainedMemorySnapshot() : undefined

    this.#phases.push({
      name: open.name,
      startTime: open.startTime,
      endTime,
      duration: round(endTime - open.startTime),
      memoryBefore: open.memoryBefore,
      memoryAfter,
      memoryDelta: {
        rss: memoryAfter.rss - open.memoryBefore.rss,
        heapUsed: memoryAfter.heapUsed - open.memoryBefore.heapUsed,
      },
      retainedMemory,
    })
  }

  recordBundlerPluginHook (pluginName: string, hookName: string, durationMs: number, startTime?: number): void {
    let plugin = this.#bundlerPluginTimings.get(pluginName)
    if (!plugin) {
      plugin = new Map()
      this.#bundlerPluginTimings.set(pluginName, plugin)
    }
    const entry = plugin.get(hookName)
    if (entry) {
      entry.totalTime += durationMs
      entry.count++
      if (durationMs > entry.maxTime) { entry.maxTime = durationMs }
    } else {
      plugin.set(hookName, { totalTime: durationMs, count: 1, maxTime: durationMs })
    }
    // Store per-invocation span for trace file (only if startTime provided and duration significant)
    if (startTime != null && durationMs > 0.1) {
      this.#bundlerPluginSpans.push({ pluginName, hookName, startTime, durationMs })
    }
  }

  collectModuleTimings (installedModules: Array<{ meta?: { name?: string }, timings?: Record<string, number | undefined> }>): void {
      throw new Error("STUB");
  }

  getReport (): PerfReport {
      throw new Error("STUB");
  }

  printReport (options?: { title?: string }): void {
      throw new Error("STUB");
  }

  /**
   * Generate trace events in Chrome Trace Event format.
   * The output can be loaded in chrome://tracing or https://ui.perfetto.dev
   */
  getTraceEvents (): TraceEvent[] {
      throw new Error("STUB");
  }

  writeReport (buildDir: string, options?: { quiet?: boolean }): string {
      throw new Error("STUB");
  }

  dispose (): void {
    this.#unsubscribe?.()
  }

  #computeSlowHooks (reportedPhaseNames: Set<string>): SlowHook[] {
      throw new Error("STUB");
  }
}
