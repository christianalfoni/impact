import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import * as tsyringe from "tsyringe";

export { tsyringe };

export const singleton = tsyringe.singleton;

export const inject = tsyringe.inject;

const diContext = createContext<tsyringe.DependencyContainer>(
  null as unknown as tsyringe.DependencyContainer
);

export const ContainerProvider: React.FC<{
  children: any;
  values?: [tsyringe.InjectionToken<unknown>, unknown][];
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

  return container.resolve(classReference);
}
