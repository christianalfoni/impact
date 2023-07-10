import "reflect-metadata";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as tsyringe from "tsyringe";
import { constructor } from "tsyringe/dist/typings/types";

export { injectable, inject } from "tsyringe";

export type IDisposable = tsyringe.Disposable;

const diContext = createContext<tsyringe.DependencyContainer>(
  null as unknown as tsyringe.DependencyContainer
);

export const InjectionProvider: React.FC<{
  children: React.ReactNode;
  values?: Array<[tsyringe.InjectionToken, unknown]>;
  classes?: constructor<unknown>[];
}> = (props) => {
  const ummountTimeoutRef = useRef<number | undefined>();
  const parentContainer = useContext(diContext);
  const [container] = useState(() => {
    const container = (
      parentContainer || tsyringe.container
    ).createChildContainer();
    if (props.values) {
      props.values.forEach(([claz, value]) => {
        container.register(claz, { useValue: value });
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
    return container;
  });

  // To ensure we dispose on actual unmount (not with strict mode double running effects), we
  // use a timeout to ensure that we are still unmounted
  useEffect(() => {
    clearTimeout(ummountTimeoutRef.current);
    return () => {
      ummountTimeoutRef.current = setTimeout(() => {
        container.dispose();
      }) as unknown as number;
    };
  }, []);

  return (
    <diContext.Provider value={container}>{props.children}</diContext.Provider>
  );
};

export function useInject<T>(classReference: tsyringe.InjectionToken<T>): T {
  const container = useContext(diContext);

  if (!container.isRegistered(classReference)) {
    throw new Error(
      `Trying to inject a class (${String(
        classReference
      )}) that has not been registered`
    );
  }

  return container.resolve(classReference);
}
