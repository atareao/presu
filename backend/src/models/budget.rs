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

#[derive(Debug, Type, Serialize, Deserialize, Clone, Copy, PartialEq)]
#[sqlx(type_name = "budget_status_enum", rename_all = "lowercase")] // Nombre del ENUM en PostgreSQL
pub enum BudgetStatus {
    #[serde(rename = "draft")]
    Draft,
    #[serde(rename = "submitted")]
    Submitted,
    #[serde(rename = "approved")]
    Approved,
    #[serde(rename = "rejected")]
    Rejected,
    #[serde(rename = "archived")]
    Archived,
}

impl fmt::Display for BudgetStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Draft => "draft",
            Self::Submitted => "submitted",
            Self::Approved => "approved",
            Self::Rejected => "rejected",
            Self::Archived => "archived",
        };
        write!(f, "{}", s)
    }
}

impl Filterable for Option<BudgetStatus> {
    fn append_filter(&self, builder: &mut QueryBuilder<Postgres>, column: &str) {
        if let Some(val) = self {
            builder.push(format!(" AND {} LIKE ", column));
            builder.push_bind(format!("%{}%", val));
        }
    }
}

/// Estructura del modelo de dominio para la tabla 'budgets'
#[axum_crud(path = "/budgets", new = "NewBudget", params = "BudgetParams")]
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Budget {
    pub id: i32,
    pub project_id: i32,
    pub code: String,
    pub version_number: i32,
    pub name: String,
    pub status: BudgetStatus, // Mapeado al enum nativo de Rust
    // Campos de Auditoría
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
}

// DTO para la creación de una nueva versión de presupuesto
#[derive(Debug, Deserialize)]
pub struct NewBudget {
    pub project_id: i32,
    pub code: String,
    pub version_number: i32,
    pub name: String,
    pub status: BudgetStatus, // Usamos el enum de Rust en el DTO
}

#[derive(Debug, serde::Deserialize, macros::Paginable)]
pub struct BudgetParams {
    pub id: Option<i32>,

    pub project_id: Option<i32>,
    pub code: Option<String>,
    pub version_number: Option<i32>,
    pub name: Option<String>,
    pub status: Option<BudgetStatus>,

    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub sort_by: Option<String>,
    pub asc: Option<bool>,
}

// =================================================================
// 2. MÉTODOS CRUD (ASOCIADOS DIRECTAMENTE AL STRUCT)
// =================================================================

impl Budget {
    const TABLE: &str = "budgets";
    const INSERT_QUERY: &str = r#"
        (
            project_id,
            code,
            version_number,
            status,
            name
        )
        VALUES ($1, $2, $3, $4, $5)
    "#;
    const UPDATE_QUERY: &str = r#"
        project_id = $2,
        code = $3,
        version_number = $4,
        status = $5,
        name = $6
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

    pub async fn count_paged(pool: &PgPool, params: &BudgetParams) -> Result<i64, Error> {
        let sql = format!("SELECT COUNT(*) FROM {} WHERE 1=1", Self::TABLE);
        debug!("Count paged: {}", &sql);
        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(&sql);
        params.project_id.append_filter(&mut query_builder, "project_id");
        params.code.append_filter(&mut query_builder, "code");
        params.version_number.append_filter(&mut query_builder, "version_number");
        params.status.append_filter(&mut query_builder, "status");
        params.name.append_filter(&mut query_builder, "name");
        query_builder
            .build()
            .map(|row: PgRow| row.get::<i64, _>(0))
            .fetch_one(pool)
            .await
    }

    pub async fn read_paged(pool: &PgPool, params: &BudgetParams) -> Result<Vec<Self>, Error> {
        let sql = format!("SELECT * FROM {} WHERE 1=1", Self::TABLE);
        debug!("Read paged: {}", &sql);
        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(&sql);
        params.project_id.append_filter(&mut query_builder, "project_id");
        params.code.append_filter(&mut query_builder, "code");
        params.version_number.append_filter(&mut query_builder, "version_number");
        params.status.append_filter(&mut query_builder, "status");
        params.name.append_filter(&mut query_builder, "name");
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
    pub async fn create(pg_pool: &PgPool, item: NewBudget) -> Result<Self, Error> {
        let sql = format!("INSERT INTO {} {} RETURNING *", Self::TABLE, Self::INSERT_QUERY);
        debug!("Create: {}", &sql);
        sqlx::query_as::<_, Self>(&sql)
        .bind(item.project_id)
        .bind(item.code)
        .bind(item.version_number)
        .bind(item.status)
        .bind(item.name)
        .fetch_one(pg_pool)
        .await
    }

    // =================================================================
    // U: UPDATE (Actualizar)
    // =================================================================
    /// Actualiza un registro por ID y devuelve el objeto actualizado.
    pub async fn update(pg_pool: &PgPool, item: Self) -> Result<Self, Error> {
        let sql = format!("UPDATE {} SET {} WHERE id = $1 RETURNING *", Self::TABLE, Self::UPDATE_QUERY);
        debug!("Update: {}", &sql);
        sqlx::query_as::<_, Self>(&sql)
        .bind(item.id)
        .bind(item.project_id)
        .bind(item.code)
        .bind(item.version_number)
        .bind(item.status)
        .bind(item.name)
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
