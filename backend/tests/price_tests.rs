
use backend::models::{
    price::{Price, NewPrice, PriceParams, PriceType},
    unit::{Unit, NewUnit},
    version::{Version, NewVersion},
};
use sqlx::{PgPool, types::BigDecimal};
use uuid::Uuid;
use rand::Rng;
use num_traits::cast::FromPrimitive;
use serde_json::json;

#[path = "common.rs"]
mod common;

async fn setup() -> (PgPool, Version, Unit) {
    let _ = &common::TRACING;
    let pool = common::setup_pool().await;

    // Create a version
    let new_version = NewVersion {
        name: format!("V-PRICE-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
    };
    let version = Version::create(&pool, new_version).await.unwrap();

    // Create a unit
    let name = format!("U-PRICE-{}", Uuid::new_v4().to_string().chars().take(2).collect::<String>());
    let new_unit = NewUnit {
        name: name.clone(),
        description: Some("Test Unit for Price".to_string()),
        base_formula: "a + b".to_string(),
        expected_params_json: json!({"a": "number", "b": "number"}),
    };
    let unit = Unit::create(&pool, new_unit).await.unwrap();

    (pool, version, unit)
}

#[tokio::test]
async fn test_create_price() {
    let (pool, version, unit) = setup().await;
    let mut rng = rand::thread_rng();
    let new_price = NewPrice {
        version_id: version.id,
        code: format!("P-CODE-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
        description: "Test Price".to_string(),
        base_price: BigDecimal::from_f64(rng.gen_range(1.0..100.0)).unwrap(),
        unit_id: unit.id,
        price_type: PriceType::Base,
    };
    let price = Price::create(&pool, new_price).await.unwrap();
    assert_eq!(price.version_id, version.id);
    assert_eq!(price.unit_id, unit.id);
    assert_eq!(price.price_type, PriceType::Base);
}

#[tokio::test]
async fn test_read_price() {
    let (pool, version, unit) = setup().await;
    let mut rng = rand::thread_rng();
    let new_price = NewPrice {
        version_id: version.id,
        code: format!("P-CODE-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
        description: "Test Price".to_string(),
        base_price: BigDecimal::from_f64(rng.gen_range(1.0..100.0)).unwrap(),
        unit_id: unit.id,
        price_type: PriceType::Base,
    };
    let price = Price::create(&pool, new_price).await.unwrap();
    let read_price = Price::read_by_id(&pool, price.id).await.unwrap().unwrap();
    assert_eq!(read_price.id, price.id);
    assert_eq!(read_price.version_id, version.id);
}

#[tokio::test]
async fn test_update_price() {
    let (pool, version, unit) = setup().await;
    let mut rng = rand::thread_rng();
    let new_price = NewPrice {
        version_id: version.id,
        code: format!("P-CODE-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
        description: "Test Price".to_string(),
        base_price: BigDecimal::from_f64(rng.gen_range(1.0..100.0)).unwrap(),
        unit_id: unit.id,
        price_type: PriceType::Base,
    };
    let mut price = Price::create(&pool, new_price).await.unwrap();
    price.description = "Updated Price".to_string();
    let updated_price = Price::update(&pool, price).await.unwrap();
    assert_eq!(updated_price.description, "Updated Price".to_string());
}

#[tokio::test]
async fn test_delete_price() {
    let (pool, version, unit) = setup().await;
    let mut rng = rand::thread_rng();
    let new_price = NewPrice {
        version_id: version.id,
        code: format!("P-CODE-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
        description: "Test Price".to_string(),
        base_price: BigDecimal::from_f64(rng.gen_range(1.0..100.0)).unwrap(),
        unit_id: unit.id,
        price_type: PriceType::Base,
    };
    let price = Price::create(&pool, new_price).await.unwrap();
    let deleted_price = Price::delete(&pool, price.id).await.unwrap();
    assert_eq!(deleted_price.id, price.id);
    let read_price = Price::read_by_id(&pool, price.id).await.unwrap();
    assert!(read_price.is_none());
}

#[tokio::test]
async fn test_list_prices() {
    let (pool, version, unit) = setup().await;
    let mut rng = rand::thread_rng();

    let new_price1 = NewPrice {
        version_id: version.id,
        code: format!("P-CODE-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
        description: "Test Price 1".to_string(),
        base_price: BigDecimal::from_f64(rng.gen_range(1.0..100.0)).unwrap(),
        unit_id: unit.id,
        price_type: PriceType::Base,
    };
    Price::create(&pool, new_price1).await.unwrap();

    let new_price2 = NewPrice {
        version_id: version.id,
        code: format!("P-CODE-{}", Uuid::new_v4().to_string().chars().take(10).collect::<String>()),
        description: "Test Price 2".to_string(),
        base_price: BigDecimal::from_f64(rng.gen_range(1.0..100.0)).unwrap(),
        unit_id: unit.id,
        price_type: PriceType::Base,
    };
    Price::create(&pool, new_price2).await.unwrap();

    let params = PriceParams {
        id: None,
        version_id: Some(version.id),
        code: None,
        description: None,
        base_price: None,
        unit_id: None,
        price_type: None,
        page: None,
        limit: None,
        sort_by: None,
        asc: None,
    };
    let prices = Price::read_paged(&pool, &params).await.unwrap();
    assert!(prices.len() >= 2);
}
