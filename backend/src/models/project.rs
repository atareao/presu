use sqlx::{
    PgPool,
    Result,
    FromRow
};
use serde::{Serialize, Deserialize};
use super::UtcTimestamp;

// Asumiendo la estructura del modelo principal Project
#[derive(Debug, FromRow, Serialize)]
pub struct Project {
    pub id: i32,
    pub code: String,           // ¡Nuevo!
    pub title: String,          // ¡Nuevo!
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}

// DTO para la creación de un nuevo proyecto
#[derive(Debug, Deserialize)]
pub struct ProjectCreateDTO {
    pub code: String,           // Requerido
    pub title: String,          // Requerido
}

// DTO para la actualización (todos opcionales)
#[derive(Debug, Deserialize)]
pub struct ProjectUpdateDTO {
    pub code: Option<String>,
    pub title: Option<String>,
}

pub async fn create_project(pool: &PgPool, data: ProjectCreateDTO, creator_id: i32) -> Result<Project> {
    sqlx::query_as!(
        Project,
        r#"
        INSERT INTO projects (code, title, created_by, updated_by)
        VALUES ($1, $2, $3, $3)
        RETURNING *
        "#,
        data.code,          // $1
        data.title,         // $2
        creator_id,         // $3 para created_by y updated_by
    )
    .fetch_one(pool)
    .await
}

pub async fn get_project_by_id(pool: &PgPool, id: i32) -> Result<Project> {
    sqlx::query_as!(
        Project,
        "SELECT * FROM projects WHERE id = $1",
        id
    )
    .fetch_one(pool)
    .await
}

pub async fn get_all_projects(pool: &PgPool) -> Result<Vec<Project>> {
    sqlx::query_as!(
        Project,
        "SELECT * FROM projects ORDER BY code",
    )
    .fetch_all(pool)
    .await
}

pub async fn update_project(pool: &PgPool, id: i32, data: ProjectUpdateDTO, updater_id: i32) -> Result<Project> {
    sqlx::query_as!(
        Project,
        r#"
        UPDATE projects
        SET 
            code = COALESCE($1, code),
            title = COALESCE($2, title),
            updated_by = $3
        WHERE id = $4
        RETURNING *
        "#,
        data.code,          // $1
        data.title,         // $2
        updater_id,         // $4
        id,                 // $5
    )
    .fetch_one(pool)
    .await
}

pub async fn delete_project(pool: &PgPool, id: i32) -> Result<Project> {
    sqlx::query_as!(
        Project,
        r#"
        DELETE FROM projects
        WHERE id = $1
        RETURNING *
        "#,
        id
    )
    .fetch_one(pool)
    .await
}
