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
        varchar email
        varchar hashed_password
        boolean is_active
        %% Los campos de auditoría (created_by/updated_by) también son FKs a esta misma tabla.
    }

    versions {
        int id PK
        varchar name
    }
    
    units {
        int id PK
        varchar name
    }
    
    projects {
        int id PK
        int base_version_id FK
        varchar name
    }
    
    prices {
        int id PK
        int version_id FK "Catálogo de precios"
        int unit_id FK
        varchar code
        numeric base_price
        price_type_enum price_type
    }
    
    decompositions {
        int id PK
        int parent_price_id FK
        int component_price_id FK
        calculation_mode_enum calculation_mode
    }
    
    budget_versions {
        int id PK
        int project_id FK
        int version_number
        budget_status_enum status
    }
    
    elements {
        int id PK
        int budget_version_id FK
        int parent_id FK "Jerarquía Recursiva"
        int version_id FK "Override de catálogo"
        element_enum element_type
        varchar budget_code
    }
    
    measurements {
        int element_id PK,FK "1:1 con elements"
        int price_id FK
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
    elements ||--|| measurements : has_detail

    %% CATÁLOGO DE PRECIOS
    versions ||--o{ projects : default_version_is
    versions ||--o{ prices : is_version_of
    versions ||--o{ elements : uses_catalog_version
    units ||--o{ prices : uses_unit

    %% LÓGICA DE CÁLCULO
    prices ||--o{ decompositions : is_decomposed_by "parent_price_id"
    prices ||--o{ decompositions : contains_component "component_price_id"
    prices ||--o{ measurements : provides_cost "price_id"

    %% AUDITORÍA (Simplificada)
    users ||--o{ users : created_by
