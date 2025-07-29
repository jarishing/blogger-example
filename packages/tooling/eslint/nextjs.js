const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "@conduit/tooling/eslint/base",
    "next/core-web-vitals",
    "@next/eslint-plugin-next/recommended"
  ],
  globals: {
    React: true,
    JSX: true
  },
  env: {
    node: true,
    browser: true
  },
  plugins: ["react", "react-hooks"],
  settings: {
    "import/resolver": {
      typescript: {
        project
      }
    }
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@next/next/no-html-link-for-pages": "off"
  }
};