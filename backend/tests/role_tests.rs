use backend::models::{Role, NewRole, RoleParams};
use sqlx::PgPool;
use uuid::Uuid;

#[path = "common.rs"]
mod common;

async fn setup() -> PgPool {
    let _ = &common::TRACING;
    let pool = common::setup_pool().await;
    pool
}

#[tokio::test]
async fn test_create_role() {
    let pool = setup().await;
    let new_role = NewRole {
        name: format!("Test Role-{}", Uuid::new_v4()),
    };
    let role = Role::create(&pool, new_role).await.unwrap();
    assert!(role.name.starts_with("Test Role-"));
}

#[tokio::test]
async fn test_read_role() {
    let pool = setup().await;
    let name = format!("Test Role 2-{}", Uuid::new_v4());
    let new_role = NewRole {
        name: name.clone(),
    };
    let role = Role::create(&pool, new_role).await.unwrap();
    let read_role = Role::read_by_id(&pool, role.id).await.unwrap().unwrap();
    assert_eq!(read_role.id, role.id);
    assert_eq!(read_role.name, name);
}

#[tokio::test]
async fn test_update_role() {
    let pool = setup().await;
    let name = format!("Test Role 3-{}", Uuid::new_v4());
    let new_role = NewRole {
        name: name.clone(),
    };
    let mut role = Role::create(&pool, new_role).await.unwrap();
    let updated_name = format!("Updated Role-{}", Uuid::new_v4());
    role.name = updated_name.clone();
    let updated_role = Role::update(&pool, role).await.unwrap();
    assert_eq!(updated_role.name, updated_name);
}

#[tokio::test]
async fn test_delete_role() {
    let pool = setup().await;
    let name = format!("Test Role 4-{}", Uuid::new_v4());
    let new_role = NewRole {
        name: name.clone(),
    };
    let role = Role::create(&pool, new_role).await.unwrap();
    let deleted_role = Role::delete(&pool, role.id).await.unwrap();
    assert_eq!(deleted_role.id, role.id);
    let read_role = Role::read_by_id(&pool, role.id).await.unwrap();
    assert!(read_role.is_none());
}

#[tokio::test]
async fn test_list_roles() {
    let pool = setup().await;
    let name1 = format!("Test Role 5-{}", Uuid::new_v4());
    let new_role = NewRole {
        name: name1.clone(),
    };
    Role::create(&pool, new_role).await.unwrap();
    let name2 = format!("Test Role 6-{}", Uuid::new_v4());
    let new_role = NewRole {
        name: name2.clone(),
    };
    Role::create(&pool, new_role).await.unwrap();
    let params = RoleParams {
        id: None,
        name: None,
        page: None,
        limit: None,
        sort_by: None,
        asc: None,
    };
    let roles = Role::read_paged(&pool, &params).await.unwrap();
    assert!(roles.len() >= 2);
}
