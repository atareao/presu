# Changelog
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

### Refactor

- *(frontend)* Corrige errores y warnings de eslint
- *(backend)* Corrige avisos de clippy -D warnings

### Testing

- *(backend)* Aplica las migraciones en el setup de los tests
