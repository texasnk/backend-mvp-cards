import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "prisma/**"],
  },
  {
    files: ["src/**/*.ts", "tests/**/*.ts", "scripts/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      indent: ["error", 2, { SwitchCase: 1 }],
    },
  },
];
