use backend::models::{
    descomposition::{Descomposition, NewDescomposition, DescompositionParams, CalculationMode},
    price::{Price, NewPrice, PriceType},
    project::{Project, NewProject},
    unit::{Unit, NewUnit},
    version::{Version, NewVersion},
};
use sqlx::PgPool;
use uuid::Uuid;
use serde_json::json;
use sqlx::types::BigDecimal;
use rand::Rng;
use num_traits::cast::FromPrimitive;

#[path = "common.rs"]
mod common;

async fn setup() -> (PgPool, Price, Price) {
    let _ = &common::TRACING;
    let pool = common::setup_pool().await;

    // Create a version
    let new_version = NewVersion {
        name: format!("V-TEST-{}", Uuid::new_v4()),
    };
    let version = Version::create(&pool, new_version).await.unwrap();

    // Create a project
    let new_project = NewProject {
        code: format!("P-TEST-{}", Uuid::new_v4()),
        title: Some("Test Project".to_string()),
    };
    let _project = Project::create(&pool, new_project).await.unwrap();

    // Create a unit
    let name = format!("U-{}", Uuid::new_v4().to_string().chars().take(8).collect::<String>());
    let new_unit = NewUnit {
        name: name.clone(),
        symbol: name.clone(),
        description: Some("Test Unit".to_string()),
        formula: "a * b".to_string(),
    };
    let unit = Unit::create(&pool, new_unit).await.unwrap();

    let mut rng = rand::thread_rng();

    // Create parent price
    let new_parent_price = NewPrice {
        version_id: version.id,
        code: format!("PRICE-PARENT-{}", Uuid::new_v4().to_string().chars().take(30).collect::<String>()),
        description: "Parent Price".to_string(),
        base_price: BigDecimal::from_f64(rng.gen_range(100.0..200.0)).unwrap(),
        unit_id: unit.id,
        price_type: PriceType::Base,
    };
    let parent_price = Price::create(&pool, new_parent_price).await.unwrap();

    // Create component price
    let new_component_price = NewPrice {
        version_id: version.id,
        code: format!("PRICE-COMPONENT-{}", Uuid::new_v4().to_string().chars().take(30).collect::<String>()),
        description: "Component Price".to_string(),
        base_price: BigDecimal::from_f64(rng.gen_range(10.0..50.0)).unwrap(),
        unit_id: unit.id,
        price_type: PriceType::Base,
    };
    let component_price = Price::create(&pool, new_component_price).await.unwrap();

    (pool, parent_price, component_price)
}

#[tokio::test]
async fn test_create_descomposition() {
    let (pool, parent_price, component_price) = setup().await;
    let new_descomposition = NewDescomposition {
        parent_price_id: parent_price.id,
        component_price_id: component_price.id,
        calculation_mode: CalculationMode::Fixed,
        fixed_quantity: BigDecimal::from_f64(2.0),
        params_json: None,
    };
    let descomposition = Descomposition::create(&pool, new_descomposition).await.unwrap();
    assert_eq!(descomposition.parent_price_id, parent_price.id);
    assert_eq!(descomposition.component_price_id, component_price.id);
    assert_eq!(descomposition.calculation_mode, CalculationMode::Fixed);
    assert_eq!(descomposition.fixed_quantity, BigDecimal::from_f64(2.0));
    assert_eq!(descomposition.params_json, None);
}

#[tokio::test]
async fn test_read_descomposition() {
    let (pool, parent_price, component_price) = setup().await;
    let new_descomposition = NewDescomposition {
        parent_price_id: parent_price.id,
        component_price_id: component_price.id,
        calculation_mode: CalculationMode::Fixed,
        fixed_quantity: BigDecimal::from_f64(2.0),
        params_json: None,
    };
    let descomposition = Descomposition::create(&pool, new_descomposition).await.unwrap();
    let read_descomposition = Descomposition::read_by_id(&pool, descomposition.id).await.unwrap().unwrap();
    assert_eq!(read_descomposition.id, descomposition.id);
    assert_eq!(read_descomposition.parent_price_id, parent_price.id);
    assert_eq!(read_descomposition.component_price_id, component_price.id);
    assert_eq!(read_descomposition.calculation_mode, CalculationMode::Fixed);
    assert_eq!(read_descomposition.fixed_quantity, BigDecimal::from_f64(2.0));
    assert_eq!(read_descomposition.params_json, None);
}

