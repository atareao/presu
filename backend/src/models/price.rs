use sqlx::{
    FromRow,
    Type,
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
    pub base_price: f64, // NUMERIC(10, 2)
    pub unit_id: i32, 
    // Mapeamos el ENUM price_type_enum a String
    pub price_type: PriceType,
    pub created_at: UtcTimestamp,
    pub updated_at: UtcTimestamp,
    pub created_by: i32, 
    pub updated_by: i32, 
}
