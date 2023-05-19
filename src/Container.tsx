import React, { createContext, useContext, useEffect, useState } from "react";

import * as tsyringe from "tsyringe";

export { tsyringe };

export const singleton = tsyringe.singleton;

const diContext = createContext<tsyringe.DependencyContainer>(
  null as unknown as tsyringe.DependencyContainer
);

export const ContainerProvider: React.FC<{
  children: any;
  useValues?: [tsyringe.InjectionToken<unknown>, unknown][];
}> = (props) => {
  const parentContainer = useContext(diContext);
  const [container] = useState(() => {
    const container = (
      parentContainer || tsyringe.container
    ).createChildContainer();
    if (props.useValues) {
      props.useValues.forEach(([claz, value]) => {
        container.register(claz, { useValue: value });
      });
    }
    return container;
  });

  useEffect(() => {
    container.reset();
  }, []);

  return (
    <diContext.Provider value={container}>{props.children}</diContext.Provider>
  );
};

export function useInject<T>(classReference: tsyringe.InjectionToken<T>): T {
  const container = useContext(diContext);

  return container.resolve(classReference);
}
