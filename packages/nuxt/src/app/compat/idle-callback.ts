// Polyfills for Safari support
// https://caniuse.com/requestidlecallback
export const requestIdleCallback: Window['requestIdleCallback'] = import.meta.server
  ? (() => {
        throw new Error("STUB");
    }) as any
  : (globalThis.requestIdleCallback || ((cb) => {
        throw new Error("STUB");
    }))

export const cancelIdleCallback: Window['cancelIdleCallback'] = import.meta.server
  ? (() => {
        throw new Error("STUB");
    }) as any
  : (globalThis.cancelIdleCallback || ((id) => {
        throw new Error("STUB");
    }))
