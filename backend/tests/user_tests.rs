use backend::models::{
    user::{User, NewUser, UserParams},
    role::{Role, NewRole},
};
use sqlx::PgPool;
use uuid::Uuid;

#[path = "common.rs"]
mod common;

async fn setup() -> (PgPool, Role) {
    let _ = &common::TRACING;
    let pool = common::setup_pool().await;
    let new_role = NewRole {
        name: format!("R-TEST-{}", Uuid::new_v4()),
    };
    let role = Role::create(&pool, new_role).await.unwrap();
    (pool, role)
}

#[tokio::test]
async fn test_create_user() {
    let (pool, role) = setup().await;
    let username = format!("U-TEST-{}", Uuid::new_v4());
    let email = format!("{}@test.com", username);
    let new_user = NewUser {
        username: username.clone(),
        email: email.clone(),
        hashed_password: "password".to_string(),
        role_id: role.id,
        is_active: true,
    };
    let user = User::create(&pool, new_user).await.unwrap();
    assert_eq!(user.username, username);
    assert_eq!(user.email, email);
    assert_eq!(user.role_id, role.id);
    assert!(user.is_active);
}

#[tokio::test]
async fn test_read_user() {
    let (pool, role) = setup().await;
    let username = format!("U-TEST-{}", Uuid::new_v4());
    let email = format!("{}@test.com", username);
    let new_user = NewUser {
        username: username.clone(),
        email: email.clone(),
        hashed_password: "password".to_string(),
        role_id: role.id,
        is_active: true,
    };
    let user = User::create(&pool, new_user).await.unwrap();
    let read_user = User::read_by_id(&pool, user.id).await.unwrap().unwrap();
    assert_eq!(read_user.id, user.id);
    assert_eq!(read_user.username, username);
    assert_eq!(read_user.email, email);
    assert_eq!(read_user.role_id, role.id);
    assert!(read_user.is_active);
}

#[tokio::test]
async fn test_update_user() {
    let (pool, role) = setup().await;
    let username = format!("U-TEST-{}", Uuid::new_v4());
    let email = format!("{}@test.com", username);
    let new_user = NewUser {
        username: username.clone(),
        email: email.clone(),
        hashed_password: "password".to_string(),
        role_id: role.id,
        is_active: true,
    };
    let mut user = User::create(&pool, new_user).await.unwrap();
    let updated_username = format!("U-TEST-UPDATED-{}", Uuid::new_v4());
    user.username = updated_username.clone();
    let updated_user = User::update(&pool, user).await.unwrap();
    assert_eq!(updated_user.username, updated_username);
}

#[tokio::test]
async fn test_delete_user() {
    let (pool, role) = setup().await;
    let username = format!("U-TEST-{}", Uuid::new_v4());
    let email = format!("{}@test.com", username);
    let new_user = NewUser {
        username: username.clone(),
        email: email.clone(),
        hashed_password: "password".to_string(),
        role_id: role.id,
        is_active: true,
    };
    let user = User::create(&pool, new_user).await.unwrap();
    let deleted_user = User::delete(&pool, user.id).await.unwrap();
    assert_eq!(deleted_user.id, user.id);
    let read_user = User::read_by_id(&pool, user.id).await.unwrap();
    assert!(read_user.is_none());
}

#[tokio::test]
async fn test_list_users() {
    let (pool, role) = setup().await;
    let username1 = format!("U-TEST-{}", Uuid::new_v4());
    let email1 = format!("{}@test.com", username1);
    let new_user1 = NewUser {
        username: username1,
        email: email1,
        hashed_password: "password".to_string(),
        role_id: role.id,
        is_active: true,
    };
    User::create(&pool, new_user1).await.unwrap();

    let username2 = format!("U-TEST-{}", Uuid::new_v4());
    let email2 = format!("{}@test.com", username2);
    let new_user2 = NewUser {
        username: username2,
        email: email2,
        hashed_password: "password".to_string(),
        role_id: role.id,
        is_active: true,
    };
    User::create(&pool, new_user2).await.unwrap();

    let params = UserParams {
        id: None,
        username: None,
        email: None,
        role_id: Some(role.id),
        is_active: Some(true),
        page: None,
        limit: None,
        sort_by: None,
        asc: None,
    };
    let users = User::read_paged(&pool, &params).await.unwrap();
    assert!(users.len() >= 2);
}
