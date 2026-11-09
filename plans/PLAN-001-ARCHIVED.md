# PLAN-001 — Remediar vulnerabilidades de dependencias (frontend)

- **Estado:** ✅ COMPLETADO — archivado el 2026-11-09
- **Issue:** #4 — https://github.com/atareao/presu/issues/4
- **Ámbito:** `frontend/` (pnpm). El backend Rust no presentaba avisos.
- **Punto de partida:** `pnpm audit` → 89 avisos (1 crítica, 48 altas, 34 moderadas, 6 bajas).

## Tareas
- [x] Bump dependencias directas: react-router `^7.18.5`, i18next-http-backend `^4.0.10`, vite `^7.3.8`, vitest `^4.1.12`, lodash `^4.18.1`.
- [x] Eliminar `i18next-scanner` (arrastraba `deepmerge`, sin versión parcheada).
- [x] Añadir `overrides` en `pnpm-workspace.yaml` para las transitivas vulnerables.
- [x] `pnpm audit` → 0 vulnerabilidades.
- [x] `pnpm build` OK y `pnpm test:run` OK.
- [x] `pnpm lint` → exit 0 (36 errores + 4 warnings corregidos).
- [x] Alertas de Dependabot del repo a 0 (frontend y backend).

## Resultado
- PRs: #4, #5 (`feature/dependency-security` → `development`) y #20, #21 (backend, `cargo update`).
- `main` con `CI` en verde y `pnpm audit` limpio desde entonces.

## Notas
- Se mantiene react-router en 7.18.5 (no 8.x) y vite/vitest en sus majors actuales para minimizar riesgo.
- El detalle técnico vive en `docs/dependency-security.md`.
