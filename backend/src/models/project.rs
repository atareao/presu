use sqlx::FromRow;
use serde::{Serialize, Deserialize};

use super::UtcTimestamp;

/// Representa una fila en la tabla 'projects'
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Project {
    pub id: i32,
    pub name: String,
    // Versión de precios de referencia para el proyecto
    pub base_version_id: i32, 
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}
