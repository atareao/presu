# PLAN-001 — Remediar vulnerabilidades de dependencias (frontend)

- **Issue:** #4 — https://github.com/atareao/presu/issues/4
- **Ámbito:** `frontend/` (pnpm). El backend Rust no presenta avisos.
- **Punto de partida:** `pnpm audit` → 89 avisos (1 crítica, 48 altas, 34 moderadas, 6 bajas).

## Tareas
- [x] Bump dependencias directas: react-router `^7.18.5`, i18next-http-backend `^4.0.10`, vite `^7.3.8`, vitest `^4.1.12`, lodash `^4.18.1`.
- [x] Eliminar `i18next-scanner` (arrastra `deepmerge`, sin versión parcheada).
- [x] Añadir `overrides` en `pnpm-workspace.yaml` para las transitivas vulnerables.
- [x] `pnpm audit` → 0 vulnerabilidades.
- [x] `pnpm build` OK y `pnpm test:run` OK (8 ficheros / 11 tests).
- [x] `pnpm lint` → exit 0 (36 errores + 4 warnings corregidos).

## Resultado
- PR: https://github.com/atareao/presu/pull/5 (`feature/dependency-security` → `development`)
