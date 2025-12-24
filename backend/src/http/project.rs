use std::sync::Arc;

use axum::{
    Json, Router,
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing,
};
use tracing::{debug, error};

use crate::models::{
    ApiResponse, AppState, CustomResponse, Data, Pagination
};
use crate::models::project::{
    Item,
    NewItem,
    Params,
};

const ROUTE_PATH: &str = "/projects";

// =================================================================
// FUNCIÓN DEL ROUTER
// =================================================================

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", routing::post(create))
        .route("/", routing::patch(update))
        .route("/", routing::get(read))
        .route("/", routing::delete(delete))
}

// =================================================================
// HANDLERS (CRUD)
// =================================================================

/// Crea un nuevo item
pub async fn create(
    State(app_state): State<Arc<AppState>>,
    Json(new_item): Json<NewItem>,
) -> impl IntoResponse {
    debug!("NewItem: {:?}", new_item);

    match Item::create(&app_state.pool, new_item).await {
        Ok(item) => {
            debug!("Item created: {:?}", item);
            ApiResponse::new(
                StatusCode::CREATED,
                "Item created",
                Data::Some(serde_json::to_value(item).unwrap()),
            )
        }
        Err(e) => {
            error!("Error creating Item: {:?}", e);
            ApiResponse::new(
                StatusCode::BAD_REQUEST,
                &format!("Error creating Item: {}", e),
                Data::None,
            )
        }
    }
}

/// Actualiza un item
pub async fn update(
    State(app_state): State<Arc<AppState>>,
    Json(item): Json<Item>, // Asume el struct completo con ID
) -> impl IntoResponse {
    debug!("Update Item: {:?}", item);

    match Item::update(&app_state.pool, item).await {
        Ok(item) => {
            debug!("Item updated: {:?}", item);
            ApiResponse::new(
                StatusCode::OK,
                "Item updated",
                Data::Some(serde_json::to_value(item).unwrap()),
            )
        }
        Err(e) => {
            error!("Error updating Item: {:?}", e);
            ApiResponse::new(
                StatusCode::BAD_REQUEST,
                &format!("Error updating Item: {}", e),
                Data::None,
            )
        }
    }
}

/// Lee todos los items o uno por ID.
pub async fn read(
    State(app_state): State<Arc<AppState>>,
    Query(params): Query<Params>,
) -> impl IntoResponse {
    debug!("Item read params: {:?}", params);

    // 1. Prioridad: Búsqueda por ID
    if let Some(id) = params.id {
        return match Item::read_by_id(&app_state.pool, id).await {
            Ok(Some(item)) => CustomResponse::api(
                StatusCode::OK,
                "Item found",
                Data::Some(serde_json::to_value(item).unwrap()),
            ),
            Ok(None) => CustomResponse::api(
                StatusCode::NOT_FOUND,
                &format!("Item {} not found", id),
                Data::None,
            ),
            Err(e) => CustomResponse::api(StatusCode::BAD_REQUEST, &e.to_string(), Data::None),
        };
    }

    // 2. Intento de lectura paginada
    let records_res = Item::read_paged(&app_state.pool, &params).await;
    let count_res = Item::count_paged(&app_state.pool, &params).await;

    if let (Ok(records), Ok(count)) = (records_res, count_res) {
        let pagination = Pagination::new(&params, count, ROUTE_PATH);

        return CustomResponse::paged(
            StatusCode::OK,
            "results",
            Data::Some(serde_json::to_value(records).unwrap()),
            pagination,
        );
    }

    // 3. Fallback: Leer todos (o error)
    match Item::read_all(&app_state.pool).await {
        Ok(items) => CustomResponse::api(
            StatusCode::OK,
            "Items list",
            Data::Some(serde_json::to_value(items).unwrap()),
        ),
        Err(e) => {
            error!("Error reading Items: {:?}", e);
            CustomResponse::api(
                StatusCode::BAD_REQUEST,
                "Error retrieving items",
                Data::None,
            )
        }
    }
}

/// Borra ua item por ID y devuelve el objeto borrado.
pub async fn delete(
    State(app_state): State<Arc<AppState>>,
    Query(params): Query<Params>,
) -> impl IntoResponse {
    // 1. Guardia: Extraemos el ID o devolvemos error inmediatamente
    let Some(id) = params.id else {
        error!("Error deleting: ID is mandatory");
        return ApiResponse::new(
            StatusCode::BAD_REQUEST,
            "ID is mandatory",
            Data::None,
        );
    };

    // 2. Ejecución: Intentamos borrar
    match Item::delete(&app_state.pool, id).await {
        Ok(item) => {
            debug!("Item deleted: {:?}", item);
            ApiResponse::new(
                StatusCode::OK,
                "Item deleted",
                Data::Some(serde_json::to_value(item).unwrap()),
            )
        }
        Err(e) => {
            error!("Error deleting item {}: {:?}", id, e);
            ApiResponse::new(
                StatusCode::BAD_REQUEST,
                &format!("Error deleting item: {}", e),
                Data::None,
            )
        }
    }
}

