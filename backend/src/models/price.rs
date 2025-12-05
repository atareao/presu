use sqlx::{
    FromRow,
    Type,
    PgPool,
    Result,
    types::BigDecimal,
};
use serde::{Serialize, Deserialize};

use super::UtcTimestamp;


#[derive(Debug, Type, Serialize, Deserialize, Clone, Copy)]
#[sqlx(type_name = "price_type_enum", rename_all = "lowercase")]
pub enum PriceType {
    #[serde(rename = "base")]
    Base,
    #[serde(rename = "decomposed")]
    Decomposed,
}

/// Representa una fila en la tabla 'prices'
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Price {
    pub id: i32,
    pub version_id: i32,
    pub code: String,
    pub description: String,
    pub base_price: BigDecimal, // NUMERIC(10, 2)
    pub unit_id: i32, 
    // Mapeamos el ENUM price_type_enum a String
    pub price_type: PriceType,
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}

// DTO para la creación de un nuevo precio
#[derive(Debug, Deserialize)]
pub struct PriceCreateDTO {
    pub version_id: i32,
    pub code: String,
    pub description: String,
    pub base_price: BigDecimal,
    pub unit_id: i32,
    pub price_type: PriceType,
}

// DTO para la actualización
#[derive(Debug, Deserialize)]
pub struct PriceUpdateDTO {
    pub code: Option<String>,
    pub description: Option<String>,
    pub base_price: Option<BigDecimal>,
    pub unit_id: Option<i32>,
    pub price_type: Option<PriceType>,
}

/// Crea un nuevo precio en el catálogo.
pub async fn create_price(pool: &PgPool, data: PriceCreateDTO, creator_id: i32) -> Result<Price> {
   sqlx::query_as!(
        Price,
        r#"
        INSERT INTO prices (version_id, code, description, base_price, unit_id, price_type, created_by, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
        RETURNING id, version_id, code, description, base_price, unit_id, price_type as "price_type: PriceType", 
                  created_at, updated_at, created_by, updated_by
        "#,
        data.version_id,    // $1
        data.code,          // $2
        data.description,   // $3
        data.base_price,    // $4 (SQLx maneja Decimal)
        data.unit_id,       // $5
        data.price_type as PriceType, // $6 (Mapeo a ENUM)
        creator_id,         // $7
    )
    .fetch_one(pool)
    .await
}

const PRICE_READ_FIELDS: &str = "id, version_id, code, description, base_price, unit_id, price_type as \"price_type: PriceType\", created_at, updated_at, created_by, updated_by";

/// Obtiene un precio por su ID.
pub async fn get_price_by_id(pool: &PgPool, id: i32) -> Result<Price> {
    sqlx::query_as!(
        Price,
        "SELECT id, version_id, code, description, base_price, unit_id, price_type as \"price_type: PriceType\", created_at, updated_at, created_by, updated_by FROM prices WHERE id = $1",
        id
    )
    .fetch_one(pool)
    .await
}

/// Obtiene todos los precios que pertenecen a una versión de catálogo específica.
pub async fn get_prices_by_version(pool: &PgPool, version_id: i32) -> Result<Vec<Price>> {
    sqlx::query_as!(
        Price,
        "SELECT id, version_id, code, description, base_price, unit_id, price_type as \"price_type: PriceType\", created_at, updated_at, created_by, updated_by FROM prices WHERE id = $1",
        version_id
    )
    .fetch_all(pool)
    .await
}

pub async fn update_price(pool: &PgPool, id: i32, data: PriceUpdateDTO, updater_id: i32) -> Result<Price> {
    sqlx::query_as!(
        Price,
        r#"
        UPDATE prices
        SET 
            code = COALESCE($1, code),
            description = COALESCE($2, description),
            base_price = COALESCE($3, base_price),
            unit_id = COALESCE($4, unit_id),
            price_type = COALESCE($5, price_type),
            updated_by = $6
        WHERE id = $7
        RETURNING id, version_id, code, description, base_price, unit_id, price_type as "price_type: PriceType", 
                  created_at, updated_at, created_by, updated_by
        "#,
        data.code,          // $1
        data.description,   // $2
        data.base_price,    // $3
        data.unit_id,       // $4
        data.price_type as Option<PriceType>, // $5
        updater_id,         // $6
        id,                 // $7
    )
    .fetch_one(pool)
    .await
}

/// Elimina un precio por su ID.
/// NOTA: Fallará si existen descomposiciones ('decompositions') o mediciones
/// ('measurements') que lo referencien.
pub async fn delete_price(pool: &PgPool, id: i32) -> Result<Price> {
    sqlx::query_as!(
        Price,
        r#"
        DELETE FROM prices
        WHERE id = $1
        RETURNING id, version_id, code, description, base_price, unit_id, price_type as "price_type: PriceType", 
                  created_at, updated_at, created_by, updated_by
        "#,
        id
    )
    .fetch_one(pool)
    .await
}
