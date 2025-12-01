use sqlx::FromRow;
use serde::{Serialize, Deserialize};
use serde_json::Value;

use super::UtcTimestamp;

/// Representa una fila en la tabla 'elements' (Capítulos o Líneas)
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Element {
    pub id: i32,
    pub project_id: i32,
    // Option<i32> permite la clave recursiva (NULL para elementos raíz)
    pub parent_id: Option<i32>, 
    
    // El campo de versión añadido
    pub version_id: i32, 
    
    // Mapeamos el ENUM element_enum a String
    pub element_type: String, 
    
    pub budget_code: String,
    pub description: Option<String>,

    // Campos de Auditoría
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}
