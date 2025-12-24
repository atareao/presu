use sqlx::{
    FromRow,
    PgPool,
    Result
};
use serde::{Serialize, Deserialize};

use super::UtcTimestamp;

// DTO para la creación de un nuevo usuario
// Nota: La contraseña ya debe venir hasheada desde el servicio de autenticación.
#[derive(Debug, Deserialize)]
pub struct UserCreateDTO {
    pub username: String,
    pub email: String,
    pub hashed_password: String, // Contraseña ya hasheada
    pub role_id: i32,
    pub is_active: bool,
}

// DTO para la actualización de datos del usuario (la contraseña se maneja aparte)
#[derive(Debug, Deserialize)]
pub struct UserUpdateDTO {
    // Option<T> permite actualizaciones parciales (PATCH)
    pub username: Option<String>,
    pub email: Option<String>,
    pub role_id: Option<i32>,
    pub is_active: Option<bool>,
}

/// Representa una fila en la tabla 'users'
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct UserRead {
    pub id: i32,
    pub username: String,
    pub email: String,
    #[serde(skip_serializing)] // No enviar el hash de la contraseña al frontend
    pub hashed_password: String, 
    pub role_id: i32, 
    pub is_active: Option<bool>,
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}
/// Crea un nuevo usuario. El 'creator_id' es el ID del usuario autenticado que realiza la acción.
pub async fn create_user(pool: &PgPool, data: UserCreateDTO, creator_id: i32) -> Result<UserRead> {
    // Los campos created_by y updated_by deben ser el ID del creador al inicio.
    sqlx::query_as!(
        UserRead,
        r#"
        INSERT INTO users (username, email, hashed_password, role_id, is_active, created_by, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $6)
        RETURNING *
        "#,
        data.username,
        data.email,
        data.hashed_password,
        data.role_id,
        data.is_active,
        creator_id, // $6 para created_by y updated_by
    )
    .fetch_one(pool)
    .await
}
/// Obtiene un usuario por ID.
pub async fn get_user_by_id(pool: &PgPool, id: i32) -> Result<UserRead> {
    sqlx::query_as!(
        UserRead,
        r#"
        SELECT * FROM users WHERE id = $1
        "#,
        id
    )
    .fetch_one(pool)
    .await
}

/// Obtiene todos los usuarios.
pub async fn get_all_users(pool: &PgPool) -> Result<Vec<UserRead>> {
    sqlx::query_as!(
        UserRead,
        r#"
        SELECT * FROM users ORDER BY id
        "#,
    )
    .fetch_all(pool)
    .await
}

/// Actualiza los datos de un usuario (no la contraseña).
pub async fn update_user(pool: &PgPool, user_id: i32, data: UserUpdateDTO, updater_id: i32) -> Result<UserRead> {
    // Utilizamos el trigger set_updated_at_users para actualizar updated_at
    sqlx::query_as!(
        UserRead,
        r#"
        UPDATE users
        SET 
            username = COALESCE($1, username),
            email = COALESCE($2, email),
            role_id = COALESCE($3, role_id),
            is_active = COALESCE($4, is_active),
            updated_by = $5
        WHERE id = $6
        RETURNING *
        "#,
        data.username,
        data.email,
        data.role_id,
        data.is_active,
        updater_id, // $5
        user_id, // $6
    )
    .fetch_one(pool)
    .await
}

/// Elimina un usuario por su ID. Retorna el número de filas afectadas.
pub async fn delete_user(pool: &PgPool, id: i32) -> Result<UserRead> {
    sqlx::query_as!(
        UserRead,
        r#"
        DELETE FROM users
        WHERE id = $1
        RETURNING *
        "#,
        id
    )
    .fetch_one(pool)
    .await
}
