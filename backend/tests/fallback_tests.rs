mod common;
use axum::{
    body::{to_bytes, Body},
    http::{Request, StatusCode},
    Router,
    routing::get,
};
use tower::ServiceExt;
use std::sync::Arc;
use backend::models::{AppState, ApiResponse};
use backend::http::fallback_404;

#[tokio::test]
async fn test_fallback_404() {
    let pool = common::setup_pool().await;
    let app_state = Arc::new(AppState {
        pool,
        secret: "secret".to_string(),
        static_dir: "".to_string(),
    });

    let app = Router::new()
        .route("/test", get(|| async {}))
        .fallback(fallback_404)
        .with_state(app_state);

    let response = app
        .oneshot(Request::builder().uri("/non-existent-route").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);

    let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let api_response: ApiResponse = serde_json::from_slice(&body).unwrap();

    assert_eq!(api_response.status, StatusCode::NOT_FOUND.as_u16());
    assert_eq!(api_response.message, "Not found");
}
