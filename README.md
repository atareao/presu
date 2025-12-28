# Presu

Presu es una aplicación de presupuestos y gestión de proyectos. Está diseñada para ser una herramienta potente y flexible para profesionales y empresas que necesitan crear, gestionar y realizar un seguimiento de los presupuestos de sus proyectos.

## Características principales

- **Gestión de proyectos**: Cree y organice sus proyectos, estableciendo versiones de base y realizando un seguimiento de su progreso.
- **Catálogo de precios**: Gestione un catálogo centralizado de precios, unidades y descomposiciones para agilizar la creación de presupuestos.
- **Presupuestos flexibles**: Genere diferentes versiones de sus presupuestos dentro de un mismo proyecto, permitiendo una fácil comparación y ajuste.
- **Mediciones detalladas**: Introduzca mediciones precisas para cada elemento de su presupuesto.
- **Control de versiones**: Utilice diferentes versiones del catálogo de precios para sus proyectos y presupuestos.

## Tecnología

Presu está construido con un stack de tecnología moderno y robusto:

- **Backend**: Desarrollado en **Rust**, utilizando el framework web **Axum** para un rendimiento y seguridad excepcionales. La interacción con la base de datos se realiza a través de **SQLx**.
- **Frontend**: Una aplicación de página única (SPA) creada con **React**, **Vite** y **TypeScript**, que ofrece una experiencia de usuario rápida y fluida.
- **Base de datos**: Utiliza **PostgreSQL** para el almacenamiento de datos persistente.

## Puesta en marcha

Para ejecutar el proyecto en su entorno de desarrollo local, siga estos pasos:

### Prerrequisitos

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) y [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/get-started) (para la base de datos)
- [Just](https://github.com/casey/just) (un ejecutor de comandos)

### Pasos

1.  **Clonar el repositorio:**

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd presu
    ```

2.  **Configurar las variables de entorno:**

    Copie el archivo `.env.example` a `.env` tanto en el directorio `backend` como en el `frontend` y rellene las variables necesarias. Como mínimo, necesitará configurar la `DATABASE_URL` para el backend.

3.  **Iniciar la base de datos:**

    Puede utilizar Docker para iniciar una instancia de PostgreSQL:

    ```bash
    docker run --name presu-db -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
    ```

4.  **Ejecutar las migraciones de la base de datos:**

    Desde el directorio `backend`, ejecute:

    ```bash
    sqlx migrate run
    ```

5.  **Instalar dependencias y ejecutar la aplicación:**

    La forma más sencilla de iniciar el entorno de desarrollo es utilizando el `justfile` proporcionado. Este comando instalará las dependencias del frontend, construirá el frontend, copiará los archivos estáticos al backend y finalmente iniciará el servidor del backend.

    ```bash
    just dev
    ```

    Alternativamente, puede ejecutar el frontend y el backend por separado en diferentes terminales:

    -   **Para el frontend:**
        ```bash
        [working-directory("./frontend")]
        pnpm install
        pnpm run dev
        ```

    -   **Para el backend:**
        ```bash
        [working-directory("./backend")]
        cargo run
        ```

Una vez que todo esté en marcha, la aplicación frontend debería ser accesible en `http://localhost:5173` y el servidor backend en `http://localhost:3000`.

## Estructura del proyecto

```
.
├── backend/        # Aplicación Rust (Axum)
│   ├── migrations/ # Migraciones de la base de datos (SQLx)
│   ├── src/        # Código fuente del backend
│   └── Cargo.toml
├── frontend/       # Aplicación React (Vite)
│   ├── src/        # Código fuente del frontend
│   └── package.json
├── .justfile       # Comandos del proyecto
├── Dockerfile      # Para construir la imagen de producción
└── README.md
```

## Diagrama de la base de datos

A continuación se muestra un diagrama de Entidad-Relación que representa la estructura de la base de datos.

```
erDiagram
    %% ----------------------------------------------------
    %% ENTITIES: DEFINICIÓN DE LAS TABLAS CON CLAVES Y CAMPOS CRÍTICOS
    %% ----------------------------------------------------
    roles {
        int id PK
        varchar name
    }
    
    users {
        int id PK
        int role_id FK
        varchar username
        varchar email
        varchar hashed_password
        boolean is_active
    }

    versions {
        int id PK
        varchar name
    }
    
    units {
        int id PK
        varchar name
        varchar description
        text base_formula
        jsonb expected_params_json
    }
    
    projects {
        int id PK
        int base_version_id FK
        varchar code
        varchar title
    }
    
    prices {
        int id PK
        int version_id FK "Catálogo de precios"
        int unit_id FK
        varchar code
        text description
        numeric base_price
        price_type_enum price_type
    }
    
    decompositions {
        int id PK
        int parent_price_id FK
        int component_price_id FK
        calculation_mode_enum calculation_mode
        numeric fixed_quantity
        jsonb params_json
    }
    
    budget_versions {
        int id PK
        int project_id FK
        varchar code
        int version_number
        varchar name
        budget_status_enum status
    }
    
    elements {
        int id PK
        int budget_id FK
        int parent_id FK "Jerarquía Recursiva"
        int version_id FK "Override de catálogo"
        element_type_enum element_type
        varchar code
        varchar budget_code
        text description
    }
    
    measurements {
        int id PK
        int element_id FK
        int price_id FK
        jsonb params_json
        text measurement_text
        numeric measured_quantity
    }
    
    %% ----------------------------------------------------
    %% RELATIONSHIPS: DEFINICIÓN DE LAS RELACIONES (FKs)
    %% ----------------------------------------------------
    
    %% AUTORIZACIÓN
    roles ||--o{ users : has
    
    %% ESTRUCTURA DEL PROYECTO
    projects ||--o{ budget_versions : has
    budget_versions ||--o{ elements : contains
    elements ||--o{ elements : has_parent
    elements ||--o{ measurements : has_detail

    %% CATÁLOGO DE PRECIOS
    versions ||--o{ projects : default_version_is
    versions ||--o{ prices : is_version_of
    versions ||--o{ elements : uses_catalog_version
    units ||--o{ prices : uses_unit

    %% LÓGICA DE CÁLCULO
    prices ||--o{ decompositions : is_decomposed_by "parent_price_id"
    prices ||--o{ decompositions : contains_component "component_price_id"
    prices ||--o{ measurements : provides_cost "price_id"
```
