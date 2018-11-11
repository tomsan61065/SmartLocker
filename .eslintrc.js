module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ["plugin:prettier/recommended"],
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
  },
  rules: {
    "prettier/prettier": ["error", {
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
      bracketSpacing: true,
    }]
  }
};