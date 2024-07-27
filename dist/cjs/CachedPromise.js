"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePromise = exports.CachedPromise = void 0;
exports.CachedPromise = {
    from: (promise) => {
        promise
            .then((value) => {
            makePromiseFulfilledCachedPromise(promise, value);
        })
            .catch((reason) => {
            makePromiseRejectedCachedPromise(promise, reason);
        });
        return makePromisePendingCachedPromise(promise);
    },
    fulfilled: (value) => {
        const promise = Promise.resolve(value);
        return makePromiseFulfilledCachedPromise(promise, value);
    },
    rejected: (reason) => {
        const promise = Promise.reject(reason);
        return makePromiseRejectedCachedPromise(promise, reason);
    },
};
function makePromiseFulfilledCachedPromise(promise, value) {
    return Object.assign(promise, {
        status: "fulfilled",
        value,
    });
}
function makePromiseRejectedCachedPromise(promise, reason) {
    return Object.assign(promise, {
        status: "rejected",
        reason,
    });
}
function makePromisePendingCachedPromise(promise) {
    return Object.assign(promise, {
        status: "pending",
    });
}
function isFulfilledCachedPromise(promise) {
    return (promise instanceof Promise &&
        "status" in promise &&
        "value" in promise &&
        promise.status === "fulfilled");
}
function isRejectedCachedPromise(promise) {
    return (promise instanceof Promise &&
        "status" in promise &&
        "reason" in promise &&
        promise.status === "rejected");
}
// There is an official RFC for this hook: https://github.com/reactjs/rfcs/pull/229
function usePromise(promise) {
    if (isFulfilledCachedPromise(promise)) {
        return promise.value;
    }
    if (isRejectedCachedPromise(promise)) {
        throw promise.reason;
    }
    promise
        .then((value) => {
        makePromiseFulfilledCachedPromise(promise, value);
    })
        .catch((reason) => {
        makePromiseRejectedCachedPromise(promise, reason);
    });
    throw makePromisePendingCachedPromise(promise);
}
exports.usePromise = usePromise;
//# sourceMappingURL=CachedPromise.js.map