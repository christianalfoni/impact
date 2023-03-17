import React, {
  Context,
  createContext,
  FunctionComponent,
  useContext,
} from "react";

export const INSTANCE_ID = Symbol("INSTANCE_ID");

export interface IOptions {
  debug?: boolean;
}

export interface IClass<T> {
  new (...args: any[]): T;
}

export interface IContainerConfig {
  [key: string]: IClass<any>;
}

export type Classes<T extends { [key: string]: {} }> = {
  [K in keyof T]: IClass<T[K]>;
};

export class DependencyInjection<T extends { [key: string]: {} }> {
  private currentContainer: DependencyInjectionContainer<T> | undefined;
  private context: Context<DependencyInjectionContainer<T>>;
  Provider: FunctionComponent<{
    container: DependencyInjectionContainer<T>;
    children: any;
  }>;
  constructor() {
    const context = (this.context = createContext(
      null as unknown as DependencyInjectionContainer<T>
    ));

    this.Provider = ({ container, children }) => (
      <context.Provider value={container}>{children}</context.Provider>
    );
  }

  useInject<U extends keyof T>(name: U): T[U] {
    return useContext(this.context).get(name);
  }
  createContainer<
    U extends {
      [K in keyof T]: IClass<T[K]>;
    }
  >(classes: U, options: IOptions = {}) {
    return new DependencyInjectionContainer<T>(
      classes,
      options,
      (container: DependencyInjectionContainer<T>) => {
        this.currentContainer = container;
      }
    );
  }
  inject<U extends keyof T>(name: U): T[U] {
    if (!this.currentContainer) {
      throw new Error("No active Dependency Injection");
    }

    return this.currentContainer.get(name) as T[U];
  }
}

export class DependencyInjectionContainer<T extends { [key: string]: {} }> {
  private _classes = new Map<keyof T, any>();
  private _singletons = new Map<keyof T, any>();

  constructor(
    classes: IContainerConfig,
    options: IOptions = {},
    private onInjection: (container: DependencyInjectionContainer<any>) => void
  ) {
    Object.keys(classes).forEach((key) => {
      this.register(key, classes[key]);
    });
  }
  private register<U>(id: keyof T, SingletonOrFactory: IClass<U>) {
    this._classes.set(id, SingletonOrFactory);
  }
  private create<U extends keyof T>(
    id: U,
    ...args: any[]
  ): T[U] extends IClass<infer O> ? O : never {
    if (!this._classes.has(id)) {
      throw new Error(`The identifier ${String(id)} is not registered`);
    }
    const Constr = this._classes.get(id);

    this.onInjection(this);

    return new Constr(...args);
  }
  get<U extends keyof T>(id: U): T[U] {
    const clas = this._classes.get(id);

    if (!clas) {
      throw new Error(`No class by the name ${String(id)}`);
    }

    return (this._singletons.get(id) ||
      this._singletons.set(id, this.create(id)).get(id)) as any;
  }
}
