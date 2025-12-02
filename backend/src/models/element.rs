use sqlx::{
    FromRow,
    Type
};
use serde::{Serialize, Deserialize};

use super::UtcTimestamp;

#[derive(Debug, Type, Serialize, Deserialize, Clone, Copy)]
#[sqlx(type_name = "element_enum", rename_all = "lowercase")]
pub enum ElementType {
    #[serde(rename = "chapter")]
    Chapter,
    #[serde(rename = "line")]
    Line,
}

#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Element {
    pub id: i32,
    pub project_id: i32,
    // Option<i32> permite la clave recursiva (NULL para elementos raíz)
    pub parent_id: Option<i32>, 
    pub version_id: i32, 
    // Mapeamos el ENUM element_enum a String
    pub element_type: ElementType, 
    pub budget_code: String,
    pub description: Option<String>,
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}
