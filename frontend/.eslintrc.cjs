// .eslintrc.cjs
module.exports = {
  root: true,
  ignorePatterns: ['.angular/**', 'dist/**'],
  overrides: [
    // TypeScript files
    {
      files: ['src/**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json'],
        createDefaultProgram: true,
      },
      plugins: ['@typescript-eslint', '@angular-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/stylistic',
        'plugin:@angular-eslint/recommended',
        'eslint-config-prettier',
      ],
      rules: {
        // Angular component/directive selectors
        '@angular-eslint/directive-selector': [
          'error',
          { type: 'attribute', prefix: 'app', style: 'camelCase' },
        ],
        '@angular-eslint/component-selector': [
          'error',
          { type: ['element', 'attribute'], prefix: 'app', style: 'kebab-case' },
        ],

        // Angular best practices
        '@angular-eslint/no-empty-lifecycle-method': 'warn',
        '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
        '@angular-eslint/prefer-output-readonly': 'warn',
        '@angular-eslint/prefer-signals': 'warn',
        '@angular-eslint/prefer-standalone': 'warn',

        // TypeScript best practices
        '@typescript-eslint/array-type': ['warn'],
        '@typescript-eslint/consistent-indexed-object-style': 'off',
        '@typescript-eslint/consistent-type-assertions': 'warn',
        '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          { accessibility: 'no-public' },
        ],
        '@typescript-eslint/naming-convention': [
          'warn',
          {
            selector: 'variable',
            format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          },
        ],
        '@typescript-eslint/no-empty-function': 'warn',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-inferrable-types': 'warn',
        '@typescript-eslint/no-shadow': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',

        // JavaScript best practices
        eqeqeq: 'error',
        complexity: ['error', 20],
        curly: 'error',
        'guard-for-in': 'error',
        'max-classes-per-file': ['error', 1],
        'max-len': ['warn', { code: 140, comments: 160 }],
        'max-lines': ['error', 500],
        'no-bitwise': 'error',
        'no-console': 'off',
        'no-new-wrappers': 'error',
        'no-useless-concat': 'error',
        'no-var': 'error',
        'no-restricted-syntax': 'off',
        'no-shadow': 'error',
        'one-var': ['error', 'never'],
        'prefer-arrow-callback': 'error',
        'prefer-const': 'error',
        'sort-imports': [
          'error',
          { ignoreCase: true, ignoreDeclarationSort: true, allowSeparatedGroups: true },
        ],

        // Security
        'no-eval': 'error',
        'no-implied-eval': 'error',
      },
    },

    // Angular template files
    {
      files: ['*.html'],
      parser: '@angular-eslint/template-parser',
      plugins: ['@angular-eslint/template'],
      extends: [
        'plugin:@angular-eslint/template/recommended',
        'plugin:@angular-eslint/template/accessibility',
      ],
      rules: {
        // Angular template best practices
        '@angular-eslint/template/attributes-order': [
          'error',
          {
            alphabetical: true,
            order: [
              'STRUCTURAL_DIRECTIVE', // e.g. *ngIf, *ngFor
              'TEMPLATE_REFERENCE',   // e.g. #ref
              'ATTRIBUTE_BINDING',    // e.g. required, id="3"
              'INPUT_BINDING',        // e.g. [id]="3"
              'TWO_WAY_BINDING',      // e.g. [(value)]="val"
              'OUTPUT_BINDING',       // e.g. (click)="doSomething()"
            ],
          },
        ],
        '@angular-eslint/template/button-has-type': 'warn',
        '@angular-eslint/template/cyclomatic-complexity': ['warn', { maxComplexity: 10 }],
        '@angular-eslint/template/eqeqeq': 'error',
        '@angular-eslint/template/prefer-control-flow': 'error',
        '@angular-eslint/template/prefer-ngsrc': 'warn',
        '@angular-eslint/template/prefer-self-closing-tags': 'warn',
        '@angular-eslint/template/use-track-by-function': 'warn',
      },
    },
  ],
};
