import { jsx as _jsx } from "react/jsx-runtime";
import { Component, createContext, useContext } from "react";
const currentContextContainer = [];
export function getActiveContextContainer() {
    return currentContextContainer[currentContextContainer.length - 1];
}
class ContextContainer {
    get isDisposed() {
        return this._isDisposed;
    }
    constructor(ref, constr, _parent) {
        this._parent = _parent;
        this._disposers = new Set();
        this._isDisposed = false;
        this._state = {
            isResolved: false,
            ref,
            constr,
        };
    }
    registerCleanup(cleaner) {
        this._disposers.add(cleaner);
    }
    resolve(context) {
        if (this._resolvementError) {
            throw this._resolvementError;
        }
        if (this._state.isResolved && context === this._state.ref) {
            return this._state.value;
        }
        if (!this._state.isResolved && this._state.ref === context) {
            try {
                currentContextContainer.push(this);
                this._state = {
                    isResolved: true,
                    value: this._state.constr(),
                    ref: context,
                };
                currentContextContainer.pop();
                return this._state.value;
            }
            catch (e) {
                this._resolvementError =
                    new Error(`Could not initialize context "${context === null || context === void 0 ? void 0 : context.name}":
${String(e)}`);
                throw this._resolvementError;
            }
        }
        if (!this._parent) {
            throw new Error(`The context "${context.name}" is not provided`);
        }
        return this._parent.resolve(context);
    }
    clear() {
        this._disposers.forEach((cleaner) => {
            cleaner();
        });
    }
    dispose() {
        this.clear();
        this._isDisposed = true;
    }
}
const reactContext = createContext(null);
export class ContextProvider extends Component {
    componentWillUnmount() {
        this.container.dispose();
    }
    render() {
        // React can keep the component reference and mount/unmount it multiple times. Because of that
        // we need to ensure to always have a hooks container instantiated when rendering, as it could
        // have been disposed due to an unmount
        if (!this.container || this.container.isDisposed) {
            this.container = new ContextContainer(this.props.context, () => this.props.context(this.props.props), 
            // eslint-disable-next-line
            // @ts-ignore
            this.context);
        }
        return (_jsx(reactContext.Provider, { value: this.container, children: this.props.children }));
    }
}
ContextProvider.contextType = reactContext;
export function cleanup(cleaner) {
    const activeContextContainer = getActiveContextContainer();
    if (!activeContextContainer) {
        throw new Error("You are cleaning up in an invalid context");
    }
    activeContextContainer.registerCleanup(cleaner);
}
export function context(context) {
    const useReactiveContext = () => {
        const activeContextContainer = getActiveContextContainer();
        if (!activeContextContainer) {
            const contextContainer = useContext(reactContext);
            if (!contextContainer) {
                throw new Error("You are using a store outside its provider");
            }
            return contextContainer.resolve(context);
        }
        return activeContextContainer.resolve(context);
    };
    useReactiveContext.Provider = (props) => {
        // To avoid TSLIB
        const propsCopy = Object.assign({}, props);
        const children = propsCopy.children;
        delete propsCopy.children;
        return (_jsx(ContextProvider, { props: propsCopy, context: context, children: children }));
    };
    // @ts-ignore
    useReactiveContext.Provider.displayName =
        context.name || "ReactiveContextProvider";
    return useReactiveContext;
}
//# sourceMappingURL=context.js.map