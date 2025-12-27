use std::sync::Arc;
use axum::{
    body::Body,
    http::{header, Request, StatusCode},
};
use backend::models::{
    user::{NewUser, User, UserPass},
    role::{NewRole, Role},
    AppState,
};
use tower::ServiceExt;
use uuid::Uuid;
use sqlx::PgPool;
use backend::http;

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

fn test_app(pool: PgPool) -> axum::Router {
    let app_state = Arc::new(AppState {
        pool,
        secret: "test_secret".to_string(),
        static_dir: "".to_string(),
    });
    http::auth::router().with_state(app_state)
}

#[tokio::test]
async fn test_register() {
    let (pool, role) = setup().await;
    let app = test_app(pool);

    let username = format!("U-TEST-{}", Uuid::new_v4());
    let email = format!("{}@test.com", username);
    let password = "password";

    let new_user = NewUser {
        username: username.clone(),
        email: email.clone(),
        hashed_password: password.to_string(),
        role_id: role.id,
        is_active: true,
    };

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/register")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(serde_json::to_string(&new_user).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::CREATED);
}

#[tokio::test]
async fn test_login() {
    let (pool, role) = setup().await;
    
    let username = format!("U-TEST-{}", Uuid::new_v4());
    let email = format!("{}@test.com", username);
    let password = "password";

    let new_user = NewUser {
        username: username.clone(),
        email: email.clone(),
        hashed_password: bcrypt::hash(password, 4).unwrap(),
        role_id: role.id,
        is_active: true,
    };
    let _ = User::create(&pool, new_user).await.unwrap();

    let app = test_app(pool);
    
    let user_pass = UserPass {
        email: email.clone(),
        password: password.to_string(),
    };

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/login")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(serde_json::to_string(&user_pass).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_logout() {
    let (pool, _) = setup().await;
    let app = test_app(pool);

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/logout")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::SEE_OTHER);
    let set_cookie = response.headers().get(header::SET_COOKIE).unwrap().to_str().unwrap();
    assert!(set_cookie.contains("token=;"));
    assert!(set_cookie.contains("Max-Age=0"));
}
