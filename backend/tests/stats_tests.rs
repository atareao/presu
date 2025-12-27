
use std::sync::Arc;
use axum::{
    body::{self, Body},
    http::{Request, StatusCode},
};
use backend::models::{
    user::{NewUser, User},
    role::{NewRole, Role},
    project::{NewProject, Project},
    budget::{NewBudget, Budget},
    AppState,
};
use serde_json::Value;
use tower::ServiceExt;
use uuid::Uuid;
use sqlx::PgPool;
use backend::http;

#[path = "common.rs"]
mod common;

async fn setup() -> (PgPool, Role, User, Project) {
    let _ = &common::TRACING;
    let pool = common::setup_pool().await;
    let new_role = NewRole {
        name: format!("R-TEST-{}", Uuid::new_v4()),
    };
    let role = Role::create(&pool, new_role).await.unwrap();
    let username = format!("U-TEST-{}", Uuid::new_v4());
    let email = format!("{}@test.com", username);
    let new_user = NewUser {
        username,
        email,
        hashed_password: "password".to_string(),
        role_id: role.id,
        is_active: true,
    };
    let user = User::create(&pool, new_user).await.unwrap();
    let new_project = NewProject {
        code: format!("P-TEST-{}", Uuid::new_v4()),
        title: Some("description".to_string()),
    };
    let project = Project::create(&pool, new_project).await.unwrap();
    (pool, role, user, project)
}

fn test_app(pool: PgPool) -> axum::Router {
    let app_state = Arc::new(AppState {
        pool,
        secret: "test_secret".to_string(),
        static_dir: "".to_string(),
    });
    http::stats::router().with_state(app_state)
}

#[tokio::test]
async fn test_count_projects() {
    let (pool, _, _, _) = setup().await;
    let app = test_app(pool);

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/projects")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = body::to_bytes(response.into_body(), 1024 * 1024).await.unwrap();
    let body: Value = serde_json::from_slice(&body).unwrap();
    assert!(body["data"].as_i64().unwrap() >= 1);
}

#[tokio::test]
async fn test_count_budgets() {
    let (pool, _, _, project) = setup().await;
    let new_budget = NewBudget {
        name: format!("B-TEST-{}", Uuid::new_v4()),
        project_id: project.id,
        code: format!("C-TEST-{}", Uuid::new_v4()),
        version_number: 1,
        status: backend::models::budget::BudgetStatus::Draft,
    };
    let _ = Budget::create(&pool, new_budget).await.unwrap();

    let app = test_app(pool);

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/budgets")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = body::to_bytes(response.into_body(), 1024 * 1024).await.unwrap();
    let body: Value = serde_json::from_slice(&body).unwrap();
    assert!(body["data"].as_i64().unwrap() >= 1);
}

#[tokio::test]
async fn test_count_users() {
    let (pool, _, _, _) = setup().await;
    let app = test_app(pool);

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/users")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = body::to_bytes(response.into_body(), 1024 * 1024).await.unwrap();
    let body: Value = serde_json::from_slice(&body).unwrap();
    assert!(body["data"].as_i64().unwrap() >= 1);
}
