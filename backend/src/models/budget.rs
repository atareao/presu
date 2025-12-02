use sqlx::{
    FromRow,
    Type,
};
use serde::{Serialize, Deserialize};

use super::UtcTimestamp;

#[derive(Debug, Type, Serialize, Deserialize, Clone, Copy)]
#[sqlx(type_name = "budget_status_enum", rename_all = "lowercase")] // Nombre del ENUM en PostgreSQL
pub enum BudgetStatus {
    #[serde(rename = "draft")]
    Draft,
    #[serde(rename = "submitted")]
    Submitted,
    #[serde(rename = "approved")]
    Approved,
    #[serde(rename = "rejected")]
    Rejected,
    #[serde(rename = "archived")]
    Archived,
}

/// Representa una fila en la tabla 'budget_versions'
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Budget {
    pub id: i32,
    pub project_id: i32, 
    pub version_number: i32, 
    pub name: String,
    pub status: BudgetStatus,
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}

