use sqlx::FromRow;
use serde::{Serialize, Deserialize};

/// Representa una fila en la tabla 'roles'
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Role {
    pub id: i32,
    pub name: String, // Contendrá valores como "SYSTEM_ADMIN", "PROJECT_MANAGER", etc.
}
