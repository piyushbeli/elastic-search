/*eslint quotes: [2, "double"]*/
module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  settings: {
    react: {
      version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  plugins: [
    "eslint-plugin-typescript",
  ],
  extends: [
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ],
  rules: {
    "jsx-no-lambda": 0,
    "ordered-imports": 0,
    "ban-types": [
      0,
    ],
    "sort-imports": ["error", { "ignoreDeclarationSort": true }],
    "max-len": ["error", 150, { "ignorePattern": "^\\s*var\\s.+=\\s*require\\s*\\(", "ignoreStrings": true }],
    "prefer-const": 1,
    "quotes": [
      "error",
      "single",
      { allowTemplateLiterals: true },
    ],
    "indent": [
      "error",
      2,
    ],
    "comma-dangle": [
      "error",
      "always-multiline",
      "never-single-line",
    ],
    "linebreak-style": [
      "error",
      "unix",
    ],
    "object-curly-spacing": ["error", "always", { "objectsInObjects": false }],
    "only-arrow-functions": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/no-explicit-any": 1,
    "@typescript-eslint/interface-name-prefix": 0,
    "@typescript-eslint/no-namespace": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/ban-ts-ignore": 0,
    "no-unused-expressions": "off",
    "@typescript-eslint/no-unused-expressions": ["off"],
    "react/prop-types": 0,
    "no-unused-vars": 0,
    "semi": [2, "always", { "omitLastInOneLineBlock": true }],
    "key-spacing": [2, { "beforeColon": false, "afterColon": true }],
  },
};
