const path = require('path');

module.exports = {
  extends: [path.resolve(__dirname, '../tooling/eslint/base.js')],
  parserOptions: {
    project: './tsconfig.json'
  }
};