import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
