import React, { createContext, useContext, useEffect, useRef, useState, } from "react";
import * as tsyringe from "tsyringe";
export { tsyringe };
export const service = () => tsyringe.scoped(tsyringe.Lifecycle.ContainerScoped);
export const inject = tsyringe.inject;
const diContext = createContext(null);
export const ServiceProvider = (props) => {
    const ummountTimeoutRef = useRef();
    const parentContainer = useContext(diContext);
    const [container] = useState(() => {
        const container = (parentContainer || tsyringe.container).createChildContainer();
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
            });
        };
    }, []);
    return (React.createElement(diContext.Provider, { value: container }, props.children));
};
export function useService(classReference) {
    const container = useContext(diContext);
    return container.resolve(classReference);
}
//# sourceMappingURL=Container.js.map