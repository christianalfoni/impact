import React from "react";
import * as tsyringe from "tsyringe";
export { tsyringe };
export declare const service: () => (target: import("tsyringe/dist/typings/types/constructor").default<unknown>) => void;
export declare const inject: typeof tsyringe.inject;
export type IDisposable = tsyringe.Disposable;
export declare const ServiceProvider: React.FC<{
    children: any;
    values?: Array<[tsyringe.InjectionToken<unknown>, unknown]>;
}>;
export declare function useService<T>(classReference: tsyringe.InjectionToken<T>): T;
