import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
  ...nextVitals,
  ...nextTs,
  ...tseslint.configs.strict,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "off",
      "react/no-danger": "error",
    },
  },
  {
    // src/lib is pure: no DOM, no browser globals.
    files: ["src/lib/**/*.ts"],
    rules: {
      "no-restricted-globals": ["error", "window", "document", "navigator", "localStorage"],
    },
  },
]);
