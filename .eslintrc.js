/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['@conduit/tooling/eslint/base'],
  ignorePatterns: ['dist', 'node_modules', 'apps', 'packages']
};