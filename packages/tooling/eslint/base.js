const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  "extends": [
    "eslint:recommended",
    "eslint-config-airbnb-base",
    "airbnb-typescript",
    "plugin:@typescript-eslint/recommended"
  ],
  "env": {
    "es2021": true,
    "node": true
  },
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "import/prefer-default-export": "off",
    "no-tabs": ["off"],
    "max-len": ["off"],
    "no-await-in-loop": "off",
    "react/jsx-filename-extension": "off",
    "class-methods-use-this": "off",
    "no-param-reassign": "off",
    "@typescript-eslint/quotes": [
      "error",
      "single",
      {
        "avoidEscape": true
      }
    ],
    "@typescript-eslint/comma-dangle": ["error", "never"],
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/lines-between-class-members": [
      "error",
      "always",
      {
        "exceptAfterSingleLine": true
      }
    ],
    // Prettier integration disabled temporarily
  },
  "overrides": [
    {
      "files": ["*.spec.{js,ts}"],
      "env": {
        "mocha": true,
        "node": true
      },
      "rules": {
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        "@typescript-eslint/no-throw-literal": "off"
      }
    }
  ],
  // parserOptions should be defined in each package's .eslintrc.js
  "ignorePatterns": ["dist", "node_modules", ".eslintrc.js", "jest.config.js"]
}; 