# HANDOFF

_Actualizado: 2026-11-09_

## Estado

`main` estable en **v0.1.3** (`4153a0e`), `development` sincronizada con `main`.
CI/CD completo y funcionando de punta a punta:

| Workflow | Disparador | Estado |
|---|---|---|
| `ci.yml` | PR/push a `development` y `main` | ✅ |
| `image.yml` | push a `main`, tags `v*`, manual | ✅ |
| `release-prepare.yml` | push a `main`, manual | ✅ |

- Dependabot: **0 alertas** (frontend y backend).
- Releases automáticas: `v0.1.0`, `v0.1.1`, `v0.1.2` y `v0.1.3` (todas con imagen en `ghcr.io/atareao/presu`).
- `cargo audit` en CI (job `audit`), CodeQL activado y ramas `main`/`development` protegidas.
- Secreto `GH_PAT` configurado (scopes `repo`, `workflow`); es lo que permite que el tag empujado por el workflow dispare `image.yml`.

## Tarea pendiente

Ninguna abierta en curso. Candidatas:

1. **Tests de frontend**: 69 ficheros en `frontend/src` y solo 8 de test (todos de `models/`). Cero tests de componentes, diálogos, `AuthContext` o páginas. Es la mayor deuda de calidad.
2. **Dependabot: 18 PRs nuevos** (#37–#55). El agrupado ya funciona (`cargo-minor-patch`, `npm-minor-patch`); los majors van sueltos. Destaca **#38 (sqlx 0.9.0)**, que permitiría quitar el aviso de `libsqlite3-sys` (RUSTSEC-2026-0459).
3. `docs/` incompleto: faltan `docs/<feature>.md` para usuarios, roles, presupuestos, precios, mediciones y proyectos.

## Contexto imprescindible

- Flujo gitflow: `feature/*` → `development` → `main`; nunca commits directos a `main`/`development`. Commits con gitmoji + conventional commits.
- Un push a `main` dispara el release: detecta bump (`!:`/`BREAKING CHANGE` → major, `feat` → minor, resto → patch), ejecuta `vampus`, sincroniza `backend/Cargo.lock`, regenera `CHANGELOG.md`, crea el tag y sincroniza `development`.
- **No** tocar `frontend/.env` en `.vampus.yml` (está gitignored: `vampus` abortaría en CI).
- **No** quitar `cargo metadata` del release si se mantiene `--locked` en el Dockerfile.
- Los avisos de `cargo audit` se silencian en `backend/.cargo/audit.toml` (el fichero debe estar en `.cargo/`, no en la raíz, y la sección es `[advisories]`).
- Un PR con conflictos **no ejecuta workflows**: si CI no arranca tras un push, mira `gh pr view N --json mergeable`.
- Tests locales: `DATABASE_URL=postgres://preemer:preemer_password@localhost:5445/preemer`.
- Docker no está disponible en local: `image.yml` solo se puede validar en CI.
- Secretos: `crypta lookup gh_pat`.
