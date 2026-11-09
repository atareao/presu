# PLAN-002 — CI/CD en GitHub Actions (paridad con valet)

- **Issue:** #7 — https://github.com/atareao/presu/issues/7
- **Ámbito:** infraestructura del repo (backend Rust + frontend pnpm).

## Tareas
- [x] `.github/workflows/ci.yml`: backend (fmt, clippy, test con Postgres) + frontend (tsc, lint, audit, test, build).
- [x] `.github/workflows/image.yml`: build Docker, smoke test (health + Postgres) y push a `ghcr.io/atareao/presu`.
- [x] `.github/dependabot.yml`: cargo `/backend` y npm `/frontend` → `development`.
- [x] `cliff.toml` y `rust-toolchain.toml` (1.98.1).
- [x] Trackear `backend/Cargo.lock`.
- [x] Dejar backend limpio (fmt + clippy) y tests autosuficientes (aplican migraciones).
- [x] Fix de `units`: SQL inválido + migración correctiva del esquema.
- [x] Resolver alertas de Dependabot del backend (openssl, rand, time, bytes, jsonwebtoken, rsa).

## Resultado
- PRs: #8, #9, #20, #21. `main` con CI e Image en verde y Dependabot a 0.
