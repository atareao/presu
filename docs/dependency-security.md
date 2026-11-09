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

## Follow-ups
- `pnpm lint` falla (preexistente): 36 errores `no-explicit-any` y variables sin usar.
