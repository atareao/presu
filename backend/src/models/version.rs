use sqlx::FromRow;
use serde::{Serialize, Deserialize};

use super::UtcTimestamp;

/// Representa una fila en la tabla 'versions'
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Version {
    pub id: i32,
    pub name: String, // Ejemplo: "2025.Q1"
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}
