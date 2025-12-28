use std::sync::Arc;

use axum::{
    body,
    extract::{
        State,
        Path,
    },
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    routing, Json, Router,
};
use bcrypt::verify;
use tracing::{debug, error};

use axum_extra::extract::cookie::{Cookie, SameSite};
use jsonwebtoken::{encode, EncodingKey, Header};

use crate::models::{ApiResponse, AppState, Data, TokenClaims, User, UserPass, NewUser, Role};

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/login", routing::post(login))
        .route("/logout", routing::get(logout))
        .route("/register", routing::post(register))
        .route("/role/{name}", routing::get(get_role))
}

pub fn api_user_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", routing::get(read))
}


type Result = std::result::Result<ApiResponse, ApiResponse>;

pub async fn login(State(app_state): State<Arc<AppState>>, Json(user_pass): Json<UserPass>) -> Result {
    //) -> Result<Json<serde_json::Value>,(StatusCode, Json<serde_json::Value>)>{
    tracing::info!("init login");
    tracing::info!("User pass: {:?}", user_pass);
    let user = User::read_by_email(&app_state.pool, user_pass.email)
        .await
        .map_err(|e| {
            let message = &format!("Error: {}", e);
            ApiResponse::new(StatusCode::FORBIDDEN, message, Data::None)
        })?
        .ok_or_else(|| {
            let message = "Invalid name or password";
            ApiResponse::new(StatusCode::FORBIDDEN, message, Data::None)
        })?;
    if !user.is_active || !verify(&user_pass.password, &user.hashed_password).unwrap() {
        let message = "Invalid name or password";
        return Err(ApiResponse::new(StatusCode::FORBIDDEN, message, Data::None));
    }
    let role = Role::read_by_id(&app_state.pool, user.role_id)
        .await
        .map_err(|e| {
            let message = &format!("Error: {}", e);
            ApiResponse::new(StatusCode::FORBIDDEN, message, Data::None)
        })?
        .ok_or_else(|| {
            let message = "Role not found";
            ApiResponse::new(StatusCode::FORBIDDEN, message, Data::None)
        })?;

    let now = chrono::Utc::now();
    let iat = now.timestamp() as usize;
    let exp = (now + chrono::Duration::minutes(60)).timestamp() as usize;
    let claims: TokenClaims = TokenClaims {
        sub: user.email.to_string(),
        role: role.name.to_string(),
        exp,
        iat,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(app_state.secret.as_bytes()),
    )
    .map_err(|e| {
        let message = format!("Encoding JWT error: {}", e);
        ApiResponse::new(StatusCode::INTERNAL_SERVER_ERROR, &message, Data::None)
    })
    .map(|token| {
        let value = serde_json::json!({"token": token});
        ApiResponse::new(StatusCode::OK, "Ok", Data::Some(value))
    })
}

pub async fn register(
    State(app_state): State<Arc<AppState>>,
    Json(user): Json<NewUser>,
) -> impl IntoResponse {
    debug!("User data: {:?}", user);
    match User::create(&app_state.pool, user).await {
        Ok(user) => {
            debug!("User created: {:?}", user);
            ApiResponse::new(StatusCode::CREATED, "User created", Data::Some(serde_json::to_value(user).unwrap()))
        },
        Err(e) => {
            error!("Error creating user: {:?}", e);
            ApiResponse::new(StatusCode::BAD_REQUEST, &format!("Error creating user: {}", e), Data::None)
        }
    }
}

pub async fn logout() -> impl IntoResponse {
    debug!("Logout");
    let cookie = Cookie::build(("token", ""))
        .path("/")
        .max_age(cookie::time::Duration::ZERO)
        .same_site(SameSite::Lax)
        .http_only(true)
        .build();

    tracing::info!("The cookie: {}", cookie.to_string());

    Response::builder()
        .status(StatusCode::SEE_OTHER)
        .header(header::LOCATION, "/")
        .header(header::SET_COOKIE, cookie.to_string())
        .body(body::Body::empty())
        .unwrap()
}

pub async fn read(
    State(app_state): State<Arc<AppState>>,
) -> impl IntoResponse {
    match User::read_all(&app_state.pool).await {
        Ok(values) => {
            debug!("Users: {:?}", values);
            ApiResponse::new(
                StatusCode::OK,
                "Users",
                Data::Some(serde_json::to_value(values).unwrap()),
            )
        }
        Err(e) => {
            error!("Error reading values: {:?}", e);
            ApiResponse::new(StatusCode::BAD_REQUEST, &format!("Error reading values: {}", e), Data::None)
        }
    }
}

pub async fn get_role(
    State(app_state): State<Arc<AppState>>,
    Path(name): Path<String>,
) -> impl IntoResponse {
    debug!("Get role by name: {}", &name);
    match Role::read_by_name(&app_state.pool, &name).await {
        Ok(Some(role)) => {
            debug!("Role: {:?}", role);
            ApiResponse::new(
                StatusCode::OK,
                "Role",
                Data::Some(serde_json::to_value(role).unwrap()),
            )
        }
        Ok(None) => {
            debug!("Role not found: {}", &name);
            ApiResponse::new(StatusCode::NOT_FOUND, "Role not found", Data::None)
        }
        Err(e) => {
            error!("Error reading role: {:?}", e);
            ApiResponse::new(StatusCode::BAD_REQUEST, &format!("Error reading role: {}", e), Data::None)
        }
    }
}

