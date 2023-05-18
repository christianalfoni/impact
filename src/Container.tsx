import React, { createContext, useContext, useEffect, useState } from "react";

import * as tsyringe from "tsyringe";

export { tsyringe };

export const singleton = tsyringe.singleton;

const diContext = createContext<tsyringe.DependencyContainer>(
  null as unknown as tsyringe.DependencyContainer
);

export const ContainerProvider: React.FC<{
  children: any;
}> = (props) => {
  const [container] = useState(() => tsyringe.container.createChildContainer());

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
