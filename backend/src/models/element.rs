use serde::{Deserialize, Serialize};
use sqlx::{
    self,
    Type,
    Postgres,
    QueryBuilder,
    Error, FromRow, Row,
    postgres::{PgPool, PgRow},
};
use tracing::debug;
use super::{
    Paginable,
    Filterable,
    UtcTimestamp,
};
use macros::axum_crud;
use std::fmt;

// =================================================================
// 1. ESTRUCTURAS DE DATOS (STRUCTS)
// =================================================================

#[derive(Debug, Type, Serialize, Deserialize, Clone, Copy)]
#[sqlx(type_name = "element_enum", rename_all = "lowercase")]
pub enum ElementType {
    #[serde(rename = "chapter")]
    Chapter,
    #[serde(rename = "line")]
    Line,
}

impl fmt::Display for ElementType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Chapter => "Chapter",
            Self::Line => "Line",
        };
        write!(f, "{}", s)
    }
}

impl Filterable for Option<ElementType> {
    fn append_filter(&self, builder: &mut QueryBuilder<Postgres>, column: &str) {
        if let Some(val) = self {
            builder.push(format!(" AND {} LIKE ", column));
            builder.push_bind(format!("%{}%", val));
        }
    }
}

#[axum_crud(path = "/elements", new = "NewElement", params = "ElementParams")]
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Element {
    pub id: i32,
    pub project_id: i32,
    // Option<i32> permite la clave recursiva (NULL para elementos raíz)
    pub parent_id: Option<i32>, 
    pub version_id: i32, 
    // Mapeamos el ENUM element_enum a String
    pub element_type: ElementType, 
    pub budget_code: String,
    pub description: Option<String>,

    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}

// DTO para la creación de una nueva versión de presupuesto
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct NewElement {
    pub project_id: i32,
    // Option<i32> permite la clave recursiva (NULL para elementos raíz)
    pub parent_id: Option<i32>, 
    pub version_id: i32, 
    // Mapeamos el ENUM element_enum a String
    pub element_type: ElementType, 
    pub budget_code: String,
    pub description: Option<String>,
}

#[derive(Debug, serde::Deserialize, macros::Paginable)]
pub struct ElementParams {
    pub id: Option<i32>,

    pub parent_id: Option<i32>,
    pub version_id: Option<i32>,
    pub element_type: Option<ElementType>,
    pub budget_code: Option<String>,
    pub description: Option<String>,

    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub sort_by: Option<String>,
    pub asc: Option<bool>,
}

// =================================================================
// 2. MÉTODOS CRUD (ASOCIADOS DIRECTAMENTE AL STRUCT)
// =================================================================

impl Element {
    const TABLE: &str = "budgets";
    const INSERT_QUERY: &str = r#"
        (
            project_id,
            parent_id,
            version_id,
            element_type,
            budget_code,
            description
        )
        VALUES ($1, $2, $3, $4, $5, $6)
    "#;
    const UPDATE_QUERY: &str = r#"
        project_id = $2,
        parent_id = $3,
        version_id = $4,
        element_type = $5,
        budget_code = $5,
        description = $7
    "#;

