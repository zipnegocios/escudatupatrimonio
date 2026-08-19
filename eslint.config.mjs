import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Convención estándar: un `_` al inicio marca a propósito que no se
      // usa (p.ej. destructuring para descartar una key: `const { action:
      // _action, ...rest } = data`) — sin esto, la única forma de "tirar"
      // una key es enumerar el resto a mano, que en objetos grandes es
      // mucho más ilegible que la alternativa.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores de eslint-config-next. `.next/**` sin `**/` al
    // principio solo ignora la carpeta en la raíz (semántica de gitignore
    // para patrones con `/` en el medio) — un .next anidado, como el que
    // deja un worktree bajo .claude/worktrees/<nombre>/.next, se colaba y
    // el linter terminaba analizando bundles de Next generados (miles de
    // errores falsos). Se agrega el prefijo `**/` para cubrir cualquier
    // profundidad.
    "**/.next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Directorio interno de la herramienta (worktrees, artefactos de
    // subagent-driven-development) — nunca es código del proyecto.
    ".claude/**",
  ]),
]);

export default eslintConfig;
