const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["./base.js"],
  env: {
    node: true,
    es6: true
  },
  settings: {
    "import/resolver": {
      typescript: {
        project
      }
    }
  },
  rules: {
    "no-console": "off",
    "@typescript-eslint/no-var-requires": "off"
  }
};