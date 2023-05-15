import React, { createContext, useContext, useEffect, useState } from "react";

import * as typedi from "typedi";

export { typedi };

export const Injectable = typedi.Service();

const diContext = createContext<typedi.ContainerInstance>(
  null as unknown as typedi.ContainerInstance
);

export const ContainerProvider: React.FC<{
  children: any;
}> = (props) => {
  const [container] = useState(() => typedi.Container.of());

  useEffect(() => {
    container.reset();
  }, []);

  return (
    <diContext.Provider value={container}>{props.children}</diContext.Provider>
  );
};

export function useInject<T>(classReference: typedi.Constructable<T>): T {
  const container = useContext(diContext);

  return container.get(classReference);
}
