import React, { createContext, useContext } from "react";
import * as tsyringe from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";
import { Disposable } from "./Disposable";

const diContext = createContext<tsyringe.DependencyContainer | null>(null);

export const Service = tsyringe.injectable;

export const Value = tsyringe.inject;

export type ServiceProviderProps = {
  children: React.ReactNode;
  values?: [[tsyringe.InjectionToken, unknown]];
  services?: constructor<unknown>[];
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
    if (props.services) {
      props.services.forEach((service) => {
        container.register(
          service,
          { useClass: service },
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
