use crate::models::{ApiResponse, Data};
use axum::http::StatusCode;

pub mod auth;
pub mod health;
pub mod stats;

pub async fn fallback_404() -> impl axum::response::IntoResponse {
    ApiResponse::new(StatusCode::NOT_FOUND, "Not found", Data::None)
}
