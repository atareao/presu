use axum::{
    extract::State,
    routing,
    Router,
    response::IntoResponse,
    http::StatusCode,
};
use crate::models::{Data, ApiResponse, AppState, Project, Budget};
use std::sync::Arc;
use tracing::{debug, error};


pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/projects", routing::get(count_projects))
        .route("/budgets", routing::get(count_budgets))
}

async fn count_projects(
    State(app_state): State<Arc<AppState>>,
) -> impl IntoResponse {
    debug!("Counting projects");
    match Project::count_all(&app_state.pool).await {
        Ok(count) => ApiResponse::create(
            StatusCode::OK,
            "Projects counted successfully",
            Data::Some(serde_json::to_value(count).unwrap()),
        ),
        Err(e) => {
            error!("Error counting projects: {}", e);
            ApiResponse::create(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error counting projects",
                Data::None,
            )
        }
    }
}
async fn count_budgets(
    State(app_state): State<Arc<AppState>>,
) -> impl IntoResponse {
    debug!("Counting budgets");
    match Budget::count_all(&app_state.pool).await {
        Ok(count) => ApiResponse::create(
            StatusCode::OK,
            "Budgets counted successfully",
            Data::Some(serde_json::to_value(count).unwrap()),
        ),
        Err(e) => {
            error!("Error counting budgets: {}", e);
            ApiResponse::create(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Error counting budgets",
                Data::None,
            )
        }
    }
}


