import type { Entry } from './entry'

const entry: Entry | (() => Promise<Entry>) = import.meta.server
  ? ctx => { throw new Error("STUB"); }
  : () => { throw new Error("STUB"); }

if (import.meta.client) {
  entry()
}

export default entry
