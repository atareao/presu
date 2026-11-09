mod common;
use axum::{
    body::{Body, to_bytes},
    http::{Request, StatusCode},
};
use backend::http::health;
use backend::models::{ApiResponse, AppState, Data};
use std::sync::Arc;
use tower::ServiceExt;

#[tokio::test]
async fn test_check_health() {
    let _ = &common::TRACING;
    let pool = common::setup_pool().await;
    let app_state = Arc::new(AppState {
        pool,
        secret: "secret".to_string(),
        static_dir: "".to_string(),
    });

    let app = health::router().with_state(app_state);

    let response = app
        .oneshot(Request::builder().uri("/").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let api_response: ApiResponse = serde_json::from_slice(&body).unwrap();

    assert_eq!(api_response.status, StatusCode::OK.as_u16());
    assert_eq!(api_response.message, "Up and running");
    assert!(matches!(api_response.data, Data::None));
}
