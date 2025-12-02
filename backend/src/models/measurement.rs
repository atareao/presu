use sqlx::FromRow;
use serde::{Serialize, Deserialize};

use super::UtcTimestamp;
use serde_json::Value;

/// Representa una fila en la tabla 'measurements'
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Measurement {
    // Clave primaria/foránea a elements.id
    pub element_id: i32, 
    pub price_id: i32, 
    // Los parámetros variables de la medición (ej: {"largo": 10.0})
    pub params_json: Value, 
    pub measurement_text: Option<String>,
    pub measured_quantity: f64, // NUMERIC(10, 4)
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}
