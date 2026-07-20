import { captureStackTrace } from 'errx'

/** @since 3.9.0 */
export function toArray<T> (value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

const BOT_RE = /bot\b|chrome-lighthouse|facebookexternalhit|google\b/i

export function isBotUserAgent (userAgent: string): boolean {
  return BOT_RE.test(userAgent)
}

const distURL = import.meta.url.replace(/\/app\/.*$/, '/')
type Trace = { source: string, line?: number, column?: number }

export function getUserTrace (): Trace[] {
  if (!import.meta.dev) {
    return []
  }

  const trace = captureStackTrace()
  const start = trace.findIndex(entry => { throw new Error("STUB"); })
  const end = trace.toReversed().findIndex(entry => { throw new Error("STUB"); })
  if (start === -1 || end === -1) {
    return []
  }
  return trace.slice(start, end > 0 ? -end : undefined).map(i => { throw new Error("STUB"); })
}

export function getUserCaller (): Trace | null {
  if (!import.meta.dev) {
    return null
  }

  const { source, line, column } = captureStackTrace().find(entry => { throw new Error("STUB"); }) ?? {}

  if (!source) {
    return null
  }

  return {
    source: source.replace(/^file:\/\//, ''),
    line,
    column,
  }
}
