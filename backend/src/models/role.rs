use sqlx::{
    FromRow,
    PgPool,
    Result
};
use serde::{Serialize, Deserialize};

/// Representa una fila en la tabla 'roles'
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Role {
    pub id: i32,
    pub name: String, // Contendrá valores como "SYSTEM_ADMIN", "PROJECT_MANAGER", etc.
}
pub async fn create_role(pool: &PgPool, name: String) -> Result<Role> {
    sqlx::query_as!(
        Role,
        r#"
        INSERT INTO roles (name)
        VALUES ($1)
        RETURNING id, name
        "#,
        name
    )
    .fetch_one(pool)
    .await
}

pub async fn get_role_by_id(pool: &PgPool, id: i32) -> Result<Role> {
    sqlx::query_as!(
        Role,
        r#"
        SELECT id, name
        FROM roles
        WHERE id = $1
        "#,
        id
    )
    .fetch_one(pool)
    .await
}

pub async fn get_all_roles(pool: &PgPool) -> Result<Vec<Role>> {
    sqlx::query_as!(
        Role,
        r#"
        SELECT id, name
        FROM roles
        ORDER BY id
        "#
    )
    .fetch_all(pool)
    .await
}

pub async fn update_role(pool: &PgPool, id: i32, new_name: String) -> Result<Role> {
    sqlx::query_as!(
        Role,
        r#"
        UPDATE roles
        SET name = $1
        WHERE id = $2
        RETURNING id, name
        "#,
        new_name,
        id
    )
    .fetch_one(pool)
    .await
}

pub async fn delete_role(pool: &PgPool, id: i32) -> Result<Role> {
    sqlx::query_as!(
        Role,
        r#"
        DELETE FROM roles
        WHERE id = $1
        RETURNING *
        "#,
        id
    )
    .execute(pool)
    .await
}
