/* eslint-disable */
const fs = require("fs");
const path = require("path");
const root = process.cwd();
const DIST_FOLDER_NAME = "dist";
const TRANSFORM_NAMES = ["babel-plugin", "swc-plugin"];
const DIST_CJS_FOLDER = path.join(root, DIST_FOLDER_NAME, "cjs");
const DIST_ESM_FOLDER = path.join(root, DIST_FOLDER_NAME, "esm");

TRANSFORM_NAMES.forEach((transformName) => {
  const DIST_TRANSFORM_FOLDER_NAME = "dist-" + transformName;

  const DIST_TRANSFORM_CJS_FOLDER = path.join(
    root,
    DIST_TRANSFORM_FOLDER_NAME,
    "cjs",
  );
  const DIST_TRANSFORM_ESM_FOLDER = path.join(
    root,
    DIST_TRANSFORM_FOLDER_NAME,
    "esm",
  );

  const files = fs.readdirSync(DIST_CJS_FOLDER);

  files.forEach((file) => {
    if (file.endsWith(".js.map")) {
      fs.renameSync(
        path.join(DIST_CJS_FOLDER, file),
        path.join(DIST_CJS_FOLDER, file.replace(".js.map", ".cjs.map")),
      );
    } else if (file.endsWith(".js")) {
      let content = fs
        .readFileSync(path.join(DIST_CJS_FOLDER, file))
        .toString();
      const localRequires = content.matchAll(/require\("\.\/(.*)"\)/g);

      for (const localRequire of localRequires) {
        content = content.replace(
          localRequire[0],
          `require("./${localRequire[1]}.cjs")`,
        );
      }

      fs.writeFileSync(path.join(DIST_CJS_FOLDER, file), content);

      fs.renameSync(
        path.join(DIST_CJS_FOLDER, file),
        path.join(DIST_CJS_FOLDER, file.replace(".js", ".cjs")),
      );
    }
  });

  try {
    fs.statSync(path.join(DIST_CJS_FOLDER, transformName + ".cjs"));
    fs.mkdirSync(path.join(root, DIST_TRANSFORM_FOLDER_NAME));
    fs.mkdirSync(path.join(root, DIST_TRANSFORM_FOLDER_NAME, "cjs"));
    fs.mkdirSync(path.join(root, DIST_TRANSFORM_FOLDER_NAME, "esm"));
    fs.renameSync(
      path.join(DIST_CJS_FOLDER, transformName + ".cjs"),
      path.join(DIST_TRANSFORM_CJS_FOLDER, "index.cjs"),
    );
    fs.renameSync(
      path.join(DIST_CJS_FOLDER, transformName + ".cjs.map"),
      path.join(DIST_TRANSFORM_CJS_FOLDER, "index.cjs.map"),
    );
    fs.renameSync(
      path.join(DIST_CJS_FOLDER, transformName + ".d.ts"),
      path.join(DIST_TRANSFORM_CJS_FOLDER, "index.d.ts"),
    );
    fs.renameSync(
      path.join(DIST_ESM_FOLDER, transformName + ".js"),
      path.join(DIST_TRANSFORM_ESM_FOLDER, "index.js"),
    );
    fs.renameSync(
      path.join(DIST_ESM_FOLDER, transformName + ".js.map"),
      path.join(DIST_TRANSFORM_ESM_FOLDER, "index.js.map"),
    );
    fs.renameSync(
      path.join(DIST_ESM_FOLDER, transformName + ".d.ts"),
      path.join(DIST_TRANSFORM_ESM_FOLDER, "index.d.ts"),
    );
  } catch {
    // File does not exist
  }
});
