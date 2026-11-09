# Seguridad de dependencias (frontend)

## Qué es
Remediación de los avisos de seguridad (`pnpm audit`) del frontend React/TypeScript.

## Ficheros implicados
- `frontend/package.json` — bumps de dependencias directas.
- `frontend/pnpm-workspace.yaml` — `overrides` para dependencias transitivas.
- `frontend/pnpm-lock.yaml` — regenerado.

## Cómo funciona
- Las dependencias **directas** se subieron al mínimo parcheado que resuelve los avisos, evitando saltos de major innecesarios.
- Las dependencias **transitivas** sin versión parcheada alcanzable se fuerzan con `overrides` (selectores por rango).
- `i18next-scanner` se eliminó: arrastraba `deepmerge` (sin parche); `i18next-cli` ya cubre su función.

## Cómo verificar
```
cd frontend
pnpm install
pnpm audit          # debe decir "No known vulnerabilities found"
pnpm build
pnpm test:run
```

## Decisiones
- Se mantiene react-router en la línea 7.x (7.18.5) en lugar de saltar a 8.x, y vite/vitest en sus majors actuales, para minimizar riesgo.
- i18next-http-backend salta a 4.x (única línea parcheada); su export por defecto sigue siendo compatible con `src/App.tsx`.

## Actualizaciones automáticas (Dependabot)
`.github/dependabot.yml` agrupa las actualizaciones **minor y patch** de cada ecosistema en un único PR
(`cargo-minor-patch`, `npm-minor-patch`). Los **majors** siguen llegando por separado porque requieren
revisión manual (i18next 26, bcrypt-ts 9 y jest-dom 7 se revisaron así).

## Backend: JWT sin criptografía asimétrica

`cargo audit` señalaba `rsa` (RUSTSEC-2023-0071, Marvin attack) y `crypto-bigint`
(RUSTSEC-2026-0387). Ambos entraban solo por `jsonwebtoken` con la feature
`rust_crypto`, que habilita RSA, P-256/P-384 y ed25519.

El backend únicamente **firma** tokens HS256 (no hay `decode` en ninguna ruta), así que
`jsonwebtoken` se sustituyó por `src/jwt.rs`: 30 líneas que firman con `hmac` + `sha2`
(crates que ya estaban en el árbol). Se eliminan del lockfile `rsa`, `ecdsa`, `p256`,
`p384`, `crypto-bigint`, `ed25519-dalek` y `curve25519-dalek`.

- Tests: `cargo test jwt` (cabecera fija, payload round-trip, firma verificada contra
  HMAC-SHA256 y secretos distintos).
- `dotenv` (sin mantenimiento) → `dotenvy`.
- `backend/.cargo/audit.toml` documenta los 3 avisos ignorados y por qué
  (`rsa` y `libsqlite3-sys` no se compilan; `pin-utils` es unmaintained sin alternativa).

## Follow-ups
- `pnpm lint` ya pasa limpio (los 36 `no-explicit-any` y las variables sin usar se corrigieron).
- `dist/` genera chunks >500 kB (`vendor-core` 1 MB, `vendor-pdf` 800 kB): pendiente de code-splitting.
