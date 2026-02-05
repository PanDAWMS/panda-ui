const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const angularEslint = require("@angular-eslint/eslint-plugin");
const parser = require("@angular-eslint/template-parser");
const angularEslintTemplate = require("@angular-eslint/eslint-plugin-template");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{}, globalIgnores([".angular/**/*", "dist/**/*"]), {
    files: ["src/**/*.ts"],

    languageOptions: {
        parser: tsParser,

        parserOptions: {
            project: ["./tsconfig.json"],
            createDefaultProgram: true,
        },
    },

    plugins: {
        "@typescript-eslint": typescriptEslint,
        "@angular-eslint": angularEslint,
    },

    extends: compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/stylistic",
        "plugin:@angular-eslint/recommended",
        "eslint-config-prettier",
    ),

    rules: {
        "@angular-eslint/directive-selector": ["error", {
            type: "attribute",
            prefix: "app",
            style: "camelCase",
        }],

        "@angular-eslint/component-selector": ["error", {
            type: ["element", "attribute"],
            prefix: "app",
            style: "kebab-case",
        }],

        "@angular-eslint/no-empty-lifecycle-method": "warn",
        "@angular-eslint/prefer-on-push-component-change-detection": "warn",
        "@angular-eslint/prefer-output-readonly": "warn",
        "@angular-eslint/prefer-signals": "warn",
        "@angular-eslint/prefer-standalone": "warn",
        "@typescript-eslint/array-type": ["warn"],
        "@typescript-eslint/consistent-indexed-object-style": "off",
        "@typescript-eslint/consistent-type-assertions": "warn",
        "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
        "@typescript-eslint/explicit-function-return-type": "error",

        "@typescript-eslint/explicit-member-accessibility": ["error", {
            accessibility: "no-public",
        }],

        "@typescript-eslint/naming-convention": ["warn", {
            selector: "variable",
            format: ["camelCase", "UPPER_CASE", "PascalCase"],
        }],

        "@typescript-eslint/no-empty-function": "warn",
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-inferrable-types": "warn",
        "@typescript-eslint/no-shadow": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        eqeqeq: "error",
        complexity: ["error", 20],
        curly: "error",
        "guard-for-in": "error",
        "max-classes-per-file": ["error", 1],

        "max-len": ["warn", {
            code: 140,
            comments: 160,
        }],

        "max-lines": ["error", 500],
        "no-bitwise": "error",
        "no-console": "off",
        "no-new-wrappers": "error",
        "no-useless-concat": "error",
        "no-var": "error",
        "no-restricted-syntax": "off",
        "no-shadow": "error",
        "one-var": ["error", "never"],
        "prefer-arrow-callback": "error",
        "prefer-const": "error",

        "sort-imports": ["error", {
            ignoreCase: true,
            ignoreDeclarationSort: true,
            allowSeparatedGroups: true,
        }],

        "no-eval": "error",
        "no-implied-eval": "error",
    },
}, {
    files: ["**/*.html"],

    languageOptions: {
        parser: parser,
    },

    plugins: {
        "@angular-eslint/template": angularEslintTemplate,
    },

    extends: compat.extends(
        "plugin:@angular-eslint/template/recommended",
        "plugin:@angular-eslint/template/accessibility",
    ),

    rules: {
        "@angular-eslint/template/attributes-order": ["error", {
            alphabetical: true,

            order: [
                "STRUCTURAL_DIRECTIVE",
                "TEMPLATE_REFERENCE",
                "ATTRIBUTE_BINDING",
                "INPUT_BINDING",
                "TWO_WAY_BINDING",
                "OUTPUT_BINDING",
            ],
        }],

        "@angular-eslint/template/button-has-type": "warn",

        "@angular-eslint/template/cyclomatic-complexity": ["warn", {
            maxComplexity: 10,
        }],

        "@angular-eslint/template/eqeqeq": "error",
        "@angular-eslint/template/prefer-control-flow": "error",
        "@angular-eslint/template/prefer-ngsrc": "warn",
        "@angular-eslint/template/prefer-self-closing-tags": "warn",
        "@angular-eslint/template/use-track-by-function": "warn",
    },
}]);
