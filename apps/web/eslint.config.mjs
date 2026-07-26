import nextPlugin from '@next/eslint-plugin-next';

const eslintConfig = [
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-img-element': 'off',
    },
  },
  {
    ignores: ['.next/**', 'out/**', 'dist/**'],
  },
];

export default eslintConfig;
