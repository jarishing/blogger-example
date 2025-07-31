const path = require('path');

module.exports = {
  extends: [path.resolve(__dirname, '../tooling/eslint/base.js')],
  parserOptions: {
    project: path.resolve(__dirname, './tsconfig.json')
  }
};