# CI/CD (GitHub Actions)

## Qué es
Integración continua y publicación de imagen Docker, replicando el esquema del repo `valet`.

## Ficheros
- `.github/workflows/ci.yml` — checks en PR/push a `development`/`main`.
- `.github/workflows/image.yml` — build + smoke test + push de imagen (push a `main`, tags `v*`, manual).
- `.github/workflows/release-prepare.yml` — bump de versión + `CHANGELOG.md` + tag `vX.Y.Z` (push a `main`, manual).
- `.github/dependabot.yml` — actualizaciones semanales (cargo `/backend`, npm `/frontend`) hacia `development`.
- `cliff.toml` — changelog con git-cliff.
- `rust-toolchain.toml` — toolchain 1.98.1 con `rustfmt` y `clippy`.

## Cómo funciona
- **Backend (job `backend`)**: `cargo fmt --check`, `cargo clippy -D warnings`, `cargo test`. Usa un servicio PostgreSQL efímero; los tests aplican las migraciones en `setup_pool`.
- **Frontend (job `frontend`)**: pnpm 12 (`packageManager`), `tsc --noEmit`, `lint`, `pnpm audit --audit-level high`, `test:run`, `build`.
- **Release**: en cada push a `main` (los commits `chore: release ...` se saltan para no entrar en bucle) detecta el bump desde los conventional commits (`!:`/`BREAKING CHANGE` → major, `feat` → minor, resto → patch), ejecuta `vampus upgrade`, sincroniza `backend/Cargo.lock` (`cargo metadata`) porque el Dockerfile compila con `--locked`, genera `CHANGELOG.md` con `git-cliff`, commitea, crea y publica el tag `vX.Y.Z`, y sincroniza `development` con `main`.
- **Imagen**: construye el Dockerfile, arranca el contenedor contra un Postgres efímero y valida `GET /api/v1/health` (con `RUST_ENV=production`). Si pasa, publica en `ghcr.io/atareao/presu` (`latest` + `sha-*`; en tags `vX.Y.Z` → `vX.Y.Z`, `X.Y`, `latest`).

## Variables/config
- `DATABASE_URL` (CI: servicio Postgres `presu:presu@localhost:5432/presu`).
- `RUST_ENV=production` en el contenedor (hace que busque las migraciones junto al binario).

## Cómo habilitar/desplegar
Nada que configurar: los workflows se ejecutan solos. Requiere `GITHUB_TOKEN` (incluido) para publicar en GHCR.
El release usa `secrets.GH_PAT` si existe y cae a `GITHUB_TOKEN` si no: con `GITHUB_TOKEN` los commits/tags que empuja **no disparan otros workflows**, así que para que un tag `v*` lance `image.yml` hay que definir el secreto `GH_PAT` (token con scope `repo`/`workflow`).

## Decisiones
- Se fija `packageManager: pnpm@12.15.0` para reproducibilidad (corepack/Docker y CI).
- Se trackea `backend/Cargo.lock` para builds `--locked` reproducibles.
- Migración correctiva `20251203051200_fix_units_columns`: alinea `units` a `name/symbol/description/formula` (el commit `5a36b19` cambió solo la migración a `unit/params` y dejó modelo/tests/frontend inconsistentes). Idempotente y reversible.

## Follow-ups
- El tag inicial `v0.1.0` se creó con el primer run de `release-prepare` (sin bump, porque la versión ya coincidía con la de arranque). Los siguientes runs sí incrementan.
- `.vampus.yml` solo referencia ficheros versionados: `frontend/.env` está en `.gitignore` y hacía abortar a `vampus` en CI (sale con código 0, por eso el workflow ahora compara la versión antes/después y falla si no cambió).
