# Changelog
## [0.1.4] - 2026-11-13

### Documentation

- Añado licencia MIT
## [0.1.3] - 2026-11-09

### Bug Fixes

- *(backend)* Firma JWT con HMAC-SHA256 en lugar de jsonwebtoken

### Dependencies

- Aplica los 10 bumps pendientes de Dependabot y los agrupa

### Documentation

- Archiva PLAN-002 y añade HANDOFF de sesión
- Archiva PLAN-001 (seguridad de dependencias frontend)

### Miscellaneous Tasks

- Añade cargo audit y documenta la protección de ramas
- Ejecuta cargo audit dentro de backend/
- Fuerza la ejecución del workflow
- Release v0.1.3
## [0.1.2] - 2026-11-09

### Miscellaneous Tasks

- Release v0.1.2
- *(release)* Sincroniza Cargo.lock tras el bump de versión
- Release v0.1.2
## [0.1.1] - 2026-11-09

### Miscellaneous Tasks

- *(release)* Evita que vampus aborte por ficheros no versionados
- Release v0.1.1
## [0.1.0] - 2026-11-09

### Bug Fixes

- *(backend)* Corrige las queries de units y alinea el esquema

### Dependencies

- *(frontend)* Actualiza dependencias para eliminar vulnerabilidades de pnpm audit
- *(backend)* Actualiza dependencias con avisos de seguridad

### Documentation

- Añade plan y documentación de seguridad de dependencias
- Actualiza PLAN-001 con issue y PR
- Añade PLAN-002 y documentación de CI/CD

### Miscellaneous Tasks

- *(ci)* Añade CI, workflow de imagen, Dependabot, cliff y toolchain
- *(frontend)* Fija pnpm@12.15.0 en packageManager
- Añade workflow de release automático (version + changelog + tag)
- *(release)* Evita SIGPIPE en la detección de bump
- Release v0.1.0

### Refactor

- *(frontend)* Corrige errores y warnings de eslint
- *(backend)* Corrige avisos de clippy -D warnings

### Testing

- *(backend)* Aplica las migraciones en el setup de los tests
