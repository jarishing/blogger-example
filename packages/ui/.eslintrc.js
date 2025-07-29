module.exports = {
  extends: ['@conduit/tooling/eslint/nextjs'],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    'react/react-in-jsx-scope': 'off'
  }
};