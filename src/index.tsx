import "reflect-metadata";

import React, { createContext, useContext } from "react";
import * as tsyringe from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";

export { injectable, inject } from "tsyringe";

export interface IDisposable {
  /**
   * Dispose this object.
   */
  dispose(): void;
}

export class Disposable implements IDisposable {
  private toDispose: IDisposable[] = [];
  public isDisposed = false;

  public addDisposable<T extends IDisposable>(disposable: T): T {
    this.toDispose.push(disposable);
    return disposable;
  }

  public onDispose(cb: () => void): void {
    this.toDispose.push(Disposable.create(cb));
  }

  public dispose(): void {
    if (this.isDisposed) return;

    this.isDisposed = true;
    this.toDispose.forEach((disposable) => {
      disposable.dispose();
    });
  }

  public static is(arg: any): arg is Disposable {
    return typeof arg["dispose"] === "function";
  }

  public static create(cb: () => void): IDisposable {
    return {
      dispose: cb,
    };
  }
}

const diContext = createContext<tsyringe.DependencyContainer | null>(null);

export type InjectionProviderProps = {
  children: React.ReactNode;
  values?: Array<[tsyringe.InjectionToken, unknown]>;
  classes?: constructor<unknown>[];
};

export class InjectionProvider extends React.Component<
  InjectionProviderProps,
  tsyringe.DependencyContainer
> {
  static contextType = diContext;
  constructor(...args: unknown[]) {
    const props = args[0] as InjectionProviderProps;
    // due to typing issue
    const parentContainer = args[1] as tsyringe.DependencyContainer | null;

    super(props);

    const container = (
      parentContainer || tsyringe.container
    ).createChildContainer();
    if (props.values) {
      props.values.forEach(([token, value]) => {
        container.register(token, { useValue: value });
      });
    }
    if (props.classes) {
      props.classes.forEach((claz) => {
        container.register(
          claz,
          { useClass: claz },
          {
            lifecycle: tsyringe.Lifecycle.ContainerScoped,
          }
        );
      });
    }
    this.state = container;
  }
  componentWillUnmount(): void {
    this.state.dispose();
  }
  render() {
    return (
      <diContext.Provider value={this.state}>
        {this.props.children}
      </diContext.Provider>
    );
  }
}

export function useInject<T>(classReference: tsyringe.InjectionToken<T>): T {
  const container = useContext(diContext);

  if (!container) {
    throw new Error("useInject used in an invalid context");
  }

  if (!container.isRegistered(classReference)) {
    throw new Error(
      `Trying to inject a class (${String(
        classReference
      )}) that has not been registered`
    );
  }

  return container.resolve(classReference);
}

/**
 * A typed event.
 */
export interface Event<T> {
  /**
   *
   * @param listener The listener function will be called when the event happens.
   * @return a disposable to remove the listener again.
   */
  (listener: (e: T) => void): IDisposable;
}

export class Emitter<T> implements IDisposable {
  private registeredListeners = new Set<(e: T) => void>();
  private _event: Event<T> | undefined;

  get event(): Event<T> {
    if (!this._event) {
      this._event = (listener: (e: T) => void) => {
        this.registeredListeners.add(listener);

        return Disposable.create(() => {
          this.registeredListeners.delete(listener);
        });
      };
    }

    return this._event;
  }

  /** Invoke all listeners registered to this event. */
  fire(event: T): void {
    this.registeredListeners.forEach((listener) => {
      listener(event);
    });
  }

  dispose(): void {
    this.registeredListeners = new Set();
  }
}
