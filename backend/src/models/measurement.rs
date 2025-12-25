use serde::{Deserialize, Serialize};
use sqlx::{
    self,
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

// =================================================================
// 1. ESTRUCTURAS DE DATOS (STRUCTS)
// =================================================================
/// Representa una fila en la tabla 'measurements'
#[axum_crud(path = "/measurements", new = "NewMeasurement", params = "MeasurementParams")]
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Measurement {
    pub id: i32,
    // Clave primaria/foránea a elements.id
    pub element_id: i32, 
    pub price_id: i32, 
    // Los parámetros variables de la medición (ej: {"largo": 10.0})
    pub params_json: Value, 
    pub measurement_text: Option<String>,
    pub measured_quantity: f64, // NUMERIC(10, 4)
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
}

// DTO para la creación de una nueva versión de presupuesto
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct NewMeasurement {
    pub element_id: i32, 
    pub price_id: i32, 
    // Los parámetros variables de la medición (ej: {"largo": 10.0})
    pub params_json: Value, 
    pub measurement_text: Option<String>,
    pub measured_quantity: f64, // NUMERIC(10, 4)
}

#[derive(Debug, serde::Deserialize, macros::Paginable)]
pub struct MeasurementParams {
    pub id: Option<i32>,

    pub measurement_text: Option<String>,
    pub measured_quantity: Option<f64>,

    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub sort_by: Option<String>,
    pub asc: Option<bool>,
}

// =================================================================
// 2. MÉTODOS CRUD (ASOCIADOS DIRECTAMENTE AL STRUCT)
// =================================================================

impl Measurement {
    const TABLE: &str = "measurements";
    const INSERT_QUERY: &str = r#"
        (
            element_id,
            price_id,
            params_json,
            measurement_text,
            measured_quantity
        )
        VALUES ($1, $2, $3, $4, $5)
    "#;
    const UPDATE_QUERY: &str = r#"
        element_id = $2,
        price_id = $3,
        params_json = $4,
        measurement_text = $5,
        measured_quantity = $6
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

    pub async fn count_paged(pool: &PgPool, params: &MeasurementParams) -> Result<i64, Error> {
        let sql = format!("SELECT COUNT(*) FROM {} WHERE 1=1", Self::TABLE);
        debug!("Count paged: {}", &sql);
        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(&sql);
        params.measurement_text.append_filter(&mut query_builder, "measurement_text");
        params.measured_quantity.append_filter(&mut query_builder, "measured_quantity");
        query_builder
            .build()
            .map(|row: PgRow| row.get::<i64, _>(0))
            .fetch_one(pool)
            .await
    }

    pub async fn read_paged(pool: &PgPool, params: &MeasurementParams) -> Result<Vec<Self>, Error> {
        let sql = format!("SELECT * FROM {} WHERE 1=1", Self::TABLE);
        debug!("Read paged: {}", &sql);
        let mut query_builder: QueryBuilder<Postgres> = QueryBuilder::new(&sql);
        params.measurement_text.append_filter(&mut query_builder, "measurement_text");
        params.measured_quantity.append_filter(&mut query_builder, "measured_quantity");
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
    pub async fn create(pg_pool: &PgPool, item: NewMeasurement) -> Result<Self, Error> {
        let sql = format!("{} RETURNING *", Self::INSERT_QUERY);
        debug!("Create: {}", &sql);
        sqlx::query_as::<_, Self>(&sql)
        .bind(item.element_id)
        .bind(item.price_id)
        .bind(item.params_json)
        .bind(item.measurement_text)
        .bind(item.measured_quantity)
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
        .bind(item.element_id)
        .bind(item.price_id)
        .bind(item.params_json)
        .bind(item.measurement_text)
        .bind(item.measured_quantity)
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
