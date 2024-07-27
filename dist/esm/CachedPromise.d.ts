type TPendingCachedPromise<T> = Promise<T> & {
    status: "pending";
};
type TFulfilledCachedPromise<T> = Promise<T> & {
    status: "fulfilled";
    value: T;
};
type TRejectedCachedPromise = Promise<never> & {
    status: "rejected";
    reason: unknown;
};
export type CachedPromise<T> = TPendingCachedPromise<T> | TFulfilledCachedPromise<T> | TRejectedCachedPromise;
export declare const CachedPromise: {
    from: <T>(promise: Promise<T>) => TPendingCachedPromise<T>;
    fulfilled: <T_1>(value: T_1) => TFulfilledCachedPromise<T_1>;
    rejected: (reason: unknown) => TRejectedCachedPromise;
};
export declare function usePromise<T>(promise: CachedPromise<T>): T;
export {};
