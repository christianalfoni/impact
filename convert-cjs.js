/* eslint-disable */
const fs = require("fs");
const path = require("path");
const root = process.cwd();
const FOLDER = path.join(root, "dist", "cjs");

const files = fs.readdirSync(FOLDER);

files.forEach((file) => {
  if (file.endsWith(".js.map")) {
    fs.renameSync(
      path.join(FOLDER, file),
      path.join(FOLDER, file.replace(".js.map", ".cjs.map")),
    );
  } else if (file.endsWith(".js")) {
    let content = fs.readFileSync(path.join(FOLDER, file)).toString();
    const localRequires = content.matchAll(/require\("\.\/(.*)"\)/g);

    for (const localRequire of localRequires) {
      content = content.replace(
        localRequire[0],
        `require("./${localRequire[1]}.cjs")`,
      );
    }

    fs.writeFileSync(path.join(FOLDER, file), content);

    fs.renameSync(
      path.join(FOLDER, file),
      path.join(FOLDER, file.replace(".js", ".cjs")),
    );
  }
});
