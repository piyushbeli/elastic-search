/*eslint quotes: [2, "double"]*/
// eslint-disable-next-line no-undef
module.exports = {
    parser: "@typescript-eslint/parser", // Specifies the ESLint parser
    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: "module", // Allows for the use of imports
        ecmaFeatures: {
            jsx: true, // Allows for the parsing of JSX
        },
    },
    plugins: [
        "eslint-plugin-typescript",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    ],
    rules: {
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
            4,
	        { "VariableDeclarator": 1 },
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
        "keyword-spacing": ["error", { "before": true, "after": true }],
        "@typescript-eslint/explicit-function-return-type": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/interface-name-prefix": 0,
        "@typescript-eslint/no-namespace": 0,
        "@typescript-eslint/no-use-before-define": 0,
        "@typescript-eslint/ban-ts-ignore": 0,
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": ["off"],
	    "@typescript-eslint/no-non-null-assertion": ["off"],
        "react/prop-types": 0,
        "no-unused-vars": 0,
        "semi": [2, "always", { "omitLastInOneLineBlock": true }],
        "key-spacing": [2, { "beforeColon": false, "afterColon": true }],
        "comma-spacing": ["error", { "before": false, "after": true }],
        "prefer-object-spread": "error",
        "semi-spacing": ["error", { "before": false, "after": true }],
        "space-before-blocks": "error",
        "no-duplicate-imports": "error",
        "no-irregular-whitespace": "error",
	    "no-mixed-spaces-and-tabs": "off",
    },
};
