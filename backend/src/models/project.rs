use serde::{Deserialize, Serialize};
use sqlx::{
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

// =================================================================
// 1. ESTRUCTURAS DE DATOS (STRUCTS)
// =================================================================

#[derive(Debug, FromRow, Serialize)]
pub struct Item {
    pub id: i32,
    pub code: String,
    pub title: String,
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}

#[derive(Debug, Deserialize)]
pub struct NewItem {
    pub code: String,
    pub title: Option<String>,
}

#[derive(Debug, serde::Deserialize, macros::Paginable)]
pub struct Params {
    pub id: Option<i32>,

    pub code: Option<String>,
    pub title: Option<i32>,

    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub sort_by: Option<String>,
    pub asc: Option<bool>,
}

// =================================================================
// 2. MÉTODOS CRUD (ASOCIADOS DIRECTAMENTE AL STRUCT)
// =================================================================

impl Item {
    const TABLE: &str = "projects";
    const INSERT_QUERY: &str = r#"
        (
            code,
            title
        )
        VALUES ($1, $2)
    "#;
    const UPDATE_QUERY: &str = r#"
        code = $2,
        title = $3
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

    pub async fn count_paged(pool: &PgPool, params: &Params) -> Result<i64, Error> {
        let sql = format!("SELECT COUNT(*) FROM {} WHERE 1=1", Self::TABLE);
        debug!("Count paged: {}", &sql);
        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(&sql);
        params.code.append_filter(&mut query_builder, "name");
        params.title.append_filter(&mut query_builder, "description");
        query_builder
            .build()
            .map(|row: PgRow| row.get::<i64, _>(0))
            .fetch_one(pool)
            .await
    }

    pub async fn read_paged(pool: &PgPool, params: &Params) -> Result<Vec<Self>, Error> {
        let sql = format!("SELECT * FROM {} WHERE 1=1", Self::TABLE);
        debug!("Read paged: {}", &sql);
        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(&sql);
        params.code.append_filter(&mut query_builder, "name");
        params.title.append_filter(&mut query_builder, "description");
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
    pub async fn create(pg_pool: &PgPool, item: NewItem) -> Result<Self, Error> {
        let sql = format!("{} RETURNING *", Self::INSERT_QUERY);
        debug!("Create: {}", &sql);
        sqlx::query_as::<_, Self>(&sql)
        .bind(item.code)
        .bind(item.title)
        .fetch_one(pg_pool)
        .await
    }

    // =================================================================
    // U: UPDATE (Actualizar)
    // =================================================================
    /// Actualiza un registro por ID y devuelve el objeto actualizado.
    pub async fn update(pg_pool: &PgPool, item: Item) -> Result<Self, Error> {
        let sql = format!("UPDATE {} SET {} WHERE id = $1 RETURNING ", Self::TABLE, Self::UPDATE_QUERY);
        debug!("Update: {}", &sql);
        sqlx::query_as::<_, Self>(&sql)
        .bind(item.id)
        .bind(item.code)
        .bind(item.title)
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
