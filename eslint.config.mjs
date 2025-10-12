import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/jsx-sort-props": "off",
      "import/order0": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "prefer-named-capture-group": "off",
      "react/function-component-definition": "off",
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "no-console": "off",
      "@typescript-eslint/naming-convention": "off",
      "import/order": "off",
      camelcase: "off",
      "react/no-array-index-key": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "react/jsx-curly-brace-presence": "off",
      "no-unused-vars": "off",
      "react/button-has-type": "off",
      "import/newline-after-import": "off",
      "react/self-closing-comp": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-implicit-coercion": "off",
      "no-var": "off",
      "turbo/no-undeclared-env-vars": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "import/no-named-as-default-member": "off",
      "react/jsx-no-leaked-render": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "no-nested-ternary": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/dot-notation": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "react/jsx-boolean-value": "off",
      "import/first": "off",
      "@typescript-eslint/no-shadow": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "import/no-cycle": "off",
      "@typescript-eslint/no-useless-template-literals": "off",
      "no-case-declarations": "off",
      "unicorn/filename-case": "off",
      "react/jsx-no-useless-fragment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-this-alias": "off", //temp
      "@typescript-eslint/no-empty-object-type": "off", //temp
      "@typescript-eslint/no-require-imports": "off", //temp
      "react/no-unescaped-entities": "off", //temp
      "@typescript-eslint/no-unsafe-function-type": "off", //temp
      "@typescript-eslint/no-wrapper-object-types": "off", //temp
      "@typescript-eslint/no-unnecessary-type-constraint": "off", //temp
      "react-hooks/exhaustive-deps": "off",
    },
  },
];
