use sqlx::{
    PgPool,
    FromRow,
    Type,
    Result,
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

/// Estructura del modelo de dominio para la tabla 'budgets'
#[derive(Debug, FromRow, Serialize)]
pub struct Budget {
    pub id: i32,
    pub project_id: i32,
    pub code: String,
    pub version_number: i32,
    pub name: String,
    pub status: BudgetStatus, // Mapeado al enum nativo de Rust
    // Campos de Auditoría
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}

// DTO para la creación de una nueva versión de presupuesto
#[derive(Debug, Deserialize)]
pub struct BudgetCreateDTO {
    // project_id se pasa como argumento para asegurar pertenencia
    pub code: String,           
    pub version_number: i32,
    pub name: String,
    pub status: BudgetStatus, // Usamos el enum de Rust en el DTO
}

// DTO para la actualización (todos opcionales, excepto 'code' que es único)
#[derive(Debug, Deserialize)]
pub struct BudgetUpdateDTO {
    pub code: Option<String>,
    pub name: Option<String>,
    pub status: Option<BudgetStatus>,
    // version_number y project_id generalmente no se cambian después de la creación
}

/// Crea una nueva versión de presupuesto para un proyecto.
pub async fn create_budget(pool: &PgPool, project_id: i32, data: BudgetCreateDTO, creator_id: i32) -> Result<Budget> {
    sqlx::query_as!(
        Budget,
        r#"
        INSERT INTO budgets (project_id, code, version_number, name, status, created_by, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $6)
        RETURNING id, project_id, code, version_number, name, status as "status: BudgetStatus", 
                  created_at, updated_at, created_by, updated_by
        "#,
        project_id,         // $1
        data.code,          // $2
        data.version_number, // $3
        data.name,          // $4
        data.status as BudgetStatus, // $5 (Mapeo a ENUM)
        creator_id,         // $6
    )
    .fetch_one(pool)
    .await
}

/// Obtiene una versión de presupuesto por su ID.
pub async fn get_budget_by_id(pool: &PgPool, id: i32) -> Result<Budget> {
    sqlx::query_as!(
        Budget,
        "SELECT id, project_id, code, version_number, name, status as \"status: BudgetStatus\", created_at, updated_at, created_by, updated_by FROM budgets WHERE id = $1",
        id
    )
    .fetch_one(pool)
    .await
}

/// Obtiene todas las versiones de presupuesto para un proyecto específico.
pub async fn get_budgets_by_project(pool: &PgPool, project_id: i32) -> Result<Vec<Budget>> {
    sqlx::query_as!(
        Budget,
        "SELECT id, project_id, code, version_number, name, status as \"status: BudgetStatus\", created_at, updated_at, created_by, updated_by FROM budgets WHERE id = $1",
        project_id
    )
    .fetch_all(pool)
    .await
}

pub async fn update_budget(pool: &PgPool, id: i32, data: BudgetUpdateDTO, updater_id: i32) -> Result<Budget> {
    sqlx::query_as!(
        Budget,
        r#"
        UPDATE budgets
        SET 
            code = COALESCE($1, code),
            name = COALESCE($2, name),
            status = COALESCE($3, status),
            updated_by = $4
        WHERE id = $5
        RETURNING id, project_id, code, version_number, name, status as "status: BudgetStatus", 
                  created_at, updated_at, created_by, updated_by
        "#,
        data.code as _, // $1
        data.name, // $2
        data.status as Option<BudgetStatus>, // $3 (Manejo de Option<ENUM>)
        updater_id, // $4
        id, // $5
    )
    .fetch_one(pool)
    .await
}

/// Elimina una versión de presupuesto por su ID.
/// NOTA: Fallará si existen 'elements' referenciando este presupuesto.
pub async fn delete_budget(pool: &PgPool, id: i32) -> Result<Budget> {
    sqlx::query_as!(
        Budget,
        r#"
        DELETE FROM budgets
        WHERE id = $1
        RETURNING id, project_id, code, version_number, name, status as "status: BudgetStatus", 
                  created_at, updated_at, created_by, updated_by
        "#,
        id
    )
    .fetch_one(pool)
    .await
}
