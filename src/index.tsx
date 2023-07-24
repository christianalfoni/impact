import "reflect-metadata";

import React, { createContext, useContext } from "react";
import * as tsyringe from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";

export const Service = tsyringe.injectable;

export const Value = tsyringe.inject;

export * from "signalit";

export class Disposable {
  private toDispose = new Set<() => void>();
  public isDisposed = false;

  public onDispose(cb: () => void) {
    this.toDispose.add(cb);

    return () => {
      this.toDispose.delete(cb);
    };
  }

  public dispose() {
    if (this.isDisposed) return;

    this.isDisposed = true;
    this.toDispose.forEach((dispose) => {
      dispose();
    });
    this.toDispose.clear();
  }
}

const diContext = createContext<tsyringe.DependencyContainer | null>(null);

export type ServiceProviderProps = {
  children: React.ReactNode;
  values?: [[tsyringe.InjectionToken, unknown]];
  classes?: constructor<unknown>[];
};

export class ServiceProvider extends React.Component<
  ServiceProviderProps,
  tsyringe.DependencyContainer
> {
  static contextType = diContext;
  constructor(...args: unknown[]) {
    const props = args[0] as ServiceProviderProps;
    // due to typing issue
    const parentContainer = args[1] as tsyringe.DependencyContainer | null;

    super(props);

    const container = (
      parentContainer || tsyringe.container
    ).createChildContainer();
    if (props.values) {
      props.values.forEach(([token, value]) => {
        container.register(token, {
          useValue: value,
        });
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

export function useService<T>(classReference: tsyringe.InjectionToken<T>): T {
  const container = useContext(diContext);

  if (!container) {
    throw new Error("useService used in an invalid context");
  }

  if (!container.isRegistered(classReference)) {
    throw new Error(
      `Trying to inject a service (${String(
        classReference
      )}) that has not been registered`
    );
  }

  const service = container.resolve(classReference);

  if (!(service instanceof Disposable)) {
    throw new Error(
      `Service (${String(classReference)}) does not extends Disposable`
    );
  }

  return service;
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
  (listener: (e: T) => void): () => void;
}

export function emitter<T>() {
  const registeredListeners = new Set<(e: T) => void>();

  return {
    on(listener: (e: T) => void) {
      registeredListeners.add(listener);

      return () => {
        registeredListeners.delete(listener);
      };
    },
    emit(event: T) {
      registeredListeners.forEach((listener) => {
        listener(event);
      });
    },
    dispose() {
      registeredListeners.clear();
    },
  };
}
