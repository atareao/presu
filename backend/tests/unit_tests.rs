use backend::models::{
    unit::{Unit, NewUnit, UnitParams},
};
use sqlx::PgPool;
use uuid::Uuid;
use serde_json::json;

#[path = "common.rs"]
mod common;

async fn setup() -> PgPool {
    let _ = &common::TRACING;
    common::setup_pool().await
}

#[tokio::test]
async fn test_create_unit() {
    let pool = setup().await;
    let name = format!("U-{}", Uuid::new_v4().to_string().chars().take(8).collect::<String>());
    let new_unit = NewUnit {
        name: name.clone(),
        description: Some("Test Unit".to_string()),
        base_formula: "a * b".to_string(),
        expected_params_json: json!({"a": "number", "b": "number"}),
    };
    let unit = Unit::create(&pool, new_unit).await.unwrap();
    assert_eq!(unit.name, name);
    assert_eq!(unit.description, Some("Test Unit".to_string()));
    assert_eq!(unit.base_formula, "a * b");
    assert_eq!(unit.expected_params_json, json!({"a": "number", "b": "number"}));
}

#[tokio::test]
async fn test_read_unit() {
    let pool = setup().await;
    let name = format!("U-{}", Uuid::new_v4().to_string().chars().take(8).collect::<String>());
    let new_unit = NewUnit {
        name: name.clone(),
        description: Some("Test Unit".to_string()),
        base_formula: "a * b".to_string(),
        expected_params_json: json!({"a": "number", "b": "number"}),
    };
    let unit = Unit::create(&pool, new_unit).await.unwrap();
    let read_unit = Unit::read_by_id(&pool, unit.id).await.unwrap().unwrap();
    assert_eq!(read_unit.id, unit.id);
    assert_eq!(read_unit.name, name);
    assert_eq!(read_unit.description, Some("Test Unit".to_string()));
    assert_eq!(read_unit.base_formula, "a * b");
    assert_eq!(read_unit.expected_params_json, json!({"a": "number", "b": "number"}));
}

#[tokio::test]
async fn test_update_unit() {
    let pool = setup().await;
    let name = format!("U-{}", Uuid::new_v4().to_string().chars().take(8).collect::<String>());
    let new_unit = NewUnit {
        name: name.clone(),
        description: Some("Test Unit".to_string()),
        base_formula: "a * b".to_string(),
        expected_params_json: json!({"a": "number", "b": "number"}),
    };
    let mut unit = Unit::create(&pool, new_unit).await.unwrap();
    let updated_description = "Updated Unit".to_string();
    unit.description = Some(updated_description.clone());
    let updated_unit = Unit::update(&pool, unit).await.unwrap();
    assert_eq!(updated_unit.description, Some(updated_description));
}

#[tokio::test]
async fn test_delete_unit() {
    let pool = setup().await;
    let name = format!("U-{}", Uuid::new_v4().to_string().chars().take(8).collect::<String>());
    let new_unit = NewUnit {
        name: name.clone(),
        description: Some("Test Unit".to_string()),
        base_formula: "a * b".to_string(),
        expected_params_json: json!({"a": "number", "b": "number"}),
    };
    let unit = Unit::create(&pool, new_unit).await.unwrap();
    let deleted_unit = Unit::delete(&pool, unit.id).await.unwrap();
    assert_eq!(deleted_unit.id, unit.id);
    let read_unit = Unit::read_by_id(&pool, unit.id).await.unwrap();
    assert!(read_unit.is_none());
}

#[tokio::test]
async fn test_list_units() {
    let pool = setup().await;
    let name1 = format!("U-{}", Uuid::new_v4().to_string().chars().take(8).collect::<String>());
    let new_unit1 = NewUnit {
        name: name1,
        description: Some("Test Unit 1".to_string()),
        base_formula: "a * b".to_string(),
        expected_params_json: json!({"a": "number", "b": "number"}),
    };
    Unit::create(&pool, new_unit1).await.unwrap();

    let name2 = format!("U-{}", Uuid::new_v4().to_string().chars().take(8).collect::<String>());
    let new_unit2 = NewUnit {
        name: name2,
        description: Some("Test Unit 2".to_string()),
        base_formula: "a * b".to_string(),
        expected_params_json: json!({"a": "number", "b": "number"}),
    };
    Unit::create(&pool, new_unit2).await.unwrap();

    let params = UnitParams {
        id: None,
        name: None,
        description: None,
        page: None,
        limit: None,
        sort_by: None,
        asc: None,
    };
    let units = Unit::read_paged(&pool, &params).await.unwrap();
    assert!(units.len() >= 2);
}
