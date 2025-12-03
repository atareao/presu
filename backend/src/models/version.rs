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

use sqlx::{PgPool, Result};
// Importa el struct Version y UtcTimestamp
// use super::{Version, UtcTimestamp}; 

// --- DTO para Creación (Sencillo, solo necesita el nombre) ---
// El creator_id se pasa como argumento de función.

// --- 1. CREATE (C) ---
/// Crea una nueva versión de catálogo. 
/// Requiere el 'creator_id' del usuario autenticado para los campos de auditoría.
pub async fn create_version(pool: &PgPool, name: String, creator_id: i32) -> Result<Version> {
    sqlx::query_as!(
        Version,
        r#"
        INSERT INTO versions (name, created_by, updated_by)
        VALUES ($1, $2, $2)
        RETURNING *
        "#,
        name,
        creator_id, // $2 se usa para created_by y updated_by iniciales
    )
    .fetch_one(pool)
    .await
}

// --- 2. READ (R) ---

/// Obtiene una versión de catálogo por su ID.
pub async fn get_version_by_id(pool: &PgPool, id: i32) -> Result<Version> {
    sqlx::query_as!(
        Version,
        r#"
        SELECT *
        FROM versions
        WHERE id = $1
        "#,
        id
    )
    .fetch_one(pool)
    .await
}

/// Obtiene todas las versiones de catálogo.
pub async fn get_all_versions(pool: &PgPool) -> Result<Vec<Version>> {
    sqlx::query_as!(
        Version,
        r#"
        SELECT *
        FROM versions
        ORDER BY name
        "#
    )
    .fetch_all(pool)
    .await
}

// --- 3. UPDATE (U) ---
/// Actualiza el nombre de una versión existente.
/// Requiere el 'updater_id' del usuario que realiza el cambio.
pub async fn update_version(pool: &PgPool, id: i32, new_name: String, updater_id: i32) -> Result<Version> {
    // El campo 'updated_at' se actualiza automáticamente por el trigger de PostgreSQL.
    sqlx::query_as!(
        Version,
        r#"
        UPDATE versions
        SET 
            name = $1,
            updated_by = $2
        WHERE id = $3
        RETURNING *
        "#,
        new_name,
        updater_id, // $2
        id, // $3
    )
    .fetch_one(pool)
    .await
}

// --- 4. DELETE (D) ---
/// Elimina una versión por su ID.
/// Retorna la cantidad de filas afectadas. Fallará si hay claves foráneas referenciando esta versión.
pub async fn delete_version(pool: &PgPool, id: i32) -> Result<Version> {
    sqlx::query_as!(
        Version,
        r#"
        DELETE FROM versions
        WHERE id = $1
        RETURNING *
        "#,
        id
    )
    .fetch_one(pool)
    .await
}
