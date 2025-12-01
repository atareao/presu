use sqlx::FromRow;
use serde::{Serialize, Deserialize};

use super::UtcTimestamp;

/// Representa una fila en la tabla 'users'
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub email: String,
    
    #[serde(skip_serializing)] // No enviar el hash de la contraseña al frontend
    pub hashed_password: String, 
    
    pub role_id: i32, 
    pub is_active: bool,

    // Campos de Auditoría (i32 es el ID del usuario)
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}
