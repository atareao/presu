use sqlx::FromRow;
use serde::{Serialize, Deserialize};

use super::UtcTimestamp;

/// Representa una fila en la tabla 'prices'
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Price {
    pub id: i32,
    pub version_id: i32,
    pub code: String,
    pub description: String,
    pub base_price: f64, // NUMERIC(10, 2)
    pub unit_id: i32, 
    
    // Mapeamos el ENUM price_type_enum a String
    pub price_type: String, 

    // Campos de Auditoría
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}
