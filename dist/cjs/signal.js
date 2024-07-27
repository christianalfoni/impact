"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signal = exports.useSignals = exports.observer = void 0;
const react_1 = require("react");
class ObserverContext {
    constructor(update) {
        this.update = update;
        this.disposeListeners = new Set();
        this.subscribeListeners = new Set();
    }
    onSubscribe(cb) {
        this.subscribeListeners.add(cb);
    }
    onDisposed(cb) {
        this.disposeListeners.add(cb);
    }
    subscribe() {
        const subscribeListeners = Array.from(this.subscribeListeners);
        subscribeListeners.forEach((cb) => cb());
        return () => {
            const disposeListeners = Array.from(this.disposeListeners);
            disposeListeners.forEach((cb) => cb());
        };
    }
    notify() {
        this.update();
    }
}
let observerContext;
function observe(fn, deps) {
    const [version, setState] = (0, react_1.useState)(0);
    const context = (observerContext = new ObserverContext(() => setState((current) => current + 1)));
    const result = deps ? (0, react_1.useMemo)(() => fn(), [version, ...deps]) : fn();
    (0, react_1.useEffect)(() => context.subscribe());
    observerContext = undefined;
    return result;
}
/**
 * Wrap a component to track any signal consumed
 */
function observer(component) {
    return ((...args) => observe(() => component(...args)));
}
exports.observer = observer;
/**
 * Use this hook to produce a result tracking signals. Typically used when defining the
 * React elements returned from a component, but can also be used to memoize by passing
 * an empty array or related dependendent values in the array
 */
function useSignals(fn, deps) {
    return observe(fn, deps);
}
exports.useSignals = useSignals;
const signalMetadataKey = Symbol("observable");
function signal(...args) {
    const descriptor = args[2];
    const getMetaData = (target) => {
        // @ts-ignore
        const metadata = Reflect.getOwnMetadata(signalMetadataKey, target, args[1]) || {
            value: descriptor.initializer ? descriptor.initializer() : undefined,
            subscribers: new Set(),
        };
        // @ts-ignore
        Reflect.defineMetadata(signalMetadataKey, metadata, target, args[1]);
        return metadata;
    };
    return {
        get() {
            const metadata = getMetaData(this);
            if (observerContext) {
                const context = observerContext;
                observerContext.onSubscribe(() => {
                    metadata.subscribers.add(context);
                });
                observerContext.onDisposed(() => {
                    metadata.subscribers.delete(context);
                });
            }
            return metadata.value;
        },
        set(newValue) {
            const metadata = getMetaData(this);
            metadata.value = newValue;
            const subscribers = Array.from(metadata.subscribers);
            subscribers.forEach((context) => context.notify());
            // @ts-ignore
            Reflect.defineMetadata(signalMetadataKey, metadata, this, args[1]);
        },
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
    };
}
exports.signal = signal;
//# sourceMappingURL=signal.js.map