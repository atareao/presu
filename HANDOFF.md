# HANDOFF

_Actualizado: 2026-11-09_

## Estado

`main` estable en **v0.1.2** (`749197a`), `development` sincronizada con `main`.
CI/CD completo y funcionando de punta a punta:

| Workflow | Disparador | Estado |
|---|---|---|
| `ci.yml` | PR/push a `development` y `main` | ✅ |
| `image.yml` | push a `main`, tags `v*`, manual | ✅ |
| `release-prepare.yml` | push a `main`, manual | ✅ |

- Dependabot: **0 alertas** (frontend y backend).
- Releases automáticas: `v0.1.0`, `v0.1.1`, `v0.1.2` (con imagen en `ghcr.io/atareao/presu`).
- Secreto `GH_PAT` configurado (scopes `repo`, `workflow`); es lo que permite que el tag empujado por el workflow dispare `image.yml`.

## Tarea pendiente

Ninguna abierta en curso. Candidatas:

1. **Archivar `PLAN-001`** (seguridad de dependencias frontend) y cerrar el issue **#4**: todas sus tareas están cerradas y el trabajo está en `main`.
2. Añadir cobertura de tests donde falte (el plan de CI/CD no la incluye).
3. Revisar que `image.yml` publique también `X.Y` (minor) además de `vX.Y.Z` y `latest`.

## Contexto imprescindible

- Flujo gitflow: `feature/*` → `development` → `main`; nunca commits directos a `main`/`development`. Commits con gitmoji + conventional commits.
- Un push a `main` dispara el release: detecta bump (`!:`/`BREAKING CHANGE` → major, `feat` → minor, resto → patch), ejecuta `vampus`, sincroniza `backend/Cargo.lock`, regenera `CHANGELOG.md`, crea el tag y sincroniza `development`.
- **No** tocar `frontend/.env` en `.vampus.yml` (está gitignored: `vampus` abortaría en CI).
- **No** quitar `cargo metadata` del release si se mantiene `--locked` en el Dockerfile.
- Tests locales: `DATABASE_URL=postgres://preemer:preemer_password@localhost:5445/preemer`.
- Docker no está disponible en local: `image.yml` solo se puede validar en CI.
- Secretos: `crypta lookup gh_pat`.
