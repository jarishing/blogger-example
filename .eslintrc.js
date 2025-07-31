/** @type {import('eslint').Linter.Config} */
const path = require('path');

module.exports = {
  root: true,
  extends: [path.resolve(__dirname, 'packages/tooling/eslint/base.js')],
  ignorePatterns: ['dist', 'node_modules', 'apps']
};