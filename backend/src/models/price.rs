use serde::{Deserialize, Serialize};
use sqlx::{
    self,
    Type,
    Postgres,
    QueryBuilder,
    Error, FromRow, Row,
    postgres::{PgPool, PgRow},
    types::BigDecimal,
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
#[sqlx(type_name = "price_type_enum", rename_all = "lowercase")]
pub enum PriceType {
    #[serde(rename = "base")]
    Base,
    #[serde(rename = "decomposed")]
    Decomposed,
}

impl fmt::Display for PriceType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Base => "base",
            Self::Decomposed => "decomposed",
        };
        write!(f, "{}", s)
    }
}

impl Filterable for Option<PriceType> {
    fn append_filter(&self, builder: &mut QueryBuilder<Postgres>, column: &str) {
        if let Some(val) = self {
            builder.push(format!(" AND {} LIKE ", column));
            builder.push_bind(format!("%{}%", val));
        }
    }
}

/// Representa una fila en la tabla 'prices'
#[axum_crud(path = "/prices", new = "NewPrice", params = "PriceParams")]
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Price {
    pub id: i32,
    pub version_id: i32,
    pub code: String,
    pub description: String,
    pub base_price: BigDecimal, // NUMERIC(10, 2)
    pub unit_id: i32, 
    // Mapeamos el ENUM price_type_enum a String
    pub price_type: PriceType,
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
}

#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct NewPrice {
    pub version_id: i32,
    pub code: String,
    pub description: String,
    pub base_price: BigDecimal,
    pub unit_id: i32,
    pub price_type: PriceType,
}

#[derive(Debug, serde::Deserialize, macros::Paginable)]
pub struct PriceParams {
    pub id: Option<i32>,

    pub code: Option<String>,
    pub description: Option<String>,
    pub base_price: Option<BigDecimal>,
    pub unit_id: Option<i32>,
    pub price_type: Option<PriceType>,

    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub sort_by: Option<String>,
    pub asc: Option<bool>,
}

// =================================================================
// 2. MÉTODOS CRUD (ASOCIADOS DIRECTAMENTE AL STRUCT)
// =================================================================

impl Price {
    const TABLE: &str = "prices";
    const INSERT_QUERY: &str = r#"
        (
            version_id,
            code,
            description,
            base_price,
            unit_id,
            price_type
        )
        VALUES ($1, $2, $3, $4, $5, $6)
    "#;
    const UPDATE_QUERY: &str = r#"
        version_id = $2,
        code = $3,
        description = $4,
        base_price = $5,
        unit_id = $6,
        price_type = $7
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

    pub async fn count_paged(pool: &PgPool, params: &PriceParams) -> Result<i64, Error> {
        let sql = format!("SELECT COUNT(*) FROM {} WHERE 1=1", Self::TABLE);
        debug!("Count paged: {}", &sql);
        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(&sql);
        params.code.append_filter(&mut query_builder, "code");
        params.description.append_filter(&mut query_builder, "description");
        params.base_price.append_filter(&mut query_builder, "base_price");
        params.unit_id.append_filter(&mut query_builder, "unit_id");
        params.price_type.append_filter(&mut query_builder, "price_type");
        query_builder
            .build()
            .map(|row: PgRow| row.get::<i64, _>(0))
            .fetch_one(pool)
            .await
    }

    pub async fn read_paged(pool: &PgPool, params: &PriceParams) -> Result<Vec<Self>, Error> {
        let sql = format!("SELECT * FROM {} WHERE 1=1", Self::TABLE);
        debug!("Read paged: {}", &sql);
        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(&sql);
        params.code.append_filter(&mut query_builder, "code");
        params.description.append_filter(&mut query_builder, "description");
        params.base_price.append_filter(&mut query_builder, "base_price");
        params.unit_id.append_filter(&mut query_builder, "unit_id");
        params.price_type.append_filter(&mut query_builder, "price_type");
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
    pub async fn create(pg_pool: &PgPool, item: NewPrice) -> Result<Self, Error> {
        let sql = format!("{} RETURNING *", Self::INSERT_QUERY);
        debug!("Create: {}", &sql);
        sqlx::query_as::<_, Self>(&sql)
        .bind(item.version_id)
        .bind(item.code)
        .bind(item.description)
        .bind(item.base_price)
        .bind(item.unit_id)
        .bind(item.price_type)
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
        .bind(item.version_id)
        .bind(item.code)
        .bind(item.description)
        .bind(item.base_price)
        .bind(item.unit_id)
        .bind(item.price_type)
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
