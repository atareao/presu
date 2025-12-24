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
#[sqlx(type_name = "calculation_mode_enum", rename_all = "lowercase")]
pub enum CalculationMode {
    #[serde(rename = "fixed")]
    Fixed,
    #[serde(rename = "formula")]
    Formula,
}


/// Representa una fila en la tabla 'decompositions'
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Decomposition {
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
    pub created_by: i32, 
    pub updated_by: i32, 
}
