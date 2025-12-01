use sqlx::FromRow;
use serde::{Serialize, Deserialize};
use serde_json::Value;

use super::UtcTimestamp;

/// Representa una fila en la tabla 'units'
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Unit {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub base_formula: String, 
    // Mapea el JSONB de parámetros esperados
    pub expected_params_json: Value, 

    // Campos de Auditoría
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}
