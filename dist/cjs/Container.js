"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useService = exports.ServiceProvider = exports.inject = exports.service = exports.tsyringe = void 0;
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const tsyringe = tslib_1.__importStar(require("tsyringe"));
exports.tsyringe = tsyringe;
const service = () => tsyringe.scoped(tsyringe.Lifecycle.ContainerScoped);
exports.service = service;
exports.inject = tsyringe.inject;
const diContext = (0, react_1.createContext)(null);
const ServiceProvider = (props) => {
    const ummountTimeoutRef = (0, react_1.useRef)();
    const parentContainer = (0, react_1.useContext)(diContext);
    const [container] = (0, react_1.useState)(() => {
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
    (0, react_1.useEffect)(() => {
        clearTimeout(ummountTimeoutRef.current);
        return () => {
            ummountTimeoutRef.current = setTimeout(() => {
                container.dispose();
            });
        };
    }, []);
    return (react_1.default.createElement(diContext.Provider, { value: container }, props.children));
};
exports.ServiceProvider = ServiceProvider;
function useService(classReference) {
    const container = (0, react_1.useContext)(diContext);
    return container.resolve(classReference);
}
exports.useService = useService;
//# sourceMappingURL=Container.js.map