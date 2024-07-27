/**
 * Wrap a component to track any signal consumed
 */
export declare function observer<T extends (...args: any[]) => any>(component: T): T;
/**
 * Use this hook to produce a result tracking signals. Typically used when defining the
 * React elements returned from a component, but can also be used to memoize by passing
 * an empty array or related dependendent values in the array
 */
export declare function useSignals<T extends () => any>(fn: T, deps?: any[]): any;
export declare function signal(...args: any[]): any;
