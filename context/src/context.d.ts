import { Component, ReactNode } from "react";
export declare function getActiveContextContainer(): ContextContainer;
export type Context<T, A extends Record<string, unknown> | void> = (props: A) => T;
export type ContextState = {
    isResolved: true;
    value: any;
    ref: Context<any, any>;
} | {
    isResolved: false;
    constr: () => any;
    ref: Context<any, any>;
};
declare class ContextContainer {
    private _parent;
    private _resolvementError?;
    private _state;
    private _disposers;
    private _isDisposed;
    get isDisposed(): boolean;
    constructor(ref: Context<any, any>, constr: () => any, _parent: ContextContainer | null);
    registerCleanup(cleaner: () => void): void;
    resolve<T, A extends Record<string, unknown> | void>(context: Context<T, A>): T;
    clear(): void;
    dispose(): void;
}
export declare class ContextProvider<T extends Record<string, unknown> | void> extends Component<{
    context: Context<any, any>;
    props: T;
    children: React.ReactNode;
}> {
    static contextType: import("react").Context<ContextContainer | null>;
    container: ContextContainer;
    componentWillUnmount(): void;
    render(): ReactNode;
}
export declare function cleanup(cleaner: () => void): void;
export declare function context<T, A extends Record<string, unknown> | void>(context: Context<T, A>): (() => T) & {
    Provider: React.FC<A & {
        children: React.ReactNode;
    }>;
};
export {};
