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
use serde_json::Value;
use macros::axum_crud;
use std::fmt;

// =================================================================
// 1. ESTRUCTURAS DE DATOS (STRUCTS)
// =================================================================

#[derive(Debug, Type, Serialize, Deserialize, Clone, Copy)]
#[sqlx(type_name = "calculation_mode_enum", rename_all = "lowercase")]
pub enum CalculationMode {
    #[serde(rename = "fixed")]
    Fixed,
    #[serde(rename = "formula")]
    Formula,
}

impl fmt::Display for CalculationMode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Fixed => "fixed",
            Self::Formula => "formula",
        };
        write!(f, "{}", s)
    }
}

impl Filterable for Option<CalculationMode> {
    fn append_filter(&self, builder: &mut QueryBuilder<Postgres>, column: &str) {
        if let Some(val) = self {
            builder.push(format!(" AND {} LIKE ", column));
            builder.push_bind(format!("%{}%", val));
        }
    }
}

#[axum_crud(path = "/descompositions", new = "NewDescomposition", params = "DescompositionParams")]
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Descomposition {
    pub id: i32,
    pub parent_price_id: i32, 
    pub component_price_id: i32, 
    pub calculation_mode: CalculationMode,
    // Cantidad fija (NULL si calculation_mode es 'formula')
    pub fixed_quantity: Option<f64>, 
    // Parámetros JSON (NULL si calculation_mode es 'fixed')
    pub params_json: Option<Value>, 
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
}


#[derive(Debug, Serialize, Deserialize)]
pub struct NewDescomposition {
    pub parent_price_id: i32, 
    pub component_price_id: i32, 
    pub calculation_mode: CalculationMode,
    // Cantidad fija (NULL si calculation_mode es 'formula')
    pub fixed_quantity: Option<f64>, 
    // Parámetros JSON (NULL si calculation_mode es 'fixed')
    pub params_json: Option<Value>, 
}

#[derive(Debug, serde::Deserialize, macros::Paginable)]
pub struct DescompositionParams {
    pub id: Option<i32>,

    pub parent_price_id: Option<i32>,
    pub component_price_id: Option<i32>,
    pub calculation_mode: Option<CalculationMode>,

    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub sort_by: Option<String>,
    pub asc: Option<bool>,
}

// =================================================================
// 2. MÉTODOS CRUD (ASOCIADOS DIRECTAMENTE AL STRUCT)
// =================================================================

impl Descomposition {
    const TABLE: &str = "descompositions";
    const INSERT_QUERY: &str = r#"
        (
            parent_price_id, 
            component_price_id, 
            calculation_mode,
            fixed_quantity, 
            params_json, 
        )
        VALUES ($1, $2, $3, $4, $5)
    "#;
    const UPDATE_QUERY: &str = r#"
        parent_price_id = $2, 
        component_price_id = $3, 
        calculation_mode = $4,
        fixed_quantity = $5, 
        params_json = $6, 
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

    pub async fn count_paged(pool: &PgPool, params: &DescompositionParams) -> Result<i64, Error> {
        let sql = format!("SELECT COUNT(*) FROM {} WHERE 1=1", Self::TABLE);
        debug!("Count paged: {}", &sql);
        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(&sql);
        params.parent_price_id.append_filter(&mut query_builder, "parent_price_id");
        params.component_price_id.append_filter(&mut query_builder, "component_price_id");
        params.calculation_mode.append_filter(&mut query_builder, "calculation_mode");
        query_builder
            .build()
            .map(|row: PgRow| row.get::<i64, _>(0))
            .fetch_one(pool)
            .await
    }

    pub async fn read_paged(pool: &PgPool, params: &DescompositionParams) -> Result<Vec<Self>, Error> {
        let sql = format!("SELECT * FROM {} WHERE 1=1", Self::TABLE);
        debug!("Read paged: {}", &sql);
        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(&sql);
        params.parent_price_id.append_filter(&mut query_builder, "parent_price_id");
        params.component_price_id.append_filter(&mut query_builder, "component_price_id");
        params.calculation_mode.append_filter(&mut query_builder, "calculation_mode");
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
    pub async fn create(pg_pool: &PgPool, item: NewDescomposition) -> Result<Self, Error> {
        let sql = format!("{} RETURNING *", Self::INSERT_QUERY);
        debug!("Create: {}", &sql);
        sqlx::query_as::<_, Self>(&sql)
        .bind(item.parent_price_id)
        .bind(item.component_price_id)
        .bind(item.calculation_mode)
        .bind(item.fixed_quantity)
        .bind(item.params_json)
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
        .bind(item.parent_price_id)
        .bind(item.component_price_id)
        .bind(item.calculation_mode)
        .bind(item.fixed_quantity)
        .bind(item.params_json)
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

