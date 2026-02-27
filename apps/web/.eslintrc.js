/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@ogla/eslint-config/next'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Relax some rules for UI heavy code
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-floating-promises': 'warn',
    // Next.js App Router uses default exports for pages
    'import/no-default-export': 'off',
  },
}
