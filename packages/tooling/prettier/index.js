module.exports = {
  printWidth: 85,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  trailingComma: "none",
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: "always",
  proseWrap: "always",
  plugins: [
    "prettier-plugin-packagejson",
    "@trivago/prettier-plugin-sort-imports"
  ],
  importOrder: [
    "^dotenv/config$",
    "<THIRD_PARTY_MODULES>",
    "^@realworld/(.*)$",
    "^[./]"
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: false
};