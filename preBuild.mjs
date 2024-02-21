import * as fs from "fs";

const VUE_CODEMIRROR_PACKAGE_JSON_PATH =
  "./node_modules/vue-codemirror/package.json";
const vueCodemirrorPackageJson = JSON.parse(
  fs.readFileSync(VUE_CODEMIRROR_PACKAGE_JSON_PATH, "utf-8"),
);

if (!vueCodemirrorPackageJson.type) {
  vueCodemirrorPackageJson.type = "module";
}

fs.writeFileSync(
  VUE_CODEMIRROR_PACKAGE_JSON_PATH,
  JSON.stringify(vueCodemirrorPackageJson, null, 2),
);
