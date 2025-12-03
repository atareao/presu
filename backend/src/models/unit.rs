use sqlx::{
    FromRow,
    PgPool,
    Result
};
use serde::{Serialize, Deserialize};
use serde_json::Value;

use super::UtcTimestamp;

/// Representa una fila en la tabla 'units'
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Unit {
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub base_formula: String, 
    // Mapea el JSONB de parámetros esperados
    pub expected_params_json: Value, 
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}

// DTO para la creación de una nueva unidad
#[derive(Debug, Deserialize)]
pub struct UnitCreateDTO {
    pub name: String,
    pub description: Option<String>,
    pub base_formula: String,
    pub expected_params_json: Value,
}

// --- 1. CREATE (C) ---
/// Crea una nueva unidad de medida. 
/// Requiere el 'creator_id' del usuario autenticado para la auditoría.
pub async fn create_unit(pool: &PgPool, data: UnitCreateDTO, creator_id: i32) -> Result<Unit> {
    sqlx::query_as!(
        Unit,
        r#"
        INSERT INTO units (name, description, base_formula, expected_params_json, created_by, updated_by)
        VALUES ($1, $2, $3, $4, $5, $5)
        RETURNING *
        "#,
        data.name,
        data.description,
        data.base_formula,
        // SQLx maneja correctamente la conversión de serde_json::Value a JSONB
        data.expected_params_json as _, 
        creator_id, // $5 para created_by y updated_by
    )
    .fetch_one(pool)
    .await
}

// --- 2. READ (R) ---

/// Obtiene una unidad por su ID.
pub async fn get_unit_by_id(pool: &PgPool, id: i32) -> Result<Unit> {
    sqlx::query_as!(
        Unit,
        r#"
        SELECT *
        FROM units
        WHERE id = $1
        "#,
        id
    )
    .fetch_one(pool)
    .await
}

/// Obtiene todas las unidades.
pub async fn get_all_units(pool: &PgPool) -> Result<Vec<Unit>> {
    sqlx::query_as!(
        Unit,
        r#"
        SELECT *
        FROM units
        ORDER BY name
        "#
    )
    .fetch_all(pool)
    .await
}

// --- 3. UPDATE (U) ---

// DTO para la actualización, usando Option<T> para actualizaciones parciales
#[derive(Debug, Deserialize)]
pub struct UnitUpdateDTO {
    pub name: Option<String>,
    pub description: Option<String>,
    pub base_formula: Option<String>,
    pub expected_params_json: Option<Value>,
}

/// Actualiza los datos de una unidad existente.
/// Requiere el 'updater_id' del usuario que realiza el cambio.
pub async fn update_unit(pool: &PgPool, id: i32, data: UnitUpdateDTO, updater_id: i32) -> Result<Unit> {
    // Usamos COALESCE para actualizar solo los campos provistos (no nulos)
    sqlx::query_as!(
        Unit,
        r#"
        UPDATE units
        SET 
            name = COALESCE($1, name),
            description = $2, -- Note: description es Option<String> en la DB, si $2 es NULL, se setea a NULL
            base_formula = COALESCE($3, base_formula),
            expected_params_json = COALESCE($4, expected_params_json),
            updated_by = $5
        WHERE id = $6
        RETURNING *
        "#,
        data.name,
        // Si data.description es None, SQLx pasará NULL, lo cual está bien para un campo Option
        data.description, 
        data.base_formula,
        data.expected_params_json as _, // Conversión para JSONB
        updater_id, // $5
        id, // $6
    )
    .fetch_one(pool)
    .await
}

// --- 4. DELETE (D) ---
/// Elimina una unidad por su ID.
/// Retorna la cantidad de filas afectadas. Fallará si hay precios ('prices') referenciando esta unidad.
pub async fn delete_unit(pool: &PgPool, id: i32) -> Result<Unit> {
    sqlx::query_as!(
        Unit,
        r#"
        DELETE FROM units
        WHERE id = $1
        RETURNING *
        "#,
        id
    )
    .fetch_one(pool)
    .await
}
