use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenClaims {
    pub sub: String,
    pub role_id: i32,
    pub iat: usize,
    pub exp: usize,
}

