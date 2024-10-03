import react from "eslint-plugin-react";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ["config/**/*", "build/**/*", "d/**/*"],
  },
  ...compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "prettier",
  ),
  {
    plugins: {
      react,
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        global: "readonly",
      },

      ecmaVersion: "latest",
      sourceType: "module",
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "warn",
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*.js","**/*.jsx"],
  },
  {
    files: ["**/__tests__/*.js"],

    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