#[tokio::test]
async fn test_update_descomposition() {
    let (pool, parent_price, component_price) = setup().await;
    let new_descomposition = NewDescomposition {
        parent_price_id: parent_price.id,
        component_price_id: component_price.id,
        calculation_mode: CalculationMode::Fixed,
        fixed_quantity: BigDecimal::from_f64(2.0),
        params_json: None,
    };
    let mut descomposition = Descomposition::create(&pool, new_descomposition).await.unwrap();
    descomposition.fixed_quantity = BigDecimal::from_f64(3.0);
    let updated_descomposition = Descomposition::update(&pool, descomposition).await.unwrap();
    assert_eq!(updated_descomposition.fixed_quantity, BigDecimal::from_f64(3.0));
}

#[tokio::test]
async fn test_delete_descomposition() {
    let (pool, parent_price, component_price) = setup().await;
    let new_descomposition = NewDescomposition {
        parent_price_id: parent_price.id,
        component_price_id: component_price.id,
        calculation_mode: CalculationMode::Fixed,
        fixed_quantity: BigDecimal::from_f64(2.0),
        params_json: None,
    };
    let descomposition = Descomposition::create(&pool, new_descomposition).await.unwrap();
    let deleted_descomposition = Descomposition::delete(&pool, descomposition.id).await.unwrap();
    assert_eq!(deleted_descomposition.id, descomposition.id);
    let read_descomposition = Descomposition::read_by_id(&pool, descomposition.id).await.unwrap();
    assert!(read_descomposition.is_none());
}

#[tokio::test]
async fn test_list_descompositions() {
    let (pool, parent_price, component_price) = setup().await;
    let new_descomposition1 = NewDescomposition {
        parent_price_id: parent_price.id,
        component_price_id: component_price.id,
        calculation_mode: CalculationMode::Fixed,
        fixed_quantity: Some(BigDecimal::from_f64(2.0).unwrap()),
        params_json: None,
    };
    Descomposition::create(&pool, new_descomposition1).await.unwrap();

    let version = Version::read_by_id(&pool, parent_price.version_id).await.unwrap().unwrap();
    let unit = Unit::read_by_id(&pool, parent_price.unit_id).await.unwrap().unwrap();
    let mut rng = rand::thread_rng();
    let new_component_price2 = NewPrice {
        version_id: version.id,
        code: format!("PRICE-COMPONENT-{}", Uuid::new_v4().to_string().chars().take(30).collect::<String>()),
        description: "Component Price 2".to_string(),
        base_price: BigDecimal::from_f64(rng.gen_range(10.0..50.0)).unwrap(),
        unit_id: unit.id,
        price_type: PriceType::Base,
    };
    let component_price2 = Price::create(&pool, new_component_price2).await.unwrap();

    let new_descomposition2 = NewDescomposition {
        parent_price_id: parent_price.id,
        component_price_id: component_price2.id,
        calculation_mode: CalculationMode::Formula,
        fixed_quantity: None,
        params_json: Some(json!({"x": 10, "y": 20})),
    };
    Descomposition::create(&pool, new_descomposition2).await.unwrap();

    let params = DescompositionParams {
        id: None,
        parent_price_id: Some(parent_price.id),
        component_price_id: None,
        calculation_mode: None,
        page: None,
        limit: None,
        sort_by: None,
        asc: None,
    };
    let descompositions = Descomposition::read_paged(&pool, &params).await.unwrap();
    assert!(descompositions.len() >= 2);
}
