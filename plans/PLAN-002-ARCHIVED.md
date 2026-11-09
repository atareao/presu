# PLAN-002 — CI/CD en GitHub Actions (paridad con valet)

- **Estado:** ✅ COMPLETADO — archivado el 2026-11-09
- **Issue:** #7 — https://github.com/atareao/presu/issues/7
- **Ámbito:** infraestructura del repo (backend Rust + frontend pnpm).

## Tareas
- [x] `.github/workflows/ci.yml`: backend (fmt, clippy, test con Postgres) + frontend (tsc, lint, audit, test, build).
- [x] `.github/workflows/image.yml`: build Docker, smoke test (health + Postgres) y push a `ghcr.io/atareao/presu`.
- [x] `.github/workflows/release-prepare.yml`: bump de versión con `vampus`, `CHANGELOG.md` con `git-cliff`, tag `vX.Y.Z` y sincronización de `development` con `main`.
- [x] Secreto `GH_PAT`: sin él los commits/tags que empuja `GITHUB_TOKEN` no disparan otros workflows (el tag no publicaba imagen).
- [x] Sincronización de `backend/Cargo.lock` en cada release (el Dockerfile compila con `--locked`).
- [x] `.github/dependabot.yml`: cargo `/backend` y npm `/frontend` → `development`.
- [x] `cliff.toml` y `rust-toolchain.toml` (1.98.1).
- [x] Trackear `backend/Cargo.lock`.
- [x] Dejar backend limpio (fmt + clippy) y tests autosuficientes (aplican migraciones).
- [x] Fix de `units`: SQL inválido + migración correctiva del esquema.
- [x] Resolver alertas de Dependabot del backend (openssl, rand, time, bytes, jsonwebtoken, rsa).

## Resultado
- PRs: #8, #9, #20, #21 (seguridad), #22, #23 (docs), #24, #26, #28, #30 (release) y #4, #5 (frontend).
- `main` con `CI`, `Image` y `Prepare Release` en verde y Dependabot a 0 alertas.
- Releases generadas automáticamente: `v0.1.0`, `v0.1.1`, `v0.1.2` (imagen publicada también con su tag).

## Incidencias resueltas
- `release-prepare` marcaba verde sin incrementar versión: `vampus` aborta (exit 0) si un fichero de `replaces` no existe — `frontend/.env` está gitignored. Ahora solo referencia ficheros versionados y el workflow compara la versión antes/después.
- `cargo build --locked` fallaba tras cada release porque el lock seguía en la versión anterior. Se añadió `cargo metadata` tras el bump.
- `set -o pipefail` + `head`/`grep -q` provocaban `SIGPIPE` (exit 141). Sustituido por `sed -n 1p` y here-strings.
