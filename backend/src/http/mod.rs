use axum::http::StatusCode;
use crate::models::{ApiResponse, Data};

pub mod health;
pub mod auth;
pub mod stats;

pub async fn fallback_404() -> impl axum::response::IntoResponse {
    ApiResponse::create(
        StatusCode::NOT_FOUND,
        "Up and running",
        Data::None
    )
}
