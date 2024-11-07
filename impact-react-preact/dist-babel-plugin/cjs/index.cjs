"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createPlugin;
const babel_transform_1 = require("@impact-react/babel-transform");
function createPlugin() {
    return [babel_transform_1.transform, { packageName: "@impact-react/preact" }];
}
//# sourceMappingURL=babel-plugin.js.map