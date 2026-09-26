import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const restrict = (patterns) => ({ "no-restricted-imports": ["error", { patterns }] });

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: restrict([
      {
        group: ["react", "react-dom", "next", "next/**", "@supabase/**"],
        message: "domain/ é puro: sem React, Next ou Supabase.",
      },
      {
        group: ["@/app/**", "@/features/**", "@/data/**", "@/ui/**", "@/lib/**"],
        message: "domain/ não depende de outras camadas.",
      },
    ]),
  },
  {
    files: ["src/ui/**/*.{ts,tsx}"],
    rules: restrict([
      { group: ["@/app/**", "@/features/**", "@/data/**"], message: "ui/ só conhece domain/ e lib/." },
    ]),
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: restrict([
      {
        group: ["@/data/**", "@/app/**"],
        message: "features/ recebe dados prontos; não acessa data/ nem app/.",
      },
      {
        group: ["@/features/*/**"],
        message: "Importe outra feature só pelo index (ex.: @/features/menu).",
      },
      {
        group: ["@/domain/schema"],
        message: "Schemas Zod ficam no servidor (data/); no cliente trariam o Zod para o bundle.",
      },
    ]),
  },
  {
    files: ["src/ui/**/*.{ts,tsx}", "src/lib/**/*.{ts,tsx}", "src/app/_components/**/*.{ts,tsx}"],
    ignores: ["src/lib/env.ts"], // env.ts só roda no servidor (usado por data/)
    rules: restrict([
      {
        group: ["@/domain/schema", "zod"],
        message: "Schemas Zod ficam no servidor (data/); no cliente trariam o Zod para o bundle.",
      },
    ]),
  },
  {
    files: ["src/data/**/*.{ts,tsx}"],
    rules: restrict([
      {
        group: ["react", "react-dom", "@/app/**", "@/features/**", "@/ui/**"],
        message: "data/ não conhece UI.",
      },
    ]),
  },
  { files: ["src/**/*.test.{ts,tsx}", "src/test/**"], rules: { "no-restricted-imports": "off" } },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/sw.js",
    "playwright-report/**",
    "test-results/**",
    ".superpowers/**",
  ]),
]);