    // =================================================================
    // R: READ
    // =================================================================
    pub async fn read_by_id(pg_pool: &PgPool, id: i32) -> Result<Option<Self>, Error> {
        let sql = format!(r#"SELECT * FROM {} WHERE id = $1"#, Self::TABLE);
        debug!("Read by: {}", &sql);
        sqlx::query_as::<_, Self>(&sql)
            .bind(id)
            .fetch_optional(pg_pool)
            .await
    }

    pub async fn read_all(pg_pool: &PgPool) -> Result<Vec<Self>, Error>{
        let sql = format!("SELECT * FROM {}", Self::TABLE);
        debug!("Read all: {}", &sql);
        sqlx::query_as::<_, Self>(&sql)
            .fetch_all(pg_pool)
            .await
    }

    pub async fn count_paged(pool: &PgPool, params: &ElementParams) -> Result<i64, Error> {
        let sql = format!("SELECT COUNT(*) FROM {} WHERE 1=1", Self::TABLE);
        debug!("Count paged: {}", &sql);
        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(&sql);
        params.parent_id.append_filter(&mut query_builder, "parent_id");
        params.version_id.append_filter(&mut query_builder, "version_id");
        params.element_type.append_filter(&mut query_builder, "element_type");
        params.budget_code.append_filter(&mut query_builder, "budget_code");
        params.description.append_filter(&mut query_builder, "description");
        query_builder
            .build()
            .map(|row: PgRow| row.get::<i64, _>(0))
            .fetch_one(pool)
            .await
    }

    pub async fn read_paged(pool: &PgPool, params: &ElementParams) -> Result<Vec<Self>, Error> {
        let sql = format!("SELECT * FROM {} WHERE 1=1", Self::TABLE);
        debug!("Read paged: {}", &sql);
        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(&sql);
        params.parent_id.append_filter(&mut query_builder, "parent_id");
        params.version_id.append_filter(&mut query_builder, "version_id");
        params.element_type.append_filter(&mut query_builder, "element_type");
        params.budget_code.append_filter(&mut query_builder, "budget_code");
        params.description.append_filter(&mut query_builder, "description");
        if let Some(sort_by) = &params.sort_by {
            query_builder.push(format!(" ORDER BY {} ", sort_by));
            query_builder.push(if params.asc.unwrap_or(true) { "ASC" } else { "DESC" });
        }
        query_builder.push(" LIMIT ");
        query_builder.push_bind(params.limit_or_default());
        query_builder.push(" OFFSET ");
        query_builder.push_bind(params.offset());
        query_builder
            .build_query_as::<Self>()
            .fetch_all(pool)
            .await
    }

    // =================================================================
    // C: CREATE (Crear)
    // =================================================================
    /// Inserta un nuevo registro en la base de datos y devuelve el objeto creado.
    pub async fn create(pg_pool: &PgPool, item: NewElement) -> Result<Self, Error> {
        let sql = format!("{} RETURNING *", Self::INSERT_QUERY);
        debug!("Create: {}", &sql);
        sqlx::query_as::<_, Self>(&sql)
        .bind(item.project_id)
        .bind(item.parent_id)
        .bind(item.version_id)
        .bind(item.element_type)
        .bind(item.budget_code)
        .bind(item.description)
        .fetch_one(pg_pool)
        .await
    }

    // =================================================================
    // U: UPDATE (Actualizar)
    // =================================================================
    /// Actualiza un registro por ID y devuelve el objeto actualizado.
    pub async fn update(pg_pool: &PgPool, item: Self) -> Result<Self, Error> {
        let sql = format!("UPDATE {} SET {} WHERE id = $1 RETURNING ", Self::TABLE, Self::UPDATE_QUERY);
        debug!("Update: {}", &sql);
        sqlx::query_as::<_, Self>(&sql)
        .bind(item.id)
        .bind(item.project_id)
        .bind(item.parent_id)
        .bind(item.version_id)
        .bind(item.element_type)
        .bind(item.budget_code)
        .bind(item.description)
        .fetch_one(pg_pool)
        .await
    }

    // =================================================================
    // D: DELETE (Borrar y devolver el valor)
    // =================================================================
    /// Elimina un registro por ID y devuelve el objeto que fue eliminado.
    pub async fn delete(pg_pool: &PgPool, id: i32) -> Result<Self, Error> {
        let sql = format!(" DELETE FROM {} WHERE id = $1 RETURNING *", Self::TABLE);
        debug!("Delete: {}", &sql);
        sqlx::query_as::<_, Self>(&sql)
            .bind(id)
            .fetch_one(pg_pool)
            .await
    }
}
